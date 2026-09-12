export function assertActionControlRecipe(source: Record<string, unknown>): void

export function compileActionControlRecipe(source: Record<string, unknown>): string

export function emitActionControlRecipe(options?: {
  sourcePath?: string
  outputPath?: string
  check?: boolean
}): Promise<{
  bytes: number
  profiles: number
  states: number
}>
