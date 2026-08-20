import type {
  FloatingPanelApi,
  FloatingPanelPosition,
  FloatingPanelResizeEdge,
  FloatingPanelSchema,
  FloatingPanelSize,
  FloatingPanelStage,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h, mergeProps, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideFloatingPanel, useFloatingPanelContext } from './context'
import { useFloatingPanel } from './use-floating-panel'

type FloatingPanelProps = FloatingPanelSchema['props']

/** 默认插槽的载荷：开合、形态与矩形，以及改这四样的动作。 */
export type FloatingPanelRootSlotProps = Pick<
  FloatingPanelApi,
  'open' | 'stage' | 'position' | 'size' | 'dragging' | 'resizing' | 'canDrag' | 'canResize'
  | 'setOpen' | 'setPosition' | 'setSize' | 'setStage'
>

export const XhFloatingPanelRoot = defineComponent({
  name: 'XhFloatingPanelRoot',
  // 全部 default: undefined，缺省值由 connect 与机器决定
  props: {
    open: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    position: { type: Object as PropType<FloatingPanelPosition>, default: undefined },
    defaultPosition: { type: Object as PropType<FloatingPanelPosition>, default: undefined },
    size: { type: Object as PropType<FloatingPanelSize>, default: undefined },
    defaultSize: { type: Object as PropType<FloatingPanelSize>, default: undefined },
    minSize: { type: Object as PropType<FloatingPanelSize>, default: undefined },
    maxSize: { type: Object as PropType<FloatingPanelSize>, default: undefined },
    stage: { type: String as PropType<FloatingPanelStage>, default: undefined },
    defaultStage: { type: String as PropType<FloatingPanelStage>, default: undefined },
    // 缺省为真的两个开关：写成裸 Boolean 会被 Vue 的布尔 casting 永久关死
    draggable: { type: Boolean, default: undefined },
    resizable: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    translations: { type: Object as PropType<FloatingPanelProps['translations']>, default: undefined },
  },
  // 语义事件收整个 details，update: 收裸值
  emits: {
    'open-change': (_details: PayloadOf<FloatingPanelProps, 'onOpenChange'>) => true,
    'update:open': (_open: PayloadOf<FloatingPanelProps, 'onOpenChange'>['open']) => true,
    'position-change': (_details: PayloadOf<FloatingPanelProps, 'onPositionChange'>) => true,
    'update:position': (_position: PayloadOf<FloatingPanelProps, 'onPositionChange'>['position']) => true,
    'size-change': (_details: PayloadOf<FloatingPanelProps, 'onSizeChange'>) => true,
    'update:size': (_size: PayloadOf<FloatingPanelProps, 'onSizeChange'>['size']) => true,
    'stage-change': (_details: PayloadOf<FloatingPanelProps, 'onStageChange'>) => true,
    'update:stage': (_stage: PayloadOf<FloatingPanelProps, 'onStageChange'>['stage']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: FloatingPanelRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useFloatingPanel(withXhConfig('floating-panel', props) as FloatingPanelProps, {
      onOpenChange: (details) => {
        emit('open-change', details)
        emit('update:open', details.open)
      },
      onPositionChange: (details) => {
        emit('position-change', details)
        emit('update:position', details.position)
      },
      onSizeChange: (details) => {
        emit('size-change', details)
        emit('update:size', details.size)
      },
      onStageChange: (details) => {
        emit('stage-change', details)
        emit('update:stage', details.stage)
      },
    })
    provideFloatingPanel(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      stage: ctx.api.value.stage,
      position: ctx.api.value.position,
      size: ctx.api.value.size,
      dragging: ctx.api.value.dragging,
      resizing: ctx.api.value.resizing,
      canDrag: ctx.api.value.canDrag,
      canResize: ctx.api.value.canResize,
      setOpen: ctx.api.value.setOpen,
      setPosition: ctx.api.value.setPosition,
      setSize: ctx.api.value.setSize,
      setStage: ctx.api.value.setStage,
    }))
  },
})

export const XhFloatingPanelTrigger = defineComponent({
  name: 'XhFloatingPanelTrigger',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    // 用原生 button，激活交给平台
    return () => h('button', ctx.api.value.getTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFloatingPanelPositioner = defineComponent({
  name: 'XhFloatingPanelPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useFloatingPanelContext()
    // 定位层搬到 portal 落点，逃开祖先的层叠上下文
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h(
        'div',
        mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        slots.default?.(),
      ),
    ])
  },
})

export const XhFloatingPanelContent = defineComponent({
  name: 'XhFloatingPanelContent',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    // 节点交给机器：跟手期间的指针监听要挂在它所在的那个文档上
    return () => h(
      'div',
      { ...ctx.api.value.getContentProps() as Record<string, unknown>, ref: ctx.contentRef },
      slots.default?.(),
    )
  },
})

export const XhFloatingPanelHeader = defineComponent({
  name: 'XhFloatingPanelHeader',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    return () => h('div', ctx.api.value.getHeaderProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFloatingPanelTitle = defineComponent({
  name: 'XhFloatingPanelTitle',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    return () => h('h2', ctx.api.value.getTitleProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFloatingPanelDragTrigger = defineComponent({
  name: 'XhFloatingPanelDragTrigger',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    return () => h('button', ctx.api.value.getDragTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFloatingPanelResizeTrigger = defineComponent({
  name: 'XhFloatingPanelResizeTrigger',
  props: {
    /** 这个把手守哪条边：n / e / s / w 四条边与 ne / nw / se / sw 四个角。 */
    edge: { type: String as PropType<FloatingPanelResizeEdge>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFloatingPanelContext()
    // 把手是 role=separator 的元素而不是按钮：方向键推边，按钮的激活键在这里没有语义
    return () => h(
      'div',
      ctx.api.value.getResizeTriggerProps({ edge: props.edge }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhFloatingPanelStageTrigger = defineComponent({
  name: 'XhFloatingPanelStageTrigger',
  props: {
    /** 按下它切到哪个形态；已经在该形态时再按一次回到常规。 */
    stage: { type: String as PropType<FloatingPanelStage>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useFloatingPanelContext()
    return () => h(
      'button',
      ctx.api.value.getStageTriggerProps({ stage: props.stage }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhFloatingPanelCloseTrigger = defineComponent({
  name: 'XhFloatingPanelCloseTrigger',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    return () => h('button', ctx.api.value.getCloseTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhFloatingPanelBody = defineComponent({
  name: 'XhFloatingPanelBody',
  setup(_, { slots }) {
    const ctx = useFloatingPanelContext()
    return () => h('div', ctx.api.value.getBodyProps() as Record<string, unknown>, slots.default?.())
  },
})
