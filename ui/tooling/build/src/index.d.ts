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
