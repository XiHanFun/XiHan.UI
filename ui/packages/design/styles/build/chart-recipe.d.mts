export const CHART_CONTRACT_FIELDS: readonly string[]

export const CHART_LINE_CONTRACT_FIELDS: readonly string[]

export function assertChartRecipe(source: Record<string, unknown>): void

export function compileChartRecipe(source: Record<string, unknown>): string

export function emitChartRecipe(options?: {
  sourcePath?: string
  outputPath?: string
  check?: boolean
}): Promise<{
  bytes: number
  contract: Record<string, string>
}>
