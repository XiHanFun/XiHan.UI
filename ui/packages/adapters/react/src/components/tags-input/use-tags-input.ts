import type { Service } from '@xihan-ui/core'
import type { TagsInputApi, TagsInputSchema } from '@xihan-ui/headless'
import type { RefObject } from 'react'
import { connectTagsInput, tagsInputMachine } from '@xihan-ui/headless'
import { useRef } from 'react'
import { useFormReset } from '../../runtime/attach-form-reset'
import { reactNormalize } from '../../runtime/normalize-props'
import { useReactScope } from '../../runtime/react-id'
import { useMachine } from '../../runtime/use-machine'

export interface TagsInputContext {
  api: TagsInputApi
  /** 机器实例，供部件上报 DOM 侧的事实（如标签节点带着焦点离场）。 */
  service: Service<TagsInputSchema>
  /** 表单重置的锚点：接在根节点上。 */
  rootRef: RefObject<HTMLElement | null>
}

export function useTagsInput(props: TagsInputSchema['props']): TagsInputContext {
  // 就地编辑框的 id 由 scope 按标签值派生，机器的聚焦副作用照它捞节点
  const scope = useReactScope()
  const rootRef = useRef<HTMLElement | null>(null)
  const service = useMachine(tagsInputMachine, () => props, { scope })

  // 标签集合攥在机器里，原生 reset 只还原原生控件——不接这条线，点重置什么都不会发生
  useFormReset(service, rootRef)

  return { api: connectTagsInput(service, reactNormalize), service, rootRef }
}
