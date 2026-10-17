/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 rating 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { RatingApi, RatingItemState, RatingSchema } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { hasNamingContent, ratingStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h, onBeforeUnmount, onMounted, onUnmounted, onUpdated, ref, watch } from 'vue'
import { withXhConfig } from '../../config/config'
import { renderStructure } from '../../runtime/structure'
import { useFieldGroupWiring, useFieldLabelWiring } from '../field/use-field-control'
import { useFormControlProps } from '../form/use-form-control'
import { provideRating, useRatingContext } from './context'
import { useRating } from './use-rating'

type RatingProps = RatingSchema['props']

/** 默认插槽的载荷：评分与预览值、星星序号表，以及取单颗星状态与改写评分的句柄。 */
export type RatingRootSlotProps = Pick<
  RatingApi,
  | 'value'
  | 'hoveredValue'
  | 'highlightedValue'
  | 'count'
  | 'empty'
  | 'items'
  | 'getItemState'
  | 'setValue'
>

/** 条目默认插槽的载荷：该颗星的选中、点亮与半亮状态。 */
export type RatingItemSlotProps = RatingItemState

export const XhRatingRoot = defineComponent({
  name: 'XhRatingRoot',
  props: {
    /** 标题文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 不显示出来的名字，写成 aria-label 落在与字段标签同一个部件上；放进字段或渲染了 label 部件时以它们为准。 */
    ariaLabel: { type: String },
    // 缺席值 undefined 表示非受控
    value: { type: Number },
    defaultValue: { type: Number },
    count: { type: Number },
    allowHalf: Boolean,
    allowClear: { type: Boolean, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    name: { type: String },
    dir: { type: String as PropType<Direction> },
    tone: { type: String as PropType<Tone> },
    size: { type: String as PropType<Size> },
    translations: { type: Object as PropType<RatingProps['translations']> },
  },
  // value-change 携带 { value }，update:value 携带裸值；hover-change 是预览通道
  emits: {
    'value-change': (_details: PayloadOf<RatingProps, 'onValueChange'>) => true,
    'update:value': (_value: PayloadOf<RatingProps, 'onValueChange'>['value']) => true,
    'hover-change': (_details: PayloadOf<RatingProps, 'onHoverChange'>) => true,
  },
  slots: Object as SlotsType<{
    default?: (props: RatingRootSlotProps) => VNode[]
    label?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const onValueChange: RatingProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onHoverChange: RatingProps['onHoverChange'] = (details) => {
      emit('hover-change', details)
    }
    const ctx = useRating(withXhConfig('rating', useFormControlProps(props)) as RatingProps, { onValueChange, onHoverChange })
    provideRating(ctx)
    return () => {
      const api = ctx.api.value
      return h('div', api.getRootProps() as Record<string, unknown>, slots.default
        ? slots.default({
            value: api.value,
            hoveredValue: api.hoveredValue,
            highlightedValue: api.highlightedValue,
            count: api.count,
            empty: api.empty,
            // 条目序号列表，供 v-for 渲染星星
            items: api.items,
            getItemState: api.getItemState,
            setValue: api.setValue,
          })
        : renderDefaultStructure(api, props.label, props.name !== undefined, slots.label))
    }
  },
})

export const XhRatingLabel = defineComponent({
  name: 'XhRatingLabel',
  setup(_, { slots }) {
    const ctx = useRatingContext()
    // 渲出来就登记，在 setup 里同步做：排在输入之前时首帧与服务端直出就带上名字
    ctx.labelCount.value++
    onUnmounted(() => {
      ctx.labelCount.value--
    })
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhRatingControl = defineComponent({
  name: 'XhRatingControl',
  setup(_, { slots }) {
    const ctx = useRatingContext()
    // 放进表单字段时，字段的标题与说明接到星组上：读屏进组时念组名与说明
    const fieldWiring = useFieldGroupWiring()
    const fieldLabel = useFieldLabelWiring()
    return () => h('div', fieldLabel.value({ ...fieldWiring.value, ...ctx.api.value.getControlProps() as Record<string, unknown> }), slots.default?.())
  },
})

export const XhRatingValueText = defineComponent({
  name: 'XhRatingValueText',
  setup(_, { slots }) {
    const ctx = useRatingContext()
    // 分值文本：写在 root 里、control 的兄弟；没给内容就填当前该点亮到的那个数
    return () => h(
      'span',
      ctx.api.value.getValueTextProps() as Record<string, unknown>,
      slots.default?.() ?? ctx.api.value.valueText,
    )
  },
})

export const XhRatingItem = defineComponent({
  name: 'XhRatingItem',
  props: {
    // 星序号，兼收字符串；往下传前统一归成数字
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  slots: Object as SlotsType<{
    default?: (props: RatingItemSlotProps) => VNode[]
  }>,
  setup(props, { slots }) {
    const ctx = useRatingContext()
    const item = computed(() => ({ value: Number(props.value) }))

    // 本条目持有焦点时，序号变更重报焦点条目，卸载时上报评分带失焦
    const itemEl = ref<HTMLElement | null>(null)
    watch(() => item.value.value, (next, prev) => {
      if (next === prev)
        return
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'ITEM.FOCUS', index: next })
    })
    onBeforeUnmount(() => {
      const { service } = ctx
      if (service.getStatus() !== 'Started')
        return
      // 按「本节点当下正持有焦点」判定，不按序号比对
      if (itemEl.value && service.scope.getActiveElement() === itemEl.value)
        service.send({ type: 'CONTROL.BLUR' })
    })

    // 作者在星里放了自己的内容（文字或带名字的节点）就以内容为名，connect 不写缺省名；按渲染出的节点判断
    const authored = ref(false)
    const readAuthored = (): void => {
      if (itemEl.value)
        authored.value = hasNamingContent(itemEl.value)
    }
    onMounted(readAuthored)
    onUpdated(readAuthored)

    return () => h('span', {
      ...ctx.api.value.getItemProps({ ...item.value, authored: authored.value }) as Record<string, unknown>,
      ref: itemEl,
    }, slots.default?.(ctx.api.value.getItemState(item.value)))
  },
})

export const XhRatingHiddenInput = defineComponent({
  name: 'XhRatingHiddenInput',
  setup() {
    const ctx = useRatingContext()
    return () => h('input', ctx.api.value.getHiddenInputProps() as Record<string, unknown>)
  },
})

/** 标准结构里各部件对应的组件。 */
const RATING_PARTS = {
  'label': XhRatingLabel,
  'control': XhRatingControl,
  'item': XhRatingItem,
  'hidden-input': XhRatingHiddenInput,
}

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 ratingStructure 渲，
 * 与 Web Components 不写部件时元素生成的节点出自同一份。标题由 label 插槽接管。
 */
function renderDefaultStructure(api: RatingApi, label: string | undefined, hiddenInput: boolean, labelSlot?: () => VNode[]): VNode[] {
  const nodes = ratingStructure(api, { label, hiddenInput, slotted: name => name === 'label' && labelSlot != null })
  return renderStructure(nodes, RATING_PARTS, node => (node.slot ? labelSlot?.() : undefined))
}
