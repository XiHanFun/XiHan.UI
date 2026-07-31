import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { ComboboxApi, ComboboxSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { comboboxMachine, connectCombobox } from '@xihan-ui/headless'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, nextTick, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ComboboxContext {
  /** 机器实例，供部件直接上报 DOM 侧事实。 */
  service: Service<ComboboxSchema>
  api: ComputedRef<ComboboxApi>
  controlRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLInputElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /** 上报候选集合可能变了；同一拍里多次调用只上报一次。 */
  syncItems: () => void
}

export function useCombobox(
  props: ComboboxSchema['props'],
  handlers: Pick<ComboboxSchema['props'], 'onValueChange' | 'onInputValueChange' | 'onOpenChange'> = {},
): ComboboxContext {
  const controlRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLInputElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  const service = useMachine(comboboxMachine, () => ({ ...props, ...handlers }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，实际入栈出栈由机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支，点输入框或触发按钮算层内交互
      branches: () => [controlRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动；锚点取整个输入行
    service.refs.set('config', config)
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
  return { service, api, controlRef, inputRef, positionerRef, contentRef, syncItems }
}
