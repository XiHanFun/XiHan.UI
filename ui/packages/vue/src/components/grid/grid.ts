import type { GridProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectGrid } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideGrid, useGridContext } from './context'

/** 模板里写 cols="3" 拿到的是字符串，交给 connect 前统一转成数字。 */
function count(value: number | string | undefined): number | undefined {
  return value == null ? undefined : Number(value)
}

export const XhGridRoot = defineComponent({
  name: 'XhGridRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    // 列数由作者声明，兼收字符串以支持模板里写 cols="3"
    cols: { type: [Number, String] as PropType<number | string>, default: undefined },
    gap: { type: String as PropType<GridProps['gap']>, default: undefined },
    align: { type: String as PropType<GridProps['align']>, default: undefined },
    justify: { type: String as PropType<GridProps['justify']>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectGrid({
      cols: count(props.cols),
      gap: props.gap,
      align: props.align,
      justify: props.justify,
    }, vueNormalize))
    provideGrid({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhGridItem = defineComponent({
  name: 'XhGridItem',
  props: {
    // 跨列与错列由每一格自报，同样兼收字符串
    span: { type: [Number, String] as PropType<number | string>, default: undefined },
    offset: { type: [Number, String] as PropType<number | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useGridContext()
    return () => h(
      'div',
      ctx.api.value.getItemProps({
        span: count(props.span),
        offset: count(props.offset),
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
