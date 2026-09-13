/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 splitter 模块的公共接口。

export { splitterAnatomy } from './splitter.anatomy'
export { connectSplitter } from './splitter.connect'
export { splitterKeyboard } from './splitter.keyboard'
export {
  panelCount,
  SPLITTER_DEFAULT_PANELS,
  SPLITTER_LARGE_STEP,
  SPLITTER_STEP,
  splitterConstraints,
  splitterMachine,
} from './splitter.machine'
export { splitterMeta } from './splitter.meta'
export {
  collapsePanel,
  equalSizes,
  expandPanel,
  isCollapsed,
  normalizeSizes,
  panelConstraint,
  panelConstraints,
  panelRange,
  resizePanels,
  roundSize,
  setBoundarySize,
  SPLITTER_TOTAL,
} from './splitter.sizing'
export type { PanelConstraint } from './splitter.sizing'
export type { SplitterApi, SplitterDragSession, SplitterPanelProps, SplitterPanelState, SplitterPoint, SplitterSchema, SplitterSizesChangeDetails, SplitterSizesChangeEndDetails, SplitterTranslations } from './splitter.types'
