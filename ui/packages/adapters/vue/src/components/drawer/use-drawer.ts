import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import type { DrawerApi, DrawerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { attachCssExit, createPresence } from '@xihan-ui/core/presence'
import { connectDrawer, drawerMachine } from '@xihan-ui/headless'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface DrawerContext {
  service: Service<DrawerSchema>
  api: ComputedRef<DrawerApi>
  rendered: Ref<boolean>
  contentRef: Ref<HTMLElement | null>
  backdropRef: Ref<HTMLElement | null>
  /** 浮层搬到哪儿：实例给的容器 > 全局配置 > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
}

export function useDrawer(
  props: DrawerSchema['props'],
  onOpenChange?: DrawerSchema['props']['onOpenChange'],
  container?: () => string | Element | null | undefined,
): DrawerContext {
  // 应用级默认挂载点：core 的 RuntimeConfig 一直留着这个字段，这里把它真正接上
  const xhConfig = useXhConfig()
  const contentRef = ref<HTMLElement | null>(null)
  const backdropRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // contained 由 container 派生,在 getter 里算:在 setup 期展开 props 会把响应式冻住,
  // 之后改 side / open 这些都推不动了
  const service = useMachine(
    drawerMachine,
    // 显式写了 contained 以它为准；没写则「给了容器即局部」
    () => ({ ...props, contained: props.contained ?? container?.() != null, onOpenChange }),
    scope,
  )

  // 初值取状态而不是 false：presence 只在有 DOM 时才建，服务端拿不到它。
  // 服务端算不出 rendered 就只发一个空占位，客户端水合时补出整棵子树 = mismatch。
  const rendered = ref(service.state.get() === 'open')

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
      isModal: () => props.modal ?? true,
      setModal: () => {},
      surfaces: () => [backdropRef.value].filter(Boolean) as Element[],
    })
    const presence: PresenceHandle = createPresence({
      config: config!,
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

  const api = computed(() => connectDrawer(service, vueNormalize))
  // 实例给的容器优先；没给就问全局配置；都没有才落单一落点
  const portalTarget = computed<string | Element>(() => container?.() ?? xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { service, api, rendered, contentRef, backdropRef, portalTarget }
}
