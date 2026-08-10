import type { TypographyApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface TypographyContext {
  api: ComputedRef<TypographyApi>
}

const KEY: InjectionKey<TypographyContext> = Symbol('xh-typography')

export function provideTypography(ctx: TypographyContext): void {
  provide(KEY, ctx)
}

export function useTypographyContext(): TypographyContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Typography 部件必须用在 XhTypographyRoot 内')
  return ctx
}
