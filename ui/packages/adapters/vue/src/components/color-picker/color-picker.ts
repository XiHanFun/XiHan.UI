/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import type { ControlVariant, Direction, Placement, Size } from '@xihan-ui/core'
import type {
  ColorFormat,
  ColorPickerApi,
  ColorPickerInputChannel,
  ColorPickerSchema,
  ColorPickerSelectionMode,
  ColorPickerTranslations,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { colorPickerToInputChannel } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotIsPlainText } from '../../runtime/slot-content'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { XhColorSliderControl, XhColorSliderThumb, XhColorSliderTrack } from '../color-slider/color-slider'
import { provideColorSlider } from '../color-slider/context'
import { XhColorSwatchPickerItem } from '../color-swatch-picker/color-swatch-picker'
import { provideColorSwatchPicker } from '../color-swatch-picker/context'
import { useFormControlProps } from '../form/use-form-control'
import { provideColorPicker, provideColorPickerTag, useColorPickerContext, useColorPickerTagContext } from './context'
import { useColorPicker } from './use-color-picker'

type ColorPickerProps = ColorPickerSchema['props']

/** 默认插槽的载荷：展开态、当前颜色的各种表示、预设色板、屏幕取色状态，以及修改展开与修改值两个动作。 */
export type ColorPickerRootSlotProps = Pick<
  ColorPickerApi,
  'open' | 'value' | 'color' | 'canAdd' | 'rgba' | 'hsva' | 'swatches' | 'recentColors' | 'picking' | 'eyeDropperSupported' | 'errors' | 'setOpen' | 'setValue' | 'add' | 'clearError' | 'clearRecentColors'
>

export const XhColorPickerRoot = defineComponent({
  name: 'XhColorPickerRoot',
  // 缺省值由 connect 与机器给出；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 选中的颜色，值串数组；单选可写裸串。 */
    value: { type: [String, Array] as PropType<string | string[]> },
    defaultValue: { type: [String, Array] as PropType<string | string[]> },
    /** 选择模式，默认 single；multiple 时工作色是草稿、按「添加」收进值，色块点一下切换，输入行里排成标签。 */
    selectionMode: { type: String as PropType<ColorPickerSelectionMode> },
    /** multiple 下最多选几个颜色。 */
    maxSelected: { type: Number },
    /** 多选时输入行最多摆几枚标签，其余折进 +N 那一枚；默认 3。 */
    maxTagCount: { type: Number },
    format: { type: String as PropType<ColorFormat> },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    alpha: Boolean,
    swatches: { type: Array as PropType<string[]> },
    inline: Boolean,
    // 缺席值 undefined 表示非受控
    recentColors: { type: Array as PropType<string[]> },
    defaultRecentColors: { type: Array as PropType<string[]> },
    maxRecentColors: { type: Number },
    name: { type: String },
    size: { type: String as PropType<Size> },
    variant: { type: String as PropType<ControlVariant> },
    dir: { type: String as PropType<Direction> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    translations: { type: Object as PropType<Partial<ColorPickerTranslations>> },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'value-change': (_details: PayloadOf<ColorPickerProps, 'onValueChange'>) => true,
    'open-change': (_details: PayloadOf<ColorPickerProps, 'onOpenChange'>) => true,
    'color-error': (_details: PayloadOf<ColorPickerProps, 'onColorError'>) => true,
    'update:value': (_value: PayloadOf<ColorPickerProps, 'onValueChange'>['value']) => true,
    'update:open': (_open: PayloadOf<ColorPickerProps, 'onOpenChange'>['open']) => true,
    'recent-colors-change': (_details: PayloadOf<ColorPickerProps, 'onRecentColorsChange'>) => true,
    'update:recentColors': (_recentColors: PayloadOf<ColorPickerProps, 'onRecentColorsChange'>['recentColors']) => true,
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
    const notifyColorError: ColorPickerProps['onColorError'] = details => emit('color-error', details)
    const notifyRecent: ColorPickerProps['onRecentColorsChange'] = (details) => {
      emit('recent-colors-change', details)
      emit('update:recentColors', details.recentColors)
    }
    const ctx = useColorPicker(withXhConfig('color-picker', useFormControlProps(props)) as ColorPickerProps, {
      onValueChange: notifyValue,
      onOpenChange: notifyOpen,
      onColorError: notifyColorError,
      onRecentColorsChange: notifyRecent,
    })
    provideColorPicker(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      open: ctx.api.value.open,
      value: ctx.api.value.value,
      color: ctx.api.value.color,
      canAdd: ctx.api.value.canAdd,
      rgba: ctx.api.value.rgba,
      hsva: ctx.api.value.hsva,
      swatches: ctx.api.value.swatches,
      recentColors: ctx.api.value.recentColors,
      picking: ctx.api.value.picking,
      eyeDropperSupported: ctx.api.value.eyeDropperSupported,
      errors: ctx.api.value.errors,
      setOpen: ctx.api.value.setOpen,
      setValue: ctx.api.value.setValue,
      add: ctx.api.value.add,
      clearError: ctx.api.value.clearError,
      clearRecentColors: ctx.api.value.clearRecentColors,
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
    // 有插槽用插槽，否则显示工作色的值串
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.color,
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
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useColorPickerContext()
    // 面板的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner；条子走浮层 4px 档
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.triggerRef }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps() as Record<string, unknown>, attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
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

export const XhColorPickerSaturationArea = defineComponent({
  name: 'XhColorPickerSaturationArea',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    // 区域节点交给机器，矩形在指针事件里现量
    return () => h('div', {
      ...ctx.api.value.getSaturationAreaProps() as Record<string, unknown>,
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

/**
 * 色相滑块的挂载点，同时充当该滑块的根节点：其中放置的是 XhColorSlider* 普通部件
 * （control / track / thumb / label / value-text），DOM 带 data-scope="color-slider"。
 * 未写默认插槽时铺开最简结构：一条轨道加一个拇指。
 */
export const XhColorPickerHueSlider = defineComponent({
  name: 'XhColorPickerHueSlider',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    provideColorSlider(ctx.hueSlider)
    return () => h('div', ctx.api.value.getHueSliderProps() as Record<string, unknown>, slots.default?.() ?? renderSliderTree())
  },
})

/** 透明度滑块的挂载点，同上；alpha 关闭时整条禁用。 */
export const XhColorPickerAlphaSlider = defineComponent({
  name: 'XhColorPickerAlphaSlider',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    provideColorSlider(ctx.alphaSlider)
    return () => h('div', ctx.api.value.getAlphaSliderProps() as Record<string, unknown>, slots.default?.() ?? renderSliderTree())
  },
})

/** 未写默认插槽时的滑块内部：control 中一条 track 与一个 thumb，与手写部件产出的 DOM 一致。 */
function renderSliderTree(): VNode[] {
  return [h(XhColorSliderControl, null, () => [h(XhColorSliderTrack), h(XhColorSliderThumb)])]
}

export const XhColorPickerChannelInput = defineComponent({
  name: 'XhColorPickerChannelInput',
  props: {
    /** 该输入框编辑的通道：hex 是整串，r/g/b 是分量，a 是透明度百分数；默认或无法识别时按 hex 处理。 */
    channel: { type: String as PropType<ColorPickerInputChannel> },
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

/**
 * 预设色板的挂载点，同时充当色板的根节点（role=radiogroup、方向键与 roving tabindex 都在它上面）：
 * 其中放置的是 XhColorSwatchPickerItem，DOM 带 data-scope="color-swatch-picker"。
 * 未写默认插槽时按 swatches 自动铺开格子。
 */
export const XhColorPickerSwatchPicker = defineComponent({
  name: 'XhColorPickerSwatchPicker',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    provideColorSwatchPicker(ctx.swatchPicker)
    return () => h(
      'div',
      ctx.api.value.getSwatchPickerProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.swatchPicker.swatches.map(node => h(XhColorSwatchPickerItem, { key: node.value, value: node.value })),
    )
  },
})

/**
 * 最近使用色的挂载点，与预设色板同一套：其中放置的是 XhColorSwatchPickerItem。
 * 未写默认插槽时按 recentColors 自动铺开格子；还没有最近使用色时挂载点收起。
 */
export const XhColorPickerRecentSwatchPicker = defineComponent({
  name: 'XhColorPickerRecentSwatchPicker',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    provideColorSwatchPicker(ctx.recentSwatchPicker)
    return () => h(
      'div',
      ctx.api.value.getRecentSwatchPickerProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.recentSwatchPicker.swatches.map(node => h(XhColorSwatchPickerItem, { key: node.value, value: node.value })),
    )
  },
})

/** 标签文字所在的块（tag 的 label）。 */
export const XhColorPickerTagLabel = defineComponent({
  name: 'XhColorPickerTagLabel',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('span', ctx.api.value.getTagLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 标签内容：只有文字时替它包一层 label；作者自己写了节点则原样放行。库自身填入的文字（+N）恒包 label。 */
function tagChildren(content: VNode[] | string | undefined): VNode[] | string | undefined {
  if (typeof content === 'string')
    return [h(XhColorPickerTagLabel, null, () => content)]
  return slotIsPlainText(content) ? [h(XhColorPickerTagLabel, null, () => content)] : content
}

/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger，可及名使用 translations.deleteItem；点按摘掉所在标签的颜色，焦点不动。 */
export const XhColorPickerItemDeleteTrigger = defineComponent({
  name: 'XhColorPickerItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    const tag = useColorPickerTagContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps({ value: tag.value() }) as Record<string, unknown>, slots.default?.())
  },
})

/** 多选时一个选中颜色一个标签，即库内 tag 的 root（data-scope="tag"），标签前由皮肤画一个色点。 */
export const XhColorPickerTag = defineComponent({
  name: 'XhColorPickerTag',
  props: {
    /** 它代表哪个选中颜色。 */
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useColorPickerContext()
    provideColorPickerTag({ value: () => props.value })
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }) as Record<string, unknown>, tagChildren(slots.default?.()))
  },
})

/** 折叠的标签合成的一个标签：有插槽时使用插槽，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export const XhColorPickerOverflowTag = defineComponent({
  name: 'XhColorPickerOverflowTag',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h(
      'span',
      ctx.api.value.getOverflowTagProps() as Record<string, unknown>,
      tagChildren(slots.default?.() ?? ctx.api.value.overflowText),
    )
  },
})

/**
 * 标签行：多选时放在盒里、触发钮之前；单选时连接层给 hidden。
 * 不写插槽即按 tags 铺出带删除钮的标签与 +N 那一枚，写了插槽由作者自己铺。
 */
export const XhColorPickerTagList = defineComponent({
  name: 'XhColorPickerTagList',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('span', ctx.api.value.getTagListProps() as Record<string, unknown>, slots.default
      ? slots.default()
      : [
          ...ctx.api.value.tags.map(tag => h(XhColorPickerTag, { key: tag.value, value: tag.value }, () => [
            h(XhColorPickerTagLabel, null, () => tag.label),
            h(XhColorPickerItemDeleteTrigger),
          ])),
          h(XhColorPickerOverflowTag),
        ])
  },
})

/** 「添加」：多选时把工作色收进值，浮层不收；单选时连接层给 hidden。文字由作者写。 */
export const XhColorPickerConfirmTrigger = defineComponent({
  name: 'XhColorPickerConfirmTrigger',
  setup(_, { slots }) {
    const ctx = useColorPickerContext()
    return () => h('button', ctx.api.value.getConfirmTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhColorPickerHiddenInput = defineComponent({
  name: 'XhColorPickerHiddenInput',
  setup() {
    const ctx = useColorPickerContext()
    // 多选时一个选中值一份同名输入，表单按原生多值收；单选仍是一份
    return () => ctx.api.value.selectionMode === 'multiple'
      ? ctx.api.value.value.map(value => h('input', { key: value, ...ctx.api.value.getHiddenInputProps({ value }) as Record<string, unknown> }))
      : h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
