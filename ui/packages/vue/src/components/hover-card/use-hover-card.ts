import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { HoverCardApi, HoverCardSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectHoverCard, hoverCardMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface HoverCardContext {
  service: Service<HoverCardSchema>
  api: ComputedRef<HoverCardApi>
  /** 定位锚点。 */
  triggerRef: Ref<HTMLElement | null>
  /** 被定位的浮层。 */
  positionerRef: Ref<HTMLElement | null>
  /** 消解层节点，同时是「焦点是否仍在卡片内」的判据之一。 */
  contentRef: Ref<HTMLElement | null>
}

export function useHoverCard(
  props: HoverCardSchema['props'],
  onOpenChange?: HoverCardSchema['props']['onOpenChange'],
): HoverCardContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // onOpenChange 由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(hoverCardMachine, () => ({ ...props, onOpenChange }), scope)

  // 无 DOM 环境（SSR）不建引擎与消解层：机器照常转移，只是不产出坐标、不入层栈
  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只给注册函数、不在这里注册：层的入栈出栈跟着可见态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支：指针按在它上面算层内交互，不该把刚悬停出来的卡片关掉
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      // 悬停卡片从不模态：不陷焦点、不锁滚动、没有自带遮罩
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
  }

  // 元素 getter 与 DOM 环境无关：连接层判定焦点去向时要经它们取活节点
  service.refs.set('getAnchorEl', () => triggerRef.value)
  service.refs.set('getFloatingEl', () => positionerRef.value)
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectHoverCard(service, vueNormalize))
  return { service, api, triggerRef, positionerRef, contentRef }
}
