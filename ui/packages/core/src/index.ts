// @xihan-ui/core —— Foundation 原语（框架无关，零运行时依赖）。

// 组件解剖
export type { Anatomy, AnatomyPart } from './anatomy'
export { createAnatomy } from './anatomy'

// 属性归一化
export { dataAttr, dataState } from './attrs'

export type { LabellingInput, LabellingResult } from './capability/a11y/aria-labelling'

export { resolveLabelling } from './capability/a11y/aria-labelling'

// 能力：无障碍
export type { HideOutsideOptions } from './capability/a11y/hide-outside'
export { hideOutside } from './capability/a11y/hide-outside'
// 能力：输入法
export type { ComposingLike } from './capability/ime'
export { isComposingEvent } from './capability/ime'
export type { ComposeEventHandlerOptions, PossibleRef } from './compose'
export { callAll, composeEventHandlers, composeRefs, isDict, isEventHandlerKey } from './compose'
// 常量
export * from './constants'
// 诊断通道
export {
  getDiagnostics,
  onDiagnostic,
  reportDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from './diagnostics/channel'
export type { DiagnosticCode } from './diagnostics/codes'
export { DIAGNOSTIC_CODES } from './diagnostics/codes'
export type {
  DiagnosticHandler,
  DiagnosticLevel,
  DiagnosticRecord,
  Diagnostics,
  DiagnosticThreshold,
} from './diagnostics/types'
// 守卫与探测
export { contains, isDocument, isElement, isFunction, isHTMLElement, isShadowRoot, isSSR, isWindow } from './guards'
// 环境抽象
export type { IdGenerator } from './id-generator'

export { createCounterIdGenerator } from './id-generator'
export { mergeProps } from './merge-props'
export type { NormalizeProps, PropTypes } from './normalize-props'
export { createNormalizer, normalizeProps } from './normalize-props'
export type { RuntimeConfig } from './runtime-config'
export { createRuntimeConfig } from './runtime-config'

export type { Scope } from './scope'
export { createScope, getActiveElementDeep } from './scope'
// 结构：层栈
export type { Layer, LayerKind, LayerRegistry } from './structure/layer-registry'
export { createLayerRegistry, getLayerRegistry } from './structure/layer-registry'

export type { PerDocumentRegistry } from './structure/per-document-registry'
export { createPerDocumentRegistry } from './structure/per-document-registry'
// 类型与生命周期
export type { Cleanup, Dict, Direction, Disposable, MaybeBooleanish, Orientation } from './types'
export { toCleanup } from './types'

// 端口类型
export type { CodeToken, CodeTokenKind, HighlighterPort } from './types/highlighter'
export type {
  Align,
  Anchor,
  Placement,
  PositionEnginePort,
  PositionOptions,
  PositionRect,
  PositionResult,
  PositionStrategy,
  Side,
  VirtualAnchor,
} from './types/position'
export type { VirtualItem, VirtualizerOptions, VirtualizerPort } from './types/virtualizer'

export { isDev } from './utils/dev'
// 工具
export { invariant, warn } from './utils/invariant'
