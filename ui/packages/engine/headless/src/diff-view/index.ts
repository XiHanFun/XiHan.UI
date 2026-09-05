export { diffViewAnatomy } from './diff-view.anatomy'
export { connectDiffView, diffViewEmptyText } from './diff-view.connect'
export { diffViewKeyboard } from './diff-view.keyboard'
export { diffViewMachine } from './diff-view.machine'
export { diffViewMeta } from './diff-view.meta'
export { computeTextDiff, diffStats, parseUnifiedPatch } from './diff-view.model'
export type { ComputeTextDiffOptions, DiffChange, DiffHunk, DiffLine, DiffModel } from './diff-view.model'
export type {
  DiffSide,
  DiffViewApi,
  DiffViewCellProps,
  DiffViewExpandedValueChangeDetails,
  DiffViewGapProps,
  DiffViewInlineChangeProps,
  DiffViewMode,
  DiffViewRow,
  DiffViewRowProps,
  DiffViewSchema,
  DiffViewSegment,
  DiffViewTranslations,
} from './diff-view.types'
