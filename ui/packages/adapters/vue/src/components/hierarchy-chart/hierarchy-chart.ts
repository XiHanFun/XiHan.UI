/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hierarchy chart 相关实现。

import type {
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartPalette,
  ChartRow,
  HierarchyChartApi,
  HierarchyChartSchema,
  HierarchyChartTranslations,
  HierarchyColorBy,
  HierarchyLayout,
  HierarchyTile,
  HierarchyTooltipModel,
  NumberFormatSpec,
} from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PayloadOf } from '../../runtime/payload'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { provideHierarchyChart, useHierarchyChartContext } from './context'
import { useHierarchyChart } from './use-hierarchy-chart'

type HierarchyChartProps = HierarchyChartSchema['props']

/** 默认插槽的载荷：自行摆放部件时用得上的状态与动作。 */
export type HierarchyChartRootSlotProps = Pick<HierarchyChartApi, 'active' | 'tooltip' | 'empty' | 'path' | 'rootKey' | 'activeKey' | 'drillTo' | 'drillUp' | 'setFocusedDatum' | 'table'>

/** 提示框插槽的载荷：激活的节点与缺省的内容模型。 */
export interface HierarchyChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: HierarchyTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: HierarchyChartApi, mark: ChartMark): VNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return h('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return h('text', props, mark.text)
  return h('path', props)
}

/** 缺省的提示框内容：头部是从当前的根到节点的路径，下面是数值与两种占比。 */
function renderTooltipContent(api: HierarchyChartApi): VNode[] {
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
function renderA11y(api: HierarchyChartApi): VNode[] {
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
export const XhHierarchyChartCaption = defineComponent({
  name: 'XhHierarchyChartCaption',
  setup(_, { slots }) {
    const ctx = useHierarchyChartContext()
    return () => h('figcaption', ctx.api.value.getCaptionProps() as Record<string, unknown>, slots.default?.())
  },
})

/** 下钻路径：从最顶层到当前的根，每一项是一个按钮；还在最顶层时收起。 */
export const XhHierarchyChartPath = defineComponent({
  name: 'XhHierarchyChartPath',
  setup() {
    const ctx = useHierarchyChartContext()
    return () => {
      const api = ctx.api.value
      return h('nav', api.getPathProps() as Record<string, unknown>, api.path.map(item =>
        h('button', { ...api.getPathItemProps(item) as Record<string, unknown>, key: item.key ?? '' }, item.name)))
    }
  },
})

/** 图例：按值着色时每个看得见的层一条色阶（名字、低端的值、渐变条、高端的值）；其余着色方式收起。 */
export const XhHierarchyChartLegend = defineComponent({
  name: 'XhHierarchyChartLegend',
  setup() {
    const ctx = useHierarchyChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getLegendProps() as Record<string, unknown>, api.legendScales.map(scale =>
        h('div', { ...api.getLegendScaleProps(scale) as Record<string, unknown>, key: scale.level }, [
          h('span', api.getLegendScaleNameProps() as Record<string, unknown>, scale.name),
          h('span', api.getLegendScaleValueProps('min') as Record<string, unknown>, scale.min),
          h('span', api.getLegendScaleBarProps() as Record<string, unknown>),
          h('span', api.getLegendScaleValueProps('max') as Record<string, unknown>, scale.max),
        ])))
    }
  },
})

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export const XhHierarchyChartViewport = defineComponent({
  name: 'XhHierarchyChartViewport',
  setup(_, { slots }) {
    const ctx = useHierarchyChartContext()
    return () => h('div', {
      ...ctx.api.value.getViewportProps() as Record<string, unknown>,
      ref: (el: unknown) => { ctx.viewportRef.value = el as HTMLElement },
    }, slots.default?.())
  },
})

/** 绘图区：节点由浅到深，名字与分组标题在上，焦点环最上。 */
export const XhHierarchyChartPlot = defineComponent({
  name: 'XhHierarchyChartPlot',
  setup() {
    const ctx = useHierarchyChartContext()
    return () => {
      const api = ctx.api.value
      const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
      return h('svg', api.getPlotProps() as Record<string, unknown>, marks.map(mark => renderMark(api, mark)))
    }
  },
})

/** 提示框：缺省内容按激活的节点生成，作用域插槽可替换。 */
export const XhHierarchyChartTooltip = defineComponent({
  name: 'XhHierarchyChartTooltip',
  slots: Object as SlotsType<{
    default?: (props: HierarchyChartTooltipSlotProps) => VNode[]
  }>,
  setup(_, { slots }) {
    const ctx = useHierarchyChartContext()
    return () => {
      const api = ctx.api.value
      return h('div', api.getTooltipProps() as Record<string, unknown>, slots.default
        ? slots.default({ active: api.active, tooltip: api.tooltip })
        : renderTooltipContent(api))
    }
  },
})

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export const XhHierarchyChartEmpty = defineComponent({
  name: 'XhHierarchyChartEmpty',
  setup(_, { slots }) {
    const ctx = useHierarchyChartContext()
    return () => h('div', ctx.api.value.getEmptyProps() as Record<string, unknown>, slots.default?.() ?? ctx.api.value.emptyText)
  },
})

/** 根：铺开缺省结构或交给默认插槽，并在末尾追加摘要与数据表。 */
export const XhHierarchyChartRoot = defineComponent({
  name: 'XhHierarchyChartRoot',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    data: { type: [Object, Array] as PropType<ChartRow | readonly ChartRow[]> },
    childrenField: { type: String },
    idField: { type: String },
    parentField: { type: String },
    nameField: { type: String },
    valueField: { type: String },
    layout: { type: String as PropType<HierarchyLayout> },
    tile: { type: String as PropType<HierarchyTile> },
    depth: { type: Number },
    colorBy: { type: String as PropType<HierarchyColorBy> },
    palette: { type: String as PropType<ChartPalette> },
    orientation: { type: String as PropType<'vertical' | 'horizontal'> },
    rootKey: { type: [String, null] as PropType<string | null> },
    defaultRootKey: { type: [String, null] as PropType<string | null> },
    format: { type: [Object, Function] as PropType<NumberFormatSpec | ((value: number) => string)> },
    activeKey: { type: [String, Number, Date, null] as PropType<ChartKey | null> },
    pending: { type: Boolean, default: undefined },
    animated: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<HierarchyChartTranslations>> },
  },
  // root-key-change / active-key-change 携带 details；update:* 携带裸值，支持 v-model
  emits: {
    'root-key-change': (_details: PayloadOf<HierarchyChartProps, 'onRootKeyChange'>) => true,
    'update:rootKey': (_key: PayloadOf<HierarchyChartProps, 'onRootKeyChange'>['rootKey']) => true,
    'active-key-change': (_details: PayloadOf<HierarchyChartProps, 'onActiveKeyChange'>) => true,
    'update:activeKey': (_key: PayloadOf<HierarchyChartProps, 'onActiveKeyChange'>['activeKey']) => true,
    'datum-active': (_details: PayloadOf<HierarchyChartProps, 'onDatumActive'>) => true,
    'datum-press': (_details: PayloadOf<HierarchyChartProps, 'onDatumPress'>) => true,
  },
  slots: Object as SlotsType<{
    /** 自行摆放部件；不写时铺开缺省结构：下钻路径、视口（绘图区与空态）、提示框。 */
    default?: (props: HierarchyChartRootSlotProps) => VNode[]
    /** 缺省结构里的标题内容。 */
    caption?: () => VNode[]
    /** 缺省结构里的提示框内容。 */
    tooltip?: (props: HierarchyChartTooltipSlotProps) => VNode[]
    /** 缺省结构里的空态内容。 */
    empty?: () => VNode[]
  }>,
  setup(props, { slots, emit }) {
    const ctx = useHierarchyChart(withXhConfig('hierarchy-chart', props) as HierarchyChartProps, {
      onRootKeyChange: (details) => {
        emit('root-key-change', details)
        emit('update:rootKey', details.rootKey)
      },
      onActiveKeyChange: (details) => {
        emit('active-key-change', details)
        emit('update:activeKey', details.activeKey)
      },
      onDatumActive: details => emit('datum-active', details),
      onDatumPress: details => emit('datum-press', details),
    })
    provideHierarchyChart(ctx)
    return () => {
      const api = ctx.api.value
      const content = slots.default
        ? slots.default({
            active: api.active,
            tooltip: api.tooltip,
            empty: api.empty,
            table: api.table,
            path: api.path,
            rootKey: api.rootKey,
            activeKey: api.activeKey,
            drillTo: api.drillTo,
            drillUp: api.drillUp,
            setFocusedDatum: api.setFocusedDatum,
          })
        : [
            ...(slots.caption ? [h(XhHierarchyChartCaption, null, () => slots.caption?.())] : []),
            h(XhHierarchyChartPath),
            h(XhHierarchyChartLegend),
            // 空态放进视口：叠在绘图区上，标题与路径不被盖住
            h(XhHierarchyChartViewport, null, () => [
              h(XhHierarchyChartPlot),
              h(XhHierarchyChartEmpty, null, slots.empty ? () => slots.empty?.() : undefined),
            ]),
            h(XhHierarchyChartTooltip, null, slots.tooltip ? { default: slots.tooltip } : undefined),
          ]
      return h('figure', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as HTMLElement },
      }, [...content, ...renderA11y(api)])
    }
  },
})
