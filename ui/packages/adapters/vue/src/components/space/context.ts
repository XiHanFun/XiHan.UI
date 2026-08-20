import type { SpaceApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface SpaceContext {
  api: ComputedRef<SpaceApi>
}

const KEY: InjectionKey<SpaceContext> = Symbol('xh-space')

export function provideSpace(ctx: SpaceContext): void {
  provide(KEY, ctx)
}

export function useSpaceContext(): SpaceContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Space 部件必须用在 XhSpace 内')
  return ctx
}
