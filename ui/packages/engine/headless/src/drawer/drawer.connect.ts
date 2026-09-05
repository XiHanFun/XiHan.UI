import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { DrawerApi, DrawerSchema, DrawerSide } from './drawer.types'
import { dataAttr } from '@xihan-ui/core'
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
  const contained = !!prop('contained')
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
      'data-size': prop('size'),
      'data-contained': dataAttr(contained),
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
      // 局部容器里遮罩改画在容器上，铺满视口的那份 fixed 由皮肤据此让位
      'data-contained': dataAttr(contained),
      // 形态轴落在 backdrop 上：三档换的都是这一层自己的底色与模糊
      'data-variant': prop('variant'),
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      'data-state': stateAttr,
      // 由皮肤的 inset 直接摆，不问引擎要坐标，没有「还没量完」的窗口：恒已落位
      'data-positioned': '',
      'data-contained': dataAttr(contained),
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
      // content 被 portal 到 body 后 root 上的选择器够不着它，故自身也带 data-side / data-size
      'data-side': side,
      'data-size': prop('size'),
      'data-contained': dataAttr(contained),
      // positioner 非必需部件，content 收起态必须自带 hidden，否则最小结构（root + content）
      // 下抽屉关不掉（WC 侧 content 常驻，尤为明显）
      'hidden': !open || undefined,
    }),
    // 面板三段：头与尾定在原处，正文自己滚
    getHeaderProps: () => normalize.element({ ...parts.header.attrs }),
    getTitleProps: () => normalize.element({ ...parts.title.attrs, id: ids.title }),
    getDescriptionProps: () => normalize.element({ ...parts.description.attrs, id: ids.description }),
    getBodyProps: () => normalize.element({ ...parts.body.attrs }),
    getFooterProps: () => normalize.element({ ...parts.footer.attrs }),
    getCloseTriggerProps: () => normalize.button({
      ...parts['close-trigger'].attrs,
      'type': 'button',
      'aria-label': prop('translations')?.close ?? 'Close',
      'onClick': () => send({ type: 'CLOSE', src: 'close-trigger' }),
    }),
  }
}
