import type { FloatingPanelApi, FloatingPanelSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectFloatingPanel, floatingPanelMachine } from '@xihan-ui/headless'
import { createScope, ensurePortalRoot } from '@xihan-ui/kernel'
import { computed, ref } from 'vue'
import { useXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface FloatingPanelContext {
  api: ComputedRef<FloatingPanelApi>
  service: Service<FloatingPanelSchema>
  /** 面板节点，跟手期间机器取它的文档挂指针监听。 */
  contentRef: Ref<HTMLElement | null>
  /** 浮层搬到哪儿：全局配置的 portalContainer > 单一落点。 */
  portalTarget: ComputedRef<string | Element>
}

/** 回调打包成一个对象：这个组件有四路对外通知，逐个当形参排下去没法读。 */
export type FloatingPanelNotifiers = Pick<
  FloatingPanelSchema['props'],
  'onOpenChange' | 'onPositionChange' | 'onSizeChange' | 'onStageChange'
>

export function useFloatingPanel(
  props: FloatingPanelSchema['props'],
  notifiers: FloatingPanelNotifiers = {},
): FloatingPanelContext {
  const contentRef = ref<HTMLElement | null>(null)

  // connect 要派生 content 与 title 的 id，因此建 scope：id 走 Vue 的 useId，
  // 同页多个面板的 IDREF 才不会相撞
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(floatingPanelMachine, () => ({ ...props, ...notifiers }), scope)

  // 传 getter 而非节点，ref 在挂载后才有值
  service.refs.set('getContentEl', () => contentRef.value)

  const api = computed(() => connectFloatingPanel(service, vueNormalize))

  // 定位层要逃开祖先的层叠上下文：祖先链上任意一处 transform / filter / contain 都会抢走
  // position: fixed 的包含块，而连接层写的 left/top 是视口坐标，面板会落到错误的位置。
  // 先问全局配置的落点，没有才落单一 portal 根
  const xhConfig = useXhConfig()
  const portalTarget = computed<string | Element>(() =>
    xhConfig.value.portalContainer?.() ?? (typeof document === 'undefined' ? 'body' : ensurePortalRoot(document)),
  )

  return { api, service, contentRef, portalTarget }
}
