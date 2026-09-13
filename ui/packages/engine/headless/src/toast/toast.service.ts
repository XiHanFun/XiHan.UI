/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 toast.service 相关实现。

import type { ResolvedToastServiceItem, ToastRecord, ToastServiceDefaults } from './toast.types'
import { resolveFeedbackServiceTitle } from '../shared/feedback-service'

/**
 * 把命令式 Toast 队列记录投影成三端默认模板共用的最终输入。
 * DOM 结构、框架节点与事件绑定仍由适配器负责。
 */
export function resolveToastServiceItem(
  toast: ToastRecord,
  defaults: ToastServiceDefaults = {},
): ResolvedToastServiceItem {
  return {
    id: toast.id,
    title: resolveFeedbackServiceTitle(toast),
    description: toast.description,
    type: toast.type ?? 'info',
    duration: toast.duration ?? defaults.duration,
    removeDelay: toast.removeDelay ?? defaults.removeDelay,
    closable: toast.closable ?? true,
    pauseOnPageIdle: defaults.pauseOnPageIdle,
    actionLabel: toast.actionLabel,
  }
}
