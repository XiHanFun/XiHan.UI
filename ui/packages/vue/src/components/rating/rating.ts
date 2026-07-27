import type { Direction } from '@xihan-ui/core'
import type { RatingSchema } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { computed, defineComponent, h, onBeforeUnmount, ref, watch } from 'vue'
import { provideRating, useRatingContext } from './context'
import { useRating } from './use-rating'

type RatingProps = RatingSchema['props']

export const XhRatingRoot = defineComponent({
  name: 'XhRatingRoot',
  props: {
    // 给 default: undefined 才表达得了"非受控"；落成 0 会被当作"受控且当前没评分"，
    // 用户从此再也点不动
    value: { type: Number, default: undefined },
    defaultValue: { type: Number, default: undefined },
    count: { type: Number, default: undefined },
    allowHalf: Boolean,
    disabled: Boolean,
    readOnly: Boolean,
    required: Boolean,
    name: { type: String, default: undefined },
    dir: { type: String as PropType<Direction>, default: undefined },
  },
  // value-change 携带 { value }；update:value 携带裸值，支持 v-model:value。
  // hover-change 是预览通道，与值无关，因此没有对应的 v-model
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
      // 作者拿它 v-for 出星星，序号即条目身份
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
    // 允许字符串是为了直接写在模板属性上（`value="3"`）；一律归成数字再往下传，
    // 否则 '3' 与 3 会在比大小时静默走成字符串比较
    value: { type: [Number, String] as PropType<number | string>, required: true },
  },
  setup(props, { slots }) {
    const ctx = useRatingContext()
    const item = computed(() => ({ value: Number(props.value) }))

    // 承载焦点的条目被移出 DOM 时浏览器不派 focusout，焦点锚点会停在一颗已消失的星上：
    // 容器判自己"焦点在带内"退出 Tab 序列，又没有条目认领得了这个锚点，
    // 整条评分带零个 Tab 停靠点，键盘用户再也进不来。count 调小就是这个形状。
    // v-for 不带 key 时 Vue 会就地复用节点：被删的是"最后一个组件实例"，
    // 而持有焦点的那个 DOM 节点还在、value 却被改成了别的序号。自己正持有焦点且 value 变了，
    // 就按新序号重报一次。
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
      // 整条带子一起卸载时根部件先停机，此刻无焦点可言（送事件还会在 dev 下抛）
      if (service.getStatus() !== 'Started')
        return
      // 判据是「本节点当下正持有焦点」，不是「值对得上」：就地复用时被卸载的是末位实例、
      // 它的 value 可能恰好等于刚纠正过的锚点，按值判会把好端端的锚点清掉
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
