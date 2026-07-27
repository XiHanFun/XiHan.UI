import type { PinInputSchema, PinInputType } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { providePinInput, usePinInputContext } from './context'
import { usePinInput } from './use-pin-input'

type PinInputProps = PinInputSchema['props']

export const XhPinInputRoot = defineComponent({
  name: 'XhPinInputRoot',
  props: {
    // 值是数组：给 default: undefined 才表达得了"非受控"，
    // 落成空数组会被当作"受控且当前全空"，用户从此再也改不动
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    // 缺省值的唯一事实源在 connect：这里一律 undefined，别在两侧各写一份默认
    length: { type: Number, default: undefined },
    type: { type: String as PropType<PinInputType>, default: undefined },
    mask: Boolean,
    otp: Boolean,
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    invalid: Boolean,
    blurOnComplete: Boolean,
    name: { type: String, default: undefined },
  },
  // value-change 携带 { value, valueAsString }；update:value 携带裸数组，支持 v-model:value
  emits: ['value-change', 'value-complete', 'update:value'],
  setup(props, { slots, emit }) {
    const onValueChange: PinInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onValueComplete: PinInputProps['onValueComplete'] = details => emit('value-complete', details)
    const ctx = usePinInput(props as PinInputProps, { onValueChange, onValueComplete })
    providePinInput(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      valueAsString: ctx.api.value.valueAsString,
      complete: ctx.api.value.complete,
      length: ctx.api.value.length,
      focusedIndex: ctx.api.value.focusedIndex,
      setValue: ctx.api.value.setValue,
      clear: ctx.api.value.clear,
    }))
  },
})

export const XhPinInputLabel = defineComponent({
  name: 'XhPinInputLabel',
  setup(_, { slots }) {
    const ctx = usePinInputContext()
    // 必须是原生 label：getLabelProps 的 for 恒写向首格，别的标签点不动
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPinInputInput = defineComponent({
  name: 'XhPinInputInput',
  props: {
    // 下标由作者声明。也收字符串：模板里写 index="0"（不带冒号）拿到的就是字符串，
    // Vue 只对 Boolean 型 prop 做属性转型，数字得自己收口
    index: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props) {
    const ctx = usePinInputContext()
    return () => h('input', ctx.api.value.getInputProps({ index: Math.trunc(Number(props.index)) }) as Record<string, unknown>)
  },
})

export const XhPinInputHiddenInput = defineComponent({
  name: 'XhPinInputHiddenInput',
  setup() {
    const ctx = usePinInputContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
