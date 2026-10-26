/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 combobox 相关实现。

import type { ControlVariant, Direction, Placement, PropTypes, Size, Tone } from '@xihan-ui/core'
import type { CollectionVirtualizer, ComboboxApi, ComboboxFilter, ComboboxFilterMode, ComboboxGroupProps, ComboboxInputBehavior, ComboboxInputEl, ComboboxInputHost, ComboboxItemProps, ComboboxNode, ComboboxNodeMeta, ComboboxSchema, ComboboxValueChangeDetails, SelectionValueKey } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { BivariantCallback } from '../../runtime/bivariant'
import type { PayloadOf } from '../../runtime/payload'
import { comboboxStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, mergeProps, onMounted, onUnmounted, onUpdated, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { slotIsPlainText } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { useScrollbars } from '../../runtime/use-scrollbars'
import { withHandlers } from '../../runtime/with-handlers'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import {
  provideCombobox,
  provideComboboxItem,
  provideComboboxItemGroup,
  provideComboboxTag,
  useComboboxContext,
  useComboboxItemContext,
  useComboboxItemGroupContext,
  useComboboxTagContext,
} from './context'
import { useCombobox } from './use-combobox'

type ComboboxProps = ComboboxSchema['props']

/** 默认插槽的载荷：展开状态、选中值、输入串、高亮候选、空态、多选的可见标签与折起的个数，以及修改它们的命令。V 是选中值的类型。 */
export type ComboboxRootSlotProps<V = string> = Pick<
  ComboboxApi<PropTypes, V>,
  'open' | 'value' | 'inputValue' | 'highlightedValue' | 'empty' | 'tags' | 'overflowCount' | 'overflowText' | 'isSelected' | 'setOpen' | 'setValue' | 'setInputValue' | 'clear' | 'deselect'
>

// 运行时的根组件按 unknown 收值；对外导出的 XhComboboxRoot 在它上面套一层按值类型收窄的类型，见文件后面
const XhComboboxRootImpl = defineComponent({
  name: 'XhComboboxRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    collection: { type: Array as PropType<ComboboxNode<unknown>[]> },
    /** 对象值怎样取键：字段名或取值函数；同一个选项每次都是新对象时给它，不给按对象身份认。 */
    valueKey: { type: [String, Function] as PropType<string | ((value: never) => string)> },
    virtualizer: { type: Object as PropType<CollectionVirtualizer> },
    /** 标题文字。提供后不必再写 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 无匹配时的提示语。提供后不必再写 empty 部件；需要放置其他内容时改用 empty 插槽。 */
    empty: { type: String },
    // 值可以是字符串、数字或对象：运行时不查类型，类型由对外导出的 XhComboboxRoot 按值类型收窄
    value: { type: null as unknown as PropType<unknown> },
    defaultValue: { type: null as unknown as PropType<unknown> },
    inputValue: { type: String },
    defaultInputValue: { type: String },
    open: { type: Boolean, default: undefined },
    defaultOpen: Boolean,
    /** 表单字段名；提供后 hidden-input 才带 name 并参与提交 */
    name: { type: String },
    form: { type: String },
    multiple: Boolean,
    /** 多选标签最多显示的数量，其余折进 +N；默认 3。 */
    maxTagCount: { type: Number },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    loading: Boolean,
    loop: { type: Boolean, default: undefined },
    placeholder: { type: String },
    /** 自动铺开时是否渲染清空按钮；手写部件模式不使用它，写了节点即可清空 */
    clearable: Boolean,
    translations: { type: Object as PropType<ComboboxProps['translations']> },
    allowCustomValue: Boolean,
    openOnClick: Boolean,
    inputBehavior: { type: String as PropType<ComboboxInputBehavior> },
    filter: { type: [String, Function] as PropType<ComboboxFilterMode | ComboboxFilter<unknown>> },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  // *-change 携带 details 对象，update:* 携带裸值
  emits: {
    'clear': () => true,
    'value-change': (_details: ComboboxValueChangeDetails<unknown>) => true,
    'input-value-change': (_details: PayloadOf<ComboboxProps, 'onInputValueChange'>) => true,
    'open-change': (_details: PayloadOf<ComboboxProps, 'onOpenChange'>) => true,
    'update:value': (_value: unknown[]) => true,
    'update:inputValue': (_inputValue: PayloadOf<ComboboxProps, 'onInputValueChange'>['inputValue']) => true,
    'update:open': (_open: PayloadOf<ComboboxProps, 'onOpenChange'>['open']) => true,
  },
  slots: Object as SlotsType<{
    'default'?: (props: ComboboxRootSlotProps<unknown>) => VNode[]
    'label'?: () => VNode[]
    'empty'?: () => VNode[]
    /** 只填条目的文字槽，副文本与首尾两格照旧各归各的 */
    'item'?: (node: ComboboxNodeMeta<unknown>) => VNode[]
    /** 只接管行首那一格，其余槽照旧由数据铺 */
    'item-prefix'?: (node: ComboboxNodeMeta<unknown>) => VNode[]
    /** 只接管行尾那一格（计数、徽标、次级图标），其余槽照旧由数据铺 */
    'item-suffix'?: (node: ComboboxNodeMeta<unknown>) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const notifyValue: ComboboxProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const notifyInputValue: ComboboxProps['onInputValueChange'] = (details) => {
      emit('input-value-change', details)
      emit('update:inputValue', details.inputValue)
    }
    const notifyOpen: ComboboxProps['onOpenChange'] = (details) => {
      emit('open-change', details)
      emit('update:open', details.open)
    }
    const ctx = useCombobox(withHandlers(withXhConfig('combobox', useFormControlProps(props)), { onClear: () => emit('clear') }) as unknown as ComboboxProps, {
      onValueChange: notifyValue,
      onInputValueChange: notifyInputValue,
      onOpenChange: notifyOpen,
    })
    provideCombobox(ctx)

    // 首帧结算一次候选条数供空态节点判断，之后的增删由条目自己上报
    onMounted(ctx.syncItems)
    onUpdated(ctx.syncItems)

    return () => h(
      'div',
      ctx.api.value.getRootProps(),
      slots.default
        ? slots.default({
            open: ctx.api.value.open,
            value: ctx.api.value.value,
            inputValue: ctx.api.value.inputValue,
            highlightedValue: ctx.api.value.highlightedValue,
            empty: ctx.api.value.empty,
            tags: ctx.api.value.tags,
            overflowCount: ctx.api.value.overflowCount,
            overflowText: ctx.api.value.overflowText,
            isSelected: ctx.api.value.isSelected,
            setOpen: ctx.api.value.setOpen,
            setValue: ctx.api.value.setValue,
            setInputValue: ctx.api.value.setInputValue,
            clear: ctx.api.value.clear,
            deselect: ctx.api.value.deselect,
          })
        : renderDefaultStructure(ctx.api.value, props, {
            'label': slots.label,
            'empty': slots.empty,
            'item': slots.item,
            'item-prefix': slots['item-prefix'],
            'item-suffix': slots['item-suffix'],
          }),
    )
  },
})

/** 根组件里随值类型收窄的那几项 prop：选中值、候选数据、取键方式、自定义过滤与值变化的回调。 */
export interface XhComboboxRootValueProps<V> {
  'value'?: V | V[]
  'defaultValue'?: V | V[]
  'collection'?: ComboboxNode<V>[]
  'valueKey'?: SelectionValueKey<V>
  'filter'?: ComboboxFilterMode | BivariantCallback<[node: ComboboxNode<V>, query: string], boolean>
  'onUpdate:value'?: BivariantCallback<[value: V[]]>
  'onValueChange'?: BivariantCallback<[details: ComboboxValueChangeDetails<V>]>
}

type XhComboboxRootInstance = InstanceType<typeof XhComboboxRootImpl>

/**
 * 按值类型收窄的根组件类型。模板里由 Volar 照 value / collection 推断 V：v-model:value 绑数字或对象的数组都不必断言，
 * 默认插槽、条目插槽与自定义过滤拿到的也是 V。`h()` 推断不了泛型，那里按 unknown 收。
 */
export type XhComboboxRootComponent = Omit<typeof XhComboboxRootImpl, never> & {
  new<V = string>(props?: Omit<XhComboboxRootInstance['$props'], keyof XhComboboxRootValueProps<V>> & XhComboboxRootValueProps<V>): Omit<XhComboboxRootInstance, '$props' | '$slots'> & {
    $props: Omit<XhComboboxRootInstance['$props'], keyof XhComboboxRootValueProps<V>> & XhComboboxRootValueProps<V>
    $slots: Omit<XhComboboxRootInstance['$slots'], 'default' | 'item' | 'item-prefix' | 'item-suffix'> & {
      'default'?: (props: ComboboxRootSlotProps<V>) => VNode[]
      'item'?: (node: ComboboxNodeMeta<V>) => VNode[]
      'item-prefix'?: (node: ComboboxNodeMeta<V>) => VNode[]
      'item-suffix'?: (node: ComboboxNodeMeta<V>) => VNode[]
    }
  }
}

export const XhComboboxRoot = XhComboboxRootImpl as unknown as XhComboboxRootComponent

export const XhComboboxLabel = defineComponent({
  name: 'XhComboboxLabel',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    // 用原生 label，connect 给的 for 指向输入框
    return () => h('label', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

export const XhComboboxControl = defineComponent({
  name: 'XhComboboxControl',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('div', {
      ...ctx.api.value.getControlProps(),
      ref: (el: unknown) => { ctx.controlRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhComboboxTagList = defineComponent({
  name: 'XhComboboxTagList',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    // 标签行：盒里、输入框之前，可见标签与 +N 那一枚在里面并排；单选或无选中时连接层给 hidden
    return () => h('span', ctx.api.value.getTagListProps(), slots.default?.())
  },
})

/** 标签文字所在的块（tag 的 label）：截断规则挂在这一层。 */
export const XhComboboxTagLabel = defineComponent({
  name: 'XhComboboxTagLabel',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('span', ctx.api.value.getTagLabelProps(), slots.default?.())
  },
})

/**
 * 标签内容：只有文字时替它包一层 label：截断规则挂在 label 上，直接展开在 root 上的文字过长会把
 * 删除按钮挤出；作者自己写了节点则原样放行。与 XhTagRoot 同一规则。
 * 库自身填入的文字（+N，没有折叠时是空串）恒包 label，三个适配器渲染出同一棵树。
 */
function tagChildren(content: VNode[] | string | undefined): VNode[] | string | undefined {
  if (typeof content === 'string')
    return [h(XhComboboxTagLabel, null, () => content)]
  return slotIsPlainText(content) ? [h(XhComboboxTagLabel, null, () => content)] : content
}

/** 一个选中值一个标签，即库内 tag 的 root（data-scope="tag"）：语气、尺寸与禁用从组合框传下，形态按盒的面派生；配合 XhComboboxItemDeleteTrigger 可删除。 */
export const XhComboboxTag = defineComponent({
  name: 'XhComboboxTag',
  props: {
    /** 它代表哪个选中值，与根上的值同类型（标签插槽里的 tag.value 原样交回来）。 */
    value: { type: null as unknown as PropType<unknown>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useComboboxContext()
    provideComboboxTag({ value: () => props.value })
    return () => h('span', ctx.api.value.getTagProps({ value: props.value }), tagChildren(slots.default?.()))
  },
})

/** 折叠的标签合成的一个标签：同样是 tag 的 root；有插槽时使用插槽，否则显示 +N。没有折叠的标签时连接层写 hidden。 */
export const XhComboboxOverflowTag = defineComponent({
  name: 'XhComboboxOverflowTag',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h(
      'span',
      ctx.api.value.getOverflowTagProps(),
      tagChildren(slots.default?.() ?? ctx.api.value.overflowText),
    )
  },
})

/** 标签中的删除按钮：即所在标签那份 tag 的 close-trigger（data-scope="tag"），可及名使用 translations.deleteItem；点按移除所在标签的选中值，焦点留在输入框。 */
export const XhComboboxItemDeleteTrigger = defineComponent({
  name: 'XhComboboxItemDeleteTrigger',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const tag = useComboboxTagContext()
    return () => h('button', ctx.api.value.getItemDeleteTriggerProps({ value: tag.value() }), slots.default?.())
  },
})

export const XhComboboxInput = defineComponent({
  name: 'XhComboboxInput',
  props: {
    /**
     * 输入框渲染为哪个标签，默认 input。
     * 写 textarea 即多行宿主：connect 随之撤销 type、role 与 aria-expanded。
     */
    as: { type: String as PropType<ComboboxInputHost>, default: 'input' },
  },
  setup(props) {
    // 字段的说明与校验状态要落在真控件上，不能停在封装根的 div 上
    const fieldWiring = useFieldStateWiring()
    // 字段的标签也得并进名字链：控件自带的那条指的是它自己那个没渲染的 label 部件
    const fieldLabel = useFieldLabelWiring()
    const ctx = useComboboxContext()
    return () => h(props.as, fieldLabel.value({
      ...fieldWiring.value,
      ...ctx.api.value.getInputProps({ as: props.as }),
      ref: (el: unknown) => { ctx.inputRef.value = el as ComboboxInputEl },
    }))
  },
})

export const XhComboboxTrigger = defineComponent({
  name: 'XhComboboxTrigger',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('button', ctx.api.value.getTriggerProps(), slots.default?.())
  },
})

export const XhComboboxClearTrigger = defineComponent({
  name: 'XhComboboxClearTrigger',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('button', ctx.api.value.getClearTriggerProps(), slots.default?.())
  },
})

export const XhComboboxPositioner = defineComponent({
  name: 'XhComboboxPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  // 根是 Teleport，Vue 不会把直通属性合上去，作者写的 class 与 style 得自己接住落到 positioner 上
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useComboboxContext()
    // 候选列表的自绘条：与 content 同级、绝对定位不占布局，壳是这层已经 fixed 的 positioner，条子走浮层 4px 档
    const bars = useScrollbars({ scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    // 搬到 portal 落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.controlRef, present: ctx.visible.value }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(), attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhComboboxContent = defineComponent({
  name: 'XhComboboxContent',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps(),
      // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
      // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

export const XhComboboxGroup = defineComponent({
  name: 'XhComboboxGroup',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useComboboxContext()
    const group = computed<ComboboxGroupProps>(() => ({ value: props.value }))
    provideComboboxItemGroup({ group })
    return () => h('div', ctx.api.value.getGroupProps(group.value), slots.default?.())
  },
})

export const XhComboboxGroupLabel = defineComponent({
  name: 'XhComboboxGroupLabel',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { group } = useComboboxItemGroupContext()
    return () => h('span', ctx.api.value.getGroupLabelProps(group.value), slots.default?.())
  },
})

export const XhComboboxItem = defineComponent({
  name: 'XhComboboxItem',
  props: {
    /** 条目代表的值，与根上的值同类型：字符串、数字或对象。 */
    value: { type: null as unknown as PropType<unknown>, required: true },
    // 缺省交给 connect 回 collection 里查，写死 false 会盖掉数据里的禁用
    disabled: { type: Boolean, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useComboboxContext()
    const item = computed<ComboboxItemProps<unknown>>(() => ({ value: props.value, disabled: props.disabled }))
    provideComboboxItem({ item })
    // 候选的进出与改名由条目自己上报，机器据此结算条数并摘掉悬空高亮
    onMounted(ctx.syncItems)
    onUnmounted(ctx.syncItems)
    // 节点就地复用时数量不变但身份换了，需按 value 另行上报
    watch(() => props.value, ctx.syncItems)
    return () => h('div', ctx.api.value.getItemProps(item.value), slots.default?.())
  },
})

export const XhComboboxItemText = defineComponent({
  name: 'XhComboboxItemText',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemTextProps(item.value), slots.default?.())
  },
})

/** 条目行首的作者内容（图标、色块、头像），对读屏隐藏 */
export const XhComboboxItemPrefix = defineComponent({
  name: 'XhComboboxItemPrefix',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemPrefixProps(item.value), slots.default?.())
  },
})

/** 条目行尾的作者内容（计数、徽标） */
export const XhComboboxItemSuffix = defineComponent({
  name: 'XhComboboxItemSuffix',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemSuffixProps(item.value), slots.default?.())
  },
})

/** 条目的第 2 行副文本，跨文字槽、走 muted 档 */
export const XhComboboxItemDescription = defineComponent({
  name: 'XhComboboxItemDescription',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemDescriptionProps(item.value), slots.default?.())
  },
})

export const XhComboboxItemIndicator = defineComponent({
  name: 'XhComboboxItemIndicator',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    const { item } = useComboboxItemContext()
    return () => h('span', ctx.api.value.getItemIndicatorProps(item.value), slots.default?.())
  },
})

export const XhComboboxHiddenInput = defineComponent({
  name: 'XhComboboxHiddenInput',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const ctx = useComboboxContext()
    // 表单出口，不写这个部件即不参与表单提交
    // 合并而不是展开：作者的 class 与部件的挂载类拼起来，不互相覆盖
    // 表单提交的是键：字符串值即它本身，数字转成字符串，对象按 valueKey
    return () => [
      ...ctx.api.value.valueKeys.map(value => h('input', {
        ...mergeProps(ctx.api.value.getHiddenInputProps({ value }), attrs),
        key: value,
      })),
      // 必填且没选值：补一份空值占位，原生 required 才拦得住空表单
      ...(ctx.api.value.value.length === 0 && ctx.api.value.required
        ? [h('input', { ...mergeProps(ctx.api.value.getHiddenInputProps(), attrs), key: 'required' })]
        : []),
    ]
  },
})

export const XhComboboxEmpty = defineComponent({
  name: 'XhComboboxEmpty',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    // 放在 positioner 里作 content 的兄弟节点，不进 role=listbox
    return () => h('div', ctx.api.value.getEmptyProps(), slots.default?.())
  },
})

export const XhComboboxLoading = defineComponent({
  name: 'XhComboboxLoading',
  setup(_, { slots }) {
    const ctx = useComboboxContext()
    // 在途占位：与空态占位同一个位置，取数期间顶上来；没写内容时显示 translations.loading
    return () => h('div', ctx.api.value.getLoadingProps(), slots.default?.() ?? ctx.api.value.translations.loading)
  },
})

/** 标准结构里各部件对应的组件；标签、标签文字、删除钮与 +N 委派给 tag，按「tag/部件名」找。 */
const COMBOBOX_PARTS = {
  'label': XhComboboxLabel,
  'control': XhComboboxControl,
  'tag-list': XhComboboxTagList,
  'tag/tag': XhComboboxTag,
  'tag/tag-label': XhComboboxTagLabel,
  'tag/item-delete-trigger': XhComboboxItemDeleteTrigger,
  'tag/overflow-tag': XhComboboxOverflowTag,
  'input': XhComboboxInput,
  'clear-trigger': XhComboboxClearTrigger,
  'trigger': XhComboboxTrigger,
  'positioner': XhComboboxPositioner,
  'content': XhComboboxContent,
  'item': XhComboboxItem,
  'item-prefix': XhComboboxItemPrefix,
  'item-text': XhComboboxItemText,
  'item-description': XhComboboxItemDescription,
  'item-suffix': XhComboboxItemSuffix,
  'item-indicator': XhComboboxItemIndicator,
  'empty': XhComboboxEmpty,
  'loading': XhComboboxLoading,
  'hidden-input': XhComboboxHiddenInput,
}

interface ComboboxStructureContent {
  'label'?: () => VNode[]
  'empty'?: () => VNode[]
  'item'?: (node: ComboboxNodeMeta<unknown>) => VNode[]
  'item-prefix'?: (node: ComboboxNodeMeta<unknown>) => VNode[]
  'item-suffix'?: (node: ComboboxNodeMeta<unknown>) => VNode[]
}

/**
 * 未写默认插槽时铺开的整套结构，作者只提供数据：照 headless 的 comboboxStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题、空态、条目文字与行首行尾由对应插槽接管。
 * 候选取 api.collection：给了 filter 即筛过的那份，没给就是调用方传进来的当前候选。
 */
function renderDefaultStructure(
  api: ComboboxApi<PropTypes, unknown>,
  props: { label?: string, empty?: string, clearable: boolean, name?: string },
  content: ComboboxStructureContent,
): VNode[] {
  const nodes = comboboxStructure(api, {
    label: props.label,
    empty: props.empty,
    clearable: props.clearable,
    name: props.name,
    slotted: name => content[name as keyof ComboboxStructureContent] != null,
  })
  return renderStructure(nodes, COMBOBOX_PARTS, (node) => {
    const meta = node.data as ComboboxNodeMeta<unknown>
    switch (node.slot?.name) {
      case 'label':
        return content.label?.()
      case 'empty':
        return content.empty?.()
      case 'item':
        return content.item?.(meta) ?? meta.label
      case 'item-prefix':
        return content['item-prefix']?.(meta)
      case 'item-suffix':
        return content['item-suffix']?.(meta)
      default:
        return undefined
    }
  })
}
