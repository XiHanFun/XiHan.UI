import type { RatingSchema } from '@xihan-ui/headless'
import type { Direction, Size, Tone } from '@xihan-ui/kernel'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideRating, useRatingContext } from './context'
import { useRating } from './use-rating'

type RatingProps = RatingSchema['props']

export const XhRatingRoot = defineComponent({
  name: 'XhRatingRoot',
  props: {
    // default: undefined 表示非受控
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: undefined },
    count: { type: Number, default: undefined },
    allowHalf: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
    tone: { type: String as PropType<Tone>, default: undefined },
    size: { type: String as PropType<Size>, default: undefined },
  },
  // value-change 携带 { value }，update:value 携带裸值；hover-change 是预览通道
  emits: ['value-change', 'update:value', 'hover-change'],
  setup(props, { slots, emit }) {
    const onValueChange: RatingProps['onValueChange'] = (details) => {
      emit('value-change', details)
      emit('update:value', details.value)
    }
    const onHoverChange: RatingProps['onHoverChange'] = (details) => {
      emit('hover-change', details)
    }
    const ctx = useRating(props as RatingProps, { onValueChange, onHoverChange })
    provideRating(ctx)
    return () => h('div', ctx.api.value.getRootProps() as Record<string, unknown>, slots.default?.({
      value: ctx.api.value.value,
      hoveredValue: ctx.api.value.hoveredValue,
      highlightedValue: ctx.api.value.highlightedValue,
      count: ctx.api.value.count,
      empty: ctx.api.value.empty,
      // 条目序号列表，供 v-for 渲染星星
      items: ctx.api.value.items,
      getItemState: ctx.api.value.getItemState,
      setValue: ctx.api.value.setValue,
    }))
  },
})

export const XhRatingLabel = defineComponent({
  name: 'XhRatingLabel',
  setup(_, { slots }) {
    const ctx = useRatingContext()
    return () => h('span', ctx.api.value.getLabelProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhRatingControl = defineComponent({
  name: 'XhRatingControl',
  setup(_, { slots }) {
    const ctx = useRatingContext()
    return () => h('div', ctx.api.value.getControlProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhRatingItem = defineComponent({
  name: 'XhRatingItem',
  props: {
    // 星序号，兼收字符串；往下传前统一归成数字
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
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

    return () => h('span', {
      ...ctx.api.value.getItemProps(item.value) as Record<string, unknown>,
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
