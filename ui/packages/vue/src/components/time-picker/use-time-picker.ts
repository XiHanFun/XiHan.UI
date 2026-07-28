import type { Cleanup, Layer, RuntimeConfig } from '@xihan-ui/core'
import type { TimePickerApi, TimePickerSchema } from '@xihan-ui/headless'
import type { ComputedRef, Ref } from 'vue'
import { createRuntimeConfig, createScope } from '@xihan-ui/core'
import { connectTimePicker, timePickerMachine } from '@xihan-ui/headless'
import { createFloatingUiPositionEngine } from '@xihan-ui/position-floating-ui'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

export interface TimePickerContext {
  api: ComputedRef<TimePickerApi>
  controlRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

export function useTimePicker(
  props: TimePickerSchema['props'],
  handlers: Pick<TimePickerSchema['props'], 'onValueChange' | 'onOpenChange'> = {},
): TimePickerContext {
  const controlRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  // scope id 走 Vue 的 useId：control 的 aria-labelledby 与 trigger 的 aria-controls 都是 IDREF，
  // 同页多个实例若拿到同一份 id，读屏会把别人的标题念给这一份控件
  const idGen = createVueIdGenerator()
  const scope = createScope(null, idGen)
  // 两个回调由组件外壳（emit）或组合式调用方提供，随 props 一并喂给机器
  const service = useMachine(timePickerMachine, () => ({ ...props, ...handlers }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只给注册函数、不在这里注册：层的入栈出栈跟着展开态走（机器的 trackLayer 效应负责）。
    // 挂载期就注册会让层与开合无关地常驻栈里，把同页其它层的 Escape 堵死。
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // 整个输入行记为本层分支：点触发器算层内交互，开合交给它自己切换。
      // 否则同一次点击先被判为外部交互关一次、再被 click 打开一次，等于关不掉。
      branches: () => [controlRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })

    // 定位引擎由适配器建好注入；机器只经端口驱动，不认识具体引擎。
    // 锚点取整个输入行，浮层因此与输入框对齐而不是只贴着某一段。
    service.refs.set('config', config)
    service.refs.set('registerLayer', registerLayer)
    service.refs.set('position', createFloatingUiPositionEngine())
    service.refs.set('getAnchorEl', () => controlRef.value)
    service.refs.set('getFloatingEl', () => positionerRef.value)
    service.refs.set('getContentEl', () => contentRef.value)
  }

  const api = computed(() => connectTimePicker(service, vueNormalize))
  return { api, controlRef, positionerRef, contentRef }
}
