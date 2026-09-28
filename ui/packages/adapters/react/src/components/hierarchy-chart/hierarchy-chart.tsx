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
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { createElement } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { HierarchyChartProvider, useHierarchyChartContext } from './context'
import { useHierarchyChart } from './use-hierarchy-chart'

type HierarchyChartProps = HierarchyChartSchema['props']

/** 函数式 children 的载荷：自行摆放部件时用得上的状态与动作。 */
export type HierarchyChartRootSlotProps = Pick<HierarchyChartApi, 'active' | 'tooltip' | 'empty' | 'path' | 'rootKey' | 'activeKey' | 'drillTo' | 'drillUp' | 'setFocusedDatum' | 'table'>

/** 提示框内容的载荷：激活的节点与缺省的内容模型。 */
export interface HierarchyChartTooltipSlotProps {
  active: ChartDatumDetails | null
  tooltip: HierarchyTooltipModel | null
}

/** 一个场景标记画成 SVG 元素；文字标记带文字。 */
function renderMark(api: HierarchyChartApi, mark: ChartMark): ReactNode {
  const props = { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key }
  if (mark.kind === 'group')
    return createElement('g', props, mark.children.map(child => renderMark(api, child)))
  if (mark.kind === 'text')
    return createElement('text', props, mark.text)
  return createElement('path', props)
}

/** 缺省的提示框内容：头部是从当前的根到节点的路径，下面是数值与两种占比。 */
function TooltipContent({ api }: { api: HierarchyChartApi }): ReactNode {
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
function A11y({ api }: { api: HierarchyChartApi }): ReactNode {
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

export interface XhHierarchyChartCaptionProps extends ComponentPropsWithRef<'figcaption'> {}

/** 标题：图表的可及名来源。 */
export function XhHierarchyChartCaption({ children, ...rest }: XhHierarchyChartCaptionProps): ReactNode {
  const { api } = useHierarchyChartContext()
  return (
    <figcaption {...mergeReactProps(api.getCaptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </figcaption>
  )
}

export interface XhHierarchyChartPathProps extends Omit<ComponentPropsWithRef<'nav'>, 'children'> {}

/** 下钻路径：从最顶层到当前的根，每一项是一个按钮；还在最顶层时收起。 */
export function XhHierarchyChartPath(props: XhHierarchyChartPathProps): ReactNode {
  const { api } = useHierarchyChartContext()
  return (
    <nav {...mergeReactProps(api.getPathProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.path.map(item => (
        <button key={item.key ?? ''} {...api.getPathItemProps(item) as Record<string, unknown>}>{item.name}</button>
      ))}
    </nav>
  )
}

export interface XhHierarchyChartLegendProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 图例：按值着色时每个看得见的层一条色阶（名字、低端的值、渐变条、高端的值）；其余着色方式收起。 */
export function XhHierarchyChartLegend(props: XhHierarchyChartLegendProps): ReactNode {
  const { api } = useHierarchyChartContext()
  return (
    <div {...mergeReactProps(api.getLegendProps() as Record<string, unknown>, props as Record<string, unknown>)}>
      {api.legendScales.map(scale => (
        <div key={scale.level} {...api.getLegendScaleProps(scale) as Record<string, unknown>}>
          <span {...api.getLegendScaleNameProps() as Record<string, unknown>}>{scale.name}</span>
          <span {...api.getLegendScaleValueProps('min') as Record<string, unknown>}>{scale.min}</span>
          <span {...api.getLegendScaleBarProps() as Record<string, unknown>} />
          <span {...api.getLegendScaleValueProps('max') as Record<string, unknown>}>{scale.max}</span>
        </div>
      ))}
    </div>
  )
}

export interface XhHierarchyChartViewportProps extends ComponentPropsWithRef<'div'> {}

/** 视口：尺寸观测的宿主，块尺寸由组件槽决定。 */
export function XhHierarchyChartViewport({ children, ...rest }: XhHierarchyChartViewportProps): ReactNode {
  const ctx = useHierarchyChartContext()
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

export interface XhHierarchyChartPlotProps extends Omit<ComponentPropsWithRef<'svg'>, 'children'> {}

/** 绘图区：节点由浅到深，名字与分组标题在上，焦点环最上。 */
export function XhHierarchyChartPlot(props: XhHierarchyChartPlotProps): ReactNode {
  const { api } = useHierarchyChartContext()
  // 指针离开是不冒泡的事件，改挂原生监听器；focusin / focusout 留给 React 的 onFocus / onBlur
  const bind = useNativeEvents(api.getPlotProps() as Record<string, unknown>, ['onPointerLeave'])
  const marks = [...api.scene.layers.data, ...api.scene.layers.front, ...api.overlay.over]
  return (
    <svg {...mergeReactProps(bind.attrs, props as Record<string, unknown>, { ref: bind.ref })}>
      {marks.map(mark => renderMark(api, mark))}
    </svg>
  )
}

export interface XhHierarchyChartTooltipProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 替换缺省内容；函数式 children 拿到激活的节点与缺省的内容模型。 */
  children?: SlotChildren<HierarchyChartTooltipSlotProps>
}

/** 提示框：缺省内容按激活的节点生成，函数式 children 可替换。 */
export function XhHierarchyChartTooltip({ children, ...rest }: XhHierarchyChartTooltipProps): ReactNode {
  const { api } = useHierarchyChartContext()
  return (
    <div {...mergeReactProps(api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children === undefined
        ? <TooltipContent api={api} />
        : renderSlot(children, { active: api.active, tooltip: api.tooltip })}
    </div>
  )
}

export interface XhHierarchyChartEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：没有可画的数据时显示，缺省文字取文案。 */
export function XhHierarchyChartEmpty({ children, ...rest }: XhHierarchyChartEmptyProps): ReactNode {
  const { api } = useHierarchyChartContext()
  return (
    <div {...mergeReactProps(api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children ?? api.emptyText}
    </div>
  )
}

export interface XhHierarchyChartRootProps extends Omit<ComponentPropsWithRef<'figure'>, 'children'> {
  /** 数据：嵌套的树，或扁平的行（配合 idField 与 parentField）。 */
  data?: ChartRow | readonly ChartRow[]
  /** 嵌套数据的子节点字段，缺省 children。 */
  childrenField?: string
  /** 扁平数据：行的身份字段。 */
  idField?: string
  /** 扁平数据：父节点的身份字段。 */
  parentField?: string
  /** 名字字段，缺省 name。 */
  nameField?: string
  /** 数值字段，缺省 value：只取叶子的值。 */
  valueField?: string
  /** 空间填充的方式，缺省 treemap。 */
  layout?: HierarchyLayout
  /** 矩形树图的铺法，缺省 squarify。 */
  tile?: HierarchyTile
  /** 同时看得见的层数，缺省 2。 */
  depth?: number
  /** 着色，缺省 branch。 */
  colorBy?: HierarchyColorBy
  /** 按值着色时顺序色阶的色板。 */
  palette?: ChartPalette
  /** 冰柱图的方向，缺省 vertical。 */
  orientation?: 'vertical' | 'horizontal'
  /** 当前的根（受控）：节点的身份，null 是最顶层。 */
  rootKey?: string | null
  /** 初始的根（非受控）。 */
  defaultRootKey?: string | null
  /** 数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 激活的键（受控）：与别的图联动时是节点的身份。 */
  activeKey?: ChartKey | null
  /** 数据重取中：保留上一帧、整体降低不透明度。 */
  pending?: boolean
  /** 播放过渡动画，缺省 true；false 时直接画终态。 */
  animated?: boolean
  locale?: string
  translations?: Partial<HierarchyChartTranslations>
  onRootKeyChange?: HierarchyChartProps['onRootKeyChange']
  onActiveKeyChange?: HierarchyChartProps['onActiveKeyChange']
  onDatumActive?: HierarchyChartProps['onDatumActive']
  onDatumPress?: HierarchyChartProps['onDatumPress']
  /** 缺省结构里的标题内容。 */
  caption?: ReactNode
  /** 缺省结构里的提示框内容。 */
  renderTooltip?: (props: HierarchyChartTooltipSlotProps) => ReactNode
  /** 缺省结构里的空态内容。 */
  empty?: ReactNode
  /** 自行摆放部件；不写时铺开缺省结构：下钻路径、视口（绘图区与空态）、提示框。 */
  children?: SlotChildren<HierarchyChartRootSlotProps>
}

export function XhHierarchyChartRoot({
  data,
  childrenField,
  idField,
  parentField,
  nameField,
  valueField,
  layout,
  tile,
  depth,
  colorBy,
  palette,
  orientation,
  rootKey,
  defaultRootKey,
  format,
  activeKey,
  pending,
  animated,
  locale,
  translations,
  onRootKeyChange,
  onActiveKeyChange,
  onDatumActive,
  onDatumPress,
  caption,
  renderTooltip,
  empty,
  children,
  ...rest
}: XhHierarchyChartRootProps): ReactNode {
  const ctx = useHierarchyChart(withXhConfig('hierarchy-chart', {
    data,
    childrenField,
    idField,
    parentField,
    nameField,
    valueField,
    layout,
    tile,
    depth,
    colorBy,
    palette,
    orientation,
    rootKey,
    defaultRootKey,
    format,
    activeKey,
    pending,
    animated,
    locale,
    translations,
    onRootKeyChange,
    onActiveKeyChange,
    onDatumActive,
    onDatumPress,
  }) as HierarchyChartProps)
  const { api } = ctx
  const body = children === undefined
    ? (
        <>
          {caption === undefined ? null : <XhHierarchyChartCaption>{caption}</XhHierarchyChartCaption>}
          <XhHierarchyChartPath />
          <XhHierarchyChartLegend />
          {/* 空态放进视口：叠在绘图区上，标题与路径不被盖住 */}
          <XhHierarchyChartViewport>
            <XhHierarchyChartPlot />
            <XhHierarchyChartEmpty>{empty}</XhHierarchyChartEmpty>
          </XhHierarchyChartViewport>
          <XhHierarchyChartTooltip>{renderTooltip}</XhHierarchyChartTooltip>
        </>
      )
    : renderSlot(children, {
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
  return (
    <HierarchyChartProvider value={ctx}>
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
    </HierarchyChartProvider>
  )
}

XhHierarchyChartRoot.xhEvents = ['root-key-change', 'active-key-change', 'datum-active', 'datum-press'] as const
