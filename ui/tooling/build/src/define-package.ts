import type { Options } from 'tsdown'
import { defineConfig } from 'tsdown'

export interface XihanPackageOptions {
  /** 入口，默认 { index: 'src/index.ts' }。多入口对应多 subpath exports。 */
  entry?: Options['entry']
  /** 是否生成 .d.ts，默认 true。 */
  dts?: boolean
  /** 额外的 external（workspace 内 @xihan-ui/* 已自动 external）。 */
  external?: (string | RegExp)[]
  /** 透传给 tsdown 的其余选项。 */
  overrides?: Partial<Options>
}

/**
 * XiHan.UI 库包统一 tsdown 配置工厂。
 * - ESM only、平台中立、保留 tree-shaking 边界。
 * - workspace 内的 @xihan-ui/* 与 vue / @lit/* 一律 external，不打进产物。
 */
export function defineXihanPackage(options: XihanPackageOptions = {}) {
  const { entry = { index: 'src/index.ts' }, dts = true, external = [], overrides = {} } = options

  return defineConfig({
    entry,
    format: ['esm'],
    platform: 'neutral',
    dts,
    clean: true,
    treeshake: true,
    external: [/^@xihan-ui\//, 'vue', /^@lit\//, ...external],
    ...overrides,
  })
}
