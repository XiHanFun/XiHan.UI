import type { GridColumnCount, GridColumnOffset, GridItemProps, GridProps, GridRowCount } from '@xihan-ui/headless'
import type { PropType } from 'vue'
import { connectGrid, normalizeGridCount, normalizeGridTier } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { vueNormalize } from '../../runtime/normalize-props'
import { provideGrid, useGridContext } from './context'

/** 断点对象形态的列数，从 GridProps 上取，不在这里另抄一份档位清单。 */
type ColsByBreakpoint = Exclude<GridProps['cols'], GridColumnCount | undefined>
/** 断点对象形态的跨列与错列，同样从类型上取。 */
type SpanByBreakpoint = Exclude<GridItemProps['span'], GridColumnCount | undefined>
type OffsetByBreakpoint = Exclude<GridItemProps['offset'], GridColumnOffset | undefined>

export const XhGridRoot = defineComponent({
  name: 'XhGridRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    // 列数由作者声明：兼收字符串以支持模板里写 cols="3"，收对象则是逐档的列数
    cols: {
      type: [Number, String, Object] as PropType<GridColumnCount | string | ColsByBreakpoint>,
    },
    rows: { type: [Number, String] as PropType<GridRowCount | string> },
    minColWidth: { type: String as PropType<GridProps['minColWidth']> },
    gap: { type: String as PropType<GridProps['gap']> },
    rowGap: { type: String as PropType<GridProps['rowGap']> },
    columnGap: { type: String as PropType<GridProps['columnGap']> },
    align: { type: String as PropType<GridProps['align']> },
    justifyItems: { type: String as PropType<GridProps['justifyItems']> },
  },
  setup(props, { slots }) {
    const api = computed(() => connectGrid({
      cols: normalizeGridTier(props.cols) as GridProps['cols'],
      rows: normalizeGridCount(props.rows) as GridRowCount | undefined,
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
    },
    offset: {
      type: [Number, String, Object] as PropType<GridColumnOffset | string | OffsetByBreakpoint>,
    },
  },
  setup(props, { slots }) {
    const ctx = useGridContext()
    return () => h(
      'div',
      ctx.api.value.getItemProps({
        span: normalizeGridTier(props.span) as GridItemProps['span'],
        offset: normalizeGridTier(props.offset) as GridItemProps['offset'],
      }) as Record<string, unknown>,
      slots.default?.(),
    )
  },
})
