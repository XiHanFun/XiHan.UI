import type { TableApi, TableSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef } from 'vue'
import { connectTable, tableMachine } from '@xihan-ui/headless'
import { createScope } from '@xihan-ui/kernel'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TableContext {
  api: ComputedRef<TableApi>
  /** 机器实例，供部件上报 DOM 侧的事实（如行卸载带走了焦点）。 */
  service: Service<TableSchema>
}

export function useTable(
  props: TableSchema['props'],
  onSortChange?: TableSchema['props']['onSortChange'],
  onSelectionChange?: TableSchema['props']['onSelectionChange'],
  onExpandedChange?: TableSchema['props']['onExpandedChange'],
  onColumnPreferenceChange?: TableSchema['props']['onColumnPreferenceChange'],
): TableContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(
    tableMachine,
    () => ({ ...props, onSortChange, onSelectionChange, onExpandedChange, onColumnPreferenceChange }),
    scope,
  )
  const api = computed(() => connectTable(service, vueNormalize))
  return { api, service }
}
