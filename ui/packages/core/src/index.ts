// @xihan-ui/core —— Foundation 原语（框架无关，零运行时依赖）。

// props-getter 机制
export type { Anatomy, AnatomyPart } from './anatomy'
export { createAnatomy } from './anatomy'

// 属性归一化
export { ariaAttr, dataAttr, dataState } from './attrs'

export type { LabellingInput, LabellingResult } from './capability/a11y/aria-labelling'

export { resolveLabelling } from './capability/a11y/aria-labelling'

// 能力：无障碍
export type { HideOutsideOptions } from './capability/a11y/hide-outside'
export { hideOutside } from './capability/a11y/hide-outside'
export type { ComposeEventHandlerOptions, PossibleRef } from './compose'
export { callAll, composeEventHandlers, composeRefs, isDict, isEventHandlerKey } from './compose'
// 常量真源
export * from './constants'
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
export type { Cleanup, Dict, Direction, Disposable, MaybeBooleanish } from './types'
export { toCleanup } from './types'

// 端口类型（实现在别处）
export type {
  Align,
  Anchor,
  Placement,
  PositionEnginePort,
  PositionOptions,
  PositionRect,
  PositionResult,
  Side,
  VirtualAnchor,
} from './types/position'
export type { VirtualItem, VirtualizerOptions, VirtualizerPort } from './types/virtualizer'

export { isDev } from './utils/dev'
// 工具
export { invariant, warn } from './utils/invariant'
