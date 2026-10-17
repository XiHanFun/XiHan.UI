/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-shell —— 四款画布式设计器共用的界面零件，只出 Web Components。元素不在 import 时注册。

export { defineDesignerShell, defineDesignerShellElement, DESIGNER_SHELL_ELEMENTS } from './define'
export type { DesignerShellTagMap } from './define'
export { registerDropTarget, startDrag } from './drag/drag'
export type { DragOptions, DragSession, DropOver, DropTargetHandlers, PanRequestDetail } from './drag/drag'
export { arrangeCommands, commandEnabled, commandLabel, createCommandToolbar, renderCommandMenu, runCommand } from './extensions/commands'
export type { CommandToolbar, DesignerCommandLayout, DesignerCommandTable } from './extensions/commands'
export { createPanelHost } from './extensions/panels'
export type { DesignerPanel, DesignerPanelHost, DesignerPanelHostOptions, DesignerPanelInstance, DesignerShellExtension } from './extensions/panels'
export { DESIGNER_FRAME_REGIONS, parseDesignerPanels, XhDesignerFrameElement } from './frame/frame-element'
export type { DesignerFrameEventMap, DesignerFramePosition, DesignerFrameRegion, DesignerFrameResizable, DesignerFrameSizes } from './frame/frame-element'
export { XhDesignerIssuesElement } from './issues/issues-element'
export type { DesignerIssueItem, DesignerIssuesEventMap } from './issues/issues-element'
export { XhDesignerMinimapElement } from './minimap/minimap-element'
export type { DesignerMinimapEventMap, DesignerMinimapShape } from './minimap/minimap-element'
export { XhDesignerPaletteElement } from './palette/palette-element'
export type { DesignerPaletteDragPayload, DesignerPaletteEventMap, DesignerPaletteGroup, DesignerPaletteItem } from './palette/palette-element'
export { createPropertyField } from './properties/field'
export type { PropertyField, PropertyFieldOptions, PropertyFieldState } from './properties/field'
export { XhDesignerPropertiesElement } from './properties/properties-element'
export type {
  DesignerPropertiesEventMap,
  DesignerPropertyDescriptor,
  DesignerPropertyEditor,
  DesignerPropertyError,
  DesignerPropertyTarget,
  DesignerPropertyTargetRef,
} from './properties/properties-element'
export { XhDesignerRulerElement } from './ruler/ruler-element'
export type { DesignerGuideAxis, DesignerGuideChange, DesignerGuides, DesignerRulerEventMap } from './ruler/ruler-element'
export { XhDesignerTransformElement } from './transform/transform-element'
export type {
  DesignerGesturePhase,
  DesignerSnapOptions,
  DesignerTransformEventMap,
  DesignerTransformItem,
  DesignerTransformKind,
} from './transform/transform-element'
export type {
  DesignerFrameTranslations,
  DesignerIssuesTranslations,
  DesignerPaletteTranslations,
  DesignerPropertiesTranslations,
  DesignerRulerTranslations,
} from './translations'
