import type { NavIntent, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { MenuApi, MenuItemProps, MenuNodeMeta, MenuSchema } from './menu.types'
import { dataAttr, focusItem, focusSafely, indexOfValue, isItemDisabled, ITEM_VALUE_ATTR, itemValue, matchTypeahead, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/core'
import { overlayPositioned } from '../shared/overlay'
import { menuAnatomy, menuItemQuery, menuItemText } from './menu.anatomy'
import { menuFallbackPlacement } from './menu.machine'

const parts = menuAnatomy.build()

// 指针亲手点亮过的条目：pointerleave 只收自己点的漆，键盘建立的锚点被指针路过不受影响
const pointerHot = new WeakSet<Element>()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

// 行内轴同理：贴边时引擎回报 0，写进 min() 会把面板压成零宽
const AVAILABLE_W_FLOOR = 96

/** 引擎回报的可用尺寸转成 CSS 长度；低于下限当作没算出来，空串撤掉声明。 */
function availablePx(available: number | undefined, floor: number): string {
  return available != null && available >= floor ? `${available}px` : ''
}

function availableSpaceVars(
  placed: { availableWidth?: number, availableHeight?: number } | null | undefined,
): Record<string, string> {
  return {
    '--xh-_menu-available-w': availablePx(placed?.availableWidth, AVAILABLE_W_FLOOR),
    '--xh-_menu-available-h': availablePx(placed?.availableHeight, AVAILABLE_H_FLOOR),
  }
}

export function connectMenu<T extends PropTypes>(
  service: Service<MenuSchema>,
  normalize: NormalizeProps<T>,
): MenuApi<T> {
  const { state, prop, send, context, refs, scope } = service
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
  const typeaheadOn = prop('typeahead') ?? true
  const menuDisabled = !!prop('disabled')

  // collection 推出的条目元信息：显示文本与禁用都在这里定案，条目部件只报 value
  const collection: MenuNodeMeta[] = (prop('collection') ?? []).map(node => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    separatorBefore: !!node.separatorBefore,
  }))
  const metaOf = new Map(collection.map(meta => [meta.value, meta]))

  /** 条目禁用：整张菜单禁用一票通过，否则部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: MenuItemProps): boolean =>
    menuDisabled || (item.disabled ?? metaOf.get(item.value)?.disabled ?? false)

  // item / item-text / item-indicator / item-description 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: MenuItemProps): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(itemDisabled(item)),
    // 子部件够不着条目的 :focus 伪类，只能读这个标记
    'data-highlighted': dataAttr(anchor === item.value),
  })

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

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用条目跳过；未命中保持原状。 */
  const focusMatch = (content: HTMLElement, query: string): void => {
    const items = queryItems(content, menuItemQuery)
    const target = matchTypeahead(items, indexOfValue(items, anchor), query, {
      text: menuItemText,
      skip: isItemDisabled,
    })
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
    disabled: menuDisabled,
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
      'disabled': menuDisabled || undefined,
      'data-state': stateAttr,
      'data-disabled': dataAttr(menuDisabled),
      'onClick': () => {
        if (!menuDisabled)
          send({ type: 'TOGGLE', focus: 'first' })
      },
      'onKeydown': (event: KeyboardEvent) => {
        if (menuDisabled)
          return
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
        ...availableSpaceVars(position),
      },
    }),
    // 键盘在 content 上靠冒泡统一处理，Escape 由消解层负责
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'menu',
      // 作者给了名字就用它，没给仍由触发器代为命名
      'aria-label': prop('translations')?.content,
      'aria-labelledby': prop('translations')?.content == null ? ids.trigger : undefined,
      // Tab 位归锚点条目，展开却无锚点时由容器兜底
      'tabindex': open && anchor == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 菜单没有 root 部件，视觉轴落在浮层树最外层的 content 上，条目继承私有槽
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      // Presence 保留视觉节点期间，逻辑关闭立即撤出交互与可访问树。
      'inert': !open || undefined,
      'aria-hidden': !open || undefined,
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
        // 连打检索只搬焦点。缓冲区空时空格不算字符（push 返回 null），落到下面当确认键；
        // 缓冲区非空时归检索。带 Ctrl/Meta/Alt 的组合不归检索管，否则 Ctrl+F 之类会被吞掉
        const query = typeaheadOn && !event.ctrlKey && !event.metaKey && !event.altKey
          ? refs.get('typeahead').push(event.key)
          : null
        if (query != null) {
          event.preventDefault()
          focusMatch(event.currentTarget as HTMLElement, query)
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
    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      // 标记位是纯装饰，语义由条目自己给出
      'aria-hidden': true,
    }),

    getItemDescriptionProps: item => normalize.element({
      ...parts['item-description'].attrs,
      ...itemStateAttrs(item),
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
