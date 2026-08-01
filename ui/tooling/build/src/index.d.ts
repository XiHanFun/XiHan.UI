import type { Options } from 'tsdown'

export interface XihanPackageOptions {
  entry?: Options['entry']
  dts?: boolean
  external?: (string | RegExp)[]
  overrides?: Partial<Options>
}

export function defineXihanPackage(options?: XihanPackageOptions): ReturnType<typeof import('tsdown').defineConfig>

export function xihanExports(subpaths: string[]): Record<string, unknown>
