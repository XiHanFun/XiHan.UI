import type { GridApi } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import { inject, provide } from 'vue'

export interface GridContext {
  api: ComputedRef<GridApi>
}

const KEY: InjectionKey<GridContext> = Symbol('xh-grid')

export function provideGrid(ctx: GridContext): void {
  provide(KEY, ctx)
}

export function useGridContext(): GridContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Grid 部件必须用在 XhGridRoot 内')
  return ctx
}
