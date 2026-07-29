import type { ThreadApi, ThreadSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectThread, threadMachine } from '@xihan-ui/headless'
import { computed, ref, watch } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ThreadContext {
  api: ComputedRef<ThreadApi>
  /** overflow:auto 的滚动容器节点。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层节点，尺寸变化的观察目标。 */
  contentRef: Ref<HTMLElement | null>
}

export function useThread(
  props: ThreadSchema['props'],
  onStickChange?: ThreadSchema['props']['onStickChange'],
): ThreadContext {
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onStickChange 由组件外壳或调用方提供，随 props 一并传给机器
  const service = useMachine(threadMachine, () => ({ ...props, onStickChange }), scope)

  // 无 DOM 环境不装 config，此时粘底效应整套不挂载
  if (typeof document !== 'undefined')
    service.refs.set('config', createRuntimeConfig({ scope, idGenerator: idGen }))

  // 传 getter 而非节点本身，ref 在挂载后才有值
  service.refs.set('getViewportEl', () => viewportRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  // 节点变化后让句柄重绑
  watch([viewportRef, contentRef], () => {
    service.refs.get('stick')?.retarget()
  })

  const api = computed(() => connectThread(service, vueNormalize))
  return { api, viewportRef, contentRef }
}
