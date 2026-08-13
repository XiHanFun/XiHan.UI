import type {
  ListboxSchema,
  PopoverSchema,
  PopselectApi,
  PopselectNode,
} from '@xihan-ui/headless'
import type { Cleanup, ControlVariant, Direction, Layer, Placement, RuntimeConfig, Size, Tone } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ComputedRef, Ref } from 'vue'
import { connectPopselect, listboxMachine, popoverMachine } from '@xihan-ui/headless'
import { createRuntimeConfig, createScope } from '@xihan-ui/kernel'
import { createPositionEngine } from '@xihan-ui/position'
import { computed, ref } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { useMachine } from '../../runtime/use-machine'
import { createVueIdGenerator } from '../../runtime/vue-id'

/** 根部件对外的全部输入：浮层一半归 popover 机器，列表一半归 listbox 机器，三个视觉轴直给 connect。 */
export interface PopselectRootProps {
  collection?: PopselectNode[]
  value?: string | string[]
  defaultValue?: string | string[]
  multiple?: boolean
  disabled?: boolean
  loop?: boolean
  typeahead?: boolean
  dir?: Direction
  open?: boolean
  defaultOpen?: boolean
  placement?: Placement
  offset?: number
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  variant?: ControlVariant
  tone?: Tone
  size?: Size
}

export interface PopselectContext {
  /** 浮层机器，供部件读开合状态。 */
  popover: Service<PopoverSchema>
  /** 列表机器，供部件上报 DOM 侧的事实（如条目卸载带走了焦点）。 */
  listbox: Service<ListboxSchema>
  api: ComputedRef<PopselectApi>
  triggerRef: Ref<HTMLElement | null>
  positionerRef: Ref<HTMLElement | null>
  contentRef: Ref<HTMLElement | null>
}

export interface PopselectNotifiers {
  onValueChange?: ListboxSchema['props']['onValueChange']
  onOpenChange?: PopoverSchema['props']['onOpenChange']
}

export function usePopselect(props: PopselectRootProps, notify: PopselectNotifiers = {}): PopselectContext {
  const triggerRef = ref<HTMLElement | null>(null)
  const positionerRef = ref<HTMLElement | null>(null)
  const contentRef = ref<HTMLElement | null>(null)

  const idGen = createVueIdGenerator()
  // 两台机器共用一个 scope：trigger 与 content 的 id 由它派生，aria-controls 才指得准
  const scope = createScope(null, idGen)

  const popover = useMachine(popoverMachine, () => ({
    open: props.open,
    defaultOpen: props.defaultOpen,
    placement: props.placement,
    offset: props.offset,
    closeOnEscape: props.closeOnEscape,
    closeOnInteractOutside: props.closeOnInteractOutside,
    // 弹出选择不陷焦点：Tab 走得出去，走出去即由消解层判定收起
    modal: false,
    onOpenChange: notify.onOpenChange,
  }), scope)

  // 连打检索缓冲存在 listbox 机器的 refs 里，适配器不必注入
  const listbox = useMachine(listboxMachine, () => ({
    collection: props.collection,
    value: props.value,
    defaultValue: props.defaultValue,
    multiple: props.multiple,
    disabled: props.disabled,
    loop: props.loop,
    typeahead: props.typeahead,
    dir: props.dir,
    onValueChange: notify.onValueChange,
  }), scope)

  if (typeof document !== 'undefined') {
    const config: RuntimeConfig = createRuntimeConfig({ scope, idGenerator: idGen })

    // 只提供注册函数，入栈出栈由 popover 机器的 trackLayer 效应按展开态驱动
    const registerLayer = (): { layer: Layer, dispose: Cleanup } => config.layerRegistry.register({
      kind: 'popover',
      node: () => contentRef.value,
      // trigger 记为本层分支，点它算层内交互
      branches: () => [triggerRef.value].filter(Boolean) as Element[],
      isModal: () => false,
      setModal: () => {},
      // 列表不带遮罩，没有「点它就该关本层」的表面
      surfaces: () => [],
    })

    // 定位引擎由适配器注入，机器只经端口驱动
    popover.refs.set('config', config)
    popover.refs.set('registerLayer', registerLayer)
    popover.refs.set('position', createPositionEngine())
    popover.refs.set('getAnchorEl', () => triggerRef.value)
    popover.refs.set('getFloatingEl', () => positionerRef.value)
    popover.refs.set('getContentEl', () => contentRef.value)
  }

  const api = computed(() => connectPopselect({
    popover,
    listbox,
    props: { variant: props.variant, tone: props.tone, size: props.size },
  }, vueNormalize))

  return { popover, listbox, api, triggerRef, positionerRef, contentRef }
}
