import type { NavIntent } from '@xihan-ui/behavior'
import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { MenuApi, MenuSchema } from './menu.types'
import { focusItem, isItemDisabled, ITEM_VALUE_ATTR, itemValue, navigateItems, navIntentFromKey, queryItems } from '@xihan-ui/behavior'
import { dataAttr } from '@xihan-ui/core'
import { menuAnatomy, menuItemQuery } from './menu.anatomy'
import { MENU_DEFAULT_PLACEMENT } from './menu.machine'

const parts = menuAnatomy.build()

export function connectMenu<T extends PropTypes>(
  service: Service<MenuSchema>,
  normalize: NormalizeProps<T>,
): MenuApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const ids = scope.ids('menu', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context；这里只读结果，不量 DOM、不调引擎，保持纯函数
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? MENU_DEFAULT_PLACEMENT
  // roving tabindex 与方向键起点共用这一个锚点；收起时为 null（条目此刻不可达）
  const anchor = context.get('focusedValue') ?? null
  const loop = prop('loop') ?? true
  const dir = prop('dir')

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send(next ? { type: 'OPEN', focus: 'first' } : { type: 'CLOSE' })
  }

  /**
   * 方向键落点：条目集合只在事件那一刻读，两个适配器此时看到的是同一份活 DOM，
   * 顺序即文档序。起点用锚点，终点用活 DOM 算，禁用条目自动跳过。
   */
  const navigate = (content: HTMLElement, intent: NavIntent): void => {
    const target = navigateItems(queryItems(content, menuItemQuery), anchor, intent, { loop })
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
        // 纵向轴 + 不收 Home/End：ArrowDown 从首个条目进、ArrowUp 从末个进；
        // 返回 null（左右键、带修饰键的组合）不归导航管，此时绝不 preventDefault
        const intent = navIntentFromKey(event, { axis: 'vertical', home: false })
        if (intent) {
          event.preventDefault()
          send({ type: 'OPEN', focus: intent === 'prev' ? 'last' : 'first' })
          return
        }
        // Enter/Space 必须吞掉：按钮的默认激活会再合成一次 click，
        // 展开随即被那次 TOGGLE 关掉，看起来就是「按了没反应」
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          send({ type: 'OPEN', focus: 'first' })
        }
      },
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'absolute',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),
    // 键盘全在 content 上收口：条目只管声明自己，一次冒泡一个处理器。
    // Escape 不在这里收——它归消解层管（只有栈顶层响应，嵌套浮层才能逐层关闭）。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'menu',
      'aria-labelledby': ids.trigger,
      // 有锚点时 Tab 位归锚点条目；展开着却没有锚点（条目被删、或首帧还没挑出锚点）时
      // 由容器兜底，否则整个菜单一个 Tab 停靠点都没有、键盘再也进不去
      // （tabs / radio-group 的容器用的是同一条规则）。收起态不需要兜底：content 此时是 hidden。
      'tabindex': open && anchor == null ? 0 : -1,
      'data-state': stateAttr,
      'data-placement': placement,
      // 收起时留在 DOM 只隐藏，不卸载作者节点
      'hidden': !open || undefined,
      'onKeydown': (event: KeyboardEvent) => {
        // 纵向菜单：左右键返回 null，放行给页面滚动与读屏（也留给将来的子菜单）
        const intent = navIntentFromKey(event, { axis: 'vertical', dir })
        if (intent) {
          event.preventDefault()
          navigate(event.currentTarget as HTMLElement, intent)
          return
        }
        // 不 preventDefault：菜单让开，焦点按 Tab 序列自然离开
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
      // 导航与选中都以此为条目身份
      [ITEM_VALUE_ATTR]: item.value,
      'role': 'menuitem',
      // 集合条目一律 aria-disabled，绝不输出原生 disabled：原生 disabled 不可聚焦、
      // 也不派发 click，禁用策略与样式会就此分裂。与 Switch/Checkbox 相反——
      // 那两个是单体控件，用原生 disabled。
      'aria-disabled': item.disabled ? 'true' : 'false',
      'data-disabled': dataAttr(item.disabled),
      // roving tabindex：整组只有锚点条目留在 Tab 序列内。锚点在展开那一刻由机器
      // 落到首/末个可用条目，收起态无锚点——此时条目连同 content 一起 hidden，本就不可达。
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': () => {
        if (!item.disabled)
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 焦点是事实不是许可：禁用条目被点到也记锚点，方向键才知道从哪儿起步
      'onFocus': () => send({ type: 'ITEM.FOCUS', value: item.value }),
    }),
    getSeparatorProps: () => normalize.element({
      ...parts.separator.attrs,
      'role': 'separator',
      'aria-orientation': 'horizontal',
    }),
    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
      'data-placement': placement,
    }),
  }
}
