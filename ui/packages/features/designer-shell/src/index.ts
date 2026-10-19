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
export { applyToolbarCustomization, mergeToolbarCustomization, toolbarCustomizationOf } from './extensions/toolbar-customization'
export type { DesignerToolbarCustomization } from './extensions/toolbar-customization'
export { DESIGNER_FIELD_IMPORT_SOURCES, XhDesignerFieldImportElement } from './fields/field-import-element'
export type { DesignerFieldImportDetail, DesignerFieldImportEventMap } from './fields/field-import-element'
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
export { createHistoryPanel } from './history/history-panel'
export type { DesignerHistoryAdapter, DesignerHistoryPanelOptions } from './history/history-panel'
export { XhDesignerIssuesElement } from './issues/issues-element'
export type { DesignerIssueItem, DesignerIssuesEventMap } from './issues/issues-element'
export { XhDesignerJsonEditorElement } from './json-editor/json-editor-element'
export type { DesignerJsonEditorEventMap, DesignerJsonValidator } from './json-editor/json-editor-element'
export { DESIGNER_COMMANDS_EN_US, DESIGNER_FIELD_IMPORT_EN_US, DESIGNER_HISTORY_EN_US, DESIGNER_JSON_EDITOR_EN_US, DESIGNER_TOUR_EN_US } from './locale/en-US'
export { XhDesignerMinimapElement } from './minimap/minimap-element'
export type { DesignerMinimapEventMap, DesignerMinimapShape } from './minimap/minimap-element'
export { XhDesignerOutlineElement } from './outline/outline-element'
export type { DesignerOutlineEventMap, DesignerOutlineMove, DesignerOutlineNode } from './outline/outline-element'
export { createOutlinePanel } from './outline/outline-panel'
export type { DesignerOutlineAdapter, DesignerOutlinePanelOptions } from './outline/outline-panel'
export { XhDesignerPaletteElement } from './palette/palette-element'
export type { DesignerPaletteDragPayload, DesignerPaletteEventMap, DesignerPaletteGroup, DesignerPaletteItem } from './palette/palette-element'
export { collectPaletteSources, resolvePaletteSources } from './palette/palette-sources'
export type { DesignerPaletteSource, DesignerPaletteView } from './palette/palette-sources'
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
export { shortcutSettingsSource } from './settings/display'
export type { DesignerShortcutsSourceOptions } from './settings/display'
export { DESIGNER_COMMON_KEYS, DESIGNER_DISPLAY_CONTROL_KINDS, DESIGNER_EDIT_COMMANDS, isDesignerDisplayControl } from './settings/display-model'
export type { DesignerCommonKey, DesignerCommonKeyId } from './settings/display-model'
export type { DesignerDisplayControl, DesignerShortcutGroup, DesignerShortcutGroupId, DesignerShortcutRow, DesignerShortcutsSource, DesignerShortcutTableGroup } from './settings/display-model'
export { createDesignerSettingsHost } from './settings/host'
export type { DesignerSettingsHost, DesignerSettingsHostOptions } from './settings/host'
export {
  collectSettingsSections,
  DESIGNER_ABOUT_SETTINGS,
  DESIGNER_GENERAL_SETTINGS,
  DESIGNER_HELP_SETTINGS,
  DESIGNER_LAYOUT_SETTINGS,
  DESIGNER_SETTING_KEYS,
  DESIGNER_SHORTCUT_SETTINGS,
  DESIGNER_TOOLBAR_SETTINGS,
  designerAboutSettings,
  designerGeneralSettings,
  designerHelpSettings,
  designerLayoutSettings,
  designerShortcutSettings,
  designerToolbarSettings,
  PANEL_LAYOUT_CONTROL,
  resolveSettings,
  settingKey,
  settingPolicy,
  settingValue,
  sortSettingsSections,
  TOOLBAR_LAYOUT_CONTROL,
  toolbarDisplayOf,
  toolbarVisibleOf,
} from './settings/model'
export type {
  DesignerAboutSettings,
  DesignerGeneralSettingsOptions,
  DesignerHelpSettings,
  DesignerSettingItem,
  DesignerSettings,
  DesignerSettingsPolicy,
  DesignerSettingsSection,
  DesignerSettingsSource,
  DesignerThemeSetting,
  DesignerToolbarSettingsOptions,
} from './settings/model'
export type { DesignerSettingsFrame } from './settings/panel-layout'
export { XhDesignerSettingsElement } from './settings/settings-element'
export type { DesignerSettingEditor, DesignerSettingsEventMap } from './settings/settings-element'
export { toolbarSettingsSource } from './settings/toolbar-layout'
export type { DesignerToolbarCommandInfo, DesignerToolbarSettingsSource } from './settings/toolbar-layout'
export { collectTourSteps, DESIGNER_TOUR_DONE_KEY, resolveTourSteps, tourDoneOf } from './tour/tour'
export type { DesignerTourStep, DesignerTourStepSource, DesignerTourStepView, DesignerTourTarget } from './tour/tour'
export { XhDesignerTourElement } from './tour/tour-element'
export type { DesignerTourEventMap } from './tour/tour-element'
export { XhDesignerTransformElement } from './transform/transform-element'
export type {
  DesignerGesturePhase,
  DesignerMeasureChangeDetail,
  DesignerMeasureConvert,
  DesignerMeasureMode,
  DesignerMeasureOptions,
  DesignerSnapOptions,
  DesignerTransformEventMap,
  DesignerTransformItem,
  DesignerTransformKind,
} from './transform/transform-element'
export type {
  DesignerCommandsTranslations,
  DesignerFieldImportTranslations,
  DesignerFrameTranslations,
  DesignerHistoryTranslations,
  DesignerIssuesTranslations,
  DesignerJsonEditorTranslations,
  DesignerOutlineTranslations,
  DesignerPaletteTranslations,
  DesignerPropertiesTranslations,
  DesignerRulerTranslations,
  DesignerSettingsTranslations,
  DesignerTourTranslations,
  DesignerTransformTranslations,
} from './translations'
export { DESIGNER_SHELL_VERSION } from './version'
