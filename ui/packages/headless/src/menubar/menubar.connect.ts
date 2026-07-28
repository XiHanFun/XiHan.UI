import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, Orientation, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { MenubarApi, MenubarItemProps, MenubarSchema } from './menubar.types'
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
import { contains, dataAttr } from '@xihan-ui/core'
import {
  menubarAnatomy,
  menubarContentQuery,
  menubarItemQuery,
  menubarItemText,
  menubarTriggerQuery,
} from './menubar.anatomy'
import { MENUBAR_DEFAULT_PLACEMENT } from './menubar.machine'

const parts = menubarAnatomy.build()

export function connectMenubar<T extends PropTypes>(
  service: Service<MenubarSchema>,
  normalize: NormalizeProps<T>,
): MenubarApi<T> {
  const { context, prop, send, refs, scope } = service
  // value 与 defaultValue 皆缺省时 cell 初值是 undefined，这里归一成 null。
  // "有没有菜单展开着"只认它一个说法，不另看状态位——两套说法迟早会说岔。
  const value = context.get('value') ?? null
  const open = value != null
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? MENUBAR_DEFAULT_PLACEMENT
  const focusedValue = context.get('focusedValue') ?? null
  const focusedItem = context.get('focusedItem') ?? null
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? true
  const menubarDisabled = !!prop('disabled')
  const typeaheadOn = prop('typeahead') ?? true

  /**
   * 交叉轴：菜单栏横排时菜单向下展开（ArrowDown 进菜单），竖排时向侧边展开（ArrowRight 进菜单）。
   * 主轴归 trigger 之间的移动，交叉轴归"进这张菜单"，两者永不抢同一对键。
   */
  const crossAxis: Orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal'

  const triggerId = (target: string): string => scope.partId(menubarAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(menubarAnatomy.name, `content:${target}`)
  const groupLabelId = (group: string): string => scope.partId(menubarAnatomy.name, `group-label:${group}`)
  const stateAttr = (isOpen: boolean): 'open' | 'closed' => (isOpen ? 'open' : 'closed')

  // item / item-text / item-indicator 共用同一份状态标记，样式层各处一致
  const itemStateAttrs = (item: MenubarItemProps): Record<string, string | undefined> => ({
    'data-disabled': dataAttr(item.disabled),
    // 焦点真的落在条目上，条目自己用 :focus 也画得出来；子部件够不着那个伪类，只能读这个标记
    'data-highlighted': dataAttr(focusedItem === item.value),
  })

  /**
   * 集合一律在事件那一刻现查：两个适配器此时看到的是同一份活 DOM，顺序即文档序，
   * 增删无需记账。渲染期不得调用——那里 Vue 读到的是上一帧、WC 读到的是本帧，两侧会分叉。
   */
  const findContent = (root: HTMLElement | null, target: string): HTMLElement | null =>
    queryItems(root, menubarContentQuery).find(el => itemValue(el) === target) ?? null

  /** 在菜单栏那排 trigger 之间走一步，落点拿到焦点。禁用项自动跳过，但它仍能当起点。 */
  const focusTrigger = (root: HTMLElement | null, from: string | null, intent: NavIntent): void => {
    const target = navigateItems(queryItems(root, menubarTriggerQuery), from, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    // 焦点事件本身也会上报一次，这里显式再发一遍是为了不把"换项"押在 focus 能不能派上：
    // 同值重发在机器里是空操作（cell 值没变即不通知）
    send({ type: 'TRIGGER.FOCUS', value: next })
  }

  /** 把焦点从 trigger 送进已经展开的那张菜单。此刻内容已可见，直接现查现聚焦。 */
  const focusEdgeItem = (root: HTMLElement | null, menu: string, intent: 'first' | 'last'): void => {
    const target = navigateItems(queryItems(findContent(root, menu), menubarItemQuery), null, intent)
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 菜单内的方向键落点：起点用条目锚点，终点用活 DOM 算，禁用条目自动跳过。 */
  const navigateItem = (content: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(queryItems(content, menubarItemQuery), focusedItem, intent, { loop })
    const next = itemValue(target)
    if (next == null)
      return
    focusItem(target)
    send({ type: 'ITEM.FOCUS', value: next })
  }

  /** 连打检索落点：从当前锚点的下一个绕一圈找，禁用条目跳过；未命中保持原状。 */
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

  /** 确认键：认焦点当下所在的条目，自报禁用的不认。 */
  const activate = (event: KeyboardEvent): void => {
    const item = (event.target as HTMLElement).closest<HTMLElement>(parts.item.selector)
    const next = itemValue(item)
    if (!item || next == null || isItemDisabled(item))
      return
    event.preventDefault()
    send({ type: 'ITEM.SELECT', value: next })
  }

  return {
    value,
    open,
    focusedValue,
    focusedItem,
    orientation,
    disabled: menubarDisabled,
    isOpen: target => target === value,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    /**
     * 根是 role=menubar：读屏据此播报"菜单栏，共 N 项"，也据此决定念哪一对方向键。
     * 键盘不在这里收口——菜单的浮层就住在 root 里面，挂在这儿的处理器会把菜单内部的
     * 方向键一并吞掉。root 只管两件跨部件的事：Tab 位兜底与焦点离场。
     */
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'menubar',
      'aria-orientation': orientation,
      'aria-disabled': menubarDisabled ? 'true' : 'false',
      'data-orientation': orientation,
      'data-state': stateAttr(open),
      'data-disabled': dataAttr(menubarDisabled),
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      // roving tabindex：焦点在菜单栏外时容器兜底进 Tab 序列，由 onFocus 转投给 trigger。
      // 判据用 focusedValue 而非"展开项"：展开项可能是程序化设的（焦点根本不在菜单栏里），
      // 也可能指向一个已被删掉的 trigger，那时没有任何 trigger 认领 tabindex=0，
      // 容器再一让位，整条菜单栏对键盘用户永久不可达。
      // 焦点已在条内时容器让位（-1），整条因此只有一个 Tab 位。
      'tabindex': focusedValue == null ? 0 : -1,
      'onFocus': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        // 只接管从菜单栏外进来的焦点：条内往外退时转投会把人困在菜单栏里
        if (contains(root, event.relatedTarget as Node | null))
          return
        const triggers = queryItems(root, menubarTriggerQuery)
        // 优先落到展开项的 trigger（程序化展开时焦点该到那张菜单上），
        // 其次是 roving 锚点，都取不到就退回首个可停留 trigger
        const target = triggers.find(el => itemValue(el) === (focusedValue ?? value) && !isItemDisabled(el))
          ?? navigateItems(triggers, null, 'first', { loop })
        focusItem(target)
      },
      'onFocusOut': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        // 焦点只是在菜单栏内部换了个落点（从 trigger 走进菜单）不算离场
        if (contains(root, event.relatedTarget as Node | null))
          return
        send({ type: 'MENUBAR.BLUR' })
      },
    }),

    /**
     * 键盘挂在 trigger 自己身上，不挂 root：菜单就住在 trigger 隔壁的浮层里，
     * 事件会一路冒到 root——挂在 root 上的话，用户在菜单内部按方向键会把 trigger 的焦点搬走。
     */
    getTriggerProps: (item) => {
      const isOpen = item.value === value
      const disabled = menubarDisabled || !!item.disabled
      return normalize.button({
        ...parts.trigger.attrs,
        // 导航与配对都以此为身份
        [ITEM_VALUE_ATTR]: item.value,
        'id': triggerId(item.value),
        'type': 'button',
        // 菜单栏的每一项本身就是一个菜单项（弹出子菜单的那种）
        'role': 'menuitem',
        'aria-haspopup': 'menu',
        'aria-expanded': isOpen ? 'true' : 'false',
        'aria-controls': contentId(item.value),
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
        // 也不派发 click，禁用的那一项会连带退出方向键的行程。
        // 与 Switch/Checkbox 相反——那两个是单体控件，用原生 disabled。
        'aria-disabled': disabled ? 'true' : 'false',
        'data-state': stateAttr(isOpen),
        'data-disabled': dataAttr(disabled),
        // roving tabindex：整条菜单栏只有锚点 trigger 留在 Tab 序列内
        'tabindex': focusedValue === item.value ? 0 : -1,
        /**
         * 打开态传染：已经有菜单展开着，掠过就切换过去——不用点、也不等延时。
         * 一个都没展开时掠过什么也不做（守卫在机器里），指针横穿整条菜单栏不会一路闪出菜单。
         * 焦点跟着搬到被掠过的 trigger 上：不搬的话焦点还留在上一张菜单的条目里，
         * 那个条目下一刻就被 hidden 收走，焦点会掉回文档根部。
         */
        'onPointerEnter': (event: PointerEvent) => {
          if (disabled || !open)
            return
          focusItem(event.currentTarget as HTMLElement)
          send({ type: 'TRIGGER.POINTER', value: item.value })
        },
        // 焦点是事实不是许可：禁用项被点到也记锚点，方向键才知道从哪儿起步。
        // 禁用声明一并带上——机器据此拒绝把菜单展开到一个被禁用的项上
        'onFocus': () => send({ type: 'TRIGGER.FOCUS', value: item.value, disabled }),
        'onClick': () => {
          if (!disabled)
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (menubarDisabled)
            return
          const root = (event.currentTarget as HTMLElement).closest<HTMLElement>(parts.root.selector)
          // 主轴：在 trigger 之间走。禁用项也走得动——它仍是方向键的起点。
          // dir 只作用于水平轴：rtl 下 ArrowRight 走上一个。Home/End 跳首尾项。
          const move = navIntentFromKey(event, { axis: orientation, dir })
          if (move) {
            event.preventDefault()
            focusTrigger(root, item.value, move)
            return
          }
          if (item.disabled)
            return
          // 交叉轴：展开本项并落到菜单首/末项。已经展开着就直接把焦点送进去——
          // 此刻内容已可见，不必再走一遍展开
          const cross = navIntentFromKey(event, { axis: crossAxis, dir, home: false })
          if (cross) {
            event.preventDefault()
            const edge = cross === 'prev' ? 'last' : 'first'
            if (isOpen)
              focusEdgeItem(root, item.value, edge)
            else
              send({ type: 'TRIGGER.OPEN', value: item.value, focus: edge })
            return
          }
          // Enter/Space 必须吞掉：按钮的默认激活会再合成一次 click，
          // 展开随即被那次 TOGGLE 关掉，看起来就是「按了没反应」
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
          }
        },
      })
    },

    getPositionerProps: (item) => {
      const isOpen = item.value === value
      return normalize.element({
        ...parts.positioner.attrs,
        [ITEM_VALUE_ATTR]: item.value,
        'data-state': stateAttr(isOpen),
        'data-placement': isOpen ? placement : undefined,
        // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
        'data-hidden': dataAttr(isOpen && position?.hidden),
        // 坐标只发给展开的那一张：引擎同时只跟一个锚点，别的 positioner 拿到的会是别人的位置
        'style': {
          position: 'absolute',
          insetInlineStart: `${(isOpen ? position?.x : undefined) ?? 0}px`,
          insetBlockStart: `${(isOpen ? position?.y : undefined) ?? 0}px`,
        },
      })
    },

    /**
     * 菜单内的键盘全在 content 上收口：条目只管声明自己，一次冒泡一个处理器。
     * Escape 不在这里收——它归消解层管（只有栈顶层响应，嵌套浮层才能逐层关闭）。
     */
    getContentProps: (item) => {
      const isOpen = item.value === value
      return normalize.element({
        ...parts.content.attrs,
        [ITEM_VALUE_ATTR]: item.value,
        'id': contentId(item.value),
        'role': 'menu',
        'aria-labelledby': triggerId(item.value),
        // 有锚点时 Tab 位归锚点条目；展开着却没有锚点（指针展开、条目被删）时由容器兜底，
        // 否则这张菜单一个 Tab 停靠点都没有、键盘再也进不去。
        // 收起态不需要兜底：content 此时是 hidden。
        'tabindex': isOpen && focusedItem == null ? 0 : -1,
        'data-state': stateAttr(isOpen),
        'data-placement': isOpen ? placement : undefined,
        // 收起时留在 DOM 只隐藏，不卸载作者节点
        'hidden': !isOpen || undefined,
        'onKeyDown': (event: KeyboardEvent) => {
          const content = event.currentTarget as HTMLElement
          // 菜单本身恒是一列条目，条目导航永远走纵轴，与菜单栏的 orientation 无关。
          // Home/End 一并归它，跳到本张菜单的首/末个可用条目
          const intent = navIntentFromKey(event, { axis: 'vertical' })
          if (intent) {
            event.preventDefault()
            navigateItem(content, intent)
            return
          }
          // 左右键切到相邻菜单并保持展开：焦点落到相邻 trigger 上，
          // 展开项由机器跟着搬（TRIGGER.FOCUS 在展开态下即换项）
          const across = navIntentFromKey(event, { axis: 'horizontal', dir, home: false })
          if (across) {
            event.preventDefault()
            focusTrigger(content.closest<HTMLElement>(parts.root.selector), item.value, across)
            return
          }
          // 不 preventDefault：菜单让开，焦点按 Tab 序列自然离开
          if (event.key === 'Tab') {
            send({ type: 'CLOSE', src: 'tab' })
            return
          }
          // 连打检索只搬焦点。缓冲区空时空格不算字符（push 返回 null），落到下面当确认键；
          // 缓冲区非空时它是词中间的空格，归检索——既已被检索吞掉就一并拦下默认滚动。
          // 带 Ctrl/Meta/Alt 的组合一律不归检索管，否则 Ctrl+F 之类会被吞掉。
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
      // 导航、检索与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'menuitem',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用条目就再也当不成方向键的起点，样式与行为也会就此分裂
      'aria-disabled': item.disabled ? 'true' : 'false',
      // roving tabindex：一张菜单里只有锚点条目留在 Tab 序列内
      'tabindex': focusedItem === item.value ? 0 : -1,
      'onClick': () => {
        if (!item.disabled)
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
    }),

    getItemTextProps: item => normalize.element({
      ...parts['item-text'].attrs,
      ...itemStateAttrs(item),
    }),

    getItemIndicatorProps: item => normalize.element({
      ...parts['item-indicator'].attrs,
      ...itemStateAttrs(item),
      // 标记位是纯装饰（勾选符号、图标、快捷键提示），条目自己已经把语义说全了
      'aria-hidden': 'true',
    }),

    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'role': 'separator',
      // 菜单是一列条目，分隔线横跨其间，与菜单栏自身的 orientation 无关
      'aria-orientation': 'horizontal',
    }),

    getGroupProps: group => normalize.element({
      ...parts.group.attrs,
      'role': 'group',
      // 分组标题不是条目，只能靠 aria-labelledby 挂上来；读屏据此播报「第 N 组，编辑」
      'aria-labelledby': groupLabelId(group.value),
    }),

    getGroupLabelProps: group => normalize.element({
      ...parts['group-label'].attrs,
      id: groupLabelId(group.value),
    }),
  }
}
