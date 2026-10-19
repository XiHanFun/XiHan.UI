/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// @xihan-ui/designer-shell —— 四款画布式设计器共用的界面零件，只出 Web Components。元素不在 import 时注册。

export { defineDesignerShell, defineDesignerShellElement, DESIGNER_SHELL_ELEMENTS } from './define'
export type { DesignerShellTagMap } from './define'
export { registerDropTarget, startDrag } from './drag/drag'
export type { DragOptions, DragSession, DropOver, DropTargetHandlers, PanRequestDetail } from './drag/drag'
export { DESIGNER_SHELL_COMMANDS, designerPanelCommandId, designerPanelCommands, designerShellCommands } from './extensions/builtin-commands'
export type { DesignerPanelCommandsOptions, DesignerShellCommandsOptions } from './extensions/builtin-commands'
export { arrangeCommands, commandEnabled, commandLabel, commandShortLabel, createCommandToolbar, renderCommandMenu, runCommand } from './extensions/commands'
export type { CommandToolbar, CommandToolbarDisplay, CommandToolbarOptions, CommandToolbarOrientation, DesignerCommandLayout, DesignerCommandTable } from './extensions/commands'
export { importSources } from './extensions/importers'
export { createPanelActions, createPanelHost } from './extensions/panels'
export type { DesignerPanel, DesignerPanelActions, DesignerPanelHost, DesignerPanelHostOptions, DesignerPanelInstance, DesignerShellExtension } from './extensions/panels'
export { DESIGNER_FRAME_REGIONS, XhDesignerFrameElement } from './frame/frame-element'
export type {
  DesignerFrameEventMap,
  DesignerFrameOverlayAnchor,
  DesignerFramePosition,
  DesignerFrameRegion,
  DesignerFrameResizable,
  DesignerLayoutChangeReason,
  DesignerPanelEntry,
} from './frame/frame-element'
export {
  defaultDesignerLayout,
  DESIGNER_LAYOUT_DOCKS,
  DESIGNER_LAYOUT_SETTING_KEY,
  DESIGNER_LAYOUT_VERSION,
  designerLayoutEquals,
  designerLayoutPolicy,
  designerPanelAbilities,
  designerPanelDock,
  isDesignerDockRegion,
  isDesignerOverlayRegion,
  resolveDesignerLayout,
  withDesignerDockSize,
  withDesignerPanelFloating,
  withDesignerPanelMinimized,
  withDesignerPanelMoved,
  withDesignerPanelShares,
  withDesignerPanelVisible,
} from './frame/layout'
export type {
  DesignerLayout,
  DesignerLayoutDock,
  DesignerLayoutPolicy,
  DesignerLayoutRect,
  DesignerLayoutSizes,
  DesignerPanelAbilities,
  ResolvedDesignerLayout,
} from './frame/layout'
export { createStatusItem } from './frame/status-item'
export type { DesignerStatusItem, DesignerStatusItemOptions, DesignerStatusItemState } from './frame/status-item'
export { DESIGNER_HISTORY_COMMANDS, designerHistoryCommands } from './history/history-commands'
export type { DesignerHistoryCommandsOptions, DesignerHistoryCommandTarget, DesignerHistoryConfirm } from './history/history-commands'
export { XhDesignerHistoryElement } from './history/history-element'
export type { DesignerHistoryEventMap } from './history/history-element'
export { XhDesignerIssuesElement } from './issues/issues-element'
export type { DesignerIssueItem, DesignerIssuesEventMap } from './issues/issues-element'
export { DESIGNER_COMMANDS_EN_US, DESIGNER_HISTORY_EN_US } from './locale/en-US'
export { XhDesignerMinimapElement } from './minimap/minimap-element'
export type { DesignerMinimapEventMap, DesignerMinimapShape } from './minimap/minimap-element'
export { XhDesignerOutlineElement } from './outline/outline-element'
export type { DesignerOutlineEventMap, DesignerOutlineMove, DesignerOutlineNode } from './outline/outline-element'
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
export { createDesignerSettingsHost } from './settings/host'
export type { DesignerSettingsHost, DesignerSettingsHostOptions } from './settings/host'
export {
  collectSettingsSections,
  DESIGNER_GENERAL_SETTINGS,
  DESIGNER_SETTING_KEYS,
  designerGeneralSettings,
  resolveSettings,
  settingKey,
  settingPolicy,
  settingValue,
  sortSettingsSections,
  toolbarDisplayOf,
} from './settings/model'
export type {
  DesignerGeneralSettingsOptions,
  DesignerSettingItem,
  DesignerSettings,
  DesignerSettingsPolicy,
  DesignerSettingsSection,
  DesignerSettingsSource,
  DesignerThemeSetting,
} from './settings/model'
export { XhDesignerSettingsElement } from './settings/settings-element'
export type { DesignerSettingEditor, DesignerSettingsEventMap } from './settings/settings-element'
export { XhDesignerTransformElement } from './transform/transform-element'
export type {
  DesignerGesturePhase,
  DesignerMeasureChangeDetail,
  DesignerMeasureMode,
  DesignerMeasureOptions,
  DesignerSnapOptions,
  DesignerTransformEventMap,
  DesignerTransformItem,
  DesignerTransformKind,
} from './transform/transform-element'
export type {
  DesignerCommandsTranslations,
  DesignerFrameTranslations,
  DesignerHistoryTranslations,
  DesignerIssuesTranslations,
  DesignerOutlineTranslations,
  DesignerPaletteTranslations,
  DesignerPropertiesTranslations,
  DesignerRulerTranslations,
  DesignerSettingsTranslations,
  DesignerTransformTranslations,
} from './translations'
