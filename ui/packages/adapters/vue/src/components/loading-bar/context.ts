import type { InjectionKey } from 'vue'
import type { LoadingBarContext } from './use-loading-bar'
import { inject, provide } from 'vue'

// 全局符号注册表：模块被打包或热更新成两份时，Symbol('x') 会是两个不同的键，
// provide 与 inject 各拿一个，部件当场抛「必须用在 XhLoadingBarRoot 内」——整棵子树白屏。
// Symbol.for 按字符串查同一个键，两份模块也对得上
const KEY: InjectionKey<LoadingBarContext> = Symbol.for('xh-loading-bar')

export function provideLoadingBar(ctx: LoadingBarContext): void {
  provide(KEY, ctx)
}

export function useLoadingBarContext(): LoadingBarContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] LoadingBar 部件必须用在 XhLoadingBarRoot 内')
  return ctx
}
