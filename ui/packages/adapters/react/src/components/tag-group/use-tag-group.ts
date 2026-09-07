import type { Service } from '@xihan-ui/core'
import type { TagGroupApi, TagGroupSchema } from '@xihan-ui/headless'
import { connectTagGroup, tagGroupMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TagGroupContext {
  api: TagGroupApi
  /** 机器实例，供部件上报 DOM 侧的事实（如标签卸载带走了焦点）。 */
  service: Service<TagGroupSchema>
}

export function useTagGroup(props: TagGroupSchema['props']): TagGroupContext {
  const scope = useReactScope()
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(tagGroupMachine, () => props, { scope })
  return { api: connectTagGroup(service, reactNormalize), service }
}
