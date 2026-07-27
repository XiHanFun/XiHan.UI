import type { BreadcrumbApi, BreadcrumbProps } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectBreadcrumb } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'

export interface BreadcrumbContext {
  api: ComputedRef<BreadcrumbApi>
}

// Breadcrumb 无状态机，也不派生 part id（没有任何 IDREF 要串），
// 因此连 scope 都不需要：props 变了由 computed 重算属性。
export function useBreadcrumb(props: BreadcrumbProps): BreadcrumbContext {
  const api = computed(() => connectBreadcrumb(props, vueNormalize))
  return { api }
}
