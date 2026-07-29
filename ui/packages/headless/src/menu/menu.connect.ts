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
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? MENU_DEFAULT_PLACEMENT
  // roving tabindex 与方向键起点共用的锚点；收起态与指针展开后均为 null
  const anchor = context.get('focusedValue') ?? null
  const loop = prop('loop') ?? true
  const dir = prop('dir')

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

  /** 确认键：选中焦点所在的非禁用条目。 */
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
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时由引擎置位
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'absolute',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
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
      // 收起时留在 DOM 只隐藏
      'hidden': !open || undefined,
      'onKeydown': (event: KeyboardEvent) => {
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
      'aria-disabled': item.disabled ? 'true' : 'false',
      'data-disabled': dataAttr(item.disabled),
      // roving tabindex：整组只有锚点条目留在 Tab 序列内
      'tabindex': anchor === item.value ? 0 : -1,
      'onClick': () => {
        if (!item.disabled)
          send({ type: 'ITEM.SELECT', value: item.value })
      },
      // 禁用条目被聚焦也记锚点，作为方向键起点
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
