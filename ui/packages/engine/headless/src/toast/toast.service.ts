import type { ResolvedToastServiceItem, ToastRecord, ToastServiceDefaults } from './toast.types'
import { resolveFeedbackServiceTitle } from '../shared/feedback-service'
import { resolveToastDuration } from './toast.machine'

/**
 * 把命令式 Toast 队列记录投影成三端默认模板共用的最终输入。
 * DOM 结构、框架节点与事件绑定仍由适配器负责。
 */
export function resolveToastServiceItem(
  toast: ToastRecord,
  defaults: ToastServiceDefaults = {},
): ResolvedToastServiceItem {
  const duration = toast.duration ?? defaults.duration
  const selfDismissing = Number.isFinite(resolveToastDuration(toast.type, duration))
  return {
    id: toast.id,
    title: resolveFeedbackServiceTitle(toast),
    type: toast.type ?? 'info',
    duration,
    removeDelay: toast.removeDelay ?? defaults.removeDelay,
    closable: toast.closable ?? !selfDismissing,
    pauseOnPageIdle: defaults.pauseOnPageIdle,
    actionLabel: toast.actionLabel,
  }
}
