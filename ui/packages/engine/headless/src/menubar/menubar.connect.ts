import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, Orientation, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { MenubarApi, MenubarItemProps, MenubarNode, MenubarNodeMeta, MenubarSchema, MenubarTriggerProps } from './menubar.types'
import {
  focusItem,
  indexOfValue,
  isItemDisabled,
  ITEM_VALUE_ATTR,
  itemValue,
  matchTypeahead,
  navigateItems,
  navIntentFromKey,
  queryItems,
} from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { overlayPositioned } from '../shared/overlay'
import {
  menubarAnatomy,
  menubarItemQuery,
  menubarItemText,
  menubarTriggerQuery,
} from './menubar.anatomy'
import { MENUBAR_DEFAULT_PLACEMENT } from './menubar.machine'

const parts = menubarAnatomy.build()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_menubar-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectMenubar<T extends PropTypes>(
  service: Service<MenubarSchema>,
  normalize: NormalizeProps<T>,
): MenubarApi<T> {
  const { context, prop, send, refs, scope } = service
  // cell 初值可能是 undefined，这里归一成 null；有无菜单展开一律看它
  const value = context.get('value') ?? null
  const open = value != null
  const position = context.get('position')
  const placements = context.get('placements')
  const switching = context.get('switching')
  const handoffValue = context.get('handoffValue')
  const placement = position?.placement ?? prop('placement') ?? MENUBAR_DEFAULT_PLACEMENT
  const focusedValue = context.get('focusedValue') ?? null
  const focusedItem = context.get('focusedItem') ?? null
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? true
  const menubarDisabled = !!prop('disabled')
  const typeaheadOn = prop('typeahead') ?? true

  /** 交叉轴：主轴用于 trigger 之间移动，交叉轴用于进入菜单。 */
  const crossAxis: Orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'

  // collection 推出的节点元信息：显示文本与禁用都在这里定案，部件只报 value
  const toMeta = (node: MenubarNode): MenubarNodeMeta => ({
    value: node.value,
    label: node.label ?? node.value,
    disabled: !!node.disabled,
    items: (node.items ?? []).map(toMeta),
  })
  const collection: MenubarNodeMeta[] = (prop('collection') ?? []).map(toMeta)
  // 入口按 value 索引
  const menuMetaOf = new Map(collection.map(meta => [meta.value, meta]))
  // 条目跨菜单摊平成一张表，条目部件只报自己那一个 value；重名的以先出现的为准
  const itemMetaOf = new Map<string, MenubarNodeMeta>()
  for (const item of collection.flatMap(meta => meta.items)) {
    if (!itemMetaOf.has(item.value))
      itemMetaOf.set(item.value, item)
  }

  /** 入口禁用：部件上写的优先，没写就回 collection 里查。 */
  const triggerDisabled = (item: MenubarTriggerProps): boolean =>
    item.disabled ?? menuMetaOf.get(item.value)?.disabled ?? false

  /** 条目禁用：部件上写的优先，没写就回 collection 里查。 */
  const itemDisabled = (item: MenubarItemProps): boolean =>
    item.disabled ?? itemMetaOf.get(item.value)?.disabled ?? false

  const triggerId = (target: string): string => scope.partId(menubarAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(menubarAnatomy.name, `content:${target}`)
  const groupLabelId = (group: string): string => scope.partId(menubarAnatomy.name, `group-label:${group}`)
  const stateAttr = (isOpen: boolean): 'open' | 'closed' => (isOpen ? 'open' : 'closed')

  // item / item-text / item-indicator 共用同一份状态标记
  const itemStateAttrs = (item: MenubarItemProps): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(itemDisabled(item)),
    // 子部件够不着条目自身的 :focus 伪类，只能读这个标记
    'data-highlighted': dataAttr(focusedItem === item.value),
  })

  /**
   * 这个节点算不算还在这套菜单栏里。
   * 浮层搬去了 portal 落点、不再是 root 的后代，光问 root 会把「焦点走进菜单」当成离场。
   */
  /**
   * 顺着 aria-controls 往下找：条目开出来的子菜单也被搬去了浮层落点，
   * 它既不是 root 的后代、也不是本菜单栏那一张浮层的后代。子菜单还能再套子菜单，
   * 所以逐层展开找，深度设上限免得作者把 aria-controls 写成环。
   */
  const withinControlled = (scope: ParentNode | null, node: Node | null, depth: number): boolean => {
    if (!scope || !node || depth > 4)
      return false
    const doc = (scope as Element).ownerDocument ?? (scope as Document)
    for (const owner of scope.querySelectorAll('[aria-controls]')) {
      const panel = doc.getElementById(owner.getAttribute('aria-controls') ?? '')
      if (!panel)
        continue
      if (contains(panel, node) || withinControlled(panel, node, depth + 1))
        return true
    }
    return false
  }

  const withinMenubar = (root: HTMLElement | null, node: Node | null): boolean => {
    if (contains(root, node) || contains(refs.get('getFloatingEl')(), node))
      return true
    // 焦点走进子菜单不算离场，否则一进去整条菜单栏就收起
    const floating = refs.get('getFloatingEl')()
    return withinControlled(root, node, 0) || withinControlled(floating, node, 0)
  }

  /** 在 trigger 之间走一步并聚焦落点，禁用项跳过但仍可作起点。 */
  const focusTrigger = (from: string | null, intent: NavIntent): void => {
    const target = navigateItems(queryItems(refs.get('getRootEl')(), menubarTriggerQuery), from, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    // 显式再发一遍，不依赖 focus 事件是否派上
    send({ type: 'TRIGGER.FOCUS', value: next })
  }

  /** 把焦点从 trigger 送进已经展开的那张菜单。 */
  const focusEdgeItem = (intent: 'first' | 'last'): void => {
    const target = navigateItems(queryItems(refs.get('getContentEl')(), menubarItemQuery), null, intent)
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 菜单内方向键落点：以条目锚点为起点在活 DOM 上求解，禁用条目跳过。 */
  const navigateItem = (content: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(queryItems(content, menubarItemQuery), focusedItem, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈查找，未命中保持原状。 */
  const focusMatch = (content: HTMLElement, query: string): void => {
    const items = queryItems(content, menubarItemQuery)
    const target = matchTypeahead(items, indexOfValue(items, focusedItem), query, {
      text: menubarItemText,
      skip: isItemDisabled,
    })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 确认键：选中焦点所在的非禁用条目。 */
  const activate = (event: KeyboardEvent): void => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(parts.item.selector)
    const next = itemValue(item)
    // 带 aria-haspopup 的是子菜单入口：它自己管展开，父层不把它当可选中的条目
    if (!item || next == null || isItemDisabled(item) || item.hasAttribute('aria-haspopup'))
      return
    event.preventDefault()
    send({ type: 'ITEM.SELECT', value: next })
  }

  return {
    value,
    collection,
    open,
    focusedValue,
    focusedItem,
    orientation,
    disabled: menubarDisabled,
    isOpen: target => target === value,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    /** 根为 role=menubar，只管 Tab 位兜底与焦点离场。 */
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'menubar',
      'aria-orientation': orientation,
      'aria-disabled': menubarDisabled ? 'true' : 'false',
      'data-orientation': orientation,
      'data-state': stateAttr(open),
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'data-disabled': dataAttr(menubarDisabled),
      // 仅作者显式给出时才写，避免切断从祖先继承的方向
      'dir': prop('dir'),
      // roving tabindex：判据只能用 focusedValue，展开项可能是程序化设的或指向已删的 trigger，那时没有 trigger 认领 tabindex=0
      'tabindex': focusedValue == null ? 0 : -1,
      'onFocus': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        // 只接管从菜单栏外进来的焦点
        if (withinMenubar(root, event.relatedTarget as Node | null))
          return
        const triggers = queryItems(root, menubarTriggerQuery)
        // 优先落到展开项或 roving 锚点的 trigger，取不到则退回首个可停留 trigger
        const target = triggers.find(el => itemValue(el) === (focusedValue ?? value) && !isItemDisabled(el))
          ?? navigateItems(triggers, null, 'first', { loop })
        focusItem(target)
      },
      'onFocusOut': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        // 焦点在菜单栏内部换落点不算离场，走进浮层也算内部
        if (withinMenubar(root, event.relatedTarget as Node | null))
          return
        send({ type: 'MENUBAR.BLUR' })
      },
    }),

    /** 键盘处理挂在 trigger 上，而非 root。 */
    getTriggerProps: (item) => {
      const isOpen = item.value === value
      const disabled = menubarDisabled || triggerDisabled(item)
      return normalize.button({
        ...parts.trigger.attrs,
        // 导航与配对的身份标记
        [ITEM_VALUE_ATTR]: item.value,
        'id': triggerId(item.value),
        'type': 'button',
        'role': 'menuitem',
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen ? 'true' : 'false',
        'aria-controls': contentId(item.value),
        // 用 aria-disabled 而非原生 disabled，禁用项仍可聚焦、仍留在方向键行程里
        'aria-disabled': disabled ? 'true' : 'false',
        'data-state': stateAttr(isOpen),
        'data-disabled': dataAttr(disabled),
        // roving tabindex：整条菜单栏只有锚点 trigger 留在 Tab 序列内
        'tabindex': focusedValue === item.value ? 0 : -1,
        /** 已有菜单展开时掠过即切换，并把焦点搬到被掠过的 trigger 上。 */
        'onPointerEnter': (event: PointerEvent) => {
          if (disabled || !open)
            return
          focusItem(event.currentTarget as HTMLElement)
          send({ type: 'TRIGGER.POINTER', value: item.value })
        },
        // 禁用项被聚焦也记锚点作为方向键起点，禁用声明一并带上
        'onFocus': () => send({ type: 'TRIGGER.FOCUS', value: item.value, disabled }),
        'onClick': () => {
          if (!disabled)
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (menubarDisabled)
            return
          // 主轴：在 trigger 之间移动，Home/End 跳首尾项
          const move = navIntentFromKey(event, { axis: orientation, dir })
          if (move) {
            event.preventDefault()
            focusTrigger(item.value, move)
            return
          }
          if (triggerDisabled(item))
            return
          // 交叉轴：展开本项并落到菜单首/末项；已展开则直接把焦点送进去
          const cross = navIntentFromKey(event, { axis: crossAxis, dir, home: false })
          if (cross) {
            event.preventDefault()
            const edge = cross === 'prev' ? 'last' : 'first'
            if (isOpen)
              focusEdgeItem(edge)
            else
              send({ type: 'TRIGGER.OPEN', value: item.value, focus: edge })
            return
          }
          // 吞掉 Enter/Space，避免按钮默认行为再合成一次 click
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            // 按住不放会连发 keydown，这是切换：重复执行会来回翻转
            if (event.repeat)
              return
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
          }
        },
      })
    },

    getPositionerProps: (item) => {
      const isOpen = item.value === value
      // 坐标取本菜单名下的那份，不取共享份：换菜单时共享份立刻归新菜单所有，
      // 正在收起的那张若从共享份取会当场归零，退场动画就在视口左上角播
      const placed = placements[item.value]
      return normalize.element({
        ...parts.positioner.attrs,
        // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
        'dir': prop('dir'),
        [ITEM_VALUE_ATTR]: item.value,
        // 浮层不在 root 之内，语气与尺寸这两轴得在这里再打一遍
        'data-tone': prop('tone'),
        'data-size': prop('size'),
        'data-state': stateAttr(isOpen),
        'data-placement': isOpen ? placement : undefined,
        // 锚点被滚出可视区时引擎置 hidden
        'data-hidden': dataAttr(placed?.hidden),
        // 落位才露：按本菜单名下那份判。收起中的留着账，退场可见；展开前清过账，先藏
        'data-positioned': dataAttr(overlayPositioned(placed)),
        'style': {
          position: 'fixed',
          left: `${placed?.x ?? 0}px`,
          top: `${placed?.y ?? 0}px`,
          // content 继承这个高度上限，超出的条目在菜单内部滚
          ...availableHeightVar(isOpen ? placed?.availableHeight : undefined),
        },
      })
    },

    /** 菜单内的键盘在 content 上靠冒泡统一处理，Escape 由消解层负责。 */
    getContentProps: (item) => {
      const isOpen = item.value === value
      // 交接：新菜单落位前上一张保持显示——否则两张之间有一到几帧空档，快速掠过成频闪
      const holding = !isOpen && switching && item.value === handoffValue
      return normalize.element({
        ...parts.content.attrs,
        [ITEM_VALUE_ATTR]: item.value,
        'id': contentId(item.value),
        // 换张进行中两侧都带上：新开的不播进场、收起的不播退场，瞬时换张。
        // 首次展开与末次收起不带，动画照常
        'data-instant': dataAttr(switching),
        'role': 'menu',
        'aria-labelledby': triggerId(item.value),
        // Tab 位归锚点条目，展开却无锚点时由容器兜底
        'tabindex': isOpen && focusedItem == null ? 0 : -1,
        'data-state': stateAttr(isOpen),
        'data-placement': isOpen ? placement : undefined,
        // 收起时留在 DOM 只隐藏；交接中的那张先不藏，等新菜单落位同帧换掉
        'hidden': (!isOpen && !holding) || undefined,
        'onKeyDown': (event: KeyboardEvent) => {
          // 子菜单已经处理掉的键不再由本层接管：子层的收回键与 Escape 都会冒泡上来
          if (event.defaultPrevented)
            return
          const content = event.currentTarget as HTMLElement
          // 条目导航恒走纵轴，Home/End 跳本张菜单的首/末个可用条目
          const intent = navIntentFromKey(event, { axis: 'vertical' })
          if (intent) {
            event.preventDefault()
            navigateItem(content, intent)
            return
          }
          // 左右键把焦点移到相邻 trigger，展开项随之切换
          const across = navIntentFromKey(event, { axis: 'horizontal', dir, home: false })
          if (across) {
            event.preventDefault()
            focusTrigger(item.value, across)
            return
          }
          // 不拦默认行为，焦点按 Tab 序列自然离开
          if (event.key === 'Tab') {
            send({ type: 'CLOSE', src: 'tab' })
            return
          }
          // 连打检索只搬焦点；带 Ctrl/Meta/Alt 的组合不参与检索。缓冲区空时 push(' ') 返回 null，空格才落到下面当确认键
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
      })
    },

    getItemProps: item => normalize.element({
      ...parts.item.attrs,
      ...itemStateAttrs(item),
      // 导航、检索与选中的条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'menuitem',
      // 用 aria-disabled 而非原生 disabled，禁用条目仍可聚焦、仍能当方向键起点
      'aria-disabled': itemDisabled(item) ? 'true' : 'false',
      // roving tabindex：一张菜单里只有锚点条目留在 Tab 序列内
      'tabindex': focusedItem === item.value ? 0 : -1,
      'onClick': (event: MouseEvent) => {
        // 子菜单入口的点击归它自己（展开/收起），不发选中
        if ((event.currentTarget as HTMLElement).hasAttribute('aria-haspopup'))
          return
        if (!itemDisabled(item))
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 禁用条目被聚焦也记锚点，作为方向键起点
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      // 标记位是纯装饰
      'aria-hidden': true,
    }),

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'role': 'separator',
      // 分隔线恒横跨菜单
      'aria-orientation': 'horizontal',
    }),

    getGroupProps: group => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      // 分组标题靠 aria-labelledby 关联
      'aria-labelledby': groupLabelId(group.value),
    }),

    getGroupLabelProps: group => normalize.element({
      ...parts['group-label'].attrs,
      id: groupLabelId(group.value),
    }),
  }
}
