import type { InjectionKey } from 'vue'
import type { BreadcrumbContext } from './use-breadcrumb'
import { inject, provide } from 'vue'

const KEY: InjectionKey<BreadcrumbContext> = Symbol('xh-breadcrumb')

export function provideBreadcrumb(ctx: BreadcrumbContext): void {
  provide(KEY, ctx)
}

export function useBreadcrumbContext(): BreadcrumbContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Breadcrumb 部件必须用在 XhBreadcrumbRoot 内')
  return ctx
}
