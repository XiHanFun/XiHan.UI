import type { PresenceHandle } from '@xihan-ui/behavior/presence'
import type { DialogApi, DialogSchema } from '@xihan-ui/headless'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { attachCssExit, createPresence } from '@xihan-ui/behavior/presence'
import { connectDialog, dialogMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DialogContext {
  service: Service<DialogSchema>
  api: ComputedRef<DialogApi>
  /** 浮层搬到哪儿：全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
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

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(dialogMachine, () => ({ ...props, onOpenChange }), scope)

  // 初值取状态而不是 false：presence 只在有 DOM 时才建，服务端拿不到它。
  // 服务端算不出 rendered 就只发一个空占位，客户端水合时补出整棵子树 = mismatch。
  const rendered = ref(service.state.get() === 'open')

  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })
    // 只提供注册函数，入栈出栈由机器的 trackOverlay 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
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

    service.refs.set('config', config!)
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
  const xhConfig = useXhConfig()
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, rendered, contentRef, backdropRef, portalTarget }
}
