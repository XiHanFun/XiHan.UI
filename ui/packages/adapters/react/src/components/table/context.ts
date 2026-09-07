import type { TableColumnProps, TableRowProps } from '@xihan-ui/headless'
import type { TableContext } from './use-table'
import { createContext, useContext } from 'react'

/** 行所在的区段，决定同一个 row 部件渲染成表头行、数据行还是脚注行。 */
export type TableSection = 'body' | 'footer' | 'header'

const Ctx = createContext<TableContext | undefined>(undefined)
const SectionCtx = createContext<TableSection>('body')
const RowCtx = createContext<TableRowProps | undefined>(undefined)
const ColumnCtx = createContext<TableColumnProps | undefined>(undefined)

export const TableProvider = Ctx
export const TableSectionProvider = SectionCtx
export const TableRowProvider = RowCtx
export const TableColumnProvider = ColumnCtx

export function useTableContext(): TableContext {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error('XhTable 的部件要放在 XhTableRoot 里')
  return ctx
}

/** 取所在区段，无区段声明时按数据行处理。 */
export function useTableSection(): TableSection {
  return useContext(SectionCtx)
}

export function useTableRowContext(): TableRowProps {
  const row = useContext(RowCtx)
  if (!row)
    throw new Error('行内部件要放在 XhTableRow 里')
  return row
}

/** 取行上下文，表头与脚注单元格不在行内时返回 undefined。 */
export function useOptionalTableRowContext(): TableRowProps | undefined {
  return useContext(RowCtx)
}

export function useTableColumnContext(): TableColumnProps {
  const column = useContext(ColumnCtx)
  if (!column)
    throw new Error('排序把手要放在 XhTableColumnHeader 里')
  return column
}

/** 取列上下文，列设置区里的把手不在列标题内时返回 undefined，列身份改由自己的 value 声明。 */
export function useOptionalTableColumnContext(): TableColumnProps | undefined {
  return useContext(ColumnCtx)
}
