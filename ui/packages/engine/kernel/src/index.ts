// @xihan-ui/kernel —— Foundation 原语（框架无关，零运行时依赖）。

// 版本号:适配器做运行期锁步检查用(全部库包同版本是硬承诺,混装会静默失效)
export { version as VERSION } from '../package.json'
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
// (与 ./skin-check 同理,见 .size-limit.json 里 kernel 与 vue 各入口的棘轮)
export type {
  DiagnosticHandler,
  DiagnosticLevel,
  DiagnosticRecord,
  Diagnostics,
  DiagnosticThreshold,
} from './diagnostics/types'
// 锁步版本检查与框架元数据同在 ./metadata 子路径,主入口只留结构原语与 VERSION
// 守卫与探测
export { contains, isDocument, isElement, isFunction, isHTMLElement, isShadowRoot, isSSR, isWindow } from './guards'
// 环境抽象
export type { IdGenerator } from './id-generator'

export { createCounterIdGenerator } from './id-generator'
// locale 解析链
export { hostLocale, resolveLocale, XH_FALLBACK_LOCALE } from './locale'
export { mergeProps } from './merge-props'
// 框架元数据在 ./metadata 子路径:与 Framework 的独立 Metadata 包同理,主入口只留
// 结构原语与 VERSION(见 .size-limit.json 里 kernel 主入口 3.3 kB 的棘轮)
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
// 结构：portal 落点
export { ensurePortalRoot } from './structure/portal-root'
// 类型与生命周期
export type { ActionVariant, Cleanup, ControlVariant, Dict, Direction, Disposable, MaybeBooleanish, Orientation, OverlayBackdropVariant, OverlayCloseReason, Size, Tone } from './types'
export { toCleanup } from './types'

// 端口类型
export type { CodeToken, CodeTokenKind, HighlighterPort } from './types/highlighter'
export type { IconNode, IconRecord, IconTag } from './types/icon'
export type {
  Align,
  Anchor,
  Placement,
  PositionArrow,
  PositionArrowOptions,
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
