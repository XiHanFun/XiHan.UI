/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 notification 模块的公共接口。

export { resolveFeedbackServiceTitle } from '../shared/feedback-service'
export type { FeedbackServiceTitleRecord } from '../shared/feedback-service'
export { createFeedbackServiceController } from './feedback-service.controller'
export type { FeedbackServiceController, FeedbackServiceControllerOptions, FeedbackServiceControllerState, FeedbackServiceQueue, FeedbackServiceRecord } from './feedback-service.controller'
export { notificationAnatomy } from './notification.anatomy'
export { connectNotification, connectNotificationItem } from './notification.connect'
export { notificationKeyboard } from './notification.keyboard'
export {
  NOTIFICATION_GAP,
  NOTIFICATION_MAX,
  NOTIFICATION_PLACEMENT,
  NOTIFICATION_PLACEMENTS,
  notificationMachine,
  notificationMergeTarget,
  notificationPlacementOf,
  notificationPriorityOf,
  sameNotificationContent,
  visibleNotifications,
} from './notification.machine'
export { notificationMeta } from './notification.meta'
export type {
  NotificationApi,
  NotificationDedupe,
  NotificationGroupProps,
  NotificationItemApi,
  NotificationItemsChangeDetails,
  NotificationOptions,
  NotificationPlacement,
  NotificationRecord,
  NotificationSchema,
  NotificationStatus,
  NotificationTranslations,
  NotificationType,
  ResolvedNotification,
} from './notification.types'
