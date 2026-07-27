import type { TagsInputBlurBehavior, TagsInputItemProps, TagsInputSchema, TagsInputTranslations } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideTagsInput, provideTagsInputItem, useTagsInputContext, useTagsInputItemContext } from './context'
import { useTagsInput } from './use-tags-input'

type TagsInputProps = TagsInputSchema['props']

export const XhTagsInputRoot = defineComponent({
  name: 'XhTagsInputRoot',
  // 缺省值的唯一事实源在 connect 与机器里 —— 凡是那边有兜底的一律 default: undefined。
  // delimiter 尤其：裸 String 声明会把"作者显式写的空串"和"没写"混成一谈，断词就再也关不掉
  props: {
    // 值是数组：给 default: undefined 才表达得了"非受控"，
    // 落成空数组会被当作"受控且当前一个标签也没有"，用户从此再也加不进去
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
    translations: { type: Object as PropType<Partial<TagsInputTranslations>>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸数组，支持 v-model:value。
  // 输入文本自成一路，两者各自受控
  emits: ['value-change', 'update:value', 'input-value-change', 'update:inputValue'],
  setup(props, { slots, emit }) {
    const onValueChange: TagsInputProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onInputValueChange: TagsInputProps['onInputValueChange'] = (details) => {
      emit('input-value-change', details)
      emit('update:inputValue', details.inputValue)
    }
    const ctx = useTagsInput(props as TagsInputProps, { onValueChange, onInputValueChange })
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
    // 必须是原生 label：getLabelProps 的 for 指向输入框，别的标签点不动
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
    const ctx = useTagsInputContext()
    return () => h('input', ctx.api.value.getInputProps() as Record<string, unknown>)
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
    // 承载焦点的标签被移出 DOM 时浏览器不派 focusout（Chrome 如此），机器读不到这件事：
    // 就地编辑的框会连同标签一起消失，机器却还停在 editing，光标锚点指着一个已经不存在的标签，
    // 从此既进不了编辑框、也回不到输入框。这里替 DOM 把焦点离场如实上报。
    // 判据是「本节点当下正持有焦点」，不是「值对得上」：v-for 就地复用时被卸载的是末位实例，
    // 它的 value 可能恰好等于正在编辑的那个，按值判会把好端端的编辑会话掐掉。
    const itemEl = ref<HTMLElement | null>(null)
    const holdsFocus = (): boolean => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return false
      const active = service.scope.getActiveElement()
      return !!itemEl.value && !!active && (itemEl.value === active || itemEl.value.contains(active))
    }
    // v-for 不带 key 时 Vue 会就地复用节点：DOM 节点没动、value 却被换成了别的标签。
    // 此刻停在这个节点里的编辑会话说的已经不是同一件事，同样按离场处理
    watch(() => props.value, (next, prev) => {
      if (next !== prev && holdsFocus())
        ctx.service.send({ type: 'ITEM.FOCUS_LOST' })
    })
    onBeforeUnmount(() => {
      // 整个组件一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
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
