import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { MenuApi, MenuItemProps, MenuNodeMeta, MenuSchema } from './menu.types'
import { dataAttr, focusItem, focusSafely, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { overlayPositioned } from '../shared/overlay'
import { menuAnatomy, menuItemQuery } from './menu.anatomy'
import { menuFallbackPlacement } from './menu.machine'

const parts = menuAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘建立的锚点被指针路过不受影响
const pointerHot = new WeakSet<Element>()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_menu-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectMenu<T extends PropTypes>(
  service: Service<MenuSchema>,
  normalize: NormalizeProps<T>,
): MenuApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('menu', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const submenu = !!prop('submenu')
  const placement = position?.placement ?? prop('placement') ?? menuFallbackPlacement(submenu, prop('dir'))
  // roving tabindex 与方向键起点共用的锚点；收起态与指针展开后均为 null
  const anchor = context.get('focusedValue') ?? null
  const loop = prop('loop') ?? true
  const dir = prop('dir')

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: MenuNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    separatorBefore: !!node.separatorBefore,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: MenuItemProps): boolean =>
    item.disabled ?? metaOf.get(item.value)?.disabled ?? false

  const groupLabelId = (group: string): string =>
    scope.partId(menuAnatomy.name, `group-label:${group}`)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send(next ? { type: 'OPEN', focus: 'first' } : { type: 'CLOSE' })
  }

  /** 方向键落点：现查条目集合，以锚点为起点，禁用条目跳过。 */
  const navigate = (content: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(queryItems(content, menuItemQuery), anchor, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 确认键：选中焦点所在的非禁用条目；子菜单触发条目（带 aria-haspopup）归子层管。 */
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
    focusedValue: anchor,
    setOpen,
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'TOGGLE', focus: 'first' }),
      'onKeydown': (event: KeyboardEvent) => {
        // 纵向轴且不收 Home/End：ArrowDown 从首个条目进、ArrowUp 从末个进
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent === 'prev' ? 'last' : 'first' })
          return
        }
        // 吞掉 Enter/Space，避免按钮默认行为再合成一次 click
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: 'first' })
        }
      },
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时由引擎置位
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        // content 继承这个高度上限，超出的条目在菜单内部滚
        ...availableHeightVar(position?.availableHeight),
      },
    }),
    // 键盘在 content 上靠冒泡统一处理，Escape 由消解层负责
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'menu',
      'aria-labelledby': ids.trigger,
      // Tab 位归锚点条目，展开却无锚点时由容器兜底
      'tabindex': open && anchor == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 菜单没有 root 部件，视觉轴落在浮层树最外层的 content 上，条目继承私有槽
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      // 收起时留在 DOM 只隐藏
      'hidden': !open || undefined,
      // content 自身拿到焦点＝没有活动条目：锚点清空，Tab 停靠点回容器兜底
      'onFocus': (event: FocusEvent) => {
        if (event.target === event.currentTarget)
          send({ type: 'FOCUS.CLEAR' })
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (event.defaultPrevented)
          return
        // 子菜单：朝触发器方向的横向键收回本层，焦点还给触发条目
        if (submenu && event.key === (dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft')) {
          event.preventDefault()
          send({ type: 'CLOSE' })
          return
        }
        // 纵向菜单：左右键返回 null，放行给页面
        const intent = navIntentFromKey(event, { axis: 'vertical', dir })
        if (intent) {
          event.preventDefault()
          navigate(event.currentTarget as HTMLElement, intent)
          return
        }
        // 不拦默认行为，焦点按 Tab 序列自然离开
        if (event.key === 'Tab') {
          send({ type: 'CLOSE', src: 'tab' })
          return
        }
        if (event.key === 'Enter' || event.key === ' ')
          activate(event)
      },
    }),
    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      // 导航与选中的条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'menuitem',
      // 用 aria-disabled 而非原生 disabled，禁用条目仍可聚焦
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      'data-disabled': dataAttr(itemDisabled(item)),
      // 皮肤的高亮只读这个标记：焦点落在条目上时由这里同步打上
      'data-highlighted': dataAttr(anchor === item.value),
      // roving tabindex：整组只有锚点条目留在 Tab 序列内
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': (event: MouseEvent) => {
        // 子菜单触发条目（带 aria-haspopup）的点按归子层：只展开不选中
        if ((event.currentTarget as HTMLElement).hasAttribute('aria-haspopup'))
          return
        if (!itemDisabled(item))
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 禁用条目被聚焦也记锚点，作为方向键起点
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
    // 双重身份：value 是它在父菜单里的条目身份（父层导航与高亮照常认），
    // 其余属性都是本子菜单的触发器。父层的选中经 aria-haspopup 嗅探跳过它。
    getSubmenuTriggerProps: item => normalize.element({
      ...parts.item.attrs,
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'menuitem',
      'aria-haspopup': 'menu',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      'data-disabled': dataAttr(itemDisabled(item)),
      'data-state': stateAttr,
      'onClick': (event: MouseEvent) => {
        if (itemDisabled(item))
          return
        // 点按先把焦点落在触发条目上：活动项跟随交互，父层随后的焦点归位
        // 指向这里而不是旧锚点，不会把刚开的子层判成焦点外移
        const triggerEl = event.currentTarget as HTMLElement
        triggerEl.focus()
        send({ type: 'TOGGLE', focus: 'none' })
      },
      'onPointerenter': (event: PointerEvent) => {
        const el = event.currentTarget as HTMLElement
        if (!isItemDisabled(el))
          focusSafely(el)
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (event.defaultPrevented || itemDisabled(item))
          return
        const expandKey = prop('dir') === 'rtl' ? 'ArrowLeft' : 'ArrowRight'
        if (event.key === expandKey || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: 'first' })
        }
      },
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
      'aria-hidden': true,
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': {
        '--xh-_menu-arrow-x': arrowAt?.x != null ? `${arrowAt.x}px` : '',
        '--xh-_menu-arrow-y': arrowAt?.y != null ? `${arrowAt.y}px` : '',
      },
    }),
  }
}
