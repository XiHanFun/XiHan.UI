import type { CodeToken, NormalizeProps, PropTypes, Service } from '@xihan-ui/core'
import type { DiffChange, DiffLine, DiffModel } from './diff-view.model'
import type { DiffSide, DiffViewApi, DiffViewCellProps, DiffViewRow, DiffViewSchema, DiffViewSegment } from './diff-view.types'
import { dataAttr } from '@xihan-ui/core'
import { diffViewAnatomy } from './diff-view.anatomy'
import { diffStats } from './diff-view.model'

const parts = diffViewAnatomy.build()

const EMPTY_MODEL: DiffModel = { hunks: [] }
const NO_TOKENS: readonly CodeToken[] = []
const NO_SEGMENTS: readonly DiffViewSegment[] = []

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
        // 标出「是点开才露出来的」：皮肤据此给这几行播一次入场
        for (let j = start + head; j < i - tail; j++)
          rows.push({ kind: 'line', rowIndex: rows.length + 1, line: lines[j]!, revealed: true })
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

/**
 * 把整行的着色记号按词级片段的边界切开，切完每一段各自带着自己那几个记号。
 *
 * 记号总长与片段总长对不上时（着色来自另一份文本）整行退回不着色：宁可不着色也不错着色。
 */
function sliceSegments(
  segments: readonly { text: string, changed: boolean }[],
  tokens: readonly CodeToken[] | undefined,
): readonly DiffViewSegment[] {
  const textLength = segments.reduce((n, segment) => n + segment.text.length, 0)
  const tokenLength = tokens?.reduce((n, token) => n + token.text.length, 0) ?? -1
  if (!tokens || tokenLength !== textLength)
    return segments.map(segment => ({ text: segment.text, changed: segment.changed, tokens: NO_TOKENS }))

  const out: DiffViewSegment[] = []
  let index = 0
  let taken = 0
  for (const segment of segments) {
    const pieces: CodeToken[] = []
    let need = segment.text.length
    while (need > 0 && index < tokens.length) {
      const token = tokens[index]!
      const take = Math.min(token.text.length - taken, need)
      pieces.push({ kind: token.kind, text: token.text.slice(taken, taken + take) })
      taken += take
      need -= take
      if (taken >= token.text.length) {
        index++
        taken = 0
      }
    }
    out.push({ text: segment.text, changed: segment.changed, tokens: pieces })
  }
  return out
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
  const expandedValue = context.get('expandedValue')
  const translations = prop('translations')
  const ids = scope.ids('diff-view', 'header')

  const rows = buildRows(model, prop('contextLines'), expandedValue)
  const rowAt = (rowIndex: number): DiffViewRow | undefined => rows[rowIndex - 1]
  const lineAt = (rowIndex: number): DiffLine | undefined => rowAt(rowIndex)?.line
  const stats = diffStats(model)
  const isEmpty = rows.length === 0

  // 只数真正暴露的内容列：行号不进列，它对读屏隐藏
  const colCount = split ? 2 : 1
  const colIndexOf = (side: DiffSide): number => (split && side === 'new' ? 2 : 1)

  const truncatedLines = Math.max(0, Math.trunc(model.truncatedLines ?? 0))
  const truncated = model.truncated === true && truncatedLines > 0
  const expandGapLabel = translations?.expandGap ?? ((count: number) => `Show ${count} hidden lines`)
  const truncationText = truncated
    ? (translations?.truncated ?? ((count: number) => `${count} more lines were cut off and are not shown`))(truncatedLines)
    : ''

  /** 这一格折起来多少行。展开之后这一格就不在行序里了，取不到即 0。 */
  const hiddenCountOf = (gapId: string): number =>
    rows.find(row => row.kind === 'gap' && row.gapId === gapId)?.hiddenCount ?? 0

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

  const cellSegments = ({ rowIndex, side }: DiffViewCellProps): readonly DiffViewSegment[] => {
    const line = lineAt(rowIndex)
    if (!hasSide(line, side, split) || !line!.segments?.length)
      return NO_SEGMENTS
    return sliceSegments(line!.segments, line!.tokens)
  }

  return {
    view,
    rows,
    expandedValue,
    stats,
    truncated,
    truncatedLines,
    truncationText,
    isEmpty,
    setExpandedValue: next => send({ type: 'CONTROLLED.EXPANDED.SET', value: next }),
    toggleGap: id => send({ type: expandedValue.includes(id) ? 'GAP.COLLAPSE' : 'GAP.EXPAND', id }),

    // 不发 aria-busy：族级规则
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'data-view': view,
      'data-size': prop('size'),
      'data-wrap': dataAttr(prop('wrap') === true),
      'data-truncated': dataAttr(truncated),
    }),

    getHeaderProps: () => normalize.element({
      ...parts.header.attrs,
      id: ids.header,
    }),

    // 增删各一个：数字由适配器从 stats 取，皮肤按 data-change 上色
    getSummaryProps: ({ change }) => normalize.element({
      ...parts.summary.attrs,
      'data-change': change,
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
      'data-revealed': dataAttr(rowAt(rowIndex)?.revealed === true),
    }),

    // 不给 role、不给列号：行号不是内容列。皮肤用 attr() 画，复制差异不带行号
    getLineNumberProps: ({ rowIndex, side }) => normalize.element({
      ...parts['line-number'].attrs,
      'aria-hidden': true,
      'data-side': side,
      'data-line-number': cellNumber({ rowIndex, side })?.toString(),
      'data-change': lineAt(rowIndex)?.change,
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

    // 只有变更处的那几段发 data-change，未变的段落是纯包裹、不着色
    getInlineChangeProps: ({ rowIndex, changed }) => normalize.element({
      ...parts['inline-change'].attrs,
      'data-change': changed ? lineAt(rowIndex)?.change : undefined,
    }),

    getTokenProps: token => normalize.element({
      ...parts.token.attrs,
      'data-kind': token.kind,
    }),

    getGapProps: ({ gapId }) => normalize.element({
      'role': 'row',
      ...parts.gap.attrs,
      'data-expanded': dataAttr(expandedValue.includes(gapId)),
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
      'aria-expanded': expandedValue.includes(gapId) ? 'true' : 'false',
      // 按钮上写的是「⋯ 12」，读出来就是"⋯ 12"，什么都没说明；名字必须自带动作与量词
      'aria-label': expandGapLabel(hiddenCountOf(gapId)),
      'data-value': gapId,
      'onClick': () => send({ type: expandedValue.includes(gapId) ? 'GAP.COLLAPSE' : 'GAP.EXPAND', id: gapId }),
    }),

    // 无变更时的占位。播报交给宿主，这里不开活区
    getEmptyProps: () => normalize.element({
      ...parts.empty.attrs,
      hidden: !isEmpty || undefined,
    }),

    /**
     * 被砍掉多少行的提示条。没截断时带 hidden，与 empty 同一套取舍。
     *
     * 差异从尾部断开之后看着仍像一份完整差异，没有这一条，
     * 评审的人会以为自己看完了，而少掉的恰恰是没被审到的那几行。
     */
    getTruncationProps: () => normalize.element({
      ...parts.truncation.attrs,
      hidden: !truncated || undefined,
    }),

    changeLabel: labelOf,
    cellText,
    cellNumber,
    cellTokens,
    cellSegments,
  }
}

/** 无变更时的兜底文案。 */
export function diffViewEmptyText(translations?: Partial<DiffViewSchema['props']['translations']>): string {
  return translations?.noChanges ?? 'No changes'
}
