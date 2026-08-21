import { overlayPositioned } from '../shared/overlay'
import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { PopoverApi, PopoverSchema } from './popover.types'
import { dataAttr } from '@xihan-ui/kernel'
import { popoverAnatomy } from './popover.anatomy'

const parts = popoverAnatomy.build()

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_popover-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectPopover<T extends PropTypes>(
  service: Service<PopoverSchema>,
  normalize: NormalizeProps<T>,
): PopoverApi<T> {
  const { state, prop, send, context, scope } = service
  const open = state.get() === 'open'
  const modal = prop('modal') ?? false
  const ids = scope.ids('popover', 'trigger', 'content', 'title', 'description')
  const stateAttr = open ? 'open' : 'closed'
  // 位置由引擎写进 context，这里只读结果，不量 DOM、不调引擎
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const placement = position?.placement ?? prop('placement') ?? 'bottom'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,
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
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点被滚出可视区时引擎会置 hidden，样式据此收起浮层
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        ...availableHeightVar(position?.availableHeight),
      },
    }),
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      'aria-modal': modal ? 'true' : 'false',
      'aria-labelledby': ids.title,
      'aria-describedby': ids.description,
      'data-state': stateAttr,
      'data-placement': placement,
      // popover 没有 root 部件，尺寸轴落在浮层树最外层的 content 上
      'data-size': prop('size'),
      // 收起时留在 DOM 只隐藏，不卸载作者节点
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
    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': {
        '--xh-_popover-arrow-x': arrowAt?.x != null ? `${arrowAt.x}px` : '',
        '--xh-_popover-arrow-y': arrowAt?.y != null ? `${arrowAt.y}px` : '',
      },
    }),
  }
}
