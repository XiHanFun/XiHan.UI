import type { TableColumnProps, TableRowProps } from '@xihan-ui/headless'
import type { ComputedRef, InjectionKey } from 'vue'
import type { TableContext } from './use-table'
import { inject, provide } from 'vue'

/** 行所在的区段，决定同一个 row 部件渲染成表头行、数据行还是脚注行。 */
export type TableSection = 'header' | 'body' | 'footer'

/** 行自报的值，供行内的把手与单元格复用同一份声明。 */
export interface TableRowContext {
  row: ComputedRef<TableRowProps>
}

/** 列自报的值，供列标题里的排序把手复用同一份声明。 */
export interface TableColumnContext {
  column: ComputedRef<TableColumnProps>
}

const KEY: InjectionKey<TableContext> = Symbol('xh-table')
const SECTION_KEY: InjectionKey<TableSection> = Symbol('xh-table-section')
const ROW_KEY: InjectionKey<TableRowContext> = Symbol('xh-table-row')
const COLUMN_KEY: InjectionKey<TableColumnContext> = Symbol('xh-table-column')

export function provideTable(ctx: TableContext): void {
  provide(KEY, ctx)
}

export function useTableContext(): TableContext {
  const ctx = inject(KEY, null)
  if (!ctx)
    throw new Error('[xh] Table 部件必须用在 XhTableRoot 内')
  return ctx
}

export function provideTableSection(section: TableSection): void {
  provide(SECTION_KEY, section)
}

/** 取所在区段，无区段声明时按数据行处理。 */
export function useTableSection(): TableSection {
  return inject(SECTION_KEY, 'body')
}

export function provideTableRow(ctx: TableRowContext): void {
  provide(ROW_KEY, ctx)
}

export function useTableRowContext(): TableRowContext {
  const ctx = inject(ROW_KEY, null)
  if (!ctx)
    throw new Error('[xh] Table 行内部件必须用在 XhTableRow 或 XhTableExpandedRow 内')
  return ctx
}

/** 注入行上下文，表头与脚注单元格不在行内时返回 null。 */
export function useOptionalTableRowContext(): TableRowContext | null {
  return inject(ROW_KEY, null)
}

export function provideTableColumn(ctx: TableColumnContext): void {
  provide(COLUMN_KEY, ctx)
}

export function useTableColumnContext(): TableColumnContext {
  const ctx = inject(COLUMN_KEY, null)
  if (!ctx)
    throw new Error('[xh] Table 排序把手必须用在 XhTableColumnHeader 内')
  return ctx
}
