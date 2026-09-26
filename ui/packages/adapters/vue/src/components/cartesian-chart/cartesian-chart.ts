/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type {
  CartesianAxis,
  CartesianChartApi,
  CartesianChartSchema,
  CartesianChartTranslations,
  CartesianOrientation,
  CartesianSeries,
  CartesianTooltipModel,
  CartesianTooltipOrder,
  CartesianTrigger,
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartRow,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideCartesianChart, useCartesianChartContext } from './context'
import { useCartesianChart } from './use-cartesian-chart'

type CartesianChartProps = CartesianChartSchema['props']

/** 默认插槽的载荷：自行摆放部件时用得上的状态与动作。 */
export type CartesianChartRootSlotProps = Pick<CartesianChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框插槽的载荷：激活的数据（axis 模式带 items）与缺省的内容模型。 */
export interface CartesianChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: CartesianTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；分组递归画子标记，文字标记带文字。 */
function renderMark(api: CartesianChartApi, mark: ChartMark): VNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return h('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return h('text', props, mark.text)
  return h('path', props)
}

/** 缺省的提示框内容：头部是自变量，每个系列一行（色标、数值、系列名）。 */
function renderTooltipContent(api: CartesianChartApi): VNode[] {
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
function renderA11y(api: CartesianChartApi): VNode[] {
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
export const XhCartesianChartCaption = defineComponent({
  name: 'XhCartesianChartCaption',
  setup(_, { slots }) {
    const ctx = useCartesianChartContext()
    return () => h('figcaption', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 图例：项由组件按系列生成；只有一个系列时整条收起。 */
export const XhCartesianChartLegend = defineComponent({
  name: 'XhCartesianChartLegend',
  setup() {
    const ctx = useCartesianChartContext()
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

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定、含坐标轴带。 */
export const XhCartesianChartViewport = defineComponent({
  name: 'XhCartesianChartViewport',
  setup(_, { slots }) {
    const ctx = useCartesianChartContext()
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.viewportRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/**
 * 绘图区：按场景生成网格、坐标轴、系列与前景层。
 * 次序是 back → under → data → over：类目带淡底与十字准线在数据之下，激活的点与焦点环在数据之上。
 */
export const XhCartesianChartPlot = defineComponent({
  name: 'XhCartesianChartPlot',
  setup() {
    const ctx = useCartesianChartContext()
    return () => {
      const api = ctx.api.value
      const marks = [
        ...api.scene.layers.back,
        ...api.overlay.under,
        ...api.scene.layers.data,
        ...api.scene.layers.front,
        ...api.overlay.over,
      ]
      return h('svg', api.getPlotProps() as Record<string, unknown>, marks.map(mark => renderMark(api, mark)))
    }
  },
})

/** 提示框：缺省内容按激活的数据生成，作用域插槽可替换。 */
export const XhCartesianChartTooltip = defineComponent({
  name: 'XhCartesianChartTooltip',
  slots: Object as SlotsType<{
    default?: (props: CartesianChartTooltipSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useCartesianChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getTooltipProps() as Record<string, unknown>, slots.default
        ? slots.default({ active: api.active, tooltip: api.tooltip })
        : renderTooltipContent(api))
    }
  },
})

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export const XhCartesianChartEmpty = defineComponent({
  name: 'XhCartesianChartEmpty',
  setup(_, { slots }) {
    const ctx = useCartesianChartContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.emptyText)
  },
})

/** 根：铺开缺省结构或交给默认插槽，并在末尾追加摘要与数据表。 */
export const XhCartesianChartRoot = defineComponent({
  name: 'XhCartesianChartRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    data: { type: Array as PropType<readonly ChartRow[]> },
    series: { type: Array as PropType<readonly CartesianSeries[]> },
    xAxis: { type: Object as PropType<CartesianAxis> },
    yAxis: { type: Object as PropType<CartesianAxis> },
    orientation: { type: String as PropType<CartesianOrientation> },
    trigger: { type: String as PropType<CartesianTrigger> },
    totals: { type: Boolean, default: undefined },
    tooltipOrder: { type: String as PropType<CartesianTooltipOrder> },
    hiddenSeries: { type: Array as PropType<string[]> },
    defaultHiddenSeries: { type: Array as PropType<string[]> },
    activeKey: { type: [String, Number, Date, null] as PropType<ChartKey | null> },
    pending: { type: Boolean, default: undefined },
    animated: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<CartesianChartTranslations>> },
  },
  // hidden-series-change / active-key-change 携带 details；update:* 携带裸值，支持 v-model
  emits: {
    'hidden-series-change': (_details: PayloadOf<CartesianChartProps, 'onHiddenSeriesChange'>) => true,
    'update:hiddenSeries': (_hidden: PayloadOf<CartesianChartProps, 'onHiddenSeriesChange'>['hiddenSeries']) => true,
    'active-key-change': (_details: PayloadOf<CartesianChartProps, 'onActiveKeyChange'>) => true,
    'update:activeKey': (_key: PayloadOf<CartesianChartProps, 'onActiveKeyChange'>['activeKey']) => true,
    'datum-active': (_details: PayloadOf<CartesianChartProps, 'onDatumActive'>) => true,
    'datum-press': (_details: PayloadOf<CartesianChartProps, 'onDatumPress'>) => true,
  },
  slots: Object as SlotsType<{
    /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
    default?: (props: CartesianChartRootSlotProps) => VNode[]
    /** 缺省结构里的标题内容。 */
    caption?: () => VNode[]
    /** 缺省结构里的提示框内容。 */
    tooltip?: (props: CartesianChartTooltipSlotProps) => VNode[]
    /** 缺省结构里的空态内容。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useCartesianChart(withXhConfig('cartesian-chart', props) as CartesianChartProps, {
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
    provideCartesianChart(ctx)
    return () => {
      const api = ctx.api.value
      const content = slots.default
        ? slots.default({
            legendItems: api.legendItems,
            active: api.active,
            tooltip: api.tooltip,
            empty: api.empty,
            hiddenSeries: api.hiddenSeries,
            activeKey: api.activeKey,
            toggleSeries: api.toggleSeries,
            setFocusedDatum: api.setFocusedDatum,
          })
        : [
            ...(slots.caption ? [h(XhCartesianChartCaption, null, () => slots.caption?.())] : []),
            h(XhCartesianChartLegend),
            // 空态放进视口：叠在绘图区上居中，标题与图例不被盖住
            h(XhCartesianChartViewport, null, () => [
              h(XhCartesianChartPlot),
              h(XhCartesianChartEmpty, null, slots.empty ? () => slots.empty?.() : undefined),
            ]),
            h(XhCartesianChartTooltip, null, slots.tooltip ? { default: slots.tooltip } : undefined),
          ]
      return h('figure', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, [...content, ...renderA11y(api)])
    }
  },
})
