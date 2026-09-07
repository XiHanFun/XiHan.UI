import type { Service } from '@xihan-ui/core'
import type { TreeApi, TreeSchema } from '@xihan-ui/headless'
import { connectTree, treeMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TreeContext {
  api: TreeApi
  /** 机器实例，供部件上报 DOM 侧的事实（如节点卸载带走了焦点）。 */
  service: Service<TreeSchema>
}

export function useTree(props: TreeSchema['props']): TreeContext {
  const scope = useReactScope()
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(treeMachine, () => props, { scope })
  return { api: connectTree(service, reactNormalize), service }
}
