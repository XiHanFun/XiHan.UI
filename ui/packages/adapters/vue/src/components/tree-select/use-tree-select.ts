import type { TreeSelectApi, TreeSelectSchema } from '@xihan-ui/headless'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectTreeSelect, treeSelectMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TreeSelectContext {
  /** 机器实例，供部件上报 DOM 侧的事实（如节点卸载带走了焦点）。 */
  service: Service<TreeSelectSchema>
  api: ComputedRef<TreeSelectApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 此刻该不该渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
}

export function useTreeSelect(
  props: TreeSelectSchema['props'],
  handlers: Pick<TreeSelectSchema['props'], 'onValueChange' | 'onExpandedChange' | 'onOpenChange'> = {},
): TreeSelectContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 三个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(treeSelectMachine, () => ({ ...props, ...handlers }), scope)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互，开合由 trigger 自己切换
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动；锚点取 trigger
    service.refs.set('config', config!)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getAnchorEl', () => triggerRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
  }

  const api = computed(() => connectTreeSelect(service, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })

  return { visible, service, api, triggerRef, positionerRef, contentRef }
}
