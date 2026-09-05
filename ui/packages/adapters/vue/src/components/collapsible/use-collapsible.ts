import type { RuntimeConfig } from '@xihan-ui/core'
import type { CollapsibleApi, CollapsibleSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { collapsibleMachine, connectCollapsible } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface CollapsibleContext {
  api: ComputedRef<CollapsibleApi>
  contentRef: Ref<HTMLElement | null>
  /** 收起动画播完之前保持为真：真正的收起由它落成内联 display。 */
  visible: Ref<boolean>
}

export function useCollapsible(
  props: CollapsibleSchema['props'],
  onOpenChange?: CollapsibleSchema['props']['onOpenChange'],
): CollapsibleContext {
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(collapsibleMachine, () => ({ ...props, onOpenChange }), scope)
  const api = computed(() => connectCollapsible(service, vueNormalize))
  const contentRef = ref<HTMLElement | null>(null)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined')
    config = createRuntimeConfig({ scope, idGenerator: idGen })

  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })
  return { api, contentRef, visible }
}
