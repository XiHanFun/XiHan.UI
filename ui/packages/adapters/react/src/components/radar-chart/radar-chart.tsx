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
  RadarLegendItem,
  RadarScale,
  RadarShape,
  RadarTooltipModel,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { RadarChartProvider, useRadarChartContext } from './context'
import { useRadarChart } from './use-radar-chart'

type RadarChartProps = RadarChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type RadarChartRootSlotProps = Pick<RadarChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum' | 'table'>

/** 提示框内容的载荷：激活的顶点与缺省的内容模型。 */
export interface RadarChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: RadarTooltipModel | null
}

/** 纹理定义：绘图区的第一个子节点，每种纹理一个 pattern、里面一条线。 */
function renderDefs(api: RadarChartApi): ReactNode {
  return createElement('defs', api.getDefsProps() as Record<string, unknown>, api.patterns.map(pattern =>
    createElement('pattern', { ...api.getPatternProps(pattern) as Record<string, unknown>, key: pattern.id }, createElement('path', api.getPatternLineProps(pattern) as Record<string, unknown>))))
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: RadarChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：头部是指标名，每个可见实体一行（色标、数值、实体名）。 */
function TooltipContent({ api }: { api: RadarChartApi }): ReactNode {
  const tooltip = api.tooltip
  if (!tooltip)
    return null
  return (
    <>
      <div {...api.getTooltipHeaderProps() as Record<string, unknown>}>{tooltip.header}</div>
      {tooltip.rows.map(row => (
        <div key={row.seriesId} {...api.getTooltipRowProps(row) as Record<string, unknown>}>
          <span {...api.getTooltipSwatchProps(row) as Record<string, unknown>} />
          <span {...api.getTooltipValueProps(row) as Record<string, unknown>}>{row.value}</span>
          <span {...api.getTooltipNameProps(row) as Record<string, unknown>}>{row.name}</span>
        </div>
      ))}
    </>
  )
}

/** 摘要与数据表：由根自动生成、视觉隐藏，保证无障碍等价物始终存在。 */
function A11y({ api }: { api: RadarChartApi }): ReactNode {
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

export interface XhRadarChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhRadarChartCaption({ children, ...rest }: XhRadarChartCaptionProps): ReactNode {
  const { api } = useRadarChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhRadarChartLegendProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 图例：项由组件按实体生成；只有一个实体时整条收起。 */
export function XhRadarChartLegend(props: XhRadarChartLegendProps): ReactNode {
  const { api } = useRadarChartContext()
  return (
    <div {...mergeReactProps(api.getLegendProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.legendItems.map(item => <LegendItem key={item.id} api={api} item={item} />)}
    </div>
  )
}

/** 图例项：焦点与指针进出是不冒泡的事件，改挂原生监听器。 */
function LegendItem({ api, item }: { api: RadarChartApi, item: RadarLegendItem }): ReactNode {
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

export interface XhRadarChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export function XhRadarChartViewport({ children, ...rest }: XhRadarChartViewportProps): ReactNode {
  const ctx = useRadarChartContext()
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

export interface XhRadarChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/** 绘图区：网格与指标名在下，准线其次，各实体的面积、轮廓与顶点再上，焦点环最上。 */
export function XhRadarChartPlot(props: XhRadarChartPlotProps): ReactNode {
  const { api } = useRadarChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [...api.scene.layers.back, ...api.overlay.under, ...api.scene.layers.data, ...api.overlay.over]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {renderDefs(api)}
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhRadarChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的顶点与缺省的内容模型。 */
  children?: SlotChildren<RadarChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的指标生成，函数式 children 可替换。 */
export function XhRadarChartTooltip({ children, ...rest }: XhRadarChartTooltipProps): ReactNode {
  const { api } = useRadarChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhRadarChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export function XhRadarChartEmpty({ children, ...rest }: XhRadarChartEmptyProps): ReactNode {
  const { api } = useRadarChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}

export interface XhRadarChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 数据：对象数组，每行一个实体（一个系列）。 */
  data?: readonly ChartRow[]
  /** 实体名所在的字段。 */
  nameField?: string
  /** 指标：3–10 个，自 12 点方向顺时针排开。 */
  indicators?: readonly RadarIndicator[]
  /** 网格形状，缺省 polygon。 */
  shape?: RadarShape
  /** 轮廓里铺一层系列色的淡洗，缺省 true。 */
  area?: boolean
  /** 量程，缺省 independent。 */
  scale?: RadarScale
  /** 轮廓的画法，缺省 linear。 */
  curve?: RadarCurve
  /** 网格分几圈，2–10，缺省 4。 */
  rings?: number
  /** 在 12 点方向那根轴上写出每一圈的数值；只在各指标量程相同时写。 */
  ringLabels?: boolean
  /** 数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 隐藏的实体（受控）。 */
  hiddenSeries?: string[]
  /** 初始隐藏的实体（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 激活的键（受控）：与别的图联动时是指标的 key。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  /** 播放过渡动画，缺省 true；false 时直接画终态。 */
  animated?: boolean
  locale?: string
  translations?: Partial<RadarChartTranslations>
  onHiddenSeriesChange?: RadarChartProps['onHiddenSeriesChange']
  onActiveKeyChange?: RadarChartProps['onActiveKeyChange']
  onDatumActive?: RadarChartProps['onDatumActive']
  onDatumPress?: RadarChartProps['onDatumPress']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: RadarChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
  children?: SlotChildren<RadarChartRootSlotProps>
}

export function XhRadarChartRoot({
  data,
  nameField,
  indicators,
  shape,
  area,
  scale,
  curve,
  rings,
  ringLabels,
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
  caption,
  renderTooltip,
  empty,
  children,
  ...rest
}: XhRadarChartRootProps): ReactNode {
  const ctx = useRadarChart(withXhConfig('radar-chart', {
    data,
    nameField,
    indicators,
    shape,
    area,
    scale,
    curve,
    rings,
    ringLabels,
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
  }) as RadarChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhRadarChartCaption>{caption}</XhRadarChartCaption>}
          <XhRadarChartLegend />
          {/* 空态放进视口：叠在绘图区上，标题与图例不被盖住 */}
          <XhRadarChartViewport>
            <XhRadarChartPlot />
            <XhRadarChartEmpty>{empty}</XhRadarChartEmpty>
          </XhRadarChartViewport>
          <XhRadarChartTooltip>{renderTooltip}</XhRadarChartTooltip>
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
        toggleSeries: api.toggleSeries,
        setFocusedDatum: api.setFocusedDatum,
      })
  return (
    <RadarChartProvider value={ctx}>
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
    </RadarChartProvider>
  )
}

XhRadarChartRoot.xhEvents = ['hidden-series-change', 'active-key-change', 'datum-active', 'datum-press'] as const
