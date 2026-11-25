/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 notification 模块的公共接口。

export { createNotificationServiceController, resolveNotificationServiceTitle } from './notification-service.controller'
export type { NotificationServiceController, NotificationServiceControllerOptions, NotificationServiceControllerState, NotificationServiceQueue, NotificationServiceRecord, NotificationServiceTitleRecord } from './notification-service.controller'
export { notificationItemMachine, resolveNotificationDuration, resolveNotificationItemId } from './notification-item.machine'
export { notificationAnatomy } from './notification.anatomy'
export { connectNotification, connectNotificationItem } from './notification.connect'
export { notificationKeyboard } from './notification.keyboard'
export {
  NOTIFICATION_PLACEMENTS,
  notificationMachine,
  notificationMergeTarget,
  notificationPlacementOf,
  notificationPriorityOf,
  sameNotificationContent,
  visibleNotifications,
} from './notification.machine'
export { notificationMeta } from './notification.meta'
export { NOTIFICATION_PRESETS, notificationPresetOf } from './notification.presets'
export type {
  NotificationActionDetails,
  NotificationApi,
  NotificationDedupe,
  NotificationGroupProps,
  NotificationItemApi,
  NotificationItemsChangeDetails,
  NotificationItemSchema,
  NotificationOptions,
  NotificationPauseSource,
  NotificationPlacement,
  NotificationPreset,
  NotificationPresetDefaults,
  NotificationPressedPart,
  NotificationRecord,
  NotificationSchema,
  NotificationStatus,
  NotificationStatusChangeDetails,
  NotificationTone,
  NotificationTranslations,
  ResolvedNotification,
} from './notification.types'
