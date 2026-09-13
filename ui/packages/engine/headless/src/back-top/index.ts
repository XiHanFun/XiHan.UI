/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 back top 模块的公共接口。

export { backTopAnatomy } from './back-top.anatomy'
export { connectBackTop } from './back-top.connect'
export { backTopKeyboard } from './back-top.keyboard'
export { BACK_TOP_VISIBILITY_HEIGHT, backTopMachine, resolveBackTopVisibilityHeight } from './back-top.machine'
export { backTopMeta } from './back-top.meta'
export type {
  BackTopApi,
  BackTopBehavior,
  BackTopRefs,
  BackTopSchema,
  BackTopTranslations,
  BackTopVisibilityChangeDetails,
} from './back-top.types'
