import type { Direction, Size, Tone } from '@xihan-ui/core'
import type {
  HeatmapApi,
  HeatmapAxisInput,
  HeatmapCellDetails,
  HeatmapCellMeta,
  HeatmapLegendBound,
  HeatmapMatrixCellMeta,
  HeatmapMatrixGrid,
  HeatmapMonthGrid,
  HeatmapPalette,
  HeatmapRowProps,
  HeatmapSchema,
  HeatmapTranslations,
  HeatmapValue,
  HeatmapVariant,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { heatmapMatrixKey, normalizeHeatmapNumber, normalizeHeatmapString } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { renderSlot } from '../../runtime/slot-content'
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
 * 函数式 children 的载荷：三张网格模型与锚点、当前详情，外加挪锚点的动作。
 * 三形态通用的那一组（`focusedCell` / `anchorCell` / `setFocusedCell`）也在里面：
 * 矩阵形态下带 Date 的那一组恒为 null，自己铺矩阵时只有这一组读得出、挪得动锚点。
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
  | 'detailOpen'
  | 'cellAt'
  | 'setFocusedCell'
  | 'setFocusedDate'
>

/**
 * 每一格的内容载荷：日期形态给日历那一格，矩阵形态给矩阵那一格。
 * 两者的坐标不同，用 `'date' in cell` 分辨。
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
  /** 逐档的分界数值；给了它就不按数据自动分档。 */
  thresholds?: number[]
  /** 一周从星期几起算。 */
  firstDayOfWeek?: number
  locale?: string
  dir?: Direction
  tone?: Tone
  palette?: HeatmapPalette
  size?: Size
  translations?: Partial<HeatmapTranslations>
  /** 焦点落到某一格。 */
  onCellFocus?: HeatmapProps['onCellFocus']
  /** 详情落在哪一格变了。 */
  onCellActive?: HeatmapProps['onCellActive']
  /** 铺开网格时每一格的内容；不给就是空格子。 */
  renderCell?: (cell: HeatmapCellSlotProps) => ReactNode
  /** 详情条的内容；给了它才铺出 tooltip 部件。 */
  renderTooltip?: (details: HeatmapCellDetails | null) => ReactNode
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
  firstDayOfWeek,
  locale,
  dir,
  tone,
  palette,
  size,
  translations,
  onCellFocus,
  onCellActive,
  renderCell,
  renderTooltip,
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
    firstDayOfWeek,
    locale,
    dir,
    tone,
    palette,
    size,
    translations,
    onCellFocus,
    onCellActive,
  }) as HeatmapProps)
  const { api } = ctx
  const body = children === undefined
    ? <DefaultTree api={api} renderCell={renderCell} renderTooltip={renderTooltip} />
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
        detailOpen: api.detailOpen,
        cellAt: api.cellAt,
        setFocusedCell: api.setFocusedCell,
        setFocusedDate: api.setFocusedDate,
      })
  return (
    <HeatmapProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{body}</div>
    </HeatmapProvider>
  )
}

XhHeatmapRoot.xhEvents = ['cell-focus', 'cell-active'] as const

export interface XhHeatmapGridProps extends ComponentPropsWithRef<'div'> {}

/** role=grid 的容器：键盘在这里收口，可及名字也长在它身上。 */
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

/** 月历形态里的一个自然月块，块内的行从这里取月份身份。 */
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
   * 不写即坐标轴那一行。
   */
  value?: number | string
  /** 月历形态：所属月份 YYYY-MM；写在月块里就不必再写一遍。 */
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
  /** 行序 0-6；不给即坐标轴那一行行首的占位。 */
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

/** 月份名。日历形态里横跨这个月占的那几列，月历形态里是一块的标题。 */
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
  /** 行身份；不写即表头行行首那个角落占位。 */
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
  /** 矩阵形态：行身份；写在行里就不必再写一遍。 */
  row?: string
}

/** 一格。数值与档位由 connect 回网格里查。 */
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

/** 详情条：悬停或聚焦到某一格时显示，位置由连接层量好写成内联样式。 */
export function XhHeatmapTooltip({ children, ...rest }: XhHeatmapTooltipProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <div {...mergeReactProps(ctx.api.getTooltipProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
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

/** 对照条一端的那个字。 */
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
}

/** 对照条里的一格，与网格里同档的格子同色。 */
export function XhHeatmapLegendItem({ value, children, ...rest }: XhHeatmapLegendItemProps): ReactNode {
  const ctx = useHeatmapContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getLegendItemProps({ level: Number(value) || 0 }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}

interface DefaultTreeProps {
  api: HeatmapApi
  renderCell?: (cell: HeatmapCellSlotProps) => ReactNode
  renderTooltip?: (details: HeatmapCellDetails | null) => ReactNode
}

/**
 * 没写 children 时按网格模型铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就自己写部件，行为不变。
 * 详情条只有给了 renderTooltip 才铺。
 */
function DefaultTree({ api, renderCell, renderTooltip }: DefaultTreeProps): ReactNode {
  // 两端各一个字：一排色块自己说不出哪头是多
  const levels = api.monthGrid?.levels ?? api.matrixGrid?.levels ?? api.grid.levels
  const legend = (
    <XhHeatmapLegend>
      <XhHeatmapLegendLabel value="low">{api.legendText.low}</XhHeatmapLegendLabel>
      {Array.from({ length: levels }, (_, level) => (
        <XhHeatmapLegendItem key={level} value={level} />
      ))}
      <XhHeatmapLegendLabel value="high">{api.legendText.high}</XhHeatmapLegendLabel>
    </XhHeatmapLegend>
  )
  const tooltip = renderTooltip
    ? <XhHeatmapTooltip>{renderTooltip(api.activeCell)}</XhHeatmapTooltip>
    : null

  if (api.matrixGrid) {
    return (
      <>
        <MatrixTree grid={api.matrixGrid} renderCell={renderCell} />
        {tooltip}
        {legend}
      </>
    )
  }
  if (api.monthGrid) {
    return (
      <>
        <MonthTree grid={api.monthGrid} renderCell={renderCell} />
        {tooltip}
        {legend}
      </>
    )
  }

  return (
    <>
      {/* 月份行排在网格之外：它只是一条对齐用的坐标轴，进了网格就得冒充表格行 */}
      <XhHeatmapRow>
        {/* 行首占位：与下面各行的星期名同宽，月份才对得上列 */}
        <XhHeatmapWeekDay />
        {api.grid.months.map(month => (
          <XhHeatmapMonthLabel key={month.value} value={month.value}>{month.label}</XhHeatmapMonthLabel>
        ))}
      </XhHeatmapRow>
      <XhHeatmapGrid>
        {api.grid.rows.map(row => (
          <XhHeatmapRow key={row.weekDay} value={row.weekDay}>
            <XhHeatmapWeekDay value={row.weekDay}>{api.grid.weekDays[row.weekDay]?.label ?? ''}</XhHeatmapWeekDay>
            {row.cells.map(cell => (
              <XhHeatmapCell key={cell.date} value={cell.date}>{renderCell?.(cell)}</XhHeatmapCell>
            ))}
          </XhHeatmapRow>
        ))}
      </XhHeatmapGrid>
      {tooltip}
      {legend}
    </>
  )
}

/** 月历形态：网格里一个自然月一块，块内先一条星期名坐标轴，再逐周一行。 */
function MonthTree({
  grid,
  renderCell,
}: { grid: HeatmapMonthGrid, renderCell?: (cell: HeatmapCellSlotProps) => ReactNode }): ReactNode {
  return (
    <XhHeatmapGrid>
      {grid.blocks.map(block => (
        <XhHeatmapMonthBlock key={block.value} value={block.value}>
          <XhHeatmapMonthLabel value={block.value}>{block.label}</XhHeatmapMonthLabel>
          <XhHeatmapRow>
            {grid.weekDays.map(day => (
              <XhHeatmapWeekDay key={day.weekDay} value={day.weekDay}>{day.label}</XhHeatmapWeekDay>
            ))}
          </XhHeatmapRow>
          {block.weeks.map(row => (
            <XhHeatmapRow key={row.week} value={row.week}>
              {row.cells.map(cell => (
                <XhHeatmapCell key={cell.date} value={cell.date}>{renderCell?.(cell)}</XhHeatmapCell>
              ))}
            </XhHeatmapRow>
          ))}
        </XhHeatmapMonthBlock>
      ))}
    </XhHeatmapGrid>
  )
}

/** 矩阵形态：头一行是列名，其余每行行首一个行名、其后逐列一格。 */
function MatrixTree({
  grid,
  renderCell,
}: { grid: HeatmapMatrixGrid, renderCell?: (cell: HeatmapCellSlotProps) => ReactNode }): ReactNode {
  return (
    <XhHeatmapGrid>
      <XhHeatmapRow>
        {/* 角落占位：与下面各行的行名同宽，列名才对得上列 */}
        <XhHeatmapRowLabel />
        {grid.columns.map(column => (
          <XhHeatmapColumnLabel key={column.value} value={column.value}>{column.label}</XhHeatmapColumnLabel>
        ))}
      </XhHeatmapRow>
      {grid.rows.map(row => (
        <XhHeatmapRow key={row.value} value={row.value}>
          <XhHeatmapRowLabel value={row.value}>{row.label}</XhHeatmapRowLabel>
          {grid.columns.map((column) => {
            const meta = grid.cells.get(heatmapMatrixKey(row.value, column.value))
            return (
              <XhHeatmapCell key={column.value} value={column.value}>
                {meta == null ? null : renderCell?.(meta)}
              </XhHeatmapCell>
            )
          })}
        </XhHeatmapRow>
      ))}
    </XhHeatmapGrid>
  )
}
