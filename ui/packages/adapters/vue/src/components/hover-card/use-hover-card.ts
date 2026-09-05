import type { Cleanup, Layer, RuntimeConfig, Service } from '@xihan-ui/core'
import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectHoverCard, hoverCardMachine } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface HoverCardContext {
  service: Service<HoverCardSchema>
  api: ComputedRef<HoverCardApi>
  /** 定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
  /** 消解层节点，也是判定焦点是否仍在卡片内的依据。 */
  contentRef: Ref<HTMLElement | null>
  /** 此刻该不该渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层搬到哪儿：全局配置的 portalContainer > body。 */
  portalTarget: ComputedRef<string | Element>
}

export function useHoverCard(
  props: HoverCardSchema['props'],
  onOpenChange?: HoverCardSchema['props']['onOpenChange'],
): HoverCardContext {
  const xhConfig = useXhConfig()
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(hoverCardMachine, () => ({ ...props, onOpenChange }), scope)

  // 无 DOM 环境（SSR）不建引擎与消解层
  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按可见态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，指针按在它上面算层内交互；
      // 浮层壳一并记上：卡片之外还浮着自绘滚动条，按住它拖动不该把卡片消解掉
      branches: () => [triggerRef.value, positionerRef.value].filter(Boolean) as Element[],
      // 悬停卡片非模态：不陷焦点、不锁滚动、无遮罩
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    service.refs.set('config', config!)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
  }

  // 元素 getter 在无 DOM 环境下也要设，连接层判定焦点去向时经它们取节点
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectHoverCard(service, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })
  // 先问全局配置的落点，没有才落 body
  const portalTarget = computed<string | Element>(() => xhConfig.value.portalContainer?.() ?? config?.portalContainer() ?? 'body')

  return { visible, service, api, triggerRef, positionerRef, contentRef, portalTarget }
}
