/** 环境档：深色、紧凑、减弱动效、高对比。 */
export type TokenMode = 'dark' | 'compact' | 'reduce' | 'more'
/** 取值档：缺省档或某个环境档。 */
export type TokenEnv = 'default' | TokenMode
export interface TokenData {
  /** 缺省档：:where(:root) 上的全部声明，含高对比开关这类内部变量。 */
  base: Record<string, string>
  /** 各环境档改写的声明。 */
  modes: Record<TokenMode, Record<string, string>>
}
export function collectTokenData(css: string): TokenData
export function createTokenResolver(data: TokenData): {
  raw: (name: string, env: TokenEnv) => string | undefined
  value: (name: string, env: TokenEnv, resolve: boolean) => string | undefined
}
