export type { XhConfig, XhConfigScope, XhTranslationOverrides } from './config'
export { getXhConfig, mergeXhConfig, onXhConfigChange, resolveXhConfig, setXhConfig } from './config'
// @xihan-ui/web-components —— Web Components 适配器（Light-DOM 行为宿主）。
// 主入口只导出运行时/DOM 原语，不含元素类，Node 下可安全 import。
// 元素类与注册在 @xihan-ui/web-components/define。

export { wcNormalize } from './dom/normalize'
export { discoverParts } from './dom/parts'
export { createSpreader } from './dom/spread'
export type { Spreader } from './dom/spread'
export { createLitRuntime } from './runtime/lit-runtime'
export type { LitRuntime } from './runtime/lit-runtime'
export { MachineController } from './runtime/machine-controller'
export { defineElement } from './runtime/registry'
