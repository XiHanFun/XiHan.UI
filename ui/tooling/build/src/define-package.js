import { defineConfig } from 'tsdown'

/**
 * @typedef {object} XihanPackageOptions
 * @property {import('tsdown').Options['entry']} [entry] 入口，默认 { index: 'src/index.ts' }。
 * @property {boolean} [dts] 是否生成 .d.ts，默认 true。
 * @property {(string|RegExp)[]} [neverBundle] 额外不打进产物的依赖。
 * @property {boolean} [unbundle] 保留模块结构（每个源文件一个产物），默认 false。
 * @property {Partial<import('tsdown').Options>} [overrides] 透传给 tsdown 的其余选项。
 */

/**
 * XiHan.UI 库包统一 tsdown 配置工厂：ESM only，@xihan-ui/* 与 vue/@lit/* 一律 external。
 * @param {XihanPackageOptions} [options]
 */
export function defineXihanPackage(options = {}) {
  const { entry = { index: 'src/index.ts' }, dts = true, neverBundle = [], unbundle = false, overrides = {} } = options
  return defineConfig({
    entry,
    format: ['esm'],
    platform: 'neutral',
    dts,
    clean: true,
    treeshake: true,
    unbundle,
    // 顶层 external 已弃用，改走 deps.neverBundle
    deps: {
      neverBundle: [/^@xihan-ui\//, 'vue', /^@lit\//, ...neverBundle],
    },
    // 类型生成占掉大半构建时间，这个库的 .d.ts 体量决定了它永远如此，
    // 这条提示每次构建都响、且提不出可执行的改法，关掉
    checks: {
      pluginTimings: false,
    },
    ...overrides,
  })
}
