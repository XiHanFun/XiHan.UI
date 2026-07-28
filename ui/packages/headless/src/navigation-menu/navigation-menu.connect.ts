import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { NavigationMenuApi, NavigationMenuSchema } from './navigation-menu.types'
import { focusItem, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { contains, dataAttr } from '@xihan-ui/core'
import { navigationMenuAnatomy, navigationMenuTriggerQuery } from './navigation-menu.anatomy'

const parts = navigationMenuAnatomy.build()

export function connectNavigationMenu<T extends PropTypes>(
  service: Service<NavigationMenuSchema>,
  normalize: NormalizeProps<T>,
): NavigationMenuApi<T> {
  const { context, prop, send, scope } = service
  // value 与 defaultValue 皆缺省时 cell 初值是 undefined，这里归一成 null
  const value = context.get('value') ?? null
  // 位置由机器在 effect 里量好写进 context；这里只读结果，不碰 DOM，保持纯函数
  const indicator = context.get('indicator')
  const orientation = prop('orientation') ?? 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? true
  const label = prop('translations')?.root ?? 'Main navigation'
  const open = value != null

  const triggerId = (target: string): string => scope.partId(navigationMenuAnatomy.name, `trigger:${target}`)
  const contentId = (target: string): string => scope.partId(navigationMenuAnatomy.name, `content:${target}`)
  const stateAttr = (isOpen: boolean): 'open' | 'closed' => (isOpen ? 'open' : 'closed')

  /** 从某个 trigger 出发在同组 trigger 之间走一步。集合只在事件那一刻现查，不缓存。 */
  const navigate = (trigger: HTMLElement, from: string, intent: NavIntent): void => {
    const list = trigger.closest<HTMLElement>(parts.list.selector)
    focusItem(navigateItems(queryItems(list, navigationMenuTriggerQuery), from, intent, { loop }))
  }

  return {
    value,
    open,
    isOpen: target => target === value,
    setValue: next => send({ type: 'VALUE.SET', value: next }),

    // 根节点须是 nav 地标：站点导航是读屏用户最常直接跳进来的那个地标。
    // 收起的三条出口（指针离开、焦点离场、Escape）都在这儿收口——
    // 它们说的都是"人已经不在这套导航里了"，那是整棵子树的事，不是某个部件的事。
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'aria-label': label,
      'data-orientation': orientation,
      'data-state': stateAttr(open),
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': prop('dir'),
      'onPointerleave': (event: PointerEvent) => {
        const root = event.currentTarget as HTMLElement
        // 焦点还停在导航里时，鼠标恰好扫出去不该把键盘用户正在读的面板收走——
        // 面板一 hidden，他的焦点会连带掉回文档根部。这一路归 focusout 管
        if (contains(root, scope.getActiveElement()))
          return
        send({ type: 'DISMISS' })
      },
      'onFocusout': (event: FocusEvent) => {
        const root = event.currentTarget as HTMLElement
        const related = event.relatedTarget as Node | null
        // 焦点只是在导航内部换了个落点（从 trigger 走进面板）不算离场
        if (related && root.contains(related))
          return
        send({ type: 'DISMISS' })
      },
      // Escape 挂在根上而不是面板上：按下它时焦点可能在面板里，也可能还在 trigger 上，
      // 只有根接得住这两种
      'onKeydown': (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || value == null)
          return
        const root = event.currentTarget as HTMLElement
        const list = root.querySelector<HTMLElement>(parts.list.selector)
        const trigger = queryItems(list, navigationMenuTriggerQuery).find(el => itemValue(el) === value)
        send({ type: 'DISMISS' })
        // 焦点归还给刚被收起的那个 trigger：不还的话，面板一 hidden 焦点就掉回文档根部，
        // 键盘用户得从页首重新 Tab 一遍。机器在静默窗口里刻意不认 trigger 的聚焦，
        // 正是为了让这一还不会把面板当场重新弹出来
        focusItem(trigger ?? null)
      },
    }),

    // list 须是 ul：站点导航是一组并列的去处，读屏会念"列表，共 n 项"。
    // aria-orientation 不写：它对 list 角色无效（那是 tablist / menu 之类才有的属性），
    // 轴向只用 data-orientation 表达，样式与键盘各自读它。
    getListProps: () => normalize.element({
      ...parts.list.attrs,
      'data-orientation': orientation,
    }),

    getItemProps: () => normalize.element({
      ...parts.item.attrs,
    }),

    /**
     * 键盘挂在 trigger 自己身上，不挂 list。
     * 面板就住在 trigger 隔壁的同一个 item 里，事件会一路冒到 list——
     * 挂在 list 上的话，用户在面板内部按方向键会把顶层 trigger 的焦点搬走。
     */
    getTriggerProps: (item) => {
      const isOpen = item.value === value
      return normalize.button({
        ...parts.trigger.attrs,
        [ITEM_VALUE_ATTR]: item.value,
        'id': triggerId(item.value),
        'type': 'button',
        'aria-expanded': isOpen ? 'true' : 'false',
        'aria-controls': contentId(item.value),
        // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
        // 也不派发 click，禁用的那一项会连带退出方向键的行程。
        // 与 Switch/Checkbox 相反——那两个是单体控件，用原生 disabled。
        'aria-disabled': item.disabled ? 'true' : 'false',
        'data-state': stateAttr(isOpen),
        'data-disabled': dataAttr(item.disabled),
        // 不做 roving tabindex：每个 trigger 都留在 Tab 序列里。
        // 面板紧跟在 trigger 之后，展开时 Tab 才走得进去；套上 roving 之后
        // 一次 Tab 就会整组跳过去，"Tab 进入面板"这条路当场断掉。
        'onPointerenter': () => {
          if (!item.disabled)
            send({ type: 'TRIGGER.POINTER', value: item.value })
        },
        'onFocus': () => {
          if (!item.disabled)
            send({ type: 'TRIGGER.FOCUS', value: item.value })
        },
        'onClick': () => {
          if (!item.disabled)
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
        },
        'onKeydown': (event: KeyboardEvent) => {
          if (item.disabled)
            return
          // 轴跟随 orientation：横排导航里的上下键返回 null，
          // 不归导航管就绝不 preventDefault，放行给页面滚动与读屏。
          // dir 只作用于水平轴：rtl 下 ArrowRight 走上一个
          const intent = navIntentFromKey(event, { axis: orientation, dir })
          if (intent) {
            event.preventDefault()
            navigate(event.currentTarget as HTMLElement, item.value, intent)
            return
          }
          // Enter/Space 必须吞掉：按钮的默认激活会再合成一次 click，
          // 那一下 TOGGLE 会把刚展开的面板立刻关掉，看起来就是「按了没反应」
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            send({ type: 'TRIGGER.TOGGLE', value: item.value })
          }
        },
      })
    },

    /**
     * 面板常挂，靠 hidden 显隐：不做懒挂载，面板内的滚动位置与表单态才留得住，
     * 收起时也不会把作者写的节点整棵拆掉。
     * 收起态的 hidden 顺带把里面的链接移出 Tab 序列——Tab 因此会跳过收起的面板。
     */
    getContentProps: (item) => {
      const isOpen = item.value === value
      return normalize.element({
        ...parts.content.attrs,
        'id': contentId(item.value),
        // 一组有名字的链接。不给 role 的话 aria-labelledby 挂在裸 div 上会被读屏忽略
        'role': 'group',
        'aria-labelledby': triggerId(item.value),
        'data-state': stateAttr(isOpen),
        'data-orientation': orientation,
        'hidden': !isOpen || undefined,
      })
    },

    // 面板里的条目是链接不是命令：它们要跳走，因此不拦点击、也不 preventDefault，
    // 只把导航收起——跳走之后面板还开着会盖住新页面的顶部
    getLinkProps: link => normalize.element({
      ...parts.link.attrs,
      // 指向当前页面的那一条用 page（与页内目录的 location 不同：那儿指的是同一页的某个位置）。
      // aria-current 不是布尔属性，规范里默认值就是 "false"，省略即"不是当前项"
      'aria-current': link.current ? 'page' : undefined,
      'data-current': dataAttr(link.current),
      'onClick': () => send({ type: 'DISMISS' }),
    }),

    // 指示条是纯装饰：哪一项展开着，读屏那边已经由 aria-expanded 说清楚了
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': 'true',
      'data-state': stateAttr(open),
      'data-orientation': orientation,
      'data-value': value ?? undefined,
      'hidden': indicator == null || undefined,
      // 只写主轴那一条：横排导航的指示条是压在 trigger 下面的一道横杠，竖排是贴在起始缘的竖杠，
      // 交叉轴的粗细与贴边归样式层管。内联样式压得过样式表，两边都写就等于把皮肤焊死了
      'style': indicator
        ? (orientation === 'vertical'
            ? { insetBlockStart: `${indicator.blockStart}px`, blockSize: `${indicator.blockSize}px` }
            : { insetInlineStart: `${indicator.inlineStart}px`, inlineSize: `${indicator.inlineSize}px` })
        : undefined,
    }),

    // 可选的共享面板外壳：作者把它放进 root 里，画一层统一的边框/阴影/背景。
    // 它不带任何 aria——面板本身的语义在 content 上，这里再补一层只会多出一个空壳节点
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'data-state': stateAttr(open),
      'data-orientation': orientation,
      'hidden': !open || undefined,
    }),
  }
}
