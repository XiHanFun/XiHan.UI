/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 floating panel 模块的公共接口。

export { floatingPanelAnatomy } from './floating-panel.anatomy'
export { connectFloatingPanel } from './floating-panel.connect'
export {
  clampFloatingPanelSize,
  FLOATING_PANEL_DEFAULT_POSITION,
  FLOATING_PANEL_DEFAULT_SIZE,
  FLOATING_PANEL_LARGE_STEP,
  FLOATING_PANEL_MIN_SIZE,
  FLOATING_PANEL_STEP,
  floatingPanelRectStyle,
  moveFloatingPanel,
  resizeFloatingPanel,
  sameFloatingPanelPosition,
  sameFloatingPanelSize,
} from './floating-panel.geometry'
export { floatingPanelKeyboard } from './floating-panel.keyboard'
export { floatingPanelMachine } from './floating-panel.machine'
export { floatingPanelMeta } from './floating-panel.meta'
export type {
  FloatingPanelApi,
  FloatingPanelDimensionsChangeDetails,
  FloatingPanelDragSession,
  FloatingPanelOpenChangeDetails,
  FloatingPanelPoint,
  FloatingPanelPosition,
  FloatingPanelPositionChangeDetails,
  FloatingPanelRefs,
  FloatingPanelResizeEdge,
  FloatingPanelResizeTriggerProps,
  FloatingPanelSchema,
  FloatingPanelSize,
  FloatingPanelTranslations,
  FloatingPanelWindowState,
  FloatingPanelWindowStateChangeDetails,
  FloatingPanelWindowStateTriggerProps,
} from './floating-panel.types'
