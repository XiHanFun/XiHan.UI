/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 timestamp 模块的公共接口。

export { timestampAnatomy } from './timestamp.anatomy'
export { connectTimestamp } from './timestamp.connect'
export { formatRelativeTime, formatTimePattern, TIMESTAMP_RELATIVE_LIMIT, timestampMachineStamp, toTimeDate } from './timestamp.format'
export type { TimestampType, TimestampValue } from './timestamp.format'
export { timestampKeyboard } from './timestamp.keyboard'
export { timestampMeta } from './timestamp.meta'
export type { TimestampApi, TimestampProps, TimestampState, TimestampTranslations } from './timestamp.types'
