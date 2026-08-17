import type { ComboboxApi, ComboboxInputEl, ComboboxSchema } from '@xihan-ui/headless'
import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { comboboxMachine, connectCombobox } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, nextTick, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { useOverlayExit } from '../../runtime/use-overlay-exit'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ComboboxContext {
  /** 机器实例，供部件直接上报 DOM 侧事实。 */
  service: Service<ComboboxSchema>
  api: ComputedRef<ComboboxApi>
  controlRef: Ref<HTMLElement | null>
  /** 输入宿主，input 或 textarea；由 XhComboboxInput 的 as 决定渲染成哪个。 */
  inputRef: Ref<ComboboxInputEl | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 此刻该不该渲染：退场动画播完之前仍为真。 */
  visible: Ref<boolean>
  /** 上报候选集合可能变了；同一拍里多次调用只上报一次。 */
  syncItems: () => void
}

export function useCombobox(
  props: ComboboxSchema['props'],
  handlers: Pick<ComboboxSchema['props'], 'onValueChange' | 'onInputValueChange' | 'onOpenChange'> = {},
): ComboboxContext {
  const controlRef = ref<HTMLElement | null>(null)
  const inputRef = ref<ComboboxInputEl | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(comboboxMachine, () => ({ ...props, ...handlers }), scope)

  // 服务端没有 DOM、也就没有退场：config 传 null 时闸门退化成「跟着展开态」
  let config: RuntimeConfig | null = null

  if (typeof document !== 'undefined') {
    config = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，实际入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config!.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支，点输入框或触发按钮算层内交互
      branches: () => [controlRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
    service.refs.set('config', config!)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createPositionEngine())
    service.refs.set('getAnchorEl', () => controlRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
    service.refs.set('getInputEl', () => inputRef.value)
  }

  // 合并到下一拍统一上报，同时等待 DOM 落定
  let syncScheduled = false
  const syncItems = (): void => {
    if (syncScheduled)
      return
    syncScheduled = true
    void nextTick(() => {
      syncScheduled = false
      if (service.getStatus() === 'Started')
        service.send({ type: 'ITEMS.SYNC' })
    })
  }

  const api = computed(() => connectCombobox(service, vueNormalize))
  // 退场闸门：收起从跟着 open 走，改成跟着 presence 走
  const visible = useOverlayExit({ config, isOpen: () => api.value.open, contentRef })

  return { visible, service, api, controlRef, inputRef, positionerRef, contentRef, syncItems }
}
