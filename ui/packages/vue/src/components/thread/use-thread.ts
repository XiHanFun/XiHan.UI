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
  /** 真正 overflow:auto 的那层：滚动位置、监听与归位都落在它身上。 */
  viewportRef: Ref<HTMLElement | null>
  /** 内容包裹层：消息一段段长出来就是它在变高，尺寸变化观察它。 */
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
  // onStickChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(threadMachine, () => ({ ...props, onStickChange }), scope)

  // 无 DOM 环境就不装 config：createRuntimeConfig 要取 document 与层注册表，SSR 期调它直接抛。
  // config 缺席时粘底效应整套不挂，机器照常转移——滚动本来就归浏览器，少一个句柄而已
  if (typeof document !== 'undefined')
    service.refs.set('config', createRuntimeConfig({ scope, idGenerator: idGen }))

  // 懒读而不是把节点直接塞进去：ref 在挂载后才有值，机器建起来的那一刻还是 null。
  // 量几何、挂 scroll 与 ResizeObserver 全在粘底句柄里进行，连接层一行 DOM 都不碰
  service.refs.set('getViewportEl', () => viewportRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  // 节点晚一拍才出现是常态：视口套在 v-if 里等接口回来、或者整块 Suspense 之后才渲。
  // 句柄是在效应挂载那一刻取的节点，不跟着换的话它会一直绑在 null 上——
  // 状态照转、ARIA 照对，就是自动吸底和"回到底部"按钮全不动，最难查的那种坏法
  watch([viewportRef, contentRef], () => {
    service.refs.get('stick')?.retarget()
  })

  const api = computed(() => connectThread(service, vueNormalize))
  return { api, viewportRef, contentRef }
}
