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
  PieLegendItem,
  PieSort,
  PieSweep,
  PieTooltipModel,
  PieVariant,
} from '@xihan-ui/headless'
import type { NumberFormatSpec } from '@xihan-ui/viz'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { PieChartProvider, usePieChartContext } from './context'
import { usePieChart } from './use-pie-chart'

type PieChartProps = PieChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type PieChartRootSlotProps = Pick<PieChartApi, 'legendItems' | 'active' | 'tooltip' | 'center' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum'>

/** 提示框内容的载荷：激活的扇区与缺省的内容模型。 */
export interface PieChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: PieTooltipModel | null
}

/** 环形中心内容的载荷：可见扇区的合计与说明文字，以及激活的扇区。 */
export interface PieChartCenterSlotProps {
  center: PieChartApi['center']
  active: ChartDatumDetails | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: PieChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：头部是扇区名，下面是数值与占比；「其他」另列出被合并的各项。 */
function TooltipContent({ api }: { api: PieChartApi }): ReactNode {
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
function A11y({ api }: { api: PieChartApi }): ReactNode {
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

export interface XhPieChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhPieChartCaption({ children, ...rest }: XhPieChartCaptionProps): ReactNode {
  const { api } = usePieChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhPieChartLegendProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 图例：项由组件按扇区生成；只有一个扇区时整条收起。 */
export function XhPieChartLegend(props: XhPieChartLegendProps): ReactNode {
  const { api } = usePieChartContext()
  return (
    <div {...mergeReactProps(api.getLegendProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.legendItems.map(item => <LegendItem key={item.id} api={api} item={item} />)}
    </div>
  )
}

/** 图例项：焦点与指针进出是不冒泡的事件，改挂原生监听器。 */
function LegendItem({ api, item }: { api: PieChartApi, item: PieLegendItem }): ReactNode {
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

export interface XhPieChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export function XhPieChartViewport({ children, ...rest }: XhPieChartViewportProps): ReactNode {
  const ctx = usePieChartContext()
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

export interface XhPieChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/** 绘图区：扇区在下，引导线与标签在上，焦点环最上。 */
export function XhPieChartPlot(props: XhPieChartPlotProps): ReactNode {
  const { api } = usePieChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhPieChartCenterProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到合计与激活的扇区。 */
  children?: SlotChildren<PieChartCenterSlotProps>
}

/** 环形中心：缺省显示可见扇区的合计，函数式 children 可替换。 */
export function XhPieChartCenter({ children, ...rest }: XhPieChartCenterProps): ReactNode {
  const { api } = usePieChartContext()
  return (
    <div {...mergeReactProps(api.getCenterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? (
            <>
              <span {...api.getCenterValueProps() as Record<string, unknown>}>{api.center.value}</span>
              <span {...api.getCenterLabelProps() as Record<string, unknown>}>{api.center.label}</span>
            </>
          )
        : renderSlot(children, { center: api.center, active: api.active })}
    </div>
  )
}

export interface XhPieChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的扇区与缺省的内容模型。 */
  children?: SlotChildren<PieChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的扇区生成，函数式 children 可替换。 */
export function XhPieChartTooltip({ children, ...rest }: XhPieChartTooltipProps): ReactNode {
  const { api } = usePieChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhPieChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的扇区时显示，缺省文字取文案。 */
export function XhPieChartEmpty({ children, ...rest }: XhPieChartEmptyProps): ReactNode {
  const { api } = usePieChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}

export interface XhPieChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 数据：对象数组，每行一个扇区。 */
  data?: readonly ChartRow[]
  /** 扇区名所在的字段。 */
  nameField?: string
  /** 数值所在的字段。 */
  valueField?: string
  /** 形态，缺省 donut。 */
  variant?: PieVariant
  /** 南丁格尔玫瑰图：角度均分，半径按数值。 */
  rose?: boolean
  /** 扫过的角度，缺省 full。 */
  sweep?: PieSweep
  /** 扇区次序，缺省 descending。 */
  sort?: PieSort
  /** 最多保留几个扇区（含「其他」），缺省 6。 */
  maxSlices?: number
  /** 扇区标签，缺省 outside。 */
  labels?: PieLabels
  /** 数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 隐藏的扇区（受控）。 */
  hiddenSeries?: string[]
  /** 初始隐藏的扇区（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 激活的键（受控）：与别的图联动时是类目名。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  locale?: string
  translations?: Partial<PieChartTranslations>
  onHiddenSeriesChange?: PieChartProps['onHiddenSeriesChange']
  onActiveKeyChange?: PieChartProps['onActiveKeyChange']
  onDatumActive?: PieChartProps['onDatumActive']
  onDatumPress?: PieChartProps['onDatumPress']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的环形中心内容。 */
  renderCenter?: (props: PieChartCenterSlotProps) => ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: PieChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区、环形中心与空态）、提示框。 */
  children?: SlotChildren<PieChartRootSlotProps>
}

export function XhPieChartRoot({
  data,
  nameField,
  valueField,
  variant,
  rose,
  sweep,
  sort,
  maxSlices,
  labels,
  format,
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
  renderCenter,
  renderTooltip,
  empty,
  children,
  ...rest
}: XhPieChartRootProps): ReactNode {
  const ctx = usePieChart(withXhConfig('pie-chart', {
    data,
    nameField,
    valueField,
    variant,
    rose,
    sweep,
    sort,
    maxSlices,
    labels,
    format,
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
  }) as PieChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhPieChartCaption>{caption}</XhPieChartCaption>}
          <XhPieChartLegend />
          {/* 环形中心与空态放进视口：叠在绘图区上，标题与图例不被盖住 */}
          <XhPieChartViewport>
            <XhPieChartPlot />
            <XhPieChartCenter>{renderCenter}</XhPieChartCenter>
            <XhPieChartEmpty>{empty}</XhPieChartEmpty>
          </XhPieChartViewport>
          <XhPieChartTooltip>{renderTooltip}</XhPieChartTooltip>
        </>
      )
    : renderSlot(children, {
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
  return (
    <PieChartProvider value={ctx}>
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
    </PieChartProvider>
  )
}

XhPieChartRoot.xhEvents = ['hidden-series-change', 'active-key-change', 'datum-active', 'datum-press'] as const
