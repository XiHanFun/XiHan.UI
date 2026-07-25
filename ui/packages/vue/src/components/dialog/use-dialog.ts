import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { Layer, RuntimeConfig } from '@xihan-ui/core'
import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createPresence } from '@xihan-ui/behavior/presence'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DialogContext {
  service: Service<DialogSchema>
  api: ComputedRef<DialogApi>
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
}

export function useDialog(props: DialogSchema['props']): DialogContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)
  const rendered = ref(false)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(dialogMachine, () => props, scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
    const { layer, dispose: disposeLayer } = config.layerRegistry.register({
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => props.modal ?? true,
      setModal: () => {},
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    })
    const presence: PresenceHandle = createPresence({
      config,
      open: service.state.get() === 'open',
      onRenderedChange: (r) => {
        rendered.value = r
      },
    })
    rendered.value = presence.rendered

    service.refs.set('config', config)
    service.refs.set('layer', layer as Layer)
    service.refs.set('presence', presence)
    service.refs.set('getContentEl', () => contentRef.value)
    service.refs.set('getTriggerEl', () => null)
    service.refs.set('branches', () => [])

    // data-state 提交到 DOM 之后再驱动 presence（保证退场探测读到正确 animationName）
    watch(() => service.state.get() === 'open', open => presence.update(open), { flush: 'post' })

    onBeforeUnmount(() => {
      presence.dispose()
      disposeLayer()
    })
  }

  const api = computed(() => connectDialog(service, vueNormalize))
  return { service, api, rendered, contentRef, backdropRef }
}
