import type { LogApi, LogProps, ThreadSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { connectLog, threadMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { computed, ref, watch } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface LogContext {
  api: ComputedRef<LogApi>
  /** overflow:auto 的滚动容器节点。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层节点，尺寸变化的观察目标。 */
  contentRef: Ref<HTMLElement | null>
}

/**
 * 粘底整套复用 thread 的机器：它只认滚动容器与内容容器两个节点，不认解剖。
 * 机器只收 onStickChange，rows / loading / translations 是纯视图属性，直接进 connect。
 */
export function useLog(
  props: LogProps,
  onStickChange?: ThreadSchema['props']['onStickChange'],
): LogContext {
  const viewportRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(threadMachine, () => ({ onStickChange }), scope)

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

  const api = computed(() => connectLog(service, props, vueNormalize))
  return { api, viewportRef, contentRef }
}
