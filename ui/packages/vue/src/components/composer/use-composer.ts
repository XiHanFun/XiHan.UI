import type { ComposerApi, ComposerSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createScope } from '@xihan-ui/core'
import { composerMachine, connectComposer } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

type Props = ComposerSchema['props']

export interface ComposerCallbacks {
  onValueChange?: Props['onValueChange']
  onSubmit?: Props['onSubmit']
  onStop?: Props['onStop']
}

export interface ComposerContext {
  api: ComputedRef<ComposerApi>
}

export function useComposer(props: Props, callbacks: ComposerCallbacks = {}): ComposerContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 三个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器。
  // 组件不碰 DOM，也不需要 RuntimeConfig：IME 与回车都走 textarea 自己的事件
  const service = useMachine(composerMachine, () => ({ ...props, ...callbacks }), scope)
  const api = computed(() => connectComposer(service, vueNormalize))
  return { api }
}
