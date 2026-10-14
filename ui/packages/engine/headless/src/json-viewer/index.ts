/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 json viewer 模块的公共接口。

export { jsonViewerAnatomy, jsonViewerBranchQuery, jsonViewerItemQuery } from './json-viewer.anatomy'
export { connectJsonViewer } from './json-viewer.connect'
export { jsonViewerKeyboard } from './json-viewer.keyboard'
export {
  flattenJson,
  formatJsonSource,
  JSON_VIEWER_ROOT_PATH,
  JSON_VIEWER_TOOLS,
  jsonChildPath,
  jsonExpandedPathsToDepth,
  jsonSearch,
  jsonSearchQuery,
  jsonText,
  jsonValueText,
  jsonValueType,
  jsonViewerMachine,
  resolveJsonViewerTools,
  tokenizeJsonText,
} from './json-viewer.machine'
export type { JsonSearchResult } from './json-viewer.machine'
export { jsonViewerMeta } from './json-viewer.meta'
export { groupJsonViewerNodesByParent } from './json-viewer.projection'
export type { JsonViewerNodesByParent } from './json-viewer.projection'
export type {
  JsonViewerApi,
  JsonViewerCopyErrorDetails,
  JsonViewerCopyStatus,
  JsonViewerExpandedValueChangeDetails,
  JsonViewerFlattenOptions,
  JsonViewerNode,
  JsonViewerNodeProps,
  JsonViewerSchema,
  JsonViewerTextSegment,
  JsonViewerTokenKind,
  JsonViewerTokenProps,
  JsonViewerTool,
  JsonViewerToolTrigger,
  JsonViewerTranslations,
  JsonViewerValueType,
  JsonViewerView,
  JsonViewerViewChangeDetails,
  JsonViewerWalkOptions,
  JsonViewerWrapChangeDetails,
} from './json-viewer.types'
