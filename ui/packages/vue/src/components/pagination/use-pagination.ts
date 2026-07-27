import type { PaginationApi, PaginationSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { connectPagination, paginationMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'

export interface PaginationContext {
  api: ComputedRef<PaginationApi>
}

export function usePagination(
  props: PaginationSchema['props'],
  onPageChange?: PaginationSchema['props']['onPageChange'],
): PaginationContext {
  // onPageChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(paginationMachine, () => ({ ...props, onPageChange }))
  const api = computed(() => connectPagination(service, vueNormalize))
  return { api }
}
