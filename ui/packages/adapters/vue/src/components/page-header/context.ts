import type { PageHeaderApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface PageHeaderContext {
  api: ComputedRef<PageHeaderApi>
}

const KEY: InjectionKey<PageHeaderContext> = Symbol.for('xh-page-header')

export function providePageHeader(ctx: PageHeaderContext): void {
  provide(KEY, ctx)
}

export function usePageHeaderContext(): PageHeaderContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] PageHeader 部件必须用在 XhPageHeaderRoot 内')
  return ctx
}
