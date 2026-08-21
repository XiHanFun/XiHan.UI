import { overlayUnplaced } from '../shared/overlay'
import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ContextMenuApi, ContextMenuItemProps, ContextMenuNodeMeta, ContextMenuSchema } from './context-menu.types'
import {
  focusItem,
  focusSafely,
  indexOfValue,
  isItemDisabled,
  ITEM_VALUE_ATTR,
  itemValue,
  matchTypeahead,
  navigateItems,
  navIntentFromKey,
  queryItems,
} from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/kernel'
import { contextMenuAnatomy, contextMenuItemQuery, contextMenuItemText } from './context-menu.anatomy'
import { CONTEXT_MENU_DEFAULT_PLACEMENT } from './context-menu.machine'

const parts = contextMenuAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘建立的锚点被指针路过不受影响
const pointerHot = new WeakSet<Element>()

/** 右键那一下的 button 值；它不算「点到别处」。 */
const SECONDARY_BUTTON = 2

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_context-menu-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectContextMenu<T extends PropTypes>(
  service: Service<ContextMenuSchema>,
  normalize: NormalizeProps<T>,
): ContextMenuApi<T> {
  const { state, prop, send, context, refs, scope } = service
  const open = state.get() === 'open'
  const pressing = state.get() === 'pressing'
  const ids = scope.ids('context-menu', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const point = context.get('point')
  const placement = position?.placement ?? prop('placement') ?? CONTEXT_MENU_DEFAULT_PLACEMENT
  // roving tabindex 与方向键起点共用这一个锚点，菜单没有选中态；收起时为 null
  const anchor = context.get('focusedValue') ?? null
  const loop = prop('loop') ?? true
  const dir = prop('dir')
  const typeaheadOn = prop('typeahead') ?? true

  // collection 推出的条目元信息：显示文本、禁用、标记位与分组都在这里定案，条目部件只报 value
  const collection: ContextMenuNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    indicator: node.indicator ?? null,
    group: node.group ?? null,
    groupLabel: node.groupLabel ?? null,
    separatorBefore: !!node.separatorBefore,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: ContextMenuItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  const groupLabelId = (group: string): string =>
    scope.partId(contextMenuAnatomy.name, `group-label:${group}`)

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: ContextMenuItemProps): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(itemDisabled(item)),
    // 子部件够不着条目的 :focus 伪类，只能读这个标记
    'data-highlighted': dataAttr(anchor === item.value),
  })

  /** 方向键落点：条目集合只在事件那一刻读，顺序即文档序；起点用锚点，禁用条目自动跳过。 */
  const navigate = (content: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(queryItems(content, contextMenuItemQuery), anchor, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用条目跳过；未命中保持原状。 */
  const focusMatch = (content: HTMLElement, query: string): void => {
    const items = queryItems(content, contextMenuItemQuery)
    const target = matchTypeahead(items, indexOfValue(items, anchor), query, {
      text: contextMenuItemText,
      skip: isItemDisabled,
    })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 确认键：认焦点当下所在的条目，自报禁用的不认；子菜单触发条目（带 aria-haspopup）归子层管。 */
  const activate = (event: KeyboardEvent): void => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(parts.item.selector)
    const next = itemValue(item)
    if (!item || next == null || isItemDisabled(item) || item.hasAttribute('aria-haspopup'))
      return
    event.preventDefault()
    send({ type: 'ITEM.SELECT', value: next })
  }

  return {
    open,
    collection,
    pressing,
    point,
    focusedValue: anchor,
    setOpen: (next) => {
      if (next === open)
        return
      if (!next) {
        send({ type: 'CLOSE' })
        return
      }
      // 命令式展开没有光标坐标：有过锚点就沿用，没有则由定位效应锚到触发区起始角；焦点端给 'none'
      send({ type: 'OPEN', focus: 'none' })
    },
    openAt: (x, y) => send({ type: 'OPEN', x, y, focus: 'none' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      // 视觉轴在根与 positioner 上各输出一次，条目与分组标题继承 positioner 声明的私有槽
      'data-tone': prop('tone'),
      'data-size': prop('size'),
    }),

    // 触发区是普通元素不是按钮：aria-expanded 不是全局属性，只对特定 role 有定义，这里不输出
    getTriggerProps: () => normalize.element({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'aria-haspopup': 'menu',
      'aria-controls': ids.content,
      'aria-keyshortcuts': 'Shift+F10',
      // 区域上没有 Tab 位，Shift+F10 与 ContextMenu 键就送不到这里
      'tabindex': 0,
      'data-state': stateAttr,
      'data-pressing': dataAttr(pressing),
      'onContextMenu': (event: MouseEvent) => {
        // 浏览器自带的右键菜单必须让位，否则两张菜单叠在一起。
        // 指针打开不预落锚点：菜单弹出那一刻不能有条目看着像被选中
        event.preventDefault()
        send({ type: 'CONTEXT.MENU', x: event.clientX, y: event.clientY, focus: 'none' })
      },
      'onPointerDown': (event: PointerEvent) => {
        // 浮层若被作者嵌在触发区内部，点条目会一路冒泡到这里；那是层内交互，不该关
        if ((event.target as HTMLElement | null)?.closest(parts.content.selector))
          return
        // 右键那一下不算「点到别处」，紧随其后的 contextmenu 会把菜单挪到新坐标
        if (event.button === SECONDARY_BUTTON)
          return
        if (open) {
          // 触发区被登记为本层分支，消解层不管它，「左键点在区域内也该关」只能在这里收口
          send({ type: 'CLOSE', src: 'interact-outside' })
          return
        }
        // 触摸与触控笔没有右键，改用长按；鼠标不参与，否则按住左键不动也会弹出菜单
        if (event.pointerType === 'mouse')
          return
        send({ type: 'PRESS.START', x: event.clientX, y: event.clientY })
      },
      // 只有计时窗口内才上报移动，否则整块区域挂着一个空转的高频回调
      'onPointerMove': (event: PointerEvent) => {
        if (pressing)
          send({ type: 'PRESS.MOVE', x: event.clientX, y: event.clientY })
      },
      // 抬手与系统打断不看 pressing 标记：它是上一帧的快照，抬手早于重渲就会被漏掉
      'onPointerUp': () => send({ type: 'PRESS.END' }),
      'onPointerCancel': () => send({ type: 'PRESS.END' }),
      'onKeyDown': (event: KeyboardEvent) => {
        // 菜单键与 Shift+F10 是右键的键盘等价物（Windows/Linux 桌面惯例）
        const menuKey = event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey)
        if (!menuKey)
          return
        event.preventDefault()
        // 键盘没有光标坐标，锚点取触发区自身的起始角；这一下读 DOM 发生在事件那一刻，不是连接期
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
        send({ type: 'CONTEXT.MENU', x: rect.x, y: rect.y, focus: 'first' })
      },
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 视觉轴在浮层这一侧再打一次：positioner 被搬到 portal 落点，继承不到根上的私有槽
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      // 展开那一帧引擎还没量完，坐标是兜底的 0——不藏的话浮层会先在视口左上角闪一下
      'data-hidden': dataAttr(overlayUnplaced(open, position)),
      'style': {
        position: 'fixed',
        // 引擎结果没回来之前先用光标坐标顶着；无引擎时它就是最终落位
        left: `${position?.x ?? point?.x ?? 0}px`,
        top: `${position?.y ?? point?.y ?? 0}px`,
        // content 继承这个高度上限，超出的条目在菜单内部滚
        ...availableHeightVar(position?.availableHeight),
      },
    }),

    // 键盘全在 content 上收口；Escape 不在这里收，归消解层管（只有栈顶层响应）。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'menu',
      // 名字只能自己给：触发区是作者的一整块内容且不带 role，指过去会把整块区域的文字
      // 算成菜单名（右键一个表格行 = 把整行念一遍）。无锚点时焦点歇在这儿，
      // 读屏此刻只报得出容器的名字与角色
      'aria-label': prop('translations')?.content ?? 'Context menu',
      // 有锚点时 Tab 位归锚点条目；展开着却没有锚点时由容器兜底，否则整个菜单没有 Tab 停靠点
      'tabindex': open && anchor == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      // content 自身拿到焦点＝没有活动条目：锚点清空，Tab 停靠点回容器兜底
      'onFocus': (event: FocusEvent) => {
        if (event.target === event.currentTarget)
          send({ type: 'FOCUS.CLEAR' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        const content = event.currentTarget as HTMLElement
        // 纵向菜单：左右键返回 null，放行给页面滚动
        const intent = navIntentFromKey(event, { axis: 'vertical', dir })
        if (intent) {
          event.preventDefault()
          navigate(content, intent)
          return
        }
        // 不 preventDefault：菜单让开，焦点按 Tab 序列自然离开
        if (event.key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }
        // 连打检索只搬焦点。缓冲区空时空格不算字符（push 返回 null），落到下面当确认键；
        // 缓冲区非空时归检索。带 Ctrl/Meta/Alt 的组合不归检索管，否则 Ctrl+F 之类会被吞掉
        const query = typeaheadOn && !event.ctrlKey && !event.metaKey && !event.altKey
          ? refs.get('typeahead').push(event.key)
          : null
        if (query != null) {
          event.preventDefault()
          focusMatch(content, query)
          return
        }
        if (event.key === 'Enter' || event.key === ' ')
          activate(event)
      },
    }),

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航、检索与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'menuitem',
      // 集合条目一律 aria-disabled，原生 disabled 不可聚焦也不派发 click
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // roving tabindex：整组只有锚点条目留在 Tab 序列内；收起态无锚点
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': (event: MouseEvent) => {
        // 子菜单触发条目（带 aria-haspopup）的点按归子层：只展开不选中
        if ((event.currentTarget as HTMLElement).hasAttribute('aria-haspopup'))
          return
        if (!itemDisabled(item))
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 禁用条目被聚焦也记锚点，方向键才有起点
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
      // 指针划过即把焦点搬来：活动项只有一个，hover 与键盘高亮不再各亮各的；
      // 只聚焦不滚动，滚动留给键盘导航
      'onPointerenter': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (isItemDisabled(el) || anchor === item.value)
          return
        pointerHot.add(el)
        focusSafely(el)
      },
      // 指针离开且没落到本菜单的其他位置：焦点还给 content，锚点随其 onFocus 清空。
      // 触摸 tap 序列里的 leave 不作数；子菜单触发条目在子层展开时保持高亮标记打开路径
      'onPointerleave': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (event.pointerType === 'touch' || !pointerHot.delete(el))
          return
        if (el.getAttribute('aria-expanded') === 'true' || el.ownerDocument.activeElement !== el)
          return
        const content = el.ownerDocument.getElementById(ids.content)
        if (!content || content.contains(event.relatedTarget as Node | null))
          return
        content.focus()
      },
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      // 标记位是纯装饰，语义由条目自己给出
      'aria-hidden': 'true',
    }),

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'role': 'separator',
      'aria-orientation': 'horizontal',
    }),

    getGroupProps: group => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      // 分组标题不是条目，只能靠 aria-labelledby 挂上来
      'aria-labelledby': groupLabelId(group.value),
    }),

    getGroupLabelProps: group => normalize.element({
      ...parts['group-label'].attrs,
      id: groupLabelId(group.value),
    }),

    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': {
        '--xh-_context-menu-arrow-x': arrowAt?.x != null ? `${arrowAt.x}px` : '',
        '--xh-_context-menu-arrow-y': arrowAt?.y != null ? `${arrowAt.y}px` : '',
      },
    }),
  }
}
