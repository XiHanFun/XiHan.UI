import type { NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { TooltipApi, TooltipSchema } from './tooltip.types'
import { dataAttr } from '@xihan-ui/core'
import { overlayPositioned } from '../shared/overlay'
import { tooltipAnatomy } from './tooltip.anatomy'
import { TOOLTIP_DEFAULT_PLACEMENT } from './tooltip.machine'

const parts = tooltipAnatomy.build()

export function connectTooltip<T extends PropTypes>(
  service: Service<TooltipSchema>,
  normalize: NormalizeProps<T>,
): TooltipApi<T> {
  const { state, context, prop, send, scope } = service
  // visible 的两个子态下浮层都可见（closing 是收起前的等待态）
  const open = state.matches('visible')
  // 展开等待期：浮层还没入栈，Escape 由 trigger 就地撤销
  const pending = state.matches('opening')
  const disabled = !!prop('disabled')
  const ids = scope.ids('tooltip', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  // 定位结果由 trackPosition 效应写进 context，这里只读结果，不查 DOM、不调引擎
  const position = context.get('position')
  const placement = position?.placement ?? prop('placement') ?? TOOLTIP_DEFAULT_PLACEMENT
  // 箭头落点：引擎没算（尚未落位）时缺席，皮肤退回居中
  const arrowAt = position?.arrow

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
      // tooltip 是描述不是名字，故用 describedby 而非 labelledby；收起时不指向隐藏节点
      'aria-describedby': open ? ids.content : undefined,
      'data-state': stateAttr,
      // 只标记不输出原生 disabled/aria-disabled：关掉的是提示，被包裹的控件仍可用
      'data-disabled': dataAttr(disabled),
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
      // 按下即让位给真正的操作
      'onPointerdown': () => send({ type: 'POINTER.DOWN' }),
      'onFocus': () => send({ type: 'FOCUS' }),
      'onBlur': () => send({ type: 'BLUR' }),
      // 浮层可见时 Escape 归消解层按层栈仲裁；这里只管等待展开期那一段
      'onKeydown': (event: KeyboardEvent) => {
        if (event.key === 'Escape' && pending)
          send({ type: 'ESCAPE' })
      },
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 定位层被搬到 portal 落点，继承不到作者子树上的方向；作者没给就不写，交给落点处的继承
      'dir': prop('dir'),
      // 落定后的朝向（可能被引擎翻转），供动画方向使用
      'data-placement': placement,
      // 锚点被滚出可视区时置位，样式据此隐藏浮层
      // 锚点被滚出可视区时引擎置 hidden，样式据此收起浮层
      'data-hidden': dataAttr(position?.hidden),
      // 落位才露：皮肤基线把定位层藏着，带这个才显示。展开那几帧坐标还没算出来时就是藏的
      'data-positioned': dataAttr(overlayPositioned(position)),
      'data-state': stateAttr,
      'style': {
        position: 'fixed',
        left: `${position?.x ?? 0}px`,
        top: `${position?.y ?? 0}px`,
        // 皮肤给 SSR 首帧兜了一条 inset-inline-start，RTL 下它落在 right 上；
        // 行内把 right 让开，行内轴才只由 left 一侧约束，浮层不会被拉宽
        right: 'auto',
      },
    }),
    // 常挂 + hidden 显隐，不卸载作者写在 content 里的节点。
    // content 自身不可聚焦，但必须可悬停：指针移入浮层要能撤销收起等待。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'tooltip',
      'data-state': stateAttr,
      // tooltip 没有 root 部件，视觉轴落在浮层树最外层的 content 上，箭头继承它声明的私有槽
      'data-tone': prop('tone'),
      'data-size': prop('size'),
      'hidden': !open || undefined,
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
    }),
    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': true,
      // 箭头自报朝向，皮肤据此贴边，不必再从祖先 positioner 上找
      'data-placement': placement,
      // 箭头交叉轴上的落点由定位引擎给：上下两侧走行内轴、左右两侧走块轴。
      // 两根轴每帧都写，翻面后另一根不会留着上一帧的值；空串即撤掉声明，皮肤退回居中
      'style': {
        '--xh-_tooltip-arrow-x': arrowAt?.x != null ? `${arrowAt.x}px` : '',
        '--xh-_tooltip-arrow-y': arrowAt?.y != null ? `${arrowAt.y}px` : '',
      },
    }),
  }
}
