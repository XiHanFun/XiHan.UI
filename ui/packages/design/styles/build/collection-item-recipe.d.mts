export function assertCollectionItemRecipe(source: Record<string, unknown>): void

export function compileCollectionItemRecipe(source: Record<string, unknown>): string

export function emitCollectionItemRecipe(options?: {
  sourcePath?: string
  outputPath?: string
  check?: boolean
}): Promise<{
  bytes: number
  columns: number
  contexts: number
  sizes: number
  states: number
}>
