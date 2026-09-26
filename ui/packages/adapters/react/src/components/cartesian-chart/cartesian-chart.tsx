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
  CartesianLegendItem,
  CartesianOrientation,
  CartesianSeries,
  CartesianTooltipModel,
  CartesianTrigger,
  ChartDatumDetails,
  ChartKey,
  ChartMark,
  ChartRow,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { CartesianChartProvider, useCartesianChartContext } from './context'
import { useCartesianChart } from './use-cartesian-chart'

type CartesianChartProps = CartesianChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type CartesianChartRootSlotProps = Pick<CartesianChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框内容的载荷：激活的数据（axis 模式带 items）与缺省的内容模型。 */
export interface CartesianChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: CartesianTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；分组递归画子标记，文字标记带文字。 */
function renderMark(api: CartesianChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：头部是自变量，每个系列一行（色标、数值、系列名）。 */
function TooltipContent({ api }: { api: CartesianChartApi }): ReactNode {
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
function A11y({ api }: { api: CartesianChartApi }): ReactNode {
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
            // 数据表的行没有稳定身份，次序即身份
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

export interface XhCartesianChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 数据：对象数组，系列用字段名把列映射到通道。 */
  data?: readonly ChartRow[]
  series?: readonly CartesianSeries[]
  xAxis?: CartesianAxis
  yAxis?: CartesianAxis
  /** 朝向，缺省 vertical。 */
  orientation?: CartesianOrientation
  /** 提示框汇报什么，缺省 axis。 */
  trigger?: CartesianTrigger
  /** 隐藏的系列（受控）。 */
  hiddenSeries?: string[]
  /** 初始隐藏的系列（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 激活的自变量键（受控）。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  locale?: string
  translations?: Partial<CartesianChartTranslations>
  onHiddenSeriesChange?: CartesianChartProps['onHiddenSeriesChange']
  onActiveKeyChange?: CartesianChartProps['onActiveKeyChange']
  onDatumActive?: CartesianChartProps['onDatumActive']
  onDatumPress?: CartesianChartProps['onDatumPress']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: CartesianChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
  children?: SlotChildren<CartesianChartRootSlotProps>
}

export function XhCartesianChartRoot({
  data,
  series,
  xAxis,
  yAxis,
  orientation,
  trigger,
  hiddenSeries,
  defaultHiddenSeries,
  activeKey,
  pending,
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
}: XhCartesianChartRootProps): ReactNode {
  const ctx = useCartesianChart(withXhConfig('cartesian-chart', {
    data,
    series,
    xAxis,
    yAxis,
    orientation,
    trigger,
    hiddenSeries,
    defaultHiddenSeries,
    activeKey,
    pending,
    locale,
    translations,
    onHiddenSeriesChange,
    onActiveKeyChange,
    onDatumActive,
    onDatumPress,
  }) as CartesianChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhCartesianChartCaption>{caption}</XhCartesianChartCaption>}
          <XhCartesianChartLegend />
          {/* 空态放进视口：叠在绘图区上居中，标题与图例不被盖住 */}
          <XhCartesianChartViewport>
            <XhCartesianChartPlot />
            <XhCartesianChartEmpty>{empty}</XhCartesianChartEmpty>
          </XhCartesianChartViewport>
          <XhCartesianChartTooltip>{renderTooltip}</XhCartesianChartTooltip>
        </>
      )
    : renderSlot(children, {
        legendItems: api.legendItems,
        active: api.active,
        tooltip: api.tooltip,
        empty: api.empty,
        hiddenSeries: api.hiddenSeries,
        activeKey: api.activeKey,
        toggleSeries: api.toggleSeries,
        setFocusedDatum: api.setFocusedDatum,
      })
  return (
    <CartesianChartProvider value={ctx}>
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
    </CartesianChartProvider>
  )
}

XhCartesianChartRoot.xhEvents = ['hidden-series-change', 'active-key-change', 'datum-active', 'datum-press'] as const

export interface XhCartesianChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhCartesianChartCaption({ children, ...rest }: XhCartesianChartCaptionProps): ReactNode {
  const { api } = useCartesianChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhCartesianChartLegendProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 图例：项由组件按系列生成；只有一个系列时整条收起。 */
export function XhCartesianChartLegend(props: XhCartesianChartLegendProps): ReactNode {
  const { api } = useCartesianChartContext()
  return (
    <div {...mergeReactProps(api.getLegendProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.legendItems.map(item => <LegendItem key={item.id} api={api} item={item} />)}
    </div>
  )
}

/** 图例项：焦点与指针进出是不冒泡的事件，改挂原生监听器。 */
function LegendItem({ api, item }: { api: CartesianChartApi, item: CartesianLegendItem }): ReactNode {
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

export interface XhCartesianChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定、含坐标轴带。 */
export function XhCartesianChartViewport({ children, ...rest }: XhCartesianChartViewportProps): ReactNode {
  const ctx = useCartesianChartContext()
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

export interface XhCartesianChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/**
 * 绘图区：按场景生成网格、坐标轴、系列与前景层。
 * 次序是 back → under → data → over：类目带淡底与十字准线在数据之下，激活的点与焦点环在数据之上。
 */
export function XhCartesianChartPlot(props: XhCartesianChartPlotProps): ReactNode {
  const { api } = useCartesianChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [
    ...api.scene.layers.back,
    ...api.overlay.under,
    ...api.scene.layers.data,
    ...api.overlay.over,
  ]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhCartesianChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的数据与缺省的内容模型。 */
  children?: SlotChildren<CartesianChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的数据生成，函数式 children 可替换。 */
export function XhCartesianChartTooltip({ children, ...rest }: XhCartesianChartTooltipProps): ReactNode {
  const { api } = useCartesianChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhCartesianChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export function XhCartesianChartEmpty({ children, ...rest }: XhCartesianChartEmptyProps): ReactNode {
  const { api } = useCartesianChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}
