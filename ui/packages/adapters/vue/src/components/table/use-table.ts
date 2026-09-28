/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 use table 相关实现。

import type { Service } from '@xihan-ui/core'
import type { TableApi, TableSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createScope } from '@xihan-ui/core'
import { connectTable, tableMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TableContext {
  api: ComputedRef<TableApi>
  /** 状态机实例，供部件上报 DOM 侧的事实（如行卸载带走了焦点）。 */
  service: Service<TableSchema>
  /** root 节点：版面实测（冻结列偏移、纵向合并格的高度）从它往下量。 */
  rootRef: Ref<HTMLElement | null>
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
  const rootRef = ref<HTMLElement | null>(null)
  service.refs.set('getRootEl', () => rootRef.value)
  const api = computed(() => connectTable(service, vueNormalize))
  return { api, service, rootRef }
}
