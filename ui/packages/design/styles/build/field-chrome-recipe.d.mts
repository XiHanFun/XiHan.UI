export function assertFieldChromeRecipe(source: Record<string, unknown>): void

export function compileFieldChromeRecipe(source: Record<string, unknown>): string

export function emitFieldChromeRecipe(options?: {
  sourcePath?: string
  outputPath?: string
  check?: boolean
}): Promise<{
  bytes: number
  layouts: number
  sizes: number
  states: number
}>
