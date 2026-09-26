/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pie chart 相关实现。

import type {
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartRow,
  PieChartApi,
  PieChartSchema,
  PieChartTranslations,
  PieLabels,
  PieSort,
  PieSweep,
  PieTooltipModel,
  PieVariant,
} from '@xihan-ui/headless'
import type { NumberFormatSpec } from '@xihan-ui/viz'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { providePieChart, usePieChartContext } from './context'
import { usePieChart } from './use-pie-chart'

type PieChartProps = PieChartSchema['props']

/** 默认插槽的载荷：自行摆放部件时用得上的状态与动作。 */
export type PieChartRootSlotProps = Pick<PieChartApi, 'legendItems' | 'active' | 'tooltip' | 'center' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框插槽的载荷：激活的扇区与缺省的内容模型。 */
export interface PieChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: PieTooltipModel | null
}

/** 环形中心插槽的载荷：可见扇区的合计与说明文字，以及激活的扇区。 */
export interface PieChartCenterSlotProps {
  center: PieChartApi['center']
  active: ChartDatumDetails | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: PieChartApi, mark: ChartMark): VNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return h('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return h('text', props, mark.text)
  return h('path', props)
}

/** 缺省的提示框内容：头部是扇区名，下面是数值与占比；「其他」另列出被合并的各项。 */
function renderTooltipContent(api: PieChartApi): VNode[] {
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
function renderA11y(api: PieChartApi): VNode[] {
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
export const XhPieChartCaption = defineComponent({
  name: 'XhPieChartCaption',
  setup(_, { slots }) {
    const ctx = usePieChartContext()
    return () => h('figcaption', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 图例：项由组件按扇区生成；只有一个扇区时整条收起。 */
export const XhPieChartLegend = defineComponent({
  name: 'XhPieChartLegend',
  setup() {
    const ctx = usePieChartContext()
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
export const XhPieChartViewport = defineComponent({
  name: 'XhPieChartViewport',
  setup(_, { slots }) {
    const ctx = usePieChartContext()
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.viewportRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 绘图区：扇区在下，引导线与标签在上，焦点环最上。 */
export const XhPieChartPlot = defineComponent({
  name: 'XhPieChartPlot',
  setup() {
    const ctx = usePieChartContext()
    return () => {
      const api = ctx.api.value
      const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
      return h('svg', api.getPlotProps() as Record<string, unknown>, marks.map(mark => renderMark(api, mark)))
    }
  },
})

/** 环形中心：缺省显示可见扇区的合计，作用域插槽可替换。 */
export const XhPieChartCenter = defineComponent({
  name: 'XhPieChartCenter',
  slots: Object as SlotsType<{
    default?: (props: PieChartCenterSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = usePieChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getCenterProps() as Record<string, unknown>, slots.default
        ? slots.default({ center: api.center, active: api.active })
        : [
            h('span', api.getCenterValueProps() as Record<string, unknown>, api.center.value),
            h('span', api.getCenterLabelProps() as Record<string, unknown>, api.center.label),
          ])
    }
  },
})

/** 提示框：缺省内容按激活的扇区生成，作用域插槽可替换。 */
export const XhPieChartTooltip = defineComponent({
  name: 'XhPieChartTooltip',
  slots: Object as SlotsType<{
    default?: (props: PieChartTooltipSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = usePieChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getTooltipProps() as Record<string, unknown>, slots.default
        ? slots.default({ active: api.active, tooltip: api.tooltip })
        : renderTooltipContent(api))
    }
  },
})

/** 空态：没有可画的扇区时显示，缺省文字取文案。 */
export const XhPieChartEmpty = defineComponent({
  name: 'XhPieChartEmpty',
  setup(_, { slots }) {
    const ctx = usePieChartContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.emptyText)
  },
})

/** 根：铺开缺省结构或交给默认插槽，并在末尾追加摘要与数据表。 */
export const XhPieChartRoot = defineComponent({
  name: 'XhPieChartRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    data: { type: Array as PropType<readonly ChartRow[]> },
    nameField: { type: String },
    valueField: { type: String },
    variant: { type: String as PropType<PieVariant> },
    rose: { type: Boolean, default: undefined },
    sweep: { type: String as PropType<PieSweep> },
    sort: { type: String as PropType<PieSort> },
    maxSlices: { type: Number },
    labels: { type: String as PropType<PieLabels> },
    format: { type: [Object, Function] as PropType<NumberFormatSpec | ((value: number) => string)> },
    hiddenSeries: { type: Array as PropType<string[]> },
    defaultHiddenSeries: { type: Array as PropType<string[]> },
    activeKey: { type: [String, Number, Date, null] as PropType<ChartKey | null> },
    pending: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<PieChartTranslations>> },
  },
  // hidden-series-change / active-key-change 携带 details；update:* 携带裸值，支持 v-model
  emits: {
    'hidden-series-change': (_details: PayloadOf<PieChartProps, 'onHiddenSeriesChange'>) => true,
    'update:hiddenSeries': (_hidden: PayloadOf<PieChartProps, 'onHiddenSeriesChange'>['hiddenSeries']) => true,
    'active-key-change': (_details: PayloadOf<PieChartProps, 'onActiveKeyChange'>) => true,
    'update:activeKey': (_key: PayloadOf<PieChartProps, 'onActiveKeyChange'>['activeKey']) => true,
    'datum-active': (_details: PayloadOf<PieChartProps, 'onDatumActive'>) => true,
    'datum-press': (_details: PayloadOf<PieChartProps, 'onDatumPress'>) => true,
  },
  slots: Object as SlotsType<{
    /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区、环形中心与空态）、提示框。 */
    default?: (props: PieChartRootSlotProps) => VNode[]
    /** 缺省结构里的标题内容。 */
    caption?: () => VNode[]
    /** 缺省结构里的环形中心内容。 */
    center?: (props: PieChartCenterSlotProps) => VNode[]
    /** 缺省结构里的提示框内容。 */
    tooltip?: (props: PieChartTooltipSlotProps) => VNode[]
    /** 缺省结构里的空态内容。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = usePieChart(withXhConfig('pie-chart', props) as PieChartProps, {
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
    providePieChart(ctx)
    return () => {
      const api = ctx.api.value
      const content = slots.default
        ? slots.default({
            legendItems: api.legendItems,
            active: api.active,
            tooltip: api.tooltip,
            center: api.center,
            empty: api.empty,
            hiddenSeries: api.hiddenSeries,
            activeKey: api.activeKey,
            toggleSeries: api.toggleSeries,
            setFocusedDatum: api.setFocusedDatum,
          })
        : [
            ...(slots.caption ? [h(XhPieChartCaption, null, () => slots.caption?.())] : []),
            h(XhPieChartLegend),
            // 环形中心与空态放进视口：叠在绘图区上，标题与图例不被盖住
            h(XhPieChartViewport, null, () => [
              h(XhPieChartPlot),
              h(XhPieChartCenter, null, slots.center ? { default: slots.center } : undefined),
              h(XhPieChartEmpty, null, slots.empty ? () => slots.empty?.() : undefined),
            ]),
            h(XhPieChartTooltip, null, slots.tooltip ? { default: slots.tooltip } : undefined),
          ]
      return h('figure', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, [...content, ...renderA11y(api)])
    }
  },
})
