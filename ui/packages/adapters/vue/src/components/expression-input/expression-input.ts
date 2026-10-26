/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 expression input 相关实现。

import type { ControlVariant, Direction, ExpressionCheck, ExpressionCompletionSource, Placement, Size, Tone } from '@xihan-ui/core'
import type { FunctionTable } from '@xihan-ui/expression'
import type { ExpressionInputApi, ExpressionInputAutoSize, ExpressionInputEl, ExpressionInputHost, ExpressionInputItem, ExpressionInputSchema, ExpressionInputTranslations } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey, PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { expressionInputStructure, withFieldDescription } from '@xihan-ui/headless'
import { computed, defineComponent, h, inject, mergeProps, onUnmounted, provide, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { XhPortal } from '../../runtime/portal'
import { renderStructure } from '../../runtime/structure'
import { useOverlayScrollbars } from '../../runtime/use-overlay-scrollbars'
import { useFieldLabelWiring, useFieldStateWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideExpressionInput, useExpressionInputContext } from './context'
import { useExpressionInput } from './use-expression-input'

type ExpressionInputProps = ExpressionInputSchema['props']

/** 默认插槽的载荷：值、开合、补全条目、问题与镜像层分段，空态与种类文案，以及改写值、插入文本与收起的句柄。 */
export type ExpressionInputRootSlotProps = Pick<
  ExpressionInputApi,
  | 'value'
  | 'open'
  | 'items'
  | 'issues'
  | 'segments'
  | 'emptyText'
  | 'kindText'
  | 'highlightedKey'
  | 'setValue'
  | 'insert'
  | 'close'
>

const ITEM_KEY: InjectionKey<ComputedRef<ExpressionInputItem | undefined>> = Symbol.for('xh-expression-input-item')

export const XhExpressionInputRoot = defineComponent({
  name: 'XhExpressionInputRoot',
  props: {
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    value: { type: String },
    defaultValue: { type: String },
    check: { type: Function as PropType<ExpressionCheck> },
    completions: { type: [Array, Function] as PropType<ExpressionCompletionSource> },
    functions: { type: Object as PropType<FunctionTable> },
    /** 标题文字；给了即在缺省结构里铺 label 部件。 */
    label: { type: String },
    multiline: Boolean,
    placeholder: { type: String },
    name: { type: String },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    autoSize: { type: [Boolean, Object] as PropType<boolean | ExpressionInputAutoSize>, default: undefined },
    checkDelay: { type: Number },
    loop: { type: Boolean, default: undefined },
    placement: { type: String as PropType<Placement> },
    offset: { type: Number },
    /** 文字方向；浮层迁移到落点后无法继承作者子树上的方向，需要 RTL 时显式提供。 */
    dir: { type: String as PropType<Direction> },
    translations: { type: Object as PropType<Partial<ExpressionInputTranslations>> },
    variant: { type: String as PropType<ControlVariant> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
  },
  emits: {
    'value-change': (_details: PayloadOf<ExpressionInputProps, 'onValueChange'>) => true,
    'issues-change': (_details: PayloadOf<ExpressionInputProps, 'onIssuesChange'>) => true,
    'completion-select': (_details: PayloadOf<ExpressionInputProps, 'onCompletionSelect'>) => true,
    'open-change': (_details: PayloadOf<ExpressionInputProps, 'onOpenChange'>) => true,
    'update:value': (_value: PayloadOf<ExpressionInputProps, 'onValueChange'>['value']) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: ExpressionInputRootSlotProps) => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useExpressionInput(withXhConfig('expression-input', useFormControlProps(props)) as ExpressionInputProps, {
      onValueChange: (details) => {
        emit('value-change', details)
        emit('update:value', details.value)
      },
      onIssuesChange: details => emit('issues-change', details),
      onCompletionSelect: details => emit('completion-select', details),
      onOpenChange: details => emit('open-change', details),
    })
    provideExpressionInput(ctx)
    // 写了 multiline 就是多行；作者自己摆 XhExpressionInputInput 时以它的 as 为准
    watch(() => props.multiline, (multiline) => {
      ctx.multiline.value = multiline
    }, { immediate: true })

    return () => {
      const api = ctx.api.value
      return h(
        'div',
        api.getRootProps(),
        slots.default
          ? slots.default({
              value: api.value,
              open: api.open,
              items: api.items,
              issues: api.issues,
              segments: api.segments,
              emptyText: api.emptyText,
              kindText: api.kindText,
              highlightedKey: api.highlightedKey,
              setValue: api.setValue,
              insert: api.insert,
              close: api.close,
            })
          : renderDefaultStructure(api, props.label, props.multiline),
      )
    }
  },
})

/** 标题；必须是原生 label，getLabelProps 的 for 恒指向输入框。 */
export const XhExpressionInputLabel = defineComponent({
  name: 'XhExpressionInputLabel',
  setup(_, { slots }) {
    const ctx = useExpressionInputContext()
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('label', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

/** 字段视觉盒：输入框与镜像层叠在里面。 */
export const XhExpressionInputControl = defineComponent({
  name: 'XhExpressionInputControl',
  setup(_, { slots }) {
    const ctx = useExpressionInputContext()
    return () => h('div', ctx.api.value.getControlProps(), slots.default?.())
  },
})

/** 输入框；缺省跟着根上的 multiline，写 as 时以它为准。 */
export const XhExpressionInputInput = defineComponent({
  name: 'XhExpressionInputInput',
  props: {
    as: { type: String as PropType<ExpressionInputHost> },
  },
  setup(props) {
    const fieldWiring = useFieldStateWiring()
    const fieldLabel = useFieldLabelWiring()
    const ctx = useExpressionInputContext()
    const tag = computed<ExpressionInputHost>(() => props.as ?? (ctx.multiline.value ? 'textarea' : 'input'))
    watch(tag, (host) => {
      ctx.multiline.value = host === 'textarea'
    }, { immediate: true })
    // 输入框自己的描述链（问题列表）与字段的拼起来，字段的在前
    return () => h(tag.value, fieldLabel.value(withFieldDescription(
      {
        ...fieldWiring.value,
        ...ctx.api.value.getInputProps({ as: tag.value }),
        ref: (el: unknown) => { ctx.inputRef.value = el as ExpressionInputEl },
      },
      fieldWiring.value['aria-describedby'] as string | undefined,
    )))
  },
})

/** 镜像层：把问题区间画成波浪下划线，对读屏隐藏。 */
export const XhExpressionInputHighlight = defineComponent({
  name: 'XhExpressionInputHighlight',
  setup(_, { slots }) {
    const ctx = useExpressionInputContext()
    return () => h('div', {
      ...ctx.api.value.getHighlightProps(),
      ref: (el: unknown) => { ctx.highlightRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 镜像层里的一段；index 是它在 segments 里的序号。 */
export const XhExpressionInputHighlightSegment = defineComponent({
  name: 'XhExpressionInputHighlightSegment',
  props: {
    index: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useExpressionInputContext()
    return () => {
      const segment = ctx.api.value.segments[Number(props.index)]
      return segment ? h('span', ctx.api.value.getHighlightSegmentProps({ segment }), slots.default?.()) : null
    }
  },
})

export const XhExpressionInputPositioner = defineComponent({
  name: 'XhExpressionInputPositioner',
  props: {
    /** 本实例的 Portal 容器；优先于应用级配置。 */
    container: { type: Object as PropType<Element> },
  },
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    const ctx = useExpressionInputContext()
    const bars = useOverlayScrollbars({ present: () => ctx.visible.value, scrollable: () => ctx.contentRef.value, props: { size: 'sm' } })
    return () => h(XhPortal, { to: props.container ?? ctx.portalTarget.value, source: ctx.inputRef, present: ctx.visible.value }, () => [
      h('div', {
        ...mergeProps(ctx.api.value.getPositionerProps(), attrs),
        ref: (el: unknown) => { ctx.positionerRef.value = el as HTMLElement },
      }, [...(slots.default?.() ?? []), ...bars.render()]),
    ])
  },
})

export const XhExpressionInputContent = defineComponent({
  name: 'XhExpressionInputContent',
  setup(_, { slots }) {
    const ctx = useExpressionInputContext()
    return () => h('div', {
      ...ctx.api.value.getContentProps(),
      style: ctx.visible.value ? undefined : { display: 'none' },
      ref: (el: unknown) => { ctx.contentRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 一条补全；value 是条目的 key。 */
export const XhExpressionInputItem = defineComponent({
  name: 'XhExpressionInputItem',
  props: {
    value: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useExpressionInputContext()
    const item = computed(() => ctx.api.value.items.find(candidate => candidate.key === props.value))
    provide(ITEM_KEY, item)
    return () => (item.value ? h('div', ctx.api.value.getItemProps({ item: item.value }), slots.default?.()) : null)
  },
})

function itemPart(name: string, props: (api: ExpressionInputApi, item: ExpressionInputItem) => unknown): ReturnType<typeof defineComponent> {
  return defineComponent({
    name,
    props: {
      value: { type: String },
    },
    setup(_, { slots }) {
      const ctx = useExpressionInputContext()
      const item = inject(ITEM_KEY, null)
      if (!item)
        throw new Error(`[xh] ${name} 必须用在 XhExpressionInputItem 内`)
      return () => (item.value ? h('span', props(ctx.api.value, item.value) as Record<string, unknown>, slots.default?.()) : null)
    },
  })
}

/** 条目种类小标（变量 / 函数），对读屏隐藏。 */
export const XhExpressionInputItemPrefix = itemPart('XhExpressionInputItemPrefix', (api, item) => api.getItemPrefixProps({ item }))
export const XhExpressionInputItemText = itemPart('XhExpressionInputItemText', (api, item) => api.getItemTextProps({ item }))
/** 名字后面的提示：函数是签名。 */
export const XhExpressionInputItemSuffix = itemPart('XhExpressionInputItemSuffix', (api, item) => api.getItemSuffixProps({ item }))
/** 条目的第 2 行说明。 */
export const XhExpressionInputItemDescription = itemPart('XhExpressionInputItemDescription', (api, item) => api.getItemDescriptionProps({ item }))

/** 没有匹配的补全时显示的空态；与 content 同级。 */
export const XhExpressionInputEmpty = defineComponent({
  name: 'XhExpressionInputEmpty',
  setup(_, { slots }) {
    const ctx = useExpressionInputContext()
    return () => h('div', ctx.api.value.getEmptyProps(), slots.default?.())
  },
})

/** 问题列表；渲染了它，输入框的描述链才引用它。 */
export const XhExpressionInputIssues = defineComponent({
  name: 'XhExpressionInputIssues',
  setup(_, { slots }) {
    const ctx = useExpressionInputContext()
    ctx.issuesCount.value++
    onUnmounted(() => {
      ctx.issuesCount.value--
    })
    return () => h('div', ctx.api.value.getIssuesProps(), slots.default?.())
  },
})

/** 问题列表里的一行；index 是它在 issues 里的序号。 */
export const XhExpressionInputIssue = defineComponent({
  name: 'XhExpressionInputIssue',
  props: {
    index: { type: String, required: true },
  },
  setup(props, { slots }) {
    const ctx = useExpressionInputContext()
    return () => {
      const issue = ctx.api.value.issues[Number(props.index)]
      return issue ? h('p', ctx.api.value.getIssueProps({ issue }), slots.default?.()) : null
    }
  },
})

/** 标准结构里各部件对应的组件。 */
const EXPRESSION_INPUT_PARTS = {
  'label': XhExpressionInputLabel,
  'control': XhExpressionInputControl,
  'input': XhExpressionInputInput,
  'highlight': XhExpressionInputHighlight,
  'highlight-segment': XhExpressionInputHighlightSegment,
  'positioner': XhExpressionInputPositioner,
  'content': XhExpressionInputContent,
  'item': XhExpressionInputItem,
  'item-prefix': XhExpressionInputItemPrefix,
  'item-text': XhExpressionInputItemText,
  'item-suffix': XhExpressionInputItemSuffix,
  'item-description': XhExpressionInputItemDescription,
  'empty': XhExpressionInputEmpty,
  'issues': XhExpressionInputIssues,
  'issue': XhExpressionInputIssue,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 expressionInputStructure 渲，
 * 与 Web Components 只写 root 时元素生成的节点出自同一份。
 */
function renderDefaultStructure(api: ExpressionInputApi, label: string | undefined, multiline: boolean): VNode[] {
  return renderStructure(expressionInputStructure(api, { label, multiline }), EXPRESSION_INPUT_PARTS)
}
