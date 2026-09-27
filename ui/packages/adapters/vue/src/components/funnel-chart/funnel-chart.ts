/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 funnel chart 相关实现。

import type {
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartPalette,
  ChartRow,
  FunnelAlign,
  FunnelChartApi,
  FunnelChartSchema,
  FunnelChartTranslations,
  FunnelConversion,
  FunnelDirection,
  FunnelLabels,
  FunnelShape,
  FunnelTooltipModel,
} from '@xihan-ui/headless'
import type { NumberFormatSpec } from '@xihan-ui/viz'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideFunnelChart, useFunnelChartContext } from './context'
import { useFunnelChart } from './use-funnel-chart'

type FunnelChartProps = FunnelChartSchema['props']

/** 默认插槽的载荷：自行摆放部件时用得上的状态与动作。 */
export type FunnelChartRootSlotProps = Pick<FunnelChartApi, 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框插槽的载荷：激活的阶段与缺省的内容模型。 */
export interface FunnelChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: FunnelTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: FunnelChartApi, mark: ChartMark): VNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return h('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return h('text', props, mark.text)
  return h('path', props)
}

/** 缺省的提示框内容：头部是阶段名，下面是数值与两种转化率。 */
function renderTooltipContent(api: FunnelChartApi): VNode[] {
  const tooltip = api.tooltip
  if (!tooltip)
    return []
  return [
    h('div', api.getTooltipHeaderProps() as Record<string, unknown>, tooltip.header),
    ...tooltip.rows.map(row => h('div', { ...api.getTooltipRowProps(row) as Record<string, unknown>, key: row.key }, [
      h('span', api.getTooltipSwatchProps(row) as Record<string, unknown>),
      h('span', api.getTooltipValueProps(row) as Record<string, unknown>, row.value),
      h('span', api.getTooltipNameProps(row) as Record<string, unknown>, row.name),
    ])),
  ]
}

/** 摘要与数据表：由根自动生成、视觉隐藏，保证无障碍等价物始终存在。 */
function renderA11y(api: FunnelChartApi): VNode[] {
  const { columns, rows } = api.table
  return [
    h('p', api.getSummaryProps() as Record<string, unknown>, api.summary),
    h('table', api.getTableProps() as Record<string, unknown>, [
      h('caption', api.tableCaption),
      h('thead', [h('tr', columns.map(column => h('th', { key: column.id, scope: 'col' }, column.label)))]),
      h('tbody', rows.map((row, i) => h('tr', { key: i }, row.cells.map((cell, c) =>
        c === 0 ? h('th', { key: c, scope: 'row' }, cell.text) : h('td', { key: c }, cell.text))))),
    ]),
  ]
}

/** 标题：图表的可及名来源。 */
export const XhFunnelChartCaption = defineComponent({
  name: 'XhFunnelChartCaption',
  setup(_, { slots }) {
    const ctx = useFunnelChartContext()
    return () => h('figcaption', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export const XhFunnelChartViewport = defineComponent({
  name: 'XhFunnelChartViewport',
  setup(_, { slots }) {
    const ctx = useFunnelChartContext()
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.viewportRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 绘图区：阶段在下，阶段标签与转化率在上，焦点环最上。 */
export const XhFunnelChartPlot = defineComponent({
  name: 'XhFunnelChartPlot',
  setup() {
    const ctx = useFunnelChartContext()
    return () => {
      const api = ctx.api.value
      const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
      return h('svg', api.getPlotProps() as Record<string, unknown>, marks.map(mark => renderMark(api, mark)))
    }
  },
})

/** 提示框：缺省内容按激活的阶段生成，作用域插槽可替换。 */
export const XhFunnelChartTooltip = defineComponent({
  name: 'XhFunnelChartTooltip',
  slots: Object as SlotsType<{
    default?: (props: FunnelChartTooltipSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useFunnelChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getTooltipProps() as Record<string, unknown>, slots.default
        ? slots.default({ active: api.active, tooltip: api.tooltip })
        : renderTooltipContent(api))
    }
  },
})

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export const XhFunnelChartEmpty = defineComponent({
  name: 'XhFunnelChartEmpty',
  setup(_, { slots }) {
    const ctx = useFunnelChartContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.emptyText)
  },
})

/** 根：铺开缺省结构或交给默认插槽，并在末尾追加摘要与数据表。 */
export const XhFunnelChartRoot = defineComponent({
  name: 'XhFunnelChartRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    data: { type: Array as PropType<readonly ChartRow[]> },
    nameField: { type: String },
    valueField: { type: String },
    shape: { type: String as PropType<FunnelShape> },
    align: { type: String as PropType<FunnelAlign> },
    direction: { type: String as PropType<FunnelDirection> },
    conversion: { type: String as PropType<FunnelConversion> },
    labels: { type: String as PropType<FunnelLabels> },
    palette: { type: String as PropType<ChartPalette> },
    format: { type: [Object, Function] as PropType<NumberFormatSpec | ((value: number) => string)> },
    hiddenSeries: { type: Array as PropType<string[]> },
    defaultHiddenSeries: { type: Array as PropType<string[]> },
    activeKey: { type: [String, Number, Date, null] as PropType<ChartKey | null> },
    pending: { type: Boolean, default: undefined },
    animated: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<FunnelChartTranslations>> },
  },
  // hidden-series-change / active-key-change 携带 details；update:* 携带裸值，支持 v-model
  emits: {
    'hidden-series-change': (_details: PayloadOf<FunnelChartProps, 'onHiddenSeriesChange'>) => true,
    'update:hiddenSeries': (_hidden: PayloadOf<FunnelChartProps, 'onHiddenSeriesChange'>['hiddenSeries']) => true,
    'active-key-change': (_details: PayloadOf<FunnelChartProps, 'onActiveKeyChange'>) => true,
    'update:activeKey': (_key: PayloadOf<FunnelChartProps, 'onActiveKeyChange'>['activeKey']) => true,
    'datum-active': (_details: PayloadOf<FunnelChartProps, 'onDatumActive'>) => true,
    'datum-press': (_details: PayloadOf<FunnelChartProps, 'onDatumPress'>) => true,
  },
  slots: Object as SlotsType<{
    /** 自行摆放部件；不写时铺开缺省结构：视口（绘图区与空态）、提示框。 */
    default?: (props: FunnelChartRootSlotProps) => VNode[]
    /** 缺省结构里的标题内容。 */
    caption?: () => VNode[]
    /** 缺省结构里的提示框内容。 */
    tooltip?: (props: FunnelChartTooltipSlotProps) => VNode[]
    /** 缺省结构里的空态内容。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useFunnelChart(withXhConfig('funnel-chart', props) as FunnelChartProps, {
      onHiddenSeriesChange: (details) => {
        emit('hidden-series-change', details)
        emit('update:hiddenSeries', details.hiddenSeries)
      },
      onActiveKeyChange: (details) => {
        emit('active-key-change', details)
        emit('update:activeKey', details.activeKey)
      },
      onDatumActive: details => emit('datum-active', details),
      onDatumPress: details => emit('datum-press', details),
    })
    provideFunnelChart(ctx)
    return () => {
      const api = ctx.api.value
      const content = slots.default
        ? slots.default({
            active: api.active,
            tooltip: api.tooltip,
            empty: api.empty,
            hiddenSeries: api.hiddenSeries,
            activeKey: api.activeKey,
            toggleSeries: api.toggleSeries,
            setFocusedDatum: api.setFocusedDatum,
          })
        : [
            ...(slots.caption ? [h(XhFunnelChartCaption, null, () => slots.caption?.())] : []),
            // 空态放进视口：叠在绘图区上，标题与图例不被盖住
            h(XhFunnelChartViewport, null, () => [
              h(XhFunnelChartPlot),
              h(XhFunnelChartEmpty, null, slots.empty ? () => slots.empty?.() : undefined),
            ]),
            h(XhFunnelChartTooltip, null, slots.tooltip ? { default: slots.tooltip } : undefined),
          ]
      return h('figure', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, [...content, ...renderA11y(api)])
    }
  },
})
