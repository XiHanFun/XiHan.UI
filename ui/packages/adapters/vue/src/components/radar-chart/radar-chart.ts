/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radar chart 相关实现。

import type {
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartRow,
  NumberFormatSpec,
  RadarChartApi,
  RadarChartSchema,
  RadarChartTranslations,
  RadarCurve,
  RadarIndicator,
  RadarScale,
  RadarShape,
  RadarTooltipModel,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideRadarChart, useRadarChartContext } from './context'
import { useRadarChart } from './use-radar-chart'

type RadarChartProps = RadarChartSchema['props']

/** 默认插槽的载荷：自行摆放部件时用得上的状态与动作。 */
export type RadarChartRootSlotProps = Pick<RadarChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum' | 'table'>

/** 提示框插槽的载荷：激活的顶点与缺省的内容模型。 */
export interface RadarChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: RadarTooltipModel | null
}

/** 纹理定义：绘图区的第一个子节点，每种纹理一个 pattern、里面一条线。 */
function renderDefs(api: RadarChartApi): VNode {
  return h('defs', api.getDefsProps() as Record<string, unknown>, api.patterns.map(pattern =>
    h('pattern', { ...api.getPatternProps(pattern) as Record<string, unknown>, key: pattern.id }, [
      h('path', api.getPatternLineProps(pattern) as Record<string, unknown>),
    ])))
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: RadarChartApi, mark: ChartMark): VNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return h('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return h('text', props, mark.text)
  return h('path', props)
}

/** 缺省的提示框内容：头部是指标名，每个可见实体一行（色标、数值、实体名）。 */
function renderTooltipContent(api: RadarChartApi): VNode[] {
  const tooltip = api.tooltip
  if (!tooltip)
    return []
  return [
    h('div', api.getTooltipHeaderProps() as Record<string, unknown>, tooltip.header),
    ...tooltip.rows.map(row => h('div', { ...api.getTooltipRowProps(row) as Record<string, unknown>, key: row.seriesId }, [
      h('span', api.getTooltipSwatchProps(row) as Record<string, unknown>),
      h('span', api.getTooltipValueProps(row) as Record<string, unknown>, row.value),
      h('span', api.getTooltipNameProps(row) as Record<string, unknown>, row.name),
    ])),
  ]
}

/** 摘要与数据表：由根自动生成、视觉隐藏，保证无障碍等价物始终存在。 */
function renderA11y(api: RadarChartApi): VNode[] {
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
export const XhRadarChartCaption = defineComponent({
  name: 'XhRadarChartCaption',
  setup(_, { slots }) {
    const ctx = useRadarChartContext()
    return () => h('figcaption', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 图例：项由组件按实体生成；只有一个实体时整条收起。 */
export const XhRadarChartLegend = defineComponent({
  name: 'XhRadarChartLegend',
  setup() {
    const ctx = useRadarChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getLegendProps() as Record<string, unknown>, api.legendItems.map(item =>
        h('button', { ...api.getLegendItemProps(item) as Record<string, unknown>, key: item.id }, [
          h('span', api.getLegendSwatchProps(item) as Record<string, unknown>),
          h('span', api.getLegendLabelProps(item) as Record<string, unknown>, item.name),
        ])))
    }
  },
})

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export const XhRadarChartViewport = defineComponent({
  name: 'XhRadarChartViewport',
  setup(_, { slots }) {
    const ctx = useRadarChartContext()
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.viewportRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 绘图区：网格与指标名在下，准线其次，各实体的面积、轮廓与顶点再上，焦点环最上。 */
export const XhRadarChartPlot = defineComponent({
  name: 'XhRadarChartPlot',
  setup() {
    const ctx = useRadarChartContext()
    return () => {
      const api = ctx.api.value
      const marks = [...api.scene.layers.back, ...api.overlay.under, ...api.scene.layers.data, ...api.overlay.over]
      return h('svg', api.getPlotProps() as Record<string, unknown>, [renderDefs(api), ...marks.map(mark => renderMark(api, mark))])
    }
  },
})

/** 提示框：缺省内容按激活的指标生成，作用域插槽可替换。 */
export const XhRadarChartTooltip = defineComponent({
  name: 'XhRadarChartTooltip',
  slots: Object as SlotsType<{
    default?: (props: RadarChartTooltipSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useRadarChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getTooltipProps() as Record<string, unknown>, slots.default
        ? slots.default({ active: api.active, tooltip: api.tooltip })
        : renderTooltipContent(api))
    }
  },
})

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export const XhRadarChartEmpty = defineComponent({
  name: 'XhRadarChartEmpty',
  setup(_, { slots }) {
    const ctx = useRadarChartContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.emptyText)
  },
})

/** 根：铺开缺省结构或交给默认插槽，并在末尾追加摘要与数据表。 */
export const XhRadarChartRoot = defineComponent({
  name: 'XhRadarChartRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    data: { type: Array as PropType<readonly ChartRow[]> },
    nameField: { type: String },
    indicators: { type: Array as PropType<readonly RadarIndicator[]> },
    shape: { type: String as PropType<RadarShape> },
    area: { type: Boolean, default: undefined },
    scale: { type: String as PropType<RadarScale> },
    curve: { type: String as PropType<RadarCurve> },
    /** 网格分几圈，2–10，缺省 4。 */
    rings: { type: Number },
    /** 在 12 点方向那根轴上写出每一圈的数值；只在各指标量程相同时写。 */
    ringLabels: { type: Boolean, default: undefined },
    format: { type: [Object, Function] as PropType<NumberFormatSpec | ((value: number) => string)> },
    hiddenSeries: { type: Array as PropType<string[]> },
    defaultHiddenSeries: { type: Array as PropType<string[]> },
    activeKey: { type: [String, Number, Date, null] as PropType<ChartKey | null> },
    pending: { type: Boolean, default: undefined },
    animated: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<RadarChartTranslations>> },
  },
  // hidden-series-change / active-key-change 携带 details；update:* 携带裸值，支持 v-model
  emits: {
    'hidden-series-change': (_details: PayloadOf<RadarChartProps, 'onHiddenSeriesChange'>) => true,
    'update:hiddenSeries': (_hidden: PayloadOf<RadarChartProps, 'onHiddenSeriesChange'>['hiddenSeries']) => true,
    'active-key-change': (_details: PayloadOf<RadarChartProps, 'onActiveKeyChange'>) => true,
    'update:activeKey': (_key: PayloadOf<RadarChartProps, 'onActiveKeyChange'>['activeKey']) => true,
    'datum-active': (_details: PayloadOf<RadarChartProps, 'onDatumActive'>) => true,
    'datum-press': (_details: PayloadOf<RadarChartProps, 'onDatumPress'>) => true,
  },
  slots: Object as SlotsType<{
    /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
    default?: (props: RadarChartRootSlotProps) => VNode[]
    /** 缺省结构里的标题内容。 */
    caption?: () => VNode[]
    /** 缺省结构里的提示框内容。 */
    tooltip?: (props: RadarChartTooltipSlotProps) => VNode[]
    /** 缺省结构里的空态内容。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useRadarChart(withXhConfig('radar-chart', props) as RadarChartProps, {
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
    provideRadarChart(ctx)
    return () => {
      const api = ctx.api.value
      const content = slots.default
        ? slots.default({
            legendItems: api.legendItems,
            active: api.active,
            tooltip: api.tooltip,
            empty: api.empty,
            table: api.table,
            hiddenSeries: api.hiddenSeries,
            activeKey: api.activeKey,
            toggleSeries: api.toggleSeries,
            setFocusedDatum: api.setFocusedDatum,
          })
        : [
            ...(slots.caption ? [h(XhRadarChartCaption, null, () => slots.caption?.())] : []),
            h(XhRadarChartLegend),
            // 空态放进视口：叠在绘图区上，标题与图例不被盖住
            h(XhRadarChartViewport, null, () => [
              h(XhRadarChartPlot),
              h(XhRadarChartEmpty, null, slots.empty ? () => slots.empty?.() : undefined),
            ]),
            h(XhRadarChartTooltip, null, slots.tooltip ? { default: slots.tooltip } : undefined),
          ]
      return h('figure', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, [...content, ...renderA11y(api)])
    }
  },
})
