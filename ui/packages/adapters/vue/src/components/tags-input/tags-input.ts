import type { TagsInputApi, TagsInputBlurBehavior, TagsInputItemProps, TagsInputSchema, TagsInputTranslations } from '@xihan-ui/headless'
import type { ControlVariant, Size, Tone } from '@xihan-ui/kernel'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { provideTagsInput, provideTagsInputItem, useTagsInputContext, useTagsInputItemContext } from './context'
import { useTagsInput } from './use-tags-input'

type TagsInputProps = TagsInputSchema['props']

/** 默认插槽的载荷：标签集合与输入文本、数量与越界标志、光标与编辑锚点，以及增删改与清空的动作。 */
export type TagsInputRootSlotProps = Pick<
  TagsInputApi,
  | 'value'
  | 'count'
  | 'inputValue'
  | 'empty'
  | 'atMax'
  | 'overflow'
  | 'highlightedValue'
  | 'editedValue'
  | 'canClear'
  | 'setValue'
  | 'addValue'
  | 'deleteValue'
  | 'clear'
  | 'setInputValue'
  | 'highlight'
  | 'edit'
>

export const XhTagsInputRoot = defineComponent({
  name: 'XhTagsInputRoot',
  // 有 connect 与机器兜底的 prop 一律 default: undefined
  props: {
    // default: undefined 表示非受控
    value: { type: Array as PropType<string[]>, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    inputValue: { type: String, default: undefined },
    defaultInputValue: { type: String, default: undefined },
    max: { type: Number, default: undefined },
    allowOverflow: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    invalid: Boolean,
    name: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    delimiter: { type: String, default: undefined },
    addOnPaste: Boolean,
    editable: Boolean,
    blurBehavior: { type: String as PropType<TagsInputBlurBehavior | null>, default: undefined },
    variant: { type: String as PropType<ControlVariant>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
    translations: { type: Object as PropType<Partial<TagsInputTranslations>>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸数组；输入文本走 input-value-change 一路
  emits: {
    'value-change': (_details: PayloadOf<TagsInputProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TagsInputProps, 'onValueChange'>['value']) => true,
    'input-value-change': (_details: PayloadOf<TagsInputProps, 'onInputValueChange'>) => true,
    'update:inputValue': (_inputValue: PayloadOf<TagsInputProps, 'onInputValueChange'>['inputValue']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TagsInputRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: TagsInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onInputValueChange: TagsInputProps['onInputValueChange'] = (details) => {
      emit('input-value-change', details)
      emit('update:inputValue', details.inputValue)
    }
    const ctx = useTagsInput(withXhConfig('tags-input', props) as TagsInputProps, { onValueChange, onInputValueChange })
    provideTagsInput(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      count: ctx.api.value.count,
      inputValue: ctx.api.value.inputValue,
      empty: ctx.api.value.empty,
      atMax: ctx.api.value.atMax,
      overflow: ctx.api.value.overflow,
      highlightedValue: ctx.api.value.highlightedValue,
      editedValue: ctx.api.value.editedValue,
      canClear: ctx.api.value.canClear,
      setValue: ctx.api.value.setValue,
      addValue: ctx.api.value.addValue,
      deleteValue: ctx.api.value.deleteValue,
      clear: ctx.api.value.clear,
      setInputValue: ctx.api.value.setInputValue,
      highlight: ctx.api.value.highlight,
      edit: ctx.api.value.edit,
    }))
  },
})

export const XhTagsInputLabel = defineComponent({
  name: 'XhTagsInputLabel',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    // 用原生 label，getLabelProps 的 for 指向输入框
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputControl = defineComponent({
  name: 'XhTagsInputControl',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputInput = defineComponent({
  name: 'XhTagsInputInput',
  setup() {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useTagsInputContext()
    return () => h('input', fieldLabel.value({ ...ctx.api.value.getInputProps() as Record<string, unknown>, ...fieldWiring.value }))
  },
})

export const XhTagsInputItem = defineComponent({
  name: 'XhTagsInputItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useTagsInputContext()
    const item = computed<TagsInputItemProps>(() => ({ value: props.value }))
    provideTagsInputItem({ item })
    // 本标签持有焦点时，value 变更或卸载都上报焦点离场以终止编辑会话
    const itemEl = ref<HTMLElement | null>(null)
    const holdsFocus = (): boolean => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return false
      const active = service.scope.getActiveElement()
      return !!itemEl.value && !!active && (itemEl.value === active || itemEl.value.contains(active))
    }
    watch(() => props.value, (next, prev) => {
      if (next !== prev && holdsFocus())
        ctx.service.send({ type: 'ITEM.FOCUS_LOST' })
    })
    onBeforeUnmount(() => {
      if (holdsFocus())
        ctx.service.send({ type: 'ITEM.FOCUS_LOST' })
    })
    return () => h(
      'div',
      { ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>, ref: itemEl },
      slots.default?.(),
    )
  },
})

export const XhTagsInputItemPreview = defineComponent({
  name: 'XhTagsInputItemPreview',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    const { item } = useTagsInputItemContext()
    return () => h('span', ctx.api.value.getItemPreviewProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputItemText = defineComponent({
  name: 'XhTagsInputItemText',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    const { item } = useTagsInputItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputItemDeleteTrigger = defineComponent({
  name: 'XhTagsInputItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    const { item } = useTagsInputItemContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputItemInput = defineComponent({
  name: 'XhTagsInputItemInput',
  setup() {
    const ctx = useTagsInputContext()
    const { item } = useTagsInputItemContext()
    return () => h('input', ctx.api.value.getItemInputProps(item.value) as Record<string, unknown>)
  },
})

export const XhTagsInputClearTrigger = defineComponent({
  name: 'XhTagsInputClearTrigger',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    return () => h('button', ctx.api.value.getClearTriggerProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputHiddenInput = defineComponent({
  name: 'XhTagsInputHiddenInput',
  setup() {
    const ctx = useTagsInputContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})
