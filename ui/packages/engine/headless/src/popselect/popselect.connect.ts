import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ListboxSchema } from '../listbox'
import type { PopselectApi, PopselectItemProps, PopselectNodeMeta, PopselectService } from './popselect.types'
import { focusItem, focusSafely, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { popselectAnatomy, popselectItemQuery, popselectItemText } from './popselect.anatomy'

const parts = popselectAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘建立的高亮被指针路过不受影响
const pointerHot = new WeakSet<Element>()

// 这次激活来自 Enter / Space 的触发器：原生按钮把这两个键翻成一次 click，
// 那次 click 与指针点出来的长得一样，只能靠「按下时记一笔、激活时取走」把两条入口分开。
// 指针按下会把标记撤掉，键按下后没等来激活（按住空格再 Tab 走开）也不会留给下一次点击
const keyActivated = new WeakSet<Element>()

/**
 * 展开那一刻的落焦点：有锚点条目就落它，没有就落列表容器（此刻正是它认领着 Tab 位）。
 *
 * 不能留给焦点域的 Tab 序列探测：那条路按文档序取 content 的全部可 tab 后代，
 * 作者放在列表前面的搜索框会把焦点抢走，而键盘处理器挂在 content 上，方向键就此失灵。
 * 本轮该有锚点却还没查到（条目身份标记晚一拍写上）时返回 null，焦点域会自行重试。
 */
export function popselectInitialFocus(
  listbox: Service<ListboxSchema>,
  content: HTMLElement | null,
): HTMLElement | null {
  if (!content)
    return null
  // 与 connect 里的 roving 锚点同一条规则，落焦与 tabindex 才指得上同一个条目
  const anchor = listbox.context.get('focusedValue') ?? listbox.context.get('value')[0] ?? null
  if (anchor == null)
    return content
  return queryItems(content, popselectItemQuery).find(el => itemValue(el) === anchor) ?? null
}

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_popselect-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectPopselect<T extends PropTypes>(
  service: PopselectService,
  normalize: NormalizeProps<T>,
): PopselectApi<T> {
  const { popover, listbox, props } = service

  const open = popover.state.get() === 'open'
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 popover 的 context，这里只读结果，不量 DOM、不调引擎
  const position = popover.context.get('position')
  const placement = position?.placement ?? popover.prop('placement') ?? 'bottom'
  // 两台机器共用一个 scope，id 只派生一次
  const ids = popover.scope.ids('popselect', 'trigger', 'content')

  const value = listbox.context.get('value')
  const focusedValue = listbox.context.get('focusedValue') ?? null
  const multiple = !!listbox.prop('multiple')
  const disabled = !!listbox.prop('disabled')
  const loop = listbox.prop('loop') ?? true
  const dir = listbox.prop('dir')
  const typeaheadOn = listbox.prop('typeahead') ?? true

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: PopselectNodeMeta[] = (listbox.prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  const isSelected = (v: string): boolean => value.includes(v)
  /** 条目禁用：整个控件禁用一票通过，其次看部件上写的，再没有就回 collection 里查。 */
  const itemDisabled = (item: PopselectItemProps): boolean =>
    disabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)

  // roving tabindex 锚点：焦点在列表内跟焦点走，否则落在选中集合的第一个。
  // 不取文档序里最靠前的选中项，那要查 DOM，而 connect 在 render 期求值、此时 DOM 尚不存在
  const anchor = focusedValue ?? value[0] ?? null

  // item / item-text / item-indicator 共用同一份状态标记
  const itemStateAttrs = (item: PopselectItemProps): Record<string, string | undefined> => ({
    'data-state': isSelected(item.value) ? 'checked' : 'unchecked',
    'data-disabled': dataAttr(itemDisabled(item)),
    'data-highlighted': dataAttr(focusedValue === item.value),
  })

  /** 按文档序现读条目集合；仅在事件回调中调用。 */
  const items = (content: HTMLElement | null): HTMLElement[] => queryItems(content, popselectItemQuery)

  const focusValue = (el: HTMLElement | null): void => {
    const next = itemValue(el)
    if (next == null)
      return
    focusItem(el)
    listbox.send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 方向键落点：以锚点为起点在活 DOM 上求解，禁用条目跳过。 */
  const focusBy = (content: HTMLElement, intent: NavIntent): void => {
    focusValue(navigateItems(items(content), anchor, intent, { loop }))
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈查找，未命中保持原状。 */
  const focusMatch = (content: HTMLElement, query: string): void => {
    const list = items(content)
    focusValue(matchTypeahead(list, indexOfValue(list, anchor), query, {
      text: popselectItemText,
      skip: isItemDisabled,
    }))
  }

  /**
   * 键盘入口的落点：无选中值时按意图从集合两端进（下键落首行、上键落末行）。
   * 有选中值时锚点已经是它，两种入口都定位到选中项，这里不插手。
   * 收起态条目虽 hidden 但仍在文档里，查询照样命中；只记锚点不搬焦点，落焦归焦点域
   */
  const landAnchor = (intent: NavIntent): void => {
    if (value.length > 0)
      return
    const next = itemValue(navigateItems(items(popover.refs.get('getContentEl')()), null, intent))
    if (next != null)
      listbox.send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 落值：单选替换并收起浮层，多选切换并保持展开继续挑。 */
  const pick = (v: string): void => {
    listbox.send(multiple ? { type: 'ITEM.TOGGLE', value: v } : { type: 'ITEM.SELECT', value: v })
    if (!multiple)
      popover.send({ type: 'CLOSE' })
  }

  /** 确认键：作用于焦点所在的非禁用条目。 */
  const commit = (content: HTMLElement): void => {
    if (focusedValue == null)
      return
    const el = items(content).find(item => itemValue(item) === focusedValue)
    if (!el || isItemDisabled(el))
      return
    pick(focusedValue)
  }

  return {
    open,
    value,
    collection,
    multiple,
    focusedValue,
    disabled,
    isSelected,
    setOpen: (next) => {
      if (next !== open)
        popover.send({ type: next ? 'OPEN' : 'CLOSE' })
    },
    setValue: next => listbox.send({ type: 'VALUE.SET', value: next }),
    select: pick,

    // 三个视觉轴打在根与 positioner 上：触发器与条目各从就近的那一处继承私有槽，其余子部件不重复标注
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      // trigger 是单体控件：用原生 disabled，不可聚焦也不派 click
      'disabled': disabled || undefined,
      // 弹出的是 listbox 不是 dialog：读屏据此播报「折叠列表框」
      'aria-haspopup': 'listbox',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
      'data-placeholder': dataAttr(value.length === 0),
      'onClick': (event: MouseEvent) => {
        // 键盘激活的这一路要有可见落点；指针点开一路不补，展开那一刻不能有条目看着像被选中
        if (keyActivated.delete(event.currentTarget as Element) && !open)
          landAnchor('next')
        popover.send({ type: 'TOGGLE' })
      },
      // 指针按下即撤掉键盘标记：这一次激活是指针的，之前那次按键没等来激活也就此作废
      'onPointerDown': (event: PointerEvent) => {
        keyActivated.delete(event.currentTarget as Element)
      },
      'onKeyDown': (event: KeyboardEvent) => {
        // 收起态的上下键直接展开；Enter / Space 由原生按钮激活翻成 click，这里只记下入口是键盘
        if (open)
          return
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          landAnchor(intent)
          popover.send({ type: 'OPEN' })
          return
        }
        if (event.key === 'Enter' || event.key === ' ')
          keyActivated.add(event.currentTarget as Element)
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    // 键盘在 content 上收口，靠冒泡统一处理；Escape 归消解层管，只有栈顶层响应
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'listbox',
      // 浮层的名字取自触发器上的文字
      'aria-labelledby': ids.trigger,
      // 省略与显式 false 不是一回事：前者是「没说」，后者是「明确说了不是多选」
      'aria-multiselectable': multiple ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : 'false',
      // 展开却无锚点时（指针打开且无选中值）容器认领 Tab 位并接住焦点，它就是列表框本身；
      // 收起态 content 带 hidden，本就不可聚焦，不必兜底
      'tabindex': open && anchor == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeyDown': (event: KeyboardEvent) => {
        if (disabled)
          return
        const content = event.currentTarget as HTMLElement
        const key = event.key
        const command = event.ctrlKey || event.metaKey
        // 纵向列表：左右键返回 null，放行给页面滚动与读屏
        const intent = command || event.altKey ? null : navIntentFromKey(key, { axis: 'vertical', dir })
        if (intent) {
          event.preventDefault()
          focusBy(content, intent)
          return
        }
        // 不 preventDefault：焦点按 Tab 序列自然离开，浮层随之收起。
        // 报 src=tab，焦点域据此放行，不把焦点抢回触发器
        if (key === 'Tab') {
          popover.send({ type: 'CLOSE', src: 'tab' })
          return
        }
        if (key === 'Enter') {
          event.preventDefault()
          commit(content)
          return
        }
        // 连打检索只搬焦点、不落值。缓冲区空时 push(' ') 返回 null，空格才落到下面当确认键
        const query = typeaheadOn && !command && !event.altKey ? listbox.refs.get('typeahead').push(key) : null
        if (query != null) {
          event.preventDefault()
          focusMatch(content, query)
          return
        }
        if (key === ' ') {
          event.preventDefault()
          commit(content)
        }
      },
      'onFocusOut': (event: FocusEvent) => {
        const content = event.currentTarget as HTMLElement
        if (contains(content, event.relatedTarget as Node | null))
          return
        listbox.send({ type: 'LIST.BLUR' })
      },
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航、检索与选中的条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'option',
      // 未选中也显式输出 false
      'aria-selected': isSelected(item.value) ? 'true' : 'false',
      // 集合条目一律 aria-disabled：原生 disabled 不可聚焦、也不派 click
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // roving tabindex：整组只有锚点条目留在 Tab 序列内
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': () => {
        if (!itemDisabled(item))
          pick(item.value)
      },
      // 焦点是事实不是许可：禁用条目被聚焦也记锚点，作为方向键起点
      'onFocus': () => listbox.send({ type: 'ITEM.FOCUS', value: item.value }),
      // 指针划过即把焦点连同高亮一起搬来：不同步的话，鼠标停在 A 上、回车却提交了键盘高亮的 B；
      // 只聚焦不滚动，滚动留给键盘导航
      'onPointerMove': (event: PointerEvent) => {
        if (itemDisabled(item) || focusedValue === item.value)
          return
        const el = event.currentTarget as HTMLElement
        pointerHot.add(el)
        focusSafely(el)
        listbox.send({ type: 'ITEM.FOCUS', value: item.value })
      },
      // 指针离开且没落到别的可用条目上：收掉高亮、焦点还给 content，hover 不留漆。
      // 触摸 tap 序列里的 leave 不作数
      'onPointerLeave': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (event.pointerType === 'touch' || !pointerHot.delete(el))
          return
        if (focusedValue !== item.value)
          return
        const to = (event.relatedTarget as HTMLElement | null)?.closest<HTMLElement>(parts.item.selector)
        if (to && !to.hasAttribute('data-disabled'))
          return
        el.closest<HTMLElement>(parts.content.selector)?.focus()
        listbox.send({ type: 'FOCUS.CLEAR' })
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      'aria-hidden': 'true',
    }),
  }
}
