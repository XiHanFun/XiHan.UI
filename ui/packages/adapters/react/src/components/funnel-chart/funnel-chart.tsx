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
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { FunnelChartProvider, useFunnelChartContext } from './context'
import { useFunnelChart } from './use-funnel-chart'

type FunnelChartProps = FunnelChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type FunnelChartRootSlotProps = Pick<FunnelChartApi, 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框内容的载荷：激活的阶段与缺省的内容模型。 */
export interface FunnelChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: FunnelTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: FunnelChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：头部是阶段名，下面是数值与两种转化率。 */
function TooltipContent({ api }: { api: FunnelChartApi }): ReactNode {
  const tooltip = api.tooltip
  if (!tooltip)
    return null
  return (
    <>
      <div {...api.getTooltipHeaderProps() as Record<string, unknown>}>{tooltip.header}</div>
      {tooltip.rows.map(row => (
        <div key={row.key} {...api.getTooltipRowProps(row) as Record<string, unknown>}>
          <span {...api.getTooltipSwatchProps(row) as Record<string, unknown>} />
          <span {...api.getTooltipValueProps(row) as Record<string, unknown>}>{row.value}</span>
          <span {...api.getTooltipNameProps(row) as Record<string, unknown>}>{row.name}</span>
        </div>
      ))}
    </>
  )
}

/** 摘要与数据表：由根自动生成、视觉隐藏，保证无障碍等价物始终存在。 */
function A11y({ api }: { api: FunnelChartApi }): ReactNode {
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

export interface XhFunnelChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhFunnelChartCaption({ children, ...rest }: XhFunnelChartCaptionProps): ReactNode {
  const { api } = useFunnelChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhFunnelChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export function XhFunnelChartViewport({ children, ...rest }: XhFunnelChartViewportProps): ReactNode {
  const ctx = useFunnelChartContext()
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

export interface XhFunnelChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/** 绘图区：阶段在下，阶段标签与转化率在上，焦点环最上。 */
export function XhFunnelChartPlot(props: XhFunnelChartPlotProps): ReactNode {
  const { api } = useFunnelChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhFunnelChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的阶段与缺省的内容模型。 */
  children?: SlotChildren<FunnelChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的阶段生成，函数式 children 可替换。 */
export function XhFunnelChartTooltip({ children, ...rest }: XhFunnelChartTooltipProps): ReactNode {
  const { api } = useFunnelChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhFunnelChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export function XhFunnelChartEmpty({ children, ...rest }: XhFunnelChartEmptyProps): ReactNode {
  const { api } = useFunnelChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}

export interface XhFunnelChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 数据：对象数组，按阶段的先后排好，每行一个阶段。 */
  data?: readonly ChartRow[]
  /** 阶段名所在的字段。 */
  nameField?: string
  /** 数值所在的字段。 */
  valueField?: string
  /** 阶段的形状，缺省 trapezoid。 */
  shape?: FunnelShape
  /** 阶段的对齐，缺省 center。 */
  align?: FunnelAlign
  /** 排列方向，缺省 down；up 即金字塔。 */
  direction?: FunnelDirection
  /** 转化率的基准，缺省 previous。 */
  conversion?: FunnelConversion
  /** 阶段标签，缺省 inside。 */
  labels?: FunnelLabels
  /** 顺序色阶的色板。 */
  palette?: ChartPalette
  /** 数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 隐藏的阶段（受控）。 */
  hiddenSeries?: string[]
  /** 初始隐藏的阶段（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 激活的键（受控）：与别的图联动时是阶段名。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  /** 播放过渡动画，缺省 true；false 时直接画终态。 */
  animated?: boolean
  locale?: string
  translations?: Partial<FunnelChartTranslations>
  onHiddenSeriesChange?: FunnelChartProps['onHiddenSeriesChange']
  onActiveKeyChange?: FunnelChartProps['onActiveKeyChange']
  onDatumActive?: FunnelChartProps['onDatumActive']
  onDatumPress?: FunnelChartProps['onDatumPress']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: FunnelChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：视口（绘图区与空态）、提示框。 */
  children?: SlotChildren<FunnelChartRootSlotProps>
}

export function XhFunnelChartRoot({
  data,
  nameField,
  valueField,
  shape,
  align,
  direction,
  conversion,
  labels,
  palette,
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
}: XhFunnelChartRootProps): ReactNode {
  const ctx = useFunnelChart(withXhConfig('funnel-chart', {
    data,
    nameField,
    valueField,
    shape,
    align,
    direction,
    conversion,
    labels,
    palette,
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
  }) as FunnelChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhFunnelChartCaption>{caption}</XhFunnelChartCaption>}
          {/* 空态放进视口：叠在绘图区上，标题与图例不被盖住 */}
          <XhFunnelChartViewport>
            <XhFunnelChartPlot />
            <XhFunnelChartEmpty>{empty}</XhFunnelChartEmpty>
          </XhFunnelChartViewport>
          <XhFunnelChartTooltip>{renderTooltip}</XhFunnelChartTooltip>
        </>
      )
    : renderSlot(children, {
        active: api.active,
        tooltip: api.tooltip,
        empty: api.empty,
        hiddenSeries: api.hiddenSeries,
        activeKey: api.activeKey,
        toggleSeries: api.toggleSeries,
        setFocusedDatum: api.setFocusedDatum,
      })
  return (
    <FunnelChartProvider value={ctx}>
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
    </FunnelChartProvider>
  )
}

XhFunnelChartRoot.xhEvents = ['hidden-series-change', 'active-key-change', 'datum-active', 'datum-press'] as const
