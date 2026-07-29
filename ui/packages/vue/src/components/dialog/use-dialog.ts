import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { attachCssExit, createPresence } from '@xihan-ui/behavior/presence'
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

export function useDialog(
  props: DialogSchema['props'],
  onOpenChange?: DialogSchema['props']['onOpenChange'],
): DialogContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)
  const rendered = ref(false)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(dialogMachine, () => ({ ...props, onOpenChange }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })
    // 只提供注册函数，入栈出栈由机器的 trackOverlay 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
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
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('presence', presence)
    service.refs.set('getContentEl', () => contentRef.value)
    service.refs.set('getTriggerEl', () => null)
    service.refs.set('branches', () => [])

    // data-state 提交到 DOM 之后再驱动 presence，让退场探测读到正确的 animationName
    watch(() => service.state.get() === 'open', open => presence.update(open), { flush: 'post' })

    // content 就位后把它的 CSS 退场动画接到 presence 退出租约，无动画时关闭即卸载
    let detachExit: (() => void) | undefined
    watch(contentRef, (el) => {
      detachExit?.()
      detachExit = el ? attachCssExit(el, presence) : undefined
    }, { flush: 'post' })

    onBeforeUnmount(() => {
      detachExit?.()
      presence.dispose()
    })
  }

  const api = computed(() => connectDialog(service, vueNormalize))
  return { service, api, rendered, contentRef, backdropRef }
}
