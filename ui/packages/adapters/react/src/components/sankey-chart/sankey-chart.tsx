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
  SankeyLegendItem,
  SankeyLinkColor,
  SankeyLinkDatum,
  SankeyNodeAlign,
  SankeyNodeDatum,
  SankeyNodeSort,
  SankeyOrientation,
  SankeyTooltipModel,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { SankeyChartProvider, useSankeyChartContext } from './context'
import { useSankeyChart } from './use-sankey-chart'

type SankeyChartProps = SankeyChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type SankeyChartRootSlotProps = Pick<SankeyChartApi, 'legendItems' | 'active' | 'tooltip' | 'empty' | 'hiddenSeries' | 'activeKey' | 'toggleSeries' | 'setFocusedDatum' | 'table'>

/** 提示框内容的载荷：激活的节点或流带与缺省的内容模型。 */
export interface SankeyChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: SankeyTooltipModel | null
}

/** 渐变定义：绘图区的第一个子节点，linkColor="gradient" 时每条流带一个渐变、两端各一个色标。 */
function renderDefs(api: SankeyChartApi): ReactNode {
  return createElement('defs', api.getDefsProps() as Record<string, unknown>, api.gradients.map(gradient =>
    createElement('linearGradient', { ...api.getGradientProps(gradient) as Record<string, unknown>, key: gradient.id }, createElement('stop', api.getGradientStopProps(gradient, 'from') as Record<string, unknown>), createElement('stop', api.getGradientStopProps(gradient, 'to') as Record<string, unknown>))))
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: SankeyChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：节点写合计与流入流出的明细，流带写流量与占比。 */
function TooltipContent({ api }: { api: SankeyChartApi }): ReactNode {
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
function A11y({ api }: { api: SankeyChartApi }): ReactNode {
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

export interface XhSankeyChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhSankeyChartCaption({ children, ...rest }: XhSankeyChartCaptionProps): ReactNode {
  const { api } = useSankeyChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhSankeyChartLegendProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 图例：项由组件按分组生成；不到两组时整条收起。 */
export function XhSankeyChartLegend(props: XhSankeyChartLegendProps): ReactNode {
  const { api } = useSankeyChartContext()
  return (
    <div {...mergeReactProps(api.getLegendProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.legendItems.map(item => <LegendItem key={item.id} api={api} item={item} />)}
    </div>
  )
}

/** 图例项：焦点与指针进出是不冒泡的事件，改挂原生监听器。 */
function LegendItem({ api, item }: { api: SankeyChartApi, item: SankeyLegendItem }): ReactNode {
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

export interface XhSankeyChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export function XhSankeyChartViewport({ children, ...rest }: XhSankeyChartViewportProps): ReactNode {
  const ctx = useSankeyChartContext()
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

export interface XhSankeyChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/** 绘图区：渐变定义在最前，流带在下，节点其上，节点名再上，焦点环最上。 */
export function XhSankeyChartPlot(props: XhSankeyChartPlotProps): ReactNode {
  const { api } = useSankeyChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {renderDefs(api)}
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhSankeyChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的节点或流带与缺省的内容模型。 */
  children?: SlotChildren<SankeyChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的节点或流带生成，函数式 children 可替换。 */
export function XhSankeyChartTooltip({ children, ...rest }: XhSankeyChartTooltipProps): ReactNode {
  const { api } = useSankeyChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhSankeyChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export function XhSankeyChartEmpty({ children, ...rest }: XhSankeyChartEmptyProps): ReactNode {
  const { api } = useSankeyChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}

export interface XhSankeyChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 节点：身份、名字与分组；缺省按流带里出现的先后推断。 */
  nodes?: readonly SankeyNodeDatum[]
  /** 流带：源、目标与流量。 */
  links?: readonly SankeyLinkDatum[]
  /** 流向，缺省 horizontal。 */
  orientation?: SankeyOrientation
  /** 节点分列的方式，缺省 justify。 */
  nodeAlign?: SankeyNodeAlign
  /** 流带的颜色，缺省 neutral。 */
  linkColor?: SankeyLinkColor
  /** 列内次序，缺省 auto。 */
  nodeSort?: SankeyNodeSort
  /** 数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 隐藏的分组（受控）。 */
  hiddenSeries?: string[]
  /** 初始隐藏的分组（非受控）。 */
  defaultHiddenSeries?: string[]
  /** 激活的键（受控）：与别的图联动时是节点的身份或「源→目标」。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  /** 播放过渡动画，缺省 true；false 时直接画终态。 */
  animated?: boolean
  locale?: string
  translations?: Partial<SankeyChartTranslations>
  onHiddenSeriesChange?: SankeyChartProps['onHiddenSeriesChange']
  onActiveKeyChange?: SankeyChartProps['onActiveKeyChange']
  onDatumActive?: SankeyChartProps['onDatumActive']
  onDatumPress?: SankeyChartProps['onDatumPress']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: SankeyChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：图例、视口（绘图区与空态）、提示框。 */
  children?: SlotChildren<SankeyChartRootSlotProps>
}

export function XhSankeyChartRoot({
  nodes,
  links,
  orientation,
  nodeAlign,
  linkColor,
  nodeSort,
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
}: XhSankeyChartRootProps): ReactNode {
  const ctx = useSankeyChart(withXhConfig('sankey-chart', {
    nodes,
    links,
    orientation,
    nodeAlign,
    linkColor,
    nodeSort,
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
  }) as SankeyChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhSankeyChartCaption>{caption}</XhSankeyChartCaption>}
          <XhSankeyChartLegend />
          {/* 空态放进视口：叠在绘图区上，标题与图例不被盖住 */}
          <XhSankeyChartViewport>
            <XhSankeyChartPlot />
            <XhSankeyChartEmpty>{empty}</XhSankeyChartEmpty>
          </XhSankeyChartViewport>
          <XhSankeyChartTooltip>{renderTooltip}</XhSankeyChartTooltip>
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
    <SankeyChartProvider value={ctx}>
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
    </SankeyChartProvider>
  )
}

XhSankeyChartRoot.xhEvents = ['hidden-series-change', 'active-key-change', 'datum-active', 'datum-press'] as const
