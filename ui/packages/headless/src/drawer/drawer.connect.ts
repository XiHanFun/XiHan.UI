import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { DrawerApi, DrawerSchema, DrawerSide } from './drawer.types'
import { drawerAnatomy } from './drawer.anatomy'

const parts = drawerAnatomy.build()

/** side 缺省时的落点。 */
export const DRAWER_DEFAULT_SIDE: DrawerSide = 'right'

export function connectDrawer<T extends PropTypes>(
  service: Service<DrawerSchema>,
  normalize: NormalizeProps<T>,
): DrawerApi<T> {
  const { state, prop, send, scope } = service
  const open = state.get() === 'open'
  const modal = prop('modal') ?? true
  const role = prop('role') ?? 'dialog'
  const side = prop('side') ?? DRAWER_DEFAULT_SIDE
  const ids = scope.ids('drawer', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    side,
    setOpen,
    // root 留在页面原地（content 会被 portal 走），收起态也带 data-state / data-side
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-side': side,
    }),
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      'onClick': () => send({ type: 'TOGGLE' }),
    }),
    getBackdropProps: () => normalize.element({
      ...parts.backdrop.attrs,
      'data-state': stateAttr,
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': role,
      'tabindex': -1,
      // 非模态时显式写 "false"，不能省略：读屏对"未声明"与"声明为非模态"处理不同
      'aria-modal': modal ? 'true' : 'false',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      // content 被 portal 到 body 后 root 上的选择器够不着它，故自身也带 data-side
      'data-side': side,
      // positioner 非必需部件，content 收起态必须自带 hidden，否则最小结构（root + content）
      // 下抽屉关不掉（WC 侧 content 常驻，尤为明显）
      'hidden': !open || undefined,
    }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),
  }
}
