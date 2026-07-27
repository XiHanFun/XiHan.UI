import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { DrawerApi, DrawerSchema, DrawerSide } from './drawer.types'
import { drawerAnatomy } from './drawer.anatomy'

const parts = drawerAnatomy.build()

/** side 缺省时的落点。右侧滑出是抽屉最常见的形态，也与 LTR 的阅读方向一致。 */
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
    // root 留在页面原地（content 会被 portal 走），滑出边在收起态也读得到：
    // 要写"从右边推进来"的过渡，得先有一个开合之前就存在的钩子。
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
      // 显式写 false，不省略：省略与 aria-modal="false" 在读屏那里不是一回事——
      // 前者是"没说"，后者是"明确说了不是模态"，非模态抽屉要的是后者
      'aria-modal': modal ? 'true' : 'false',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      // 面板自己也带滑出边：它被 portal 到 body 之后，写在 root 上的选择器够不着它
      'data-side': side,
      // 收起态自己也带 hidden，不指望作者一定写了 positioner：
      // meta 里 positioner 并非必需部件，按最小合规结构（只有 root + content）写时，
      // 少了这一句，收起的抽屉会一直摊在页面上。
      // Vue 侧关闭后会把 content 卸掉、看不出来；WC 侧 content 常驻，一眼就见。
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
