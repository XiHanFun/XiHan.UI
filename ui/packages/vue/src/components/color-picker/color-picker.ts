import type { Direction, Placement } from '@xihan-ui/core'
import type {
  ColorPickerChannel,
  ColorPickerFormat,
  ColorPickerInputChannel,
  ColorPickerSchema,
  ColorPickerTranslations,
} from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { colorPickerToChannel, colorPickerToInputChannel } from '@xihan-ui/headless'
import { computed, defineComponent, h, onUnmounted } from 'vue'
import {
  provideColorPicker,
  provideColorPickerChannel,
  useColorPickerChannelContext,
  useColorPickerContext,
} from './context'
import { useColorPicker } from './use-color-picker'

type ColorPickerProps = ColorPickerSchema['props']

export const XhColorPickerRoot = defineComponent({
  name: 'XhColorPickerRoot',
  // 缺省值的唯一事实源在 connect / 机器 —— 凡是那边有兜底的一律 default: undefined
  // （value 尤其：落成空串会被当作"受控且当前为空"，用户从此再也改不动）
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
    dir: { type: String as PropType<Direction>, default: undefined },
    placement: { type: String as PropType<Placement>, default: undefined },
    offset: { type: Number, default: undefined },
    translations: { type: Object as PropType<Partial<ColorPickerTranslations>>, default: undefined },
  },
  // *-change 携带 details 对象；update:* 携带裸值，支持 v-model:value / v-model:open
  emits: ['value-change', 'open-change', 'update:value', 'update:open'],
  setup(props, { slots, emit }) {
    const notifyValue: ColorPickerProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyOpen: ColorPickerProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useColorPicker(props as ColorPickerProps, {
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

export const XhColorPickerTrigger = defineComponent({
  name: 'XhColorPickerTrigger',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 必须是原生 button：Enter/Space 的激活由平台负责，浮层也以它为定位锚点
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
    // 作者写了插槽就听作者的，否则显示当前值串
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
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('div', {
      ...ctx.api.value.getPositionerProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhColorPickerContent = defineComponent({
  name: 'XhColorPickerContent',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhColorPickerArea = defineComponent({
  name: 'XhColorPickerArea',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 区域节点交给机器：矩形只在指针事件那一刻现量，连接期一律不碰 DOM
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
    /** 这条滑杆调的是哪一路，与 WC 侧的 channel 属性是同一份声明；漏写或写错都退回色相。 */
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
    // 卸载时把登记撤掉：留着一个已经离开文档的节点，量出来的矩形恒是 0
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
    /** 这个框编辑的是哪一路：hex 是整串，r/g/b 是分量，a 是透明度百分数；漏写或写错都退回 hex。 */
    channel: { type: String as PropType<ColorPickerInputChannel>, default: undefined },
  },
  setup(props) {
    const ctx = useColorPickerContext()
    const channel = computed(() => colorPickerToInputChannel(props.channel))
    // 数值框不必住在通道滑杆里（多半与滑杆各占一行），身份由它自己声明
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
    /** 这一格的颜色，与 WC 侧的 value 属性是同一份声明。 */
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
