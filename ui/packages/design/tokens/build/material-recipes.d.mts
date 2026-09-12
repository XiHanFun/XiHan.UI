export function attachMaterialRecipes<T extends Record<string, unknown>>(
  document: T,
  material: Record<string, unknown>,
  file: string,
): T & { material: Record<string, unknown> }

export function compileMaterialRecipes(source: Record<string, unknown>): Record<string, Record<string, unknown>>

export function emitMaterialRecipes(tokensDir?: string): Promise<{
  fragments: Record<string, Record<string, unknown>>
  recipes: number
  targets: number
}>
