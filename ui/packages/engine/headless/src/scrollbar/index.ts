/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 scrollbar 模块的公共接口。

export { scrollbarAnatomy } from './scrollbar.anatomy'
export { connectScrollbar } from './scrollbar.connect'
export { scrollbarKeyboard } from './scrollbar.keyboard'
export {
  SCROLLBAR_DEFAULT_TYPE,
  SCROLLBAR_HIDE_DELAY,
  SCROLLBAR_HOST_ATTR,
  SCROLLBAR_SCROLL_END_DELAY,
  SCROLLBAR_STEP,
  scrollbarMachine,
} from './scrollbar.machine'
export { scrollbarMeta } from './scrollbar.meta'
export type {
  ScrollbarAnchor,
  ScrollbarApi,
  ScrollbarDragSession,
  ScrollbarLayerBox,
  ScrollbarPoint,
  ScrollbarRefs,
  ScrollbarSchema,
  ScrollbarScrollDetails,
  ScrollbarTranslations,
  ScrollbarType,
} from './scrollbar.types'
