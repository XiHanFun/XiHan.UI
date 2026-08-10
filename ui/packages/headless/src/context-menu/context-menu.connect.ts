import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ContextMenuApi, ContextMenuItemProps, ContextMenuNodeMeta, ContextMenuSchema } from './context-menu.types'
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
import { dataAttr } from '@xihan-ui/core'
import { contextMenuAnatomy, contextMenuItemQuery, contextMenuItemText } from './context-menu.anatomy'
import { CONTEXT_MENU_DEFAULT_PLACEMENT } from './context-menu.machine'

const parts = contextMenuAnatomy.build()

/** 右键那一下的 button 值；它不算「点到别处」。 */
const SECONDARY_BUTTON = 2

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
      // 命令式展开没有光标坐标，落回最近一次锚点（从未打开过则是原点）；焦点端给 'none'
      send({ type: 'OPEN', x: point?.x ?? 0, y: point?.y ?? 0, focus: 'none' })
    },
    openAt: (x, y) => send({ type: 'OPEN', x, y, focus: 'none' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      // 视觉轴只在根上输出，条目与分组标题继承根声明的私有槽
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
        // 浏览器自带的右键菜单必须让位，否则两张菜单叠在一起
        event.preventDefault()
        send({ type: 'CONTEXT.MENU', x: event.clientX, y: event.clientY, focus: 'first' })
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
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        // 引擎结果没回来之前先用光标坐标顶着；无引擎时它就是最终落位
        insetInlineStart: `${position?.x ?? point?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? point?.y ?? 0}px`,
      },
    }),

    // 键盘全在 content 上收口；Escape 不在这里收，归消解层管（只有栈顶层响应）。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'menu',
      'aria-labelledby': ids.trigger,
      // 有锚点时 Tab 位归锚点条目；展开着却没有锚点时由容器兜底，否则整个菜单没有 Tab 停靠点
      'tabindex': open && anchor == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
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
      'onClick': () => {
        if (!itemDisabled(item))
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 禁用条目被聚焦也记锚点，方向键才有起点
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
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
    }),
  }
}
