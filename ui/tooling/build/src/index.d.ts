import type { Options } from 'tsdown'

export interface XihanPackageOptions {
  /** 入口，默认 { index: 'src/index.ts' }。 */
  entry?: Options['entry']
  /** 是否生成 .d.ts，默认 true。 */
  dts?: boolean
  /** 额外不打进产物的依赖。 */
  neverBundle?: (string | RegExp)[]
  /** 保留模块结构（每个源文件一个产物），默认 false。 */
  unbundle?: boolean
  /** 透传给 tsdown 的其余选项。 */
  overrides?: Partial<Options>
}

export function defineXihanPackage(options?: XihanPackageOptions): ReturnType<typeof import('tsdown').defineConfig>

export function xihanExports(subpaths: string[]): Record<string, unknown>

/** srcDir 下要带 'use client' 的模块（绝对路径，正斜杠）。 */
export function clientModules(srcDir: string): Set<string>

/** 产物文件头是否是 'use client' 指令。 */
export function hasUseClientDirective(code: string): boolean

/** 给按模块产出的 React 包加 'use client' 指令的打包插件。 */
export function useClientDirective(options?: { srcDir?: string }): import('tsdown').TsdownPlugin
