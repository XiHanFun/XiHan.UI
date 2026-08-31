import type { CodeToken, NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { DiffChange, DiffLine, DiffModel } from './diff-view.model'
import type { DiffSide, DiffViewApi, DiffViewCellProps, DiffViewRow, DiffViewSchema } from './diff-view.types'
import { dataAttr } from '@xihan-ui/kernel'
import { diffViewAnatomy } from './diff-view.anatomy'
import { diffStats } from './diff-view.model'

const parts = diffViewAnatomy.build()

const EMPTY_MODEL: DiffModel = { hunks: [] }
const NO_TOKENS: readonly CodeToken[] = []

/**
 * 把模型摊成可见行序：hunk 内远离变更的连续上下文折成一格。
 *
 * 行序在这里一次算好，行号与列号一律从模型算、绝不从 DOM 反推。
 */
function buildRows(model: DiffModel, contextLines: number | undefined, expanded: readonly string[]): DiffViewRow[] {
  const rows: DiffViewRow[] = []
  const fold = Number.isFinite(contextLines) && contextLines! >= 0
  const keep = fold ? Math.floor(contextLines!) : 0

  model.hunks.forEach((hunk, hunkIndex) => {
    const lines = hunk.lines
    let i = 0
    while (i < lines.length) {
      if (lines[i]!.change !== 'context' || !fold) {
        rows.push({ kind: 'line', rowIndex: rows.length + 1, line: lines[i]! })
        i++
        continue
      }
      // 一段连续的上下文：两端各留 keep 行，中间够长才折
      const start = i
      while (i < lines.length && lines[i]!.change === 'context') i++
      const run = i - start
      const atHead = start === 0
      const atTail = i === lines.length
      // 段首与段尾只需留靠里那一侧的上下文
      const head = atHead ? 0 : keep
      const tail = atTail ? 0 : keep
      const hidden = run - head - tail
      if (hidden <= 1) {
        for (let j = start; j < i; j++)
          rows.push({ kind: 'line', rowIndex: rows.length + 1, line: lines[j]! })
        continue
      }
      const gapId = `${hunkIndex}:${start}`
      for (let j = start; j < start + head; j++)
        rows.push({ kind: 'line', rowIndex: rows.length + 1, line: lines[j]! })
      if (expanded.includes(gapId)) {
        for (let j = start + head; j < i - tail; j++)
          rows.push({ kind: 'line', rowIndex: rows.length + 1, line: lines[j]! })
      }
      else {
        rows.push({ kind: 'gap', rowIndex: rows.length + 1, gapId, hiddenCount: hidden })
      }
      for (let j = i - tail; j < i; j++)
        rows.push({ kind: 'line', rowIndex: rows.length + 1, line: lines[j]! })
    }
  })
  return rows
}

/** 这一行在这一侧有没有内容。unified 只有一列，恒有。 */
function hasSide(line: DiffLine | undefined, side: DiffSide, split: boolean): boolean {
  if (!line)
    return false
  if (!split)
    return true
  return side === 'old' ? line.change !== 'added' : line.change !== 'removed'
}

export function connectDiffView<T extends PropTypes>(
  service: Service<DiffViewSchema>,
  normalize: NormalizeProps<T>,
): DiffViewApi<T> {
  const { context, prop, send, scope } = service
  const model = prop('model') ?? EMPTY_MODEL
  const view = prop('view') ?? 'unified'
  const split = view === 'split'
  const expanded = context.get('expanded')
  const translations = prop('translations')
  const ids = scope.ids('diff-view', 'header')

  const rows = buildRows(model, prop('contextLines'), expanded)
  const rowAt = (rowIndex: number): DiffViewRow | undefined => rows[rowIndex - 1]
  const lineAt = (rowIndex: number): DiffLine | undefined => rowAt(rowIndex)?.line
  const stats = diffStats(model)
  const isEmpty = rows.length === 0

  // 只数真正暴露的内容列：行号不进列，它对读屏隐藏
  const colCount = split ? 2 : 1
  const colIndexOf = (side: DiffSide): number => (split && side === 'new' ? 2 : 1)

  const labelOf = (change: DiffChange): string => {
    if (change === 'added')
      return translations?.added ?? 'Added'
    if (change === 'removed')
      return translations?.removed ?? 'Removed'
    return translations?.unchanged ?? 'Unchanged'
  }

  const cellNumber = ({ rowIndex, side }: DiffViewCellProps): number | undefined => {
    const line = lineAt(rowIndex)
    if (!line)
      return undefined
    if (!split)
      return line.newNumber ?? line.oldNumber
    return side === 'old' ? line.oldNumber : line.newNumber
  }

  const cellText = ({ rowIndex, side }: DiffViewCellProps): string | undefined => {
    const line = lineAt(rowIndex)
    return hasSide(line, side, split) ? line!.text : undefined
  }

  const cellTokens = ({ rowIndex, side }: DiffViewCellProps): readonly CodeToken[] => {
    const line = lineAt(rowIndex)
    return hasSide(line, side, split) ? line!.tokens ?? NO_TOKENS : NO_TOKENS
  }

  return {
    view,
    rows,
    expanded,
    stats,
    truncated: model.truncated === true,
    isEmpty,
    setExpanded: next => send({ type: 'CONTROLLED.EXPANDED.SET', value: next }),
    toggleGap: id => send({ type: expanded.includes(id) ? 'GAP.COLLAPSE' : 'GAP.EXPAND', id }),

    // 不发 aria-busy：族级规则
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-view': view,
      'data-size': prop('size'),
      'data-truncated': dataAttr(model.truncated === true),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      id: ids.header,
    }),

    // 唯一的 Tab 停靠点，横纵滚动交给浏览器
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      tabindex: 0,
    }),

    // 行数是折叠之后的可见行数（含折起来的那些格），与每行的 aria-rowindex 同一口径
    getBodyProps: () => normalize.element({
      'role': 'table',
      ...parts.body.attrs,
      'aria-labelledby': model.newPath ?? model.oldPath ? ids.header : undefined,
      'aria-label': model.newPath ?? model.oldPath ? undefined : (translations?.diff ?? 'Diff'),
      'aria-rowcount': rows.length,
      'aria-colcount': colCount,
    }),

    getRowProps: ({ rowIndex }) => normalize.element({
      'role': 'row',
      ...parts.row.attrs,
      'aria-rowindex': rowIndex,
      'data-change': lineAt(rowIndex)?.change,
    }),

    // 不给 role、不给列号：行号不是内容列。皮肤用 attr() 画，复制差异不带行号
    getLineNumberProps: ({ rowIndex, side }) => normalize.element({
      ...parts['line-number'].attrs,
      'aria-hidden': true,
      'data-side': side,
      'data-line-number': cellNumber({ rowIndex, side })?.toString(),
    }),

    // split 下空侧照发 cell，否则列号会串位
    getLineContentProps: ({ rowIndex, side }) => normalize.element({
      'role': 'cell',
      ...parts['line-content'].attrs,
      'aria-colindex': colIndexOf(side),
      'data-side': side,
      'data-empty': dataAttr(!hasSide(lineAt(rowIndex), side, split)),
      'data-change': lineAt(rowIndex)?.change,
    }),

    // 住在内容格里面并视觉隐藏：变更类型不能只靠颜色传达
    getChangeLabelProps: ({ change }) => normalize.element({
      ...parts['change-label'].attrs,
      'data-change': change,
    }),

    getTokenProps: token => normalize.element({
      ...parts.token.attrs,
      'data-kind': token.kind,
    }),

    getGapProps: ({ gapId }) => normalize.element({
      'role': 'row',
      ...parts.gap.attrs,
      'data-expanded': dataAttr(expanded.includes(gapId)),
      'data-value': gapId,
    }),

    // 跨列由皮肤的网格声明处理；这里只发一个合法的列号
    getGapCellProps: () => normalize.element({
      'role': 'cell',
      ...parts['gap-cell'].attrs,
      'aria-colindex': 1,
    }),

    getGapTriggerProps: ({ gapId }) => normalize.button({
      ...parts['gap-trigger'].attrs,
      'type': 'button',
      'aria-expanded': expanded.includes(gapId) ? 'true' : 'false',
      'aria-label': translations?.expandGap,
      'data-value': gapId,
      'onClick': () => send({ type: expanded.includes(gapId) ? 'GAP.COLLAPSE' : 'GAP.EXPAND', id: gapId }),
    }),

    // 无变更时的占位。播报交给宿主，这里不开活区
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      hidden: !isEmpty || undefined,
    }),

    changeLabel: labelOf,
    cellText,
    cellNumber,
    cellTokens,
  }
}

/** 无变更时的兜底文案。 */
export function diffViewEmptyText(translations?: Partial<DiffViewSchema['props']['translations']>): string {
  return translations?.noChanges ?? 'No changes'
}
