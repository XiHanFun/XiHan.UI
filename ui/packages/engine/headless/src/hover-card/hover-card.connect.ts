import { overlayPositioned } from '../shared/overlay'
import type { NormalizeProps, Placement, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { HoverCardApi, HoverCardSchema } from './hover-card.types'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { hoverCardAnatomy } from './hover-card.anatomy'

const parts = hoverCardAnatomy.build()

/** 定位结果落地前的占位朝向。 */
const DEFAULT_PLACEMENT: Placement = 'bottom'

// 落定那一侧的可用高度。贴边时引擎会回报 0，直接写进 min() 会把面板压成零高，
// 所以低于这个下限就当作没算出来：空串撤掉声明，退回皮肤 positioner 上那档 100vh
const AVAILABLE_H_FLOOR = 96

function availableHeightVar(available: number | undefined): Record<string, string> {
  return {
    '--xh-_hover-card-available-h':
      available != null && available >= AVAILABLE_H_FLOOR ? `${available}px` : '',
  }
}

export function connectHoverCard<T extends PropTypes>(
  service: Service<HoverCardSchema>,
  normalize: NormalizeProps<T>,
): HoverCardApi<T> {
  const { state, context, prop, send, refs, scope } = service
  // visible 的两个子态下浮层都可见
  const open = state.matches('visible')
  const disabled = !!prop('disabled')
  const ids = scope.ids('hover-card', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  const position = context.get('position')
  // 箭头落点：引擎没算（没要箭头 / 尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow
  const placement = position?.placement ?? prop('placement') ?? DEFAULT_PLACEMENT

  /**
   * 焦点是否仍落在卡片内（trigger 或 content 子树）。
   * 只在事件回调里调用：connect 在 render 期求值，那一刻这些节点还不存在。
   */
  const staysInside = (related: EventTarget | null): boolean => {
    const node = related as Node | null
    return contains(refs.get('getAnchorEl')(), node) || contains(refs.get('getContentEl')(), node)
  }

  // 落点仍在卡片内不算离场
  const onFocusLeave = (event: FocusEvent): void => {
    if (staysInside(event.relatedTarget))
      return
    send({ type: 'BLUR' })
  }

  const onEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape')
      send({ type: 'ESCAPE' })
  }

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    setOpen,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-disabled': dataAttr(disabled),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-haspopup': 'dialog',
      'aria-expanded': open ? 'true' : 'false',
      'aria-controls': ids.content,
      'data-state': stateAttr,
      // 只标记，不输出原生 disabled/aria-disabled
      'data-disabled': dataAttr(disabled),
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
      'onFocus': () => send({ type: 'FOCUS' }),
      'onBlur': onFocusLeave,
      'onKeydown': onEscapeKey,
    }),

    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时由引擎置位
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

    /** 可交互面板：非模态 dialog，收起时留在 DOM 只隐藏。 */
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'dialog',
      'tabindex': -1,
      // 显式 false，不省略：读屏对"没说"与"明确说了不是模态"的处理并不一样
      'aria-modal': 'false',
      'aria-labelledby': ids.trigger,
      'data-state': stateAttr,
      'data-placement': placement,
      // 尺寸轴落在 content 上而非 root：root 是可选部件，面板几何也长在 content 上
      'data-size': prop('size'),
      'hidden': !open || undefined,
      // 指针移入卡片即撤销收起等待
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
      // focusin/focusout 冒泡，覆盖后代
      'onFocusIn': () => send({ type: 'FOCUS' }),
      'onFocusOut': onFocusLeave,
      'onKeydown': onEscapeKey,
    }),

    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': {
        '--xh-_hover-card-arrow-x': arrowAt?.x != null ? `${arrowAt.x}px` : '',
        '--xh-_hover-card-arrow-y': arrowAt?.y != null ? `${arrowAt.y}px` : '',
      },
    }),
  }
}
