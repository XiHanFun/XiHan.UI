import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { ContextMenuApi, ContextMenuSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectContextMenu, contextMenuMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ContextMenuContext {
  service: Service<ContextMenuSchema>
  api: ComputedRef<ContextMenuApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

export function useContextMenu(
  props: ContextMenuSchema['props'],
  onOpenChange?: ContextMenuSchema['props']['onOpenChange'],
  onSelect?: ContextMenuSchema['props']['onSelect'],
): ContextMenuContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(contextMenuMachine, () => ({ ...props, onOpenChange, onSelect }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只给注册函数、不在这里注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 触发区记为本层分支：展开着再右键要能就地换坐标，先被判成层外交互关一次就白闪了。
      // 代价是"左键点在触发区内也该关"落不到消解层头上，那条由 connect 在 pointerdown 上自己收口。
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎。
    // 锚点是光标坐标（虚拟锚点），因此这里没有 getAnchorEl。
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
  }

  const api = computed(() => connectContextMenu(service, vueNormalize))
  return { service, api, triggerRef, positionerRef, contentRef }
}
