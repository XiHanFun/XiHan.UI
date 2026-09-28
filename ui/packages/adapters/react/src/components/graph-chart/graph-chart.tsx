/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 graph chart 相关实现。

import type {
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  GraphChartApi,
  GraphChartSchema,
  GraphChartTranslations,
  GraphLayout,
  GraphLegendItem,
  GraphLinkDatum,
  GraphNodeDatum,
  GraphTooltipModel,
  GraphView,
  NumberFormatSpec,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { GraphChartProvider, useGraphChartContext } from './context'
import { useGraphChart } from './use-graph-chart'

type GraphChartProps = GraphChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type GraphChartRootSlotProps = Pick<GraphChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'view' | 'toggleSeries' | 'zoomBy' | 'resetView' | 'setFocusedDatum' | 'table'>

/** 提示框内容的载荷：激活的节点与缺省的内容模型。 */
export interface GraphChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: GraphTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: GraphChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：头部是节点名，下面是数值与连线数。 */
function TooltipContent({ api }: { api: GraphChartApi }): ReactNode {
  const tooltip = api.tooltip
  if (!tooltip)
    return null
  return (
    <>
      <div {...api.getTooltipHeaderProps() as Record<string, unknown>}>{tooltip.header}</div>
      {tooltip.rows.map(row => (
        <div key={row.key} {...api.getTooltipRowProps(row) as Record<string, unknown>}>
          <span {...api.getTooltipValueProps(row) as Record<string, unknown>}>{row.value}</span>
          <span {...api.getTooltipNameProps(row) as Record<string, unknown>}>{row.name}</span>
        </div>
      ))}
    </>
  )
}

/** 摘要与数据表：由根自动生成、视觉隐藏，保证无障碍等价物始终存在。 */
function A11y({ api }: { api: GraphChartApi }): ReactNode {
  const { columns, rows } = api.table
  return (
    <>
      <p {...api.getSummaryProps() as Record<string, unknown>}>{api.summary}</p>
      <table {...api.getTableProps() as Record<string, unknown>}>
        <caption>{api.tableCaption}</caption>
        <thead>
          <tr>{columns.map(column => <th key={column.id} scope="col">{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.cells.map((cell, c) => c === 0
                ? <th key={c} scope="row">{cell.text}</th>
                : <td key={c}>{cell.text}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export interface XhGraphChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhGraphChartCaption({ children, ...rest }: XhGraphChartCaptionProps): ReactNode {
  const { api } = useGraphChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhGraphChartLegendProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 图例：项由组件按分组生成；不到两组时整条收起。 */
export function XhGraphChartLegend(props: XhGraphChartLegendProps): ReactNode {
  const { api } = useGraphChartContext()
  return (
    <div {...mergeReactProps(api.getLegendProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.legendItems.map(item => <LegendItem key={item.id} api={api} item={item} />)}
    </div>
  )
}

/** 图例项：焦点与指针进出是不冒泡的事件，改挂原生监听器。 */
function LegendItem({ api, item }: { api: GraphChartApi, item: GraphLegendItem }): ReactNode {
  const bind = useNativeEvents(
    api.getLegendItemProps(item) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  return (
    <button {...mergeReactProps(bind.attrs, { ref: bind.ref })}>
      <span {...api.getLegendSwatchProps(item) as Record<string, unknown>} />
      <span {...api.getLegendLabelProps(item) as Record<string, unknown>}>{item.name}</span>
    </button>
  )
}

export interface XhGraphChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export function XhGraphChartViewport({ children, ...rest }: XhGraphChartViewportProps): ReactNode {
  const ctx = useGraphChartContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getViewportProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLElement | null) => { ctx.viewportRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhGraphChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/** 绘图区：连线在下，箭头其上，节点再上，节点名与焦点环最上。 */
export function XhGraphChartPlot(props: XhGraphChartPlotProps): ReactNode {
  const { api } = useGraphChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhGraphChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的节点与缺省的内容模型。 */
  children?: SlotChildren<GraphChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的节点生成，函数式 children 可替换。 */
export function XhGraphChartTooltip({ children, ...rest }: XhGraphChartTooltipProps): ReactNode {
  const { api } = useGraphChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhGraphChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export function XhGraphChartEmpty({ children, ...rest }: XhGraphChartEmptyProps): ReactNode {
  const { api } = useGraphChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}

export interface XhGraphChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 节点：身份、名字、分组与数值。 */
  nodes?: readonly GraphNodeDatum[]
  /** 连线：两端节点的身份与可选的权重。 */
  links?: readonly GraphLinkDatum[]
  /** 布局，缺省 force。 */
  layout?: GraphLayout
  /** 树与径向树的根；不写时取没有入边的节点。 */
  root?: string
  /** 有向：连线的目标一端画箭头。 */
  directed?: boolean
  /** 力导布局下可以拖动节点，缺省 true。 */
  draggableNodes?: boolean
  /** 画布可以平移缩放，缺省 false。 */
  zoom?: boolean
  /** 画布视图：给了即受控，写入只发 onViewChange。 */
  view?: GraphView
  defaultView?: GraphView
  /** 数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 隐藏的分组（受控）。 */
  hiddenSeries?: string[]
  /** 初始隐藏的分组（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 激活的键（受控）：与别的图联动时是节点的身份。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  /** 播放过渡动画，缺省 true；false 时直接画终态。 */
  animated?: boolean
  locale?: string
  translations?: Partial<GraphChartTranslations>
  onHiddenSeriesChange?: GraphChartProps['onHiddenSeriesChange']
  onActiveKeyChange?: GraphChartProps['onActiveKeyChange']
  onDatumActive?: GraphChartProps['onDatumActive']
  onDatumPress?: GraphChartProps['onDatumPress']
  /** 画布视图变化（缩放、平移、复位）。 */
  onViewChange?: GraphChartProps['onViewChange']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: GraphChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
  children?: SlotChildren<GraphChartRootSlotProps>
}

export function XhGraphChartRoot({
  nodes,
  links,
  layout,
  root,
  directed,
  draggableNodes,
  zoom,
  view,
  defaultView,
  format,
  hiddenSeries,
  defaultHiddenSeries,
  activeKey,
  pending,
  animated,
  locale,
  translations,
  onHiddenSeriesChange,
  onActiveKeyChange,
  onDatumActive,
  onDatumPress,
  onViewChange,
  caption,
  renderTooltip,
  empty,
  children,
  ...rest
}: XhGraphChartRootProps): ReactNode {
  const ctx = useGraphChart(withXhConfig('graph-chart', {
    nodes,
    links,
    layout,
    root,
    directed,
    draggableNodes,
    zoom,
    view,
    defaultView,
    format,
    hiddenSeries,
    defaultHiddenSeries,
    activeKey,
    pending,
    animated,
    locale,
    translations,
    onHiddenSeriesChange,
    onActiveKeyChange,
    onDatumActive,
    onDatumPress,
    onViewChange,
  }) as GraphChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhGraphChartCaption>{caption}</XhGraphChartCaption>}
          <XhGraphChartLegend />
          {/* 空态放进视口：叠在绘图区上，标题与图例不被盖住 */}
          <XhGraphChartViewport>
            <XhGraphChartPlot />
            <XhGraphChartEmpty>{empty}</XhGraphChartEmpty>
          </XhGraphChartViewport>
          <XhGraphChartTooltip>{renderTooltip}</XhGraphChartTooltip>
        </>
      )
    : renderSlot(children, {
        legendItems: api.legendItems,
        active: api.active,
        tooltip: api.tooltip,
        empty: api.empty,
        table: api.table,
        hiddenSeries: api.hiddenSeries,
        activeKey: api.activeKey,
        view: api.view,
        toggleSeries: api.toggleSeries,
        zoomBy: api.zoomBy,
        resetView: api.resetView,
        setFocusedDatum: api.setFocusedDatum,
      })
  return (
    <GraphChartProvider value={ctx}>
      <figure
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
        <A11y api={api} />
      </figure>
    </GraphChartProvider>
  )
}

XhGraphChartRoot.xhEvents = ['hidden-series-change', 'active-key-change', 'datum-active', 'datum-press', 'view-change'] as const
