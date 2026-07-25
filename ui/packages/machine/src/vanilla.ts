// 内置运行时子入口：Web Components、测试、benchmark 用；不进主入口。
export { createSignalScope, createVanillaRuntime } from './reactive/vanilla'
export type { Signal, VanillaRuntime } from './reactive/vanilla'
