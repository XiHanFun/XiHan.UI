/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供通知两种形态预设的缺省值。

import type { NotificationPreset, NotificationPresetDefaults } from './notification.types'

/** 卡片预设的缺省停留毫秒。 */
const NOTIFICATION_CARD_DURATION = 5000
/** 轻提示预设的缺省停留毫秒：一句话，读完就走。 */
const NOTIFICATION_TOAST_DURATION = 4000
/** 卡片预设每个落位同屏留几条。 */
const NOTIFICATION_CARD_MAX = 5
/** 轻提示预设每个落位同屏留几条：叠成一摞，多了后层看不出来。 */
const NOTIFICATION_TOAST_MAX = 3

/**
 * 两种预设各自的缺省值。卡片是标题加正文两层、需要读一会儿的消息，落在右下角逐条排开；
 * 轻提示是刚才那个操作的一句结果，落在底部居中、叠成一摞，页面转入后台时按住计时，免得回来时已经错过。
 */
export const NOTIFICATION_PRESETS: Readonly<Record<NotificationPreset, Readonly<NotificationPresetDefaults>>> = Object.freeze({
  card: Object.freeze({
    placement: 'bottom-end',
    max: NOTIFICATION_CARD_MAX,
    gap: 16,
    duration: NOTIFICATION_CARD_DURATION,
    stacked: false,
    pauseOnPageIdle: false,
  }),
  toast: Object.freeze({
    placement: 'bottom',
    max: NOTIFICATION_TOAST_MAX,
    gap: 12,
    duration: NOTIFICATION_TOAST_DURATION,
    stacked: true,
    pauseOnPageIdle: true,
  }),
})

/** 预设的缺省值。不认识的预设当场报错，不静默落回卡片。 */
export function notificationPresetOf(preset: NotificationPreset | undefined): Readonly<NotificationPresetDefaults> {
  const key = preset ?? 'card'
  if (!Object.hasOwn(NOTIFICATION_PRESETS, key))
    throw new Error(`[xh] notification 的 preset 只认 card / toast，收到 "${String(preset)}"`)
  return NOTIFICATION_PRESETS[key]
}
