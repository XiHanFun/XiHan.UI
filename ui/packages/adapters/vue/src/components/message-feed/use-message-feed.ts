import type { MessageFeedApi, MessageFeedSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectMessageFeed, messageFeedMachine } from '@xihan-ui/headless'
import { computed, ref, watch } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = MessageFeedSchema['props']

export interface MessageFeedContext {
  api: ComputedRef<MessageFeedApi>
  /** 根节点，条目集合的归属容器。 */
  rootRef: Ref<HTMLElement | null>
  /** overflow:auto 的滚动容器节点。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层节点，尺寸变化的观察目标。 */
  contentRef: Ref<HTMLElement | null>
}

export function useMessageFeed(
  props: Props,
  handlers: Pick<Props, 'onStickChange' | 'onItemFocus'> = {},
): MessageFeedContext {
  const rootRef = ref<HTMLElement | null>(null)
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(messageFeedMachine, () => ({ ...props, ...handlers }), scope)

  // 无 DOM 环境不装 config，此时粘底效应整套不挂载
  if (typeof document !== 'undefined')
    service.refs.set('config', createRuntimeConfig({ scope, idGenerator: idGen }))

  // 传 getter 而非节点本身，ref 在挂载后才有值
  service.refs.set('getRootEl', () => rootRef.value)
  service.refs.set('getViewportEl', () => viewportRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  // 节点变化后让句柄重绑
  watch([viewportRef, contentRef], () => {
    service.refs.get('stick')?.retarget()
  })

  const api = computed(() => connectMessageFeed(service, vueNormalize))
  return { api, rootRef, viewportRef, contentRef }
}
