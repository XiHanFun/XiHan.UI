export function assertSwatchRecipe(source: Record<string, unknown>): void

export function compileSwatchRecipe(source: Record<string, unknown>): string

export function emitSwatchRecipe(options?: {
  sourcePath?: string
  outputPath?: string
  check?: boolean
}): Promise<{
  bytes: number
  sizes: number
}>
