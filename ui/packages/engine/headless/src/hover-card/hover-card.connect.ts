import type { NormalizeProps, Placement, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { HoverCardApi, HoverCardSchema } from './hover-card.types'
import { contains, dataAttr } from '@xihan-ui/kernel'
import { hoverCardAnatomy } from './hover-card.anatomy'

const parts = hoverCardAnatomy.build()

/** 定位结果落地前的占位朝向。 */
const DEFAULT_PLACEMENT: Placement = 'bottom'

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
      'data-state': stateAttr,
      'data-placement': placement,
      // 锚点滚出可视区时由引擎置位
      'data-hidden': dataAttr(position?.hidden),
      'style': {
        position: 'fixed',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
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
