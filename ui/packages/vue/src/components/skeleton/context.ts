import type { InjectionKey } from 'vue'
import type { SkeletonContext } from './use-skeleton'
import { inject, provide } from 'vue'

const KEY: InjectionKey<SkeletonContext> = Symbol('xh-skeleton')

export function provideSkeleton(ctx: SkeletonContext): void {
  provide(KEY, ctx)
}

export function useSkeletonContext(): SkeletonContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Skeleton 部件必须用在 XhSkeletonRoot 内')
  return ctx
}
