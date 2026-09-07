import type { Service } from '@xihan-ui/core'
import type { ListboxApi, ListboxSchema } from '@xihan-ui/headless'
import { connectListbox, listboxMachine } from '@xihan-ui/headless'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface ListboxContext {
  /** 机器实例，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  service: Service<ListboxSchema>
  api: ListboxApi
}

export function useListbox(props: ListboxSchema['props']): ListboxContext {
  const scope = useReactScope()
  // 连打检索缓冲存在机器的 refs 里，适配器不必注入 refs
  const service = useMachine(listboxMachine, () => props, { scope })
  return { service, api: connectListbox(service, reactNormalize) }
}
