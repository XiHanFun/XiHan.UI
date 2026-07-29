import { defineConfig } from 'tsdown'

/**
 * @typedef {object} XihanPackageOptions
 * @property {import('tsdown').Options['entry']} [entry] 入口，默认 { index: 'src/index.ts' }。
 * @property {boolean} [dts] 是否生成 .d.ts，默认 true。
 * @property {(string|RegExp)[]} [external] 额外 external。
 * @property {Partial<import('tsdown').Options>} [overrides] 透传给 tsdown 的其余选项。
 */

/**
 * XiHan.UI 库包统一 tsdown 配置工厂：ESM only，@xihan-ui/* 与 vue/@lit/* 一律 external。
 * @param {XihanPackageOptions} [options]
 */
export function defineXihanPackage(options = {}) {
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
