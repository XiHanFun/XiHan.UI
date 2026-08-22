import type {
  ColorPickerApi,
  ColorPickerChannel,
  ColorPickerFormat,
  ColorPickerInputChannel,
  ColorPickerSchema,
  ColorPickerTranslations,
} from '@xihan-ui/headless'
import type { Direction, Placement } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { colorPickerToChannel, colorPickerToInputChannel } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps, onUnmounted, Teleport } from 'vue'
import { withXhConfig } from '../../config/config'
import {
  provideColorPicker,
  provideColorPickerChannel,
  useColorPickerChannelContext,
  useColorPickerContext,
} from './context'
import { useColorPicker } from './use-color-picker'

type ColorPickerProps = ColorPickerSchema['props']

/** 默认插槽的载荷：展开态、当前颜色的各式表示、预设色板、屏幕取色状态，以及改展开与改值两个动作。 */
export type ColorPickerRootSlotProps = Pick<
  ColorPickerApi,
  'open' | 'value' | 'rgba' | 'hsva' | 'swatches' | 'picking' | 'eyeDropperSupported' | 'setOpen' | 'setValue'
>

export const XhColorPickerRoot = defineComponent({
  name: 'XhColorPickerRoot',
  // 缺省值由 connect 与机器给出，这里一律 default: undefined
  props: {
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
    format: { type: String as PropType<ColorPickerFormat>, default: undefined },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    alpha: Boolean,
    swatches: { type: Array as PropType<string[]>, default: undefined },
    name: { type: String, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    translations: { type: Object as PropType<Partial<ColorPickerTranslations>>, default: undefined },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<ColorPickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<ColorPickerProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<ColorPickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<ColorPickerProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ColorPickerRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: ColorPickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: ColorPickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useColorPicker(withXhConfig('color-picker', props) as ColorPickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
    })
    provideColorPicker(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      rgba: ctx.api.value.rgba,
      hsva: ctx.api.value.hsva,
      swatches: ctx.api.value.swatches,
      picking: ctx.api.value.picking,
      eyeDropperSupported: ctx.api.value.eyeDropperSupported,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
    }))
  },
})

export const XhColorPickerLabel = defineComponent({
  name: 'XhColorPickerLabel',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerControl = defineComponent({
  name: 'XhColorPickerControl',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 描边、底色与聚焦环所在的那一层，触发按钮与尾部动作钮在里面并排
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerTrigger = defineComponent({
  name: 'XhColorPickerTrigger',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 原生 button，激活交给平台；同时是浮层的定位锚点
    return () => h('button', {
      ...ctx.api.value.getTriggerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.triggerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhColorPickerValueText = defineComponent({
  name: 'XhColorPickerValueText',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 有插槽用插槽，否则显示当前值串
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.value,
    )
  },
})

export const XhColorPickerSwatch = defineComponent({
  name: 'XhColorPickerSwatch',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('span', ctx.api.value.getSwatchProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerPositioner = defineComponent({
  name: 'XhColorPickerPositioner',
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(_, { slots, attrs }) {
    const ctx = useColorPickerContext()
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(Teleport, { to: ctx.portalTarget.value }, [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, slots.default?.()),
    ])
  },
})

export const XhColorPickerContent = defineComponent({
  name: 'XhColorPickerContent',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhColorPickerArea = defineComponent({
  name: 'XhColorPickerArea',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 区域节点交给机器，矩形在指针事件里现量
    return () => h('div', {
      ...ctx.api.value.getAreaProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.areaRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhColorPickerAreaThumb = defineComponent({
  name: 'XhColorPickerAreaThumb',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('div', ctx.api.value.getAreaThumbProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerChannelSlider = defineComponent({
  name: 'XhColorPickerChannelSlider',
  props: {
    /** 这条滑杆调的是哪一路，缺省或不识别时按色相处理。 */
    channel: { type: String as PropType<ColorPickerChannel>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useColorPickerContext()
    const channel = computed(() => colorPickerToChannel(props.channel))
    provideColorPickerChannel({ channel })
    return () => h(
      'div',
      ctx.api.value.getChannelSliderProps({ channel: channel.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhColorPickerChannelSliderTrack = defineComponent({
  name: 'XhColorPickerChannelSliderTrack',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    const { channel } = useColorPickerChannelContext()
    // 卸载时撤掉登记，避免留下已离开文档的节点
    onUnmounted(() => ctx.setChannelTrack(channel.value, null))
    return () => h('div', {
      ...ctx.api.value.getChannelSliderTrackProps({ channel: channel.value }) as Record<string, unknown>,
      ref: (el: unknown) => ctx.setChannelTrack(channel.value, el as HTMLElement | null),
    }, slots.default?.())
  },
})

export const XhColorPickerChannelSliderThumb = defineComponent({
  name: 'XhColorPickerChannelSliderThumb',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    const { channel } = useColorPickerChannelContext()
    return () => h(
      'div',
      ctx.api.value.getChannelSliderThumbProps({ channel: channel.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhColorPickerChannelInput = defineComponent({
  name: 'XhColorPickerChannelInput',
  props: {
    /** 这个框编辑的是哪一路：hex 是整串，r/g/b 是分量，a 是透明度百分数；缺省或不识别时按 hex 处理。 */
    channel: { type: String as PropType<ColorPickerInputChannel>, default: undefined },
  },
  setup(props) {
    const ctx = useColorPickerContext()
    const channel = computed(() => colorPickerToInputChannel(props.channel))
    // 通道身份由本部件自己声明，不必嵌在通道滑杆内
    return () => h('input', ctx.api.value.getChannelInputProps({ channel: channel.value }) as Record<string, unknown>)
  },
})

export const XhColorPickerEyeDropperTrigger = defineComponent({
  name: 'XhColorPickerEyeDropperTrigger',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('button', ctx.api.value.getEyeDropperTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerSwatchGroup = defineComponent({
  name: 'XhColorPickerSwatchGroup',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('div', ctx.api.value.getSwatchGroupProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerSwatchItem = defineComponent({
  name: 'XhColorPickerSwatchItem',
  props: {
    /** 这一格的颜色。 */
    value: { type: String, default: '' },
  },
  setup(props, { slots }) {
    const ctx = useColorPickerContext()
    return () => h(
      'button',
      ctx.api.value.getSwatchItemProps({ value: props.value }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})

export const XhColorPickerHiddenInput = defineComponent({
  name: 'XhColorPickerHiddenInput',
  setup() {
    const ctx = useColorPickerContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
