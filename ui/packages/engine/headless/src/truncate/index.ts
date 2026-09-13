/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 truncate 模块的公共接口。

export { truncateAnatomy } from './truncate.anatomy'
export { connectTruncate } from './truncate.connect'
export { truncateKeyboard } from './truncate.keyboard'
export { isTruncateOverflowing, resolveTruncateLines, TRUNCATE_DEFAULT_LINES, truncateMachine } from './truncate.machine'
export { truncateMeta } from './truncate.meta'
export type { TruncateApi, TruncateMetrics, TruncateOpenChangeDetails, TruncateOverflowChangeDetails, TruncateRefs, TruncateSchema, TruncateTranslations } from './truncate.types'
