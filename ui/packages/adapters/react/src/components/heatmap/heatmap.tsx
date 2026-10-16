/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 heatmap 相关实现。

import type { Direction, Size, Tone } from '@xihan-ui/core'
import type {
  HeatmapApi,
  HeatmapAxisInput,
  HeatmapCellMeta,
  HeatmapDatumDetails,
  HeatmapLegendBound,
  HeatmapMatrixCellMeta,
  HeatmapPalette,
  HeatmapPolarity,
  HeatmapRowProps,
  HeatmapScaleMode,
  HeatmapSchema,
  HeatmapTranslations,
  HeatmapValue,
  HeatmapVariant,
  NumberFormatSpec,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { heatmapStructure, normalizeHeatmapNumber, normalizeHeatmapString } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import {
  HeatmapMonthProvider,
  HeatmapProvider,
  HeatmapRowProvider,
  useHeatmapContext,
  useHeatmapMonth,
  useHeatmapRow,
} from './context'
import { useHeatmap } from './use-heatmap'

type HeatmapProps = HeatmapSchema['props']

/**
 * 函数式 children 的载荷：三张网格模型与锚点、当前详情，以及移动锚点的动作。
 * 三形态通用的一组（`focusedCell` / `anchorCell` / `setFocusedCell`）也包含在内：
 * 矩阵形态下带 Date 的一组恒为 null，自行铺设矩阵时只有这一组能读取、移动锚点。
 */
export type HeatmapRootSlotProps = Pick<
  HeatmapApi,
  | 'variant'
  | 'grid'
  | 'monthGrid'
  | 'matrixGrid'
  | 'focusedCell'
  | 'focusedDate'
  | 'anchorCell'
  | 'anchorDate'
  | 'activeCell'
  | 'activeKey'
  | 'empty'
  | 'detailOpen'
  | 'scaleMode'
  | 'legendItems'
  | 'cellAt'
  | 'setFocusedCell'
  | 'setFocusedDate'
>

/**
 * 每一格的内容载荷：日期形态给日历的格子，矩阵形态给矩阵的格子。
 * 两者的坐标不同，用 `'date' in cell` 区分。
 */
export type HeatmapCellSlotProps = HeatmapCellMeta | HeatmapMatrixCellMeta

export interface XhHeatmapRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  /** 形态：calendar 一年一张、month 一个自然月一块、matrix 行列自定。 */
  variant?: HeatmapVariant
  value?: HeatmapValue[]
  /** 矩阵形态的行。 */
  rows?: HeatmapAxisInput[]
  /** 矩阵形态的列。 */
  columns?: HeatmapAxisInput[]
  startDate?: string
  endDate?: string
  /** 分几档色阶。 */
  levels?: number
  /** 逐档的分界数值；提供后不按数据自动分档。 */
  thresholds?: number[]
  /** 色阶：顺序色阶从空到满，发散色阶以中点分两侧；缺省时数据里出现负数就按发散色阶。 */
  scale?: HeatmapScaleMode
  /** 发散色阶的中点，默认 0。 */
  midpoint?: number
  /** 连续色阶：着色按数值的确切比例，不按档位取整。 */
  continuous?: boolean
  /** 一周从星期几起算。 */
  firstDayOfWeek?: number
  locale?: string
  dir?: Direction
  tone?: Tone
  palette?: HeatmapPalette
  size?: Size
  /** 播放过渡，默认开；关闭后直接画终态。 */
  animated?: boolean
  /** 数值格式：详情、格子的可及名与发散色阶对照条两端共用。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 数据重取中：保留上一帧、网格整体降低不透明度。 */
  pending?: boolean
  /** 激活的键（受控）：日期形态是 ISO 日期，矩阵形态是行列合成的串。 */
  activeKey?: string | null
  translations?: Partial<HeatmapTranslations>
  /** 详情所在的格子变化。 */
  onDatumActive?: HeatmapProps['onDatumActive']
  /** 点按一格，或焦点在格上按 Enter。 */
  onDatumPress?: HeatmapProps['onDatumPress']
  /** 指针或键盘把激活的格子换掉。 */
  onActiveKeyChange?: HeatmapProps['onActiveKeyChange']
  /** 铺开网格时每一格的内容；未提供时是空格子。 */
  renderCell?: (cell: HeatmapCellSlotProps) => ReactNode
  /** 详情条的内容；提供后才铺设 tooltip 部件。 */
  renderTooltip?: (details: HeatmapDatumDetails | null) => ReactNode
  /** 缺省结构里的空态内容；未提供时是空态文案。 */
  renderEmpty?: () => ReactNode
  children?: SlotChildren<HeatmapRootSlotProps>
}

export function XhHeatmapRoot({
  variant,
  value,
  rows,
  columns,
  startDate,
  endDate,
  levels,
  thresholds,
  scale,
  midpoint,
  continuous,
  firstDayOfWeek,
  locale,
  dir,
  tone,
  palette,
  size,
  animated,
  format,
  pending,
  activeKey,
  translations,
  onDatumActive,
  onDatumPress,
  onActiveKeyChange,
  renderCell,
  renderTooltip,
  renderEmpty,
  children,
  ...rest
}: XhHeatmapRootProps): ReactNode {
  const ctx = useHeatmap(withXhConfig('heatmap', {
    variant,
    value,
    rows,
    columns,
    startDate,
    endDate,
    levels,
    thresholds,
    scale,
    midpoint,
    continuous,
    firstDayOfWeek,
    locale,
    dir,
    tone,
    palette,
    size,
    animated,
    format,
    pending,
    activeKey,
    translations,
    onDatumActive,
    onDatumPress,
    onActiveKeyChange,
  }) as HeatmapProps)
  const { api } = ctx
  const body = children === undefined
    ? <DefaultTree api={api} renderCell={renderCell} renderTooltip={renderTooltip} renderEmpty={renderEmpty} />
    : renderSlot(children, {
        variant: api.variant,
        grid: api.grid,
        monthGrid: api.monthGrid,
        matrixGrid: api.matrixGrid,
        focusedCell: api.focusedCell,
        focusedDate: api.focusedDate,
        anchorCell: api.anchorCell,
        anchorDate: api.anchorDate,
        activeCell: api.activeCell,
        activeKey: api.activeKey,
        empty: api.empty,
        detailOpen: api.detailOpen,
        scaleMode: api.scaleMode,
        legendItems: api.legendItems,
        cellAt: api.cellAt,
        setFocusedCell: api.setFocusedCell,
        setFocusedDate: api.setFocusedDate,
      })
  return (
    <HeatmapProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {body}
      </div>
    </HeatmapProvider>
  )
}

XhHeatmapRoot.xhEvents = ['datum-active', 'datum-press', 'active-key-change'] as const

export interface XhHeatmapGridProps extends ComponentPropsWithRef<'div'> {}

/** role=grid 的容器：键盘在这里收口，可及名字也挂在它上面。 */
export function XhHeatmapGrid({ children, ...rest }: XhHeatmapGridProps): ReactNode {
  const ctx = useHeatmapContext()
  // 网格自己得焦要把焦点转投给锚点那一格，DOM 的 focus 不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getGridProps() as Record<string, unknown>,
    ['onFocus'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhHeatmapMonthBlockProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 月份身份 YYYY-MM。 */
  value: string
}

/** 月历形态中的一个自然月块，块内的行从这里取月份身份。 */
export function XhHeatmapMonthBlock({ value, children, ...rest }: XhHeatmapMonthBlockProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <HeatmapMonthProvider value={value}>
      <div
        {...mergeReactProps(
          ctx.api.getMonthBlockProps({ value }) as Record<string, unknown>,
          rest as Record<string, unknown>,
        )}
      >
        {children}
      </div>
    </HeatmapMonthProvider>
  )
}

export interface XhHeatmapRowProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /**
   * 行的身份。日历形态是行序 0-6，月历形态是月内第几周，矩阵形态是行身份；
   * 未写即坐标轴行。
   */
  value?: number | string
  /** 月历形态：所属月份 YYYY-MM；写在月块中时不必再写一遍。 */
  month?: string
}

export function XhHeatmapRow({ value, month, children, ...rest }: XhHeatmapRowProps): ReactNode {
  const ctx = useHeatmapContext()
  const blockMonth = useHeatmapMonth()
  const { variant } = ctx.api
  let row: HeatmapRowProps
  if (variant === 'matrix')
    row = { row: normalizeHeatmapString(value) }
  else if (variant === 'month')
    row = { month: month ?? blockMonth, week: normalizeHeatmapNumber(value) }
  else
    row = { weekDay: normalizeHeatmapNumber(value) }
  return (
    <HeatmapRowProvider value={row.row}>
      <div
        {...mergeReactProps(
          ctx.api.getRowProps(row) as Record<string, unknown>,
          rest as Record<string, unknown>,
        )}
      >
        {children}
      </div>
    </HeatmapRowProvider>
  )
}

export interface XhHeatmapWeekDayProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 行序 0-6；未提供即坐标轴行行首的占位。 */
  value?: number | string
}

/** 行首的星期名。 */
export function XhHeatmapWeekDay({ value, children, ...rest }: XhHeatmapWeekDayProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getWeekDayProps({ weekDay: normalizeHeatmapNumber(value) }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhHeatmapMonthLabelProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 月份身份 YYYY-MM。 */
  value: string
}

/** 月份名。日历形态中横跨该月所占的列，月历形态中是一块的标题。 */
export function XhHeatmapMonthLabel({ value, children, ...rest }: XhHeatmapMonthLabelProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getMonthLabelProps({ value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhHeatmapRowLabelProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 行身份；未写即表头行行首的角落占位。 */
  value?: string
}

/** 矩阵的行名。 */
export function XhHeatmapRowLabel({ value, children, ...rest }: XhHeatmapRowLabelProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getRowLabelProps({ value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhHeatmapColumnLabelProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 列身份。 */
  value: string
}

/** 矩阵的列名。 */
export function XhHeatmapColumnLabel({ value, children, ...rest }: XhHeatmapColumnLabelProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getColumnLabelProps({ value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhHeatmapCellProps extends Omit<ComponentPropsWithRef<'div'>, 'value'> {
  /** 日期形态是 ISO 日期，矩阵形态是列身份。 */
  value: string
  /** 矩阵形态：行身份；写在行中时不必再写一遍。 */
  row?: string
}

/** 一格。数值与档位由 connect 查询网格。 */
export function XhHeatmapCell({ value, row, children, ...rest }: XhHeatmapCellProps): ReactNode {
  const ctx = useHeatmapContext()
  const parentRow = useHeatmapRow()
  const cell = ctx.api.variant === 'matrix'
    ? { row: row ?? parentRow, column: value }
    : { date: value }
  // 指针进出与聚焦都不冒泡，改装成原生监听器
  const bind = useNativeEvents(
    ctx.api.getCellProps(cell) as Record<string, unknown>,
    ['onFocus', 'onPointerEnter', 'onPointerLeave'],
  )
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhHeatmapTooltipProps extends ComponentPropsWithRef<'div'> {}

/** 详情条：悬停或聚焦到某一格时显示，位置由连接层测量后写为内联样式。 */
export function XhHeatmapTooltip({ children, ...rest }: XhHeatmapTooltipProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <div {...mergeReactProps(ctx.api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhHeatmapEmptyProps extends ComponentPropsWithRef<'div'> {}

/** 空态：网格里一条数据都没有时叠在网格上，取数中改写加载文案。 */
export function XhHeatmapEmpty({ children, ...rest }: XhHeatmapEmptyProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <div {...mergeReactProps(ctx.api.getEmptyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhHeatmapLegendProps extends ComponentPropsWithRef<'div'> {}

/** 色阶对照条。 */
export function XhHeatmapLegend({ children, ...rest }: XhHeatmapLegendProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <div {...mergeReactProps(ctx.api.getLegendProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhHeatmapLegendLabelProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 挂在哪一端：low 是色阶起点，high 是终点。 */
  value: HeatmapLegendBound
}

/** 对照条一端的文字。 */
export function XhHeatmapLegendLabel({ value, children, ...rest }: XhHeatmapLegendLabelProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getLegendLabelProps({ bound: value }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

export interface XhHeatmapLegendItemProps extends Omit<ComponentPropsWithRef<'span'>, 'value'> {
  /** 档位，兼收字符串。 */
  value: number | string
  /** 发散色阶下这一格在中点的哪一侧；顺序色阶与中点那一格不写。 */
  polarity?: HeatmapPolarity
}

/** 对照条中的一格，与网格中同档（发散色阶下同侧同档）的格子同色。 */
export function XhHeatmapLegendItem({ value, polarity, children, ...rest }: XhHeatmapLegendItemProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getLegendItemProps({ level: Number(value) || 0, polarity: polarity ?? null }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

/** 标准结构里各部件对应的组件。 */
const HEATMAP_PARTS = {
  'grid': XhHeatmapGrid,
  'month-block': XhHeatmapMonthBlock,
  'row': XhHeatmapRow,
  'week-day': XhHeatmapWeekDay,
  'month-label': XhHeatmapMonthLabel,
  'row-label': XhHeatmapRowLabel,
  'column-label': XhHeatmapColumnLabel,
  'cell': XhHeatmapCell,
  'tooltip': XhHeatmapTooltip,
  'legend': XhHeatmapLegend,
  'legend-label': XhHeatmapLegendLabel,
  'legend-item': XhHeatmapLegendItem,
  'empty': XhHeatmapEmpty,
}

interface DefaultTreeProps {
  api: HeatmapApi
  renderCell?: (cell: HeatmapCellSlotProps) => ReactNode
  renderTooltip?: (details: HeatmapDatumDetails | null) => ReactNode
  renderEmpty?: () => ReactNode
}

/**
 * 未写 children 时铺开的整套结构，作者只提供数据：照 headless 的 heatmapStructure 渲，
 * 与 Web Components 只写 root 时元素生成的节点出自同一份。格子、详情条与空态的内容由对应渲染函数接管。
 */
function DefaultTree({ api, renderCell, renderTooltip, renderEmpty }: DefaultTreeProps): ReactNode {
  return renderStructure(heatmapStructure(api, { tooltip: !!renderTooltip }), HEATMAP_PARTS, (node) => {
    if (node.part === 'cell')
      return node.data == null ? null : renderCell?.(node.data as HeatmapCellSlotProps) ?? null
    if (node.part === 'tooltip')
      return renderTooltip?.(api.activeCell)
    if (node.part === 'empty')
      return renderEmpty ? renderEmpty() : api.emptyText
    return undefined
  })
}
