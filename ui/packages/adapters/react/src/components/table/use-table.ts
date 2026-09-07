import type { Service } from '@xihan-ui/core'
import type { TableApi, TableSchema } from '@xihan-ui/headless'
import { connectTable, tableMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TableContext {
  api: TableApi
  /** 机器实例，供部件上报 DOM 侧的事实（如行卸载带走了焦点）。 */
  service: Service<TableSchema>
}

export function useTable(props: TableSchema['props']): TableContext {
  const scope = useReactScope()
  const service = useMachine(tableMachine, () => props, { scope })
  return { api: connectTable(service, reactNormalize), service }
}
