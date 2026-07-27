import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { ComboboxApi, ComboboxSchema } from '@xihan-ui/headless'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { comboboxMachine, connectCombobox } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, nextTick, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface ComboboxContext {
  /** 部件要上报 DOM 侧的事实（如候选集合变了），得直接够到机器。 */
  service: Service<ComboboxSchema>
  api: ComputedRef<ComboboxApi>
  controlRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLInputElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
  /**
   * 上报「候选集合可能变了」。候选是调用方过滤后现渲的，机器无从预知何时变，
   * 只能由部件在自己的生命周期里如实告知；同一拍里叫多少次都只上报一次。
   */
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
  // 三个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(comboboxMachine, () => ({ ...props, ...handlers }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只给注册函数、不在这里注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支：点输入框或触发按钮算层内交互，开合交给它们自己切换。
      // 否则同一次点击先被判为外部交互关一次、再被 click 打开一次，等于关不掉。
      branches: () => [controlRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎。
    // 锚点取整个输入行，浮层因此与输入框等宽对齐而不是只贴着文字框。
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
    service.refs.set('getAnchorEl', () => controlRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
    service.refs.set('getInputEl', () => inputRef.value)
  }

  // 合并到下一拍统一上报：整份候选换掉时每个条目都会各叫一次，
  // 而每次上报都要在 content 里现查一遍 DOM，逐条发等于把列表长度平方掉。
  // 推迟一拍也正好让 DOM 落定——条目的 onMounted 跑在插入之后、onUnmounted 跑在移除之后，
  // 但同一批增删要等整轮提交完才算数。
  let syncScheduled = false
  const syncItems = (): void => {
    if (syncScheduled)
      return
    syncScheduled = true
    void nextTick(() => {
      syncScheduled = false
      // 整个组件一起卸载时机器已停机，此刻没有集合可言（送事件还会在 dev 下抛）
      if (service.getStatus() === 'Started')
        service.send({ type: 'ITEMS.SYNC' })
    })
  }

  const api = computed(() => connectCombobox(service, vueNormalize))
  return { service, api, controlRef, inputRef, positionerRef, contentRef, syncItems }
}
