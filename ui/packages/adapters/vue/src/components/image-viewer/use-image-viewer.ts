import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { ImageViewerApi, ImageViewerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { connectImageViewer, imageViewerMachine } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ImageViewerContext {
  service: Service<ImageViewerSchema>
  api: ComputedRef<ImageViewerApi>
  /** 浮层搬到哪儿：全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
}

export function useImageViewer(
  props: ImageViewerSchema['props'],
  handlers: Pick<ImageViewerSchema['props'], 'onOpenChange' | 'onIndexChange'> = {},
): ImageViewerContext {
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(imageViewerMachine, () => ({ ...props, ...handlers }), scope)

  // 初值取状态而不是 false：presence 只在有 DOM 时才建，服务端拿不到它。
  // 服务端算不出 rendered 就只发一个空占位，客户端水合时补出整棵子树 = mismatch。
  const rendered = ref(service.state.get() === 'open')

  const xhConfig = useXhConfig()
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({
      scope,
      idGenerator: idGen,
      // 宿主把滚动搬进内容容器时 body 本身不滚，加锁会是空操作；这条把真正在滚的那层交给滚动锁
      scrollRoot: () => xhConfig.value.scrollRoot?.() ?? null,
    })
    // 只提供注册函数，入栈出栈由机器的 trackOverlay 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'modal',
      node: () => contentRef.value,
      branches: () => [],
      isModal: () => true,
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

    // data-state 提交到 DOM 之后再驱动 presence，让退场探测读到正确的 animationName
    watch(() => service.state.get() === 'open', open => presence.update(open), { flush: 'post' })

    // 内容与遮罩各自的动画都要申领退出租约；任一未结束都不能提早释放模态资源。
    const tracked = new Map<HTMLElement, Cleanup>()
    watch([contentRef, backdropRef], (nodes) => {
      const next = new Set(nodes.filter((node): node is HTMLElement => node !== null))
      for (const node of next) {
        if (!tracked.has(node))
          tracked.set(node, attachCssExit(node, presence))
      }
      for (const [node, detach] of tracked) {
        if (!next.has(node)) {
          tracked.delete(node)
          detach()
        }
      }
    }, { flush: 'post' })

    onBeforeUnmount(() => {
      presence.dispose()
      for (const detach of tracked.values()) detach()
      tracked.clear()
    })
  }

  const api = computed(() => connectImageViewer(service, vueNormalize))
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, rendered, contentRef, backdropRef, portalTarget }
}
