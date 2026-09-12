import type { DiffSide, DiffViewMode } from './diff-view.types'

/** 一种差异视图要铺出的列序。 */
export type DiffViewSides = readonly DiffSide[]

/** unified 只铺旧侧这一列，split 按旧侧、新侧的稳定顺序铺两列。 */
export function diffViewSides(view: DiffViewMode): DiffViewSides {
  return view === 'split' ? ['old', 'new'] : ['old']
}
