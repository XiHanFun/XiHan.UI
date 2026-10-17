/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tags input 相关实现。

import type { ControlVariant, Size, Tone } from '@xihan-ui/core'
import type { TagsInputApi, TagsInputBlurBehavior, TagsInputItemProps, TagsInputSchema, TagsInputTranslations } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { tagsInputStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onBeforeUnmount, onUnmounted, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideTagsInput, provideTagsInputItem, useTagsInputContext, useTagsInputItemContext } from './context'
import { useTagsInput } from './use-tags-input'

type TagsInputProps = TagsInputSchema['props']

/** 计数部件默认插槽的载荷：当前个数、上限与已达上限、越界两个标志。 */
export type TagsInputCountSlotProps = Pick<TagsInputApi, 'count' | 'max' | 'atMax' | 'overflow'>

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
  // 有 connect 与机器兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: Array as PropType<string[]> },
    defaultValue: { type: Array as PropType<string[]> },
    inputValue: { type: String },
    defaultInputValue: { type: String },
    max: { type: Number },
    allowOverflow: Boolean,
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    showCount: Boolean,
    name: { type: String },
    placeholder: { type: String },
    delimiter: { type: [String, Array] as PropType<string | string[]> },
    validate: { type: Function as PropType<TagsInputProps['validate']> },
    addOnPaste: Boolean,
    editable: Boolean,
    blurBehavior: { type: String as PropType<TagsInputBlurBehavior | null> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<Partial<TagsInputTranslations>> },
  },
  // value-change 携带 { value }，update:value 携带裸数组；输入文本走 input-value-change 一路
  emits: {
    'clear': () => true,
    'value-change': (_details: PayloadOf<TagsInputProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<TagsInputProps, 'onValueChange'>['value']) => true,
    'input-value-change': (_details: PayloadOf<TagsInputProps, 'onInputValueChange'>) => true,
    'update:inputValue': (_inputValue: PayloadOf<TagsInputProps, 'onInputValueChange'>['inputValue']) => true,
    'tag-reject': (_details: PayloadOf<TagsInputProps, 'onTagReject'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: TagsInputRootSlotProps) => VNode[]
    label?: () => VNode[]
    /** 只填标签文本，常态部分的删除钮与就地编辑照旧由结构铺 */
    item?: (props: { value: string }) => VNode[]
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
    const onTagReject: TagsInputProps['onTagReject'] = details => emit('tag-reject', details)
    const ctx = useTagsInput(withHandlers(withXhConfig('tags-input', useFormControlProps(props)), { onClear: () => emit('clear') }) as TagsInputProps, { onValueChange, onInputValueChange, onTagReject })
    provideTagsInput(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            count: api.count,
            inputValue: api.inputValue,
            empty: api.empty,
            atMax: api.atMax,
            overflow: api.overflow,
            highlightedValue: api.highlightedValue,
            editedValue: api.editedValue,
            canClear: api.canClear,
            setValue: api.setValue,
            addValue: api.addValue,
            deleteValue: api.deleteValue,
            clear: api.clear,
            setInputValue: api.setInputValue,
            highlight: api.highlight,
            edit: api.edit,
          })
        : renderDefaultStructure(api, { label: props.label, editable: props.editable }, { label: slots.label, item: slots.item }))
    }
  },
})

export const XhTagsInputLabel = defineComponent({
  name: 'XhTagsInputLabel',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 用原生 label，getLabelProps 的 for 指向输入框
    return () => h('label', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhTagsInputControl = defineComponent({
  name: 'XhTagsInputControl',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    return () => h('div', { ...(ctx.api.value.getControlProps() as Record<string, unknown>), ref: ctx.controlRef }, slots.default?.())
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
    return () => h('input', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getInputProps() as Record<string, unknown> }))
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

/** 标签的预览：渲染为库内 tag 的 root（data-scope="tag"），就地编辑时由 tag 收起。 */
export const XhTagsInputItemPreview = defineComponent({
  name: 'XhTagsInputItemPreview',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    const { item } = useTagsInputItemContext()
    return () => h('span', ctx.api.value.getItemPreviewProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 标签文字：渲染为 tag 的 label，截断落在这一层。 */
export const XhTagsInputItemText = defineComponent({
  name: 'XhTagsInputItemText',
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    const { item } = useTagsInputItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value) as Record<string, unknown>, slots.default?.())
  },
})

/** 删除按钮：渲染为所在标签那份 tag 的 close-trigger，不占 Tab 位；禁用与只读时保留位置、原生 disabled。 */
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

/** 计数：未写内容时渲染「已用 / 上限」，未设上限时只渲染已用。 */
export const XhTagsInputCount = defineComponent({
  name: 'XhTagsInputCount',
  slots: Object as SlotsType<{
    default?: (props: TagsInputCountSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useTagsInputContext()
    return () => {
      const api = ctx.api.value
      const fallback = api.max === undefined ? `${api.count}` : `${api.count} / ${api.max}`
      return h(
        'span',
        api.getCountProps() as Record<string, unknown>,
        slots.default?.({ count: api.count, max: api.max, atMax: api.atMax, overflow: api.overflow }) ?? fallback,
      )
    }
  },
})

export const XhTagsInputHiddenInput = defineComponent({
  name: 'XhTagsInputHiddenInput',
  setup() {
    const ctx = useTagsInputContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/** 标准结构里各部件对应的组件；标签的常态部分、文本与删除钮委派给 tag，按「tag/部件名」找。 */
const TAGS_INPUT_PARTS = {
  'label': XhTagsInputLabel,
  'control': XhTagsInputControl,
  'item': XhTagsInputItem,
  'tag/item-preview': XhTagsInputItemPreview,
  'tag/item-text': XhTagsInputItemText,
  'tag/item-delete-trigger': XhTagsInputItemDeleteTrigger,
  'item-input': XhTagsInputItemInput,
  'input': XhTagsInputInput,
  'clear-trigger': XhTagsInputClearTrigger,
  'count': XhTagsInputCount,
  'hidden-input': XhTagsInputHiddenInput,
}

interface TagsInputStructureContent {
  label?: () => VNode[]
  item?: (props: { value: string }) => VNode[]
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 tagsInputStructure 渲，标签按当前值铺，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题与标签文本由对应插槽接管。
 */
function renderDefaultStructure(api: TagsInputApi, options: { label?: string, editable: boolean }, content: TagsInputStructureContent): VNode[] {
  const nodes = tagsInputStructure(api, {
    label: options.label,
    editable: options.editable,
    slotted: name => content[name as keyof TagsInputStructureContent] != null,
  })
  return renderStructure(nodes, TAGS_INPUT_PARTS, (node) => {
    if (node.slot?.name === 'label')
      return content.label?.()
    if (node.slot?.name === 'item')
      return content.item?.({ value: node.data as string }) ?? (node.data as string)
    return undefined
  })
}
