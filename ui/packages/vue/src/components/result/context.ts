import type { ResultApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface ResultContext {
  api: ComputedRef<ResultApi>
}

const KEY: InjectionKey<ResultContext> = Symbol('xh-result')

export function provideResult(ctx: ResultContext): void {
  provide(KEY, ctx)
}

export function useResultContext(): ResultContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Result 部件必须用在 XhResultRoot 内')
  return ctx
}
