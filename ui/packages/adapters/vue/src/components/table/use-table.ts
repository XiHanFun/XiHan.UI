import type { Service } from '@xihan-ui/core'
import type { TableApi, TableSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTable, tableMachine } from '@xihan-ui/headless'
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
  onExpandedValueChange?: TableSchema['props']['onExpandedValueChange'],
  onColumnPreferenceChange?: TableSchema['props']['onColumnPreferenceChange'],
  onRowMove?: TableSchema['props']['onRowMove'],
): TableContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(
    tableMachine,
    () => ({ ...props, onSortChange, onSelectionChange, onExpandedValueChange, onColumnPreferenceChange, onRowMove }),
    scope,
  )
  const api = computed(() => connectTable(service, vueNormalize))
  return { api, service }
}
