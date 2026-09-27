/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sankey chart 相关实现。

import type {
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  NumberFormatSpec,
  SankeyChartApi,
  SankeyChartSchema,
  SankeyChartTranslations,
  SankeyLinkColor,
  SankeyLinkDatum,
  SankeyNodeAlign,
  SankeyNodeDatum,
  SankeyNodeSort,
  SankeyOrientation,
  SankeyTooltipModel,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideSankeyChart, useSankeyChartContext } from './context'
import { useSankeyChart } from './use-sankey-chart'

type SankeyChartProps = SankeyChartSchema['props']

/** 默认插槽的载荷：自行摆放部件时用得上的状态与动作。 */
export type SankeyChartRootSlotProps = Pick<SankeyChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框插槽的载荷：激活的节点或流带与缺省的内容模型。 */
export interface SankeyChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: SankeyTooltipModel | null
}

/** 渐变定义：绘图区的第一个子节点，linkColor="gradient" 时每条流带一个渐变、两端各一个色标。 */
function renderDefs(api: SankeyChartApi): VNode {
  return h('defs', api.getDefsProps() as Record<string, unknown>, api.gradients.map(gradient =>
    h('linearGradient', { ...api.getGradientProps(gradient) as Record<string, unknown>, key: gradient.id }, [
      h('stop', api.getGradientStopProps(gradient, 'from') as Record<string, unknown>),
      h('stop', api.getGradientStopProps(gradient, 'to') as Record<string, unknown>),
    ])))
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: SankeyChartApi, mark: ChartMark): VNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return h('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return h('text', props, mark.text)
  return h('path', props)
}

/** 缺省的提示框内容：节点写合计与流入流出的明细，流带写流量与占比。 */
function renderTooltipContent(api: SankeyChartApi): VNode[] {
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
function renderA11y(api: SankeyChartApi): VNode[] {
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
export const XhSankeyChartCaption = defineComponent({
  name: 'XhSankeyChartCaption',
  setup(_, { slots }) {
    const ctx = useSankeyChartContext()
    return () => h('figcaption', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 图例：项由组件按分组生成；不到两组时整条收起。 */
export const XhSankeyChartLegend = defineComponent({
  name: 'XhSankeyChartLegend',
  setup() {
    const ctx = useSankeyChartContext()
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
export const XhSankeyChartViewport = defineComponent({
  name: 'XhSankeyChartViewport',
  setup(_, { slots }) {
    const ctx = useSankeyChartContext()
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.viewportRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 绘图区：渐变定义在最前，流带在下，节点其上，节点名再上，焦点环最上。 */
export const XhSankeyChartPlot = defineComponent({
  name: 'XhSankeyChartPlot',
  setup() {
    const ctx = useSankeyChartContext()
    return () => {
      const api = ctx.api.value
      const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
      return h('svg', api.getPlotProps() as Record<string, unknown>, [renderDefs(api), ...marks.map(mark => renderMark(api, mark))])
    }
  },
})

/** 提示框：缺省内容按激活的节点或流带生成，作用域插槽可替换。 */
export const XhSankeyChartTooltip = defineComponent({
  name: 'XhSankeyChartTooltip',
  slots: Object as SlotsType<{
    default?: (props: SankeyChartTooltipSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useSankeyChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getTooltipProps() as Record<string, unknown>, slots.default
        ? slots.default({ active: api.active, tooltip: api.tooltip })
        : renderTooltipContent(api))
    }
  },
})

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export const XhSankeyChartEmpty = defineComponent({
  name: 'XhSankeyChartEmpty',
  setup(_, { slots }) {
    const ctx = useSankeyChartContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.emptyText)
  },
})

/** 根：铺开缺省结构或交给默认插槽，并在末尾追加摘要与数据表。 */
export const XhSankeyChartRoot = defineComponent({
  name: 'XhSankeyChartRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    nodes: { type: Array as PropType<readonly SankeyNodeDatum[]> },
    links: { type: Array as PropType<readonly SankeyLinkDatum[]> },
    orientation: { type: String as PropType<SankeyOrientation> },
    nodeAlign: { type: String as PropType<SankeyNodeAlign> },
    linkColor: { type: String as PropType<SankeyLinkColor> },
    nodeSort: { type: String as PropType<SankeyNodeSort> },
    format: { type: [Object, Function] as PropType<NumberFormatSpec | ((value: number) => string)> },
    hiddenSeries: { type: Array as PropType<string[]> },
    defaultHiddenSeries: { type: Array as PropType<string[]> },
    activeKey: { type: [String, Number, Date, null] as PropType<ChartKey | null> },
    pending: { type: Boolean, default: undefined },
    animated: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<SankeyChartTranslations>> },
  },
  // hidden-series-change / active-key-change 携带 details；update:* 携带裸值，支持 v-model
  emits: {
    'hidden-series-change': (_details: PayloadOf<SankeyChartProps, 'onHiddenSeriesChange'>) => true,
    'update:hiddenSeries': (_hidden: PayloadOf<SankeyChartProps, 'onHiddenSeriesChange'>['hiddenSeries']) => true,
    'active-key-change': (_details: PayloadOf<SankeyChartProps, 'onActiveKeyChange'>) => true,
    'update:activeKey': (_key: PayloadOf<SankeyChartProps, 'onActiveKeyChange'>['activeKey']) => true,
    'datum-active': (_details: PayloadOf<SankeyChartProps, 'onDatumActive'>) => true,
    'datum-press': (_details: PayloadOf<SankeyChartProps, 'onDatumPress'>) => true,
  },
  slots: Object as SlotsType<{
    /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
    default?: (props: SankeyChartRootSlotProps) => VNode[]
    /** 缺省结构里的标题内容。 */
    caption?: () => VNode[]
    /** 缺省结构里的提示框内容。 */
    tooltip?: (props: SankeyChartTooltipSlotProps) => VNode[]
    /** 缺省结构里的空态内容。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useSankeyChart(withXhConfig('sankey-chart', props) as SankeyChartProps, {
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
    provideSankeyChart(ctx)
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
            ...(slots.caption ? [h(XhSankeyChartCaption, null, () => slots.caption?.())] : []),
            h(XhSankeyChartLegend),
            // 空态放进视口：叠在绘图区上，标题与图例不被盖住
            h(XhSankeyChartViewport, null, () => [
              h(XhSankeyChartPlot),
              h(XhSankeyChartEmpty, null, slots.empty ? () => slots.empty?.() : undefined),
            ]),
            h(XhSankeyChartTooltip, null, slots.tooltip ? { default: slots.tooltip } : undefined),
          ]
      return h('figure', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, [...content, ...renderA11y(api)])
    }
  },
})
