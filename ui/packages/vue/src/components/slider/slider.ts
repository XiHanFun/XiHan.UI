import type { Direction, Orientation } from '@xihan-ui/core'
import type { SliderSchema, SliderValueTextDetails } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h } from 'vue'
import { provideSlider, provideSliderThumb, useSliderContext, useSliderThumbContext } from './context'
import { useSlider } from './use-slider'

type SliderProps = SliderSchema['props']

export const XhSliderRoot = defineComponent({
  name: 'XhSliderRoot',
  props: {
    // 值恒是数组，单滑块即长度 1；default: undefined 表示非受控
    value: { type: Array as PropType<number[]>, default: undefined },
    defaultValue: { type: Array as PropType<number[]>, default: undefined },
    min: { type: Number, default: undefined },
    max: { type: Number, default: undefined },
    step: { type: Number, default: undefined },
    largeStep: { type: Number, default: undefined },
    minStepsBetweenThumbs: { type: Number, default: undefined },
    orientation: { type: String as PropType<Orientation>, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    getValueText: {
      type: Function as PropType<(details: SliderValueTextDetails) => string>,
      default: undefined,
    },
  },
  // value-change 携带 { value }，update:value 携带裸数组；value-change-end 只在操作收尾时发一次
  emits: ['value-change', 'update:value', 'value-change-end'],
  setup(props, { slots, emit }) {
    const notify: SliderProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyEnd: SliderProps['onValueChangeEnd'] = (details) => {
      emit('value-change-end', details)
    }
    const ctx = useSlider(props as SliderProps, notify, notifyEnd)
    provideSlider(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      thumbs: ctx.api.value.thumbs,
      range: ctx.api.value.range,
      dragging: ctx.api.value.dragging,
      setValue: ctx.api.value.setValue,
      setThumbValue: ctx.api.value.setThumbValue,
    }))
  },
})

export const XhSliderLabel = defineComponent({
  name: 'XhSliderLabel',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderControl = defineComponent({
  name: 'XhSliderControl',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderTrack = defineComponent({
  name: 'XhSliderTrack',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    // 轨道节点交给机器，矩形在指针事件里现量
    return () => h('div', {
      ...ctx.api.value.getTrackProps() as Record<string, unknown>,
      ref: ctx.trackRef,
    }, slots.default?.())
  },
})

export const XhSliderRange = defineComponent({
  name: 'XhSliderRange',
  setup(_, { slots }) {
    const ctx = useSliderContext()
    return () => h('div', ctx.api.value.getRangeProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderThumb = defineComponent({
  name: 'XhSliderThumb',
  props: {
    /** 第几个滑块，多滑块时必须逐个写明（`:index="i"`）；兼收字符串。 */
    index: { type: [Number, String] as PropType<number | string>, default: 0 },
  },
  setup(props, { slots }) {
    const ctx = useSliderContext()
    const index = computed(() => {
      const n = Number(props.index)
      return Number.isFinite(n) ? n : 0
    })
    provideSliderThumb({ index })
    return () => h('div', ctx.api.value.getThumbProps(index.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhSliderHiddenInput = defineComponent({
  name: 'XhSliderHiddenInput',
  setup() {
    const { index } = useSliderThumbContext()
    const ctx = useSliderContext()
    return () => h('input', ctx.api.value.getHiddenInputProps(index.value) as Record<string, unknown>)
  },
})
