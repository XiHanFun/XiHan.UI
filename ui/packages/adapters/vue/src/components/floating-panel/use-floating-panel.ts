import type { RuntimeConfig, Service } from '@xihan-ui/core'
import type { FloatingPanelApi, FloatingPanelSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope, ensurePortalRoot } from '@xihan-ui/core'
import { connectFloatingPanel, floatingPanelMachine } from '@xihan-ui/headless'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FloatingPanelContext {
  api: ComputedRef<FloatingPanelApi>
  service: Service<FloatingPanelSchema>
  /** 面板节点，跟手期间机器取它的文档挂指针监听。 */
  contentRef: Ref<HTMLElement | null>
  /** 定位层节点，进退场动画挂在它身上。 */
  positionerRef: Ref<HTMLElement | null>
  /** 定位层此刻该不该可见：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 浮层搬到哪儿：全局配置的 portalContainer > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
}

/** 回调打包成一个对象：这个组件有四路对外通知，逐个当形参排下去没法读。 */
export type FloatingPanelNotifiers = Pick<
  FloatingPanelSchema['props'],
  'onOpenChange' | 'onPositionChange' | 'onDimensionsChange' | 'onWindowStateChange'
>

export function useFloatingPanel(
  props: FloatingPanelSchema['props'],
  notifiers: FloatingPanelNotifiers = {},
): FloatingPanelContext {
  const contentRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)

  // connect 要派生 content 与 title 的 id，因此建 scope：id 走 Vue 的 useId，
  // 同页多个面板的 IDREF 才不会相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(floatingPanelMachine, () => ({ ...props, ...notifiers }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectFloatingPanel(service, vueNormalize))

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null
  if (typeof document !== 'undefined')
    config = createRuntimeConfig({ scope, idGenerator: idGen })

  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走。面板整棵子树都在 positioner 底下，
  // 收起与进退场动画都落在它身上，探测器也从它身上读 animationName
  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef: positionerRef })

  // 定位层要逃开祖先的层叠上下文：祖先链上任意一处 transform / filter / contain 都会抢走
  // position: fixed 的包含块，而连接层写的 left/top 是视口坐标，面板会落到错误的位置。
  // 先问全局配置的落点，没有才落单一 portal 根
  const xhConfig = useXhConfig()
  const portalTarget = computed<string | Element>(() =>
    xhConfig.value.portalContainer?.() ?? (typeof document === 'undefined' ? 'body' : ensurePortalRoot(document)),
  )

  return { api, service, contentRef, positionerRef, visible, portalTarget }
}
