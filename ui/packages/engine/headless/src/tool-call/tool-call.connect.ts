import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ToolCallApi, ToolCallProps, ToolCallSchema } from './tool-call.types'
import { dataAttr } from '@xihan-ui/kernel'
import { toolCallAnatomy } from './tool-call.anatomy'
import { isToolCallRunning, toolCallStatusText } from './tool-call.types'

const parts = toolCallAnatomy.build()

/**
 * 视图属性走第二参而不是机器 props：Web Components 侧按机器名给全局文案分桶，
 * 而本族两个组件共用一台机器，走机器 props 的话文案会全取到 tool-call 那一格。
 */
export function connectToolCall<T extends PropTypes>(
  service: Service<ToolCallSchema>,
  props: ToolCallProps,
  normalize: NormalizeProps<T>,
): ToolCallApi<T> {
  const { state, prop, send, scope } = service
  const open = state.get().endsWith('.expanded')
  const disabled = !!prop('disabled')
  const phase = props.phase ?? 'input-available'
  const running = isToolCallRunning(phase)
  const ids = scope.ids('tool-call', 'trigger', 'content', 'error')
  const stateAttr = open ? 'open' : 'closed'

  const setOpen = (next: boolean): void => {
    if (next !== open)
      send({ type: next ? 'OPEN' : 'CLOSE' })
  }

  return {
    open,
    phase,
    running,
    disabled,
    statusText: toolCallStatusText(phase, props.translations),
    setOpen,

    // 不发 aria-busy：它会压住同一棵子树内播报区的播报，而全族只认会话级的那一个活区
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-state': stateAttr,
      'data-phase': phase,
      'data-tone': props.tone,
      'data-size': props.size,
      'data-disabled': dataAttr(disabled),
      'data-running': dataAttr(running),
    }),

    getTriggerProps: () => normalize.button({
      ...parts.trigger.attrs,
      'id': ids.trigger,
      'type': 'button',
      'aria-controls': ids.content,
      'aria-expanded': open ? 'true' : 'false',
      // 出错时才把错误文本挂进描述链：无条件挂会指向一个作者根本没渲的节点
      'aria-describedby': phase === 'output-error' ? ids.error : undefined,
      // 单体控件用原生 disabled，只留 data-disabled 的话禁用态只是样式
      'disabled': disabled || undefined,
      'data-state': stateAttr,
      'data-phase': phase,
      'data-disabled': dataAttr(disabled),
      'onClick': () => {
        if (!disabled)
          send({ type: 'TOGGLE' })
      },
    }),

    // 纯视觉，不进可访问名
    getIndicatorProps: () => normalize.element({
      ...parts.indicator.attrs,
      'aria-hidden': true,
      'data-state': stateAttr,
    }),

    // name 与 status 排在 trigger 之内，自然计入它的可访问名（「搜索，已完成」），
    // 各自都不另开活区
    getNameProps: () => normalize.element({
      ...parts.name.attrs,
      'data-phase': phase,
    }),

    getStatusProps: () => normalize.element({
      ...parts.status.attrs,
      'data-phase': phase,
    }),

    // 常驻在 trigger 与 content 之间：审批闸门不该被折叠藏起来
    getApprovalProps: () => normalize.element({
      ...parts.approval.attrs,
      'data-phase': phase,
      'hidden': phase !== 'awaiting-approval' || undefined,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'id': ids.content,
      'role': 'region',
      'aria-labelledby': ids.trigger,
      'data-state': stateAttr,
      'hidden': !open || undefined,
      // 收起动画播完之前 content 还在渲染，此时 hidden 已被皮肤的 display 盖掉，
      // 靠 inert 把这一段窗口里的内容挡在读屏与 Tab 序之外
      'inert': !open || undefined,
    }),

    getInputProps: () => normalize.element({
      ...parts.input.attrs,
      'data-phase': phase,
    }),

    getOutputProps: () => normalize.element({
      ...parts.output.attrs,
      'data-phase': phase,
    }),

    // 流被中止时未拿到结果的工具会被收尾成出错态且不带错误文本，这一格要容忍空内容
    getErrorProps: () => normalize.element({
      ...parts.error.attrs,
      'id': ids.error,
      'data-phase': phase,
    }),
  }
}
