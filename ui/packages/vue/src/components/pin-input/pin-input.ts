import type { PinInputSchema, PinInputTranslations, PinInputType } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { providePinInput, usePinInputContext } from './context'
import { usePinInput } from './use-pin-input'

type PinInputProps = PinInputSchema['props']

export const XhPinInputRoot = defineComponent({
  name: 'XhPinInputRoot',
  props: {
    // default: undefined 表示非受控
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    // 缺省值由 connect 给出，这里一律 default: undefined
    length: { type: Number, default: undefined },
    type: { type: String as PropType<PinInputType>, default: undefined },
    mask: Boolean,
    otp: Boolean,
    placeholder: { type: String, default: undefined },
    disabled: Boolean,
    invalid: Boolean,
    blurOnComplete: Boolean,
    name: { type: String, default: undefined },
    translations: { type: Object as PropType<Partial<PinInputTranslations>>, default: undefined },
  },
  // value-change 携带 { value, valueAsString }，update:value 携带裸数组
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
    // 必须是原生 label，getLabelProps 的 for 恒写向首格
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhPinInputInput = defineComponent({
  name: 'XhPinInputInput',
  props: {
    // 下标由作者声明，兼收字符串以支持模板里写 index="0"
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
