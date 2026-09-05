import type { GridColumnCount, GridColumnOffset, GridItemProps, GridProps, GridRowCount } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectGrid } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideGrid, useGridContext } from './context'

/** 断点对象形态的列数，从 GridProps 上取，不在这里另抄一份档位清单。 */
type ColsByBreakpoint = Exclude<GridProps['cols'], GridColumnCount | undefined>
/** 断点对象形态的跨列与错列，同样从类型上取。 */
type SpanByBreakpoint = Exclude<GridItemProps['span'], GridColumnCount | undefined>
type OffsetByBreakpoint = Exclude<GridItemProps['offset'], GridColumnOffset | undefined>

/** 列数的档位名，base 在前，其余自窄到宽。跨列与错列共用这一份。 */
const COLS_TIERS = ['base', 'sm', 'md', 'lg', 'xl'] as const

/** 模板里写 cols="3" 拿到的是字符串，交给 connect 前统一转成数字；取值范围由 connect 判。 */
function count(value: number | string | undefined): GridColumnCount | undefined {
  return value == null ? undefined : Number(value) as GridColumnCount
}

/**
 * 逐档的数：整数与字符串按单个数走；断点对象逐档转数字，没写的档不带进去。
 * 特性写法（`span='{"base":1,"md":6}'`）拿到的是一串 JSON，解析不出对象时按没写算——
 * 半截对象进去，缺的那几档会安静地退回缺省，而作者看不出是哪里写坏了。
 */
function tierOf<T extends ColsByBreakpoint | SpanByBreakpoint | OffsetByBreakpoint>(
  value: number | string | T | undefined,
): number | T | undefined {
  if (value == null)
    return undefined
  let source: unknown = value
  if (typeof source === 'string' && source.trimStart().startsWith('{')) {
    try {
      source = JSON.parse(source)
    }
    catch {
      return undefined
    }
  }
  if (source === null || typeof source !== 'object' || Array.isArray(source))
    return Number(source as number | string)
  const out = {} as T
  for (const name of COLS_TIERS) {
    const raw = (source as Record<string, number | string | undefined>)[name]
    if (raw != null)
      (out as Record<string, number>)[name] = Number(raw)
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
    rows: { type: [Number, String] as PropType<GridRowCount | string>, default: undefined },
    minColWidth: { type: String as PropType<GridProps['minColWidth']>, default: undefined },
    gap: { type: String as PropType<GridProps['gap']>, default: undefined },
    rowGap: { type: String as PropType<GridProps['rowGap']>, default: undefined },
    columnGap: { type: String as PropType<GridProps['columnGap']>, default: undefined },
    align: { type: String as PropType<GridProps['align']>, default: undefined },
    justifyItems: { type: String as PropType<GridProps['justifyItems']>, default: undefined },
  },
  setup(props, { slots }) {
    const api = computed(() => connectGrid({
      cols: tierOf<ColsByBreakpoint>(props.cols) as GridProps['cols'],
      rows: count(props.rows),
      minColWidth: props.minColWidth,
      gap: props.gap,
      rowGap: props.rowGap,
      columnGap: props.columnGap,
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
    // 跨列与错列由每一格自报，同样兼收字符串；收对象则是逐档的跨列 / 错列
    span: {
      type: [Number, String, Object] as PropType<GridColumnCount | string | SpanByBreakpoint>,
      default: undefined,
    },
    offset: {
      type: [Number, String, Object] as PropType<GridColumnOffset | string | OffsetByBreakpoint>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const ctx = useGridContext()
    return () => h(
      'div',
      ctx.api.value.getItemProps({
        span: tierOf<SpanByBreakpoint>(props.span) as GridItemProps['span'],
        offset: tierOf<OffsetByBreakpoint>(props.offset) as GridItemProps['offset'],
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
