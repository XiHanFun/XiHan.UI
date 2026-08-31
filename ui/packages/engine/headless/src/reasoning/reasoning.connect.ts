import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ToolCallSchema } from '../tool-call'
import type { ReasoningApi, ReasoningProps } from './reasoning.types'
import { dataAttr } from '@xihan-ui/kernel'
import { reasoningAnatomy } from './reasoning.anatomy'
import { reasoningDuration, reasoningStatusText } from './reasoning.types'

const parts = reasoningAnatomy.build()

/**
 * 思考过程的连接层。自动开合整套复用 tool-call 的机器：那台机器不认解剖，
 * 只认「在跑 / 不在跑」与四个叶态，故本组件用自己的 anatomy 配它。
 *
 * 视图属性走第二参：Web Components 侧按机器名给全局文案分桶，
 * 走机器 props 的话本组件的文案会全取到 tool-call 那一格。
 */
export function connectReasoning<T extends PropTypes>(
  service: Service<ToolCallSchema>,
  props: ReasoningProps,
  normalize: NormalizeProps<T>,
): ReasoningApi<T> {
  const { state, prop, send, scope } = service
  const open = state.get().endsWith('.expanded')
  const disabled = !!prop('disabled')
  const streaming = !!props.streaming
  const ids = scope.ids('reasoning', 'trigger', 'content')
  const stateAttr = open ? 'open' : 'closed'
  const durationMs = reasoningDuration(props.startTime, props.endTime)

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    streaming,
    disabled,
    durationMs,
    statusText: reasoningStatusText(streaming, durationMs, props.translations),
    setOpen,

    // 不发 aria-busy：全族只认会话级的那一个活区
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-streaming': dataAttr(streaming),
      'data-variant': props.variant,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
    }),

    // label 与 duration 排在里面，「思考过程，用时 12 秒」自然构成可访问名——
    // 再发一个 aria-label 会盖过节点里的文字，两者不一致时读屏念的和屏幕上看到的对不上
    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-controls': ids.content,
      'aria-expanded': open ? 'true' : 'false',
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-streaming': dataAttr(streaming),
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),

    // 状态图形位：跟着在不在想换色，对读屏隐藏——它说的话 label 已经说过了
    getIconProps: () => normalize.element({
      ...parts.icon.attrs,
      'aria-hidden': true,
      'data-streaming': dataAttr(streaming),
    }),

    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-state': stateAttr,
    }),

    getLabelProps: () => normalize.element({
      ...parts.label.attrs,
      'data-streaming': dataAttr(streaming),
    }),

    getDurationProps: () => normalize.element({
      ...parts.duration.attrs,
      'data-streaming': dataAttr(streaming),
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'region',
      'aria-labelledby': ids.trigger,
      'data-state': stateAttr,
      'hidden': !open || undefined,
      // 收起动画播完之前内容还在渲染，inert 把这段窗口挡在读屏与 Tab 序之外
      'inert': !open || undefined,
    }),
  }
}
