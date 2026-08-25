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
  onPageSizeChange?: PaginationSchema['props']['onPageSizeChange'],
): PaginationContext {
  const service = useMachine(paginationMachine, () => ({ ...props, onPageChange, onPageSizeChange }))
  const api = computed(() => connectPagination(service, vueNormalize))
  return { api }
}
