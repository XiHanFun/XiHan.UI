import type { NormalizeProps, Placement, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { TooltipApi, TooltipSchema } from './tooltip.types'
import { dataAttr } from '@xihan-ui/core'
import { tooltipAnatomy } from './tooltip.anatomy'

const parts = tooltipAnatomy.build()

/** 定位结果落地前的占位朝向，与定位引擎的默认值一致。 */
const DEFAULT_PLACEMENT: Placement = 'bottom'

export function connectTooltip<T extends PropTypes>(
  service: Service<TooltipSchema>,
  normalize: NormalizeProps<T>,
): TooltipApi<T> {
  const { state, context, prop, send, scope } = service
  // closing 是收起前的等待态，此时浮层仍然可见
  const open = state.matches('open', 'closing')
  const disabled = !!prop('disabled')
  const ids = scope.ids('tooltip', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  // 定位结果由 trackPosition 效应写进 context：这里只读结果，不查 DOM、不调引擎
  const position = context.get('position')

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
      'onKeydown': (event: KeyboardEvent) => {
        if (event.key === 'Escape')
          send({ type: 'ESCAPE' })
      },
    }),
    getPositionerProps: () => normalize.element({
      ...parts.positioner.attrs,
      // 落定后的朝向（可能被引擎翻转），供箭头与动画方向使用
      'data-placement': position?.placement ?? prop('placement') ?? DEFAULT_PLACEMENT,
      // 锚点被滚出可视区时置位，样式据此隐藏浮层
      'data-hidden': dataAttr(position?.hidden),
      'data-state': stateAttr,
      'style': {
        position: 'absolute',
        insetInlineStart: `${position?.x ?? 0}px`,
        insetBlockStart: `${position?.y ?? 0}px`,
      },
    }),
    // 常挂 + hidden 显隐：不卸载作者写在 content 里的节点。content 自身不可聚焦
    // （tooltip 不承载交互），但**必须可悬停**：指针移入浮层要能撤销收起等待，
    // 否则文案长到需要停留细看时会在指针下方消失。
    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'tooltip',
      'data-state': stateAttr,
      'hidden': !open || undefined,
      'onPointerenter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerleave': () => send({ type: 'POINTER.LEAVE' }),
    }),
    getArrowProps: () => normalize.element({
      ...parts.arrow.attrs,
      'aria-hidden': 'true',
    }),
  }
}
