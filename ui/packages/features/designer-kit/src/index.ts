/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 src 模块的公共接口。

export { alignRects, distributeRects } from './arrange'
export type { AlignMode, DistributeAxis, DistributeSpacing } from './arrange'
export { CLIPBOARD_FORMAT, clipboardMimeType, decodeClipboard, encodeClipboard } from './clipboard'
export type { ClipboardDecodeError, ClipboardDecodeResult, ClipboardEnvelope } from './clipboard'
export { DATA_FIELD_CONTENTS, DATA_FIELD_KINDS, findDataField, listDataFields, listFilterFields } from './data-fields'
export type { DataField, DataFieldContent, DataFieldEntry, DataFieldKind, ListDataFieldsOptions } from './data-fields'
export {
  assertCommandShape,
  checkExtensionData,
  commandForShortcut,
  commandShortcuts,
  createExtensionHost,
  DesignerExtensionError,
  EXTENSION_DATA_KEY,
  extensionCommands,
  extensionControls,
  extensionDataPath,
  extensionEditors,
  extensionIssuePrefix,
  findImporter,
  formatShortcut,
  getExtensionData,
  importerAccept,
  isCommandMenuSeparator,
  mergeExtensions,
  runExtensionRules,
  setExtensionData,
  shortcutKey,
} from './extensions'
export type {
  DesignerCommand,
  DesignerCommandMenuEntry,
  DesignerCommandMenuItem,
  DesignerCommandPanel,
  DesignerCommandPlacement,
  DesignerExporter,
  DesignerExtensionBase,
  DesignerExtensionCore,
  DesignerFieldSource,
  DesignerFieldSourceContent,
  DesignerFieldSourceHost,
  DesignerFieldSourcePage,
  DesignerImporter,
  DesignerImportSource,
  ExtensionHost,
  ExtensionHostOptions,
  ExtensionKeySpaces,
  SchemaRule,
} from './extensions'
export {
  expandRect,
  hitTest,
  pointInRect,
  rectCenter,
  rectContains,
  rectCorners,
  rectFromPoints,
  rectsIntersect,
  rotatedBounds,
  rotatedRectIntersects,
  rotatePoint,
  unionRects,
} from './geometry'
export type { Point, Rect, Size } from './geometry'
export { clampToGrid, compactLayout, gridCollides, placeGridItem, removeGridItem, setGridItemRect } from './grid'
export type { GridItem, GridOptions, GridPlacement, GridRect } from './grid'
export { applyInSequence, createHistory, HISTORY_NUDGE_MERGE_WITHIN, nudgeMergeKey, snapshotHistory } from './history'
export type { ApplyOperation, ExecuteOptions, History, HistoryChange, HistoryChangeKind, HistoryEntry, HistoryLabel, HistoryOptions, HistorySnapshot, OperationResult } from './history'
export { createIdAllocator, nextFreeId, remapIds } from './ids'
export type { IdAllocator } from './ids'
export { marqueeModeFromDrag, marqueeRect, selectInMarquee } from './marquee'
export type { MarqueeMode } from './marquee'
export { applyPathOperation, applyPathOperations, PathOperationError } from './path-operation'
export type { PathOperation, PathOperationErrorCode } from './path-operation'
export { rulerTicks } from './ruler'
export type { RulerOptions, RulerTick, RulerTicks } from './ruler'
export { snapPointToGrid, snapRect, snapToGrid } from './snap'
export type { SnapGuide, SnapLines, SnapOptions, SnapResult } from './snap'
export { checkTableCells, planCellMerge, planCellSplit, planTableLineInsert, planTableLineRemove } from './table-cells'
export type { TableAxis, TableCell, TableCellIssue, TableCellPosition, TableLinePlan, TableMergePlan, TableSize } from './table-cells'
export { handlePoints, nudgeDelta, resizeWithHandle, rotateWithHandle } from './transform'
export type { NudgeOptions, ResizeHandle, ResizeOptions, RotateOptions, TransformHandle } from './transform'
export { convertLength, CSS_PX_PER_INCH, formatLength, isPaperPresetName, LENGTH_UNIT_SYMBOLS, LENGTH_UNITS, MM_PER_INCH, PAPER_PRESET_NAMES, PAPER_PRESETS, PT_PER_INCH, stepLength } from './units'
export type { FormatLengthOptions, LengthConversionOptions, LengthUnit, PaperPresetName, StepLengthOptions } from './units'
export {
  centerOn,
  clampZoom,
  constrainViewport,
  DEFAULT_VIEWPORT,
  DEFAULT_ZOOM_LIMITS,
  fitRect,
  panBy,
  revealRect,
  screenRectToWorld,
  screenToWorld,
  visibleWorldRect,
  wheelZoomFactor,
  worldRectToScreen,
  worldToScreen,
  zoomBy,
  zoomTo,
} from './viewport'
export type { FitOptions, Viewport, ZoomLimits } from './viewport'
