import type { GridColumnCount, GridColumnOffset, GridProps } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectGrid } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideGrid, useGridContext } from './context'

/** 断点对象形态的列数，从 GridProps 上取，不在这里另抄一份档位清单。 */
type ColsByBreakpoint = Exclude<GridProps['cols'], GridColumnCount | undefined>

/** 列数的档位名，base 在前，其余自窄到宽。 */
const COLS_TIERS = ['base', 'sm', 'md', 'lg', 'xl'] as const

/** 模板里写 cols="3" 拿到的是字符串，交给 connect 前统一转成数字；取值范围由 connect 判。 */
function count(value: number | string | undefined): GridColumnCount | undefined {
  return value == null ? undefined : Number(value) as GridColumnCount
}

/** 列数：整数与字符串按单个数走；断点对象逐档转数字，没写的档不带进去。 */
function colsOf(value: number | string | ColsByBreakpoint | undefined): GridProps['cols'] {
  if (value == null || typeof value !== 'object')
    return count(value)
  const out: ColsByBreakpoint = {}
  for (const name of COLS_TIERS) {
    const raw = value[name]
    if (raw != null)
      out[name] = Number(raw) as GridColumnCount
  }
  return out
}

export const XhGridRoot = defineComponent({
  name: 'XhGridRoot',
  // 有 connect 兜底的 prop 一律 default: undefined
  props: {
    // 列数由作者声明：兼收字符串以支持模板里写 cols="3"，收对象则是逐档的列数
    cols: {
      type: [Number, String, Object] as PropType<GridColumnCount | string | ColsByBreakpoint>,
      default: undefined,
    },
    gap: { type: String as PropType<GridProps['gap']>, default: undefined },
    align: { type: String as PropType<GridProps['align']>, default: undefined },
    justifyItems: { type: String as PropType<GridProps['justifyItems']>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectGrid({
      cols: colsOf(props.cols),
      gap: props.gap,
      align: props.align,
      justifyItems: props.justifyItems,
    }, vueNormalize))
    provideGrid({ api })
    return () => h('div', api.value.getRootProps() as Record<string, unknown>, slots.default?.())
  },
})

export const XhGridItem = defineComponent({
  name: 'XhGridItem',
  props: {
    // 跨列与错列由每一格自报，同样兼收字符串
    span: { type: [Number, String] as PropType<GridColumnCount | string>, default: undefined },
    offset: { type: [Number, String] as PropType<GridColumnOffset | string>, default: undefined },
  },
  setup(props, { slots }) {
    const ctx = useGridContext()
    return () => h(
      'div',
      ctx.api.value.getItemProps({
        span: count(props.span),
        offset: count(props.offset) as GridColumnOffset | undefined,
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
