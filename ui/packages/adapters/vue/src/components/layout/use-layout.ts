import type { LayoutApi, LayoutSchema } from '@xihan-ui/headless'
import type { ComputedRef } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectLayout, layoutMachine } from '@xihan-ui/headless'
import { computed } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface LayoutContext {
  api: ComputedRef<LayoutApi>
}

export function useLayout(
  props: LayoutSchema['props'],
  onSiderCollapsedChange?: LayoutSchema['props']['onSiderCollapsedChange'],
  onSiderBreakpoint?: LayoutSchema['props']['onSiderBreakpoint'],
): LayoutContext {
  // 把手要用 aria-controls 指向侧栏，两者的 id 必须同源，所以显式建 scope
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(layoutMachine, () => ({ ...props, onSiderCollapsedChange, onSiderBreakpoint }), scope)
  // 覆盖式侧栏与浮层必须读取同一运行时层栈；服务端没有 DOM，不挂 Escape 副作用。
  if (typeof document !== 'undefined')
    service.refs.set('config', createRuntimeConfig({ scope, idGenerator: idGen }))
  const api = computed(() => connectLayout(service, vueNormalize))
  return { api }
}
