import type { CodeToken, PropTypes, Size } from '@xihan-ui/kernel'
import type { MachineSchema } from '@xihan-ui/machine'
import type { DiffChange, DiffLine, DiffModel } from './diff-view.model'

export type DiffViewMode = 'unified' | 'split'

/** split 视图里的两侧。unified 只有一列，恒为 old。 */
export type DiffSide = 'old' | 'new'

export interface DiffViewExpandedChangeDetails {
  expanded: string[]
}

/** 铺出来的一行：要么是一行差异，要么是折起来的那一格。 */
export interface DiffViewRow {
  kind: 'line' | 'gap'
  /** 1 基可见行序，与 aria-rowcount 同一口径。 */
  rowIndex: number
  /** kind 为 line 时有。 */
  line?: DiffLine
  /** kind 为 gap 时有：这一格的身份。 */
  gapId?: string
  /** kind 为 gap 时有：折起来多少行。 */
  hiddenCount?: number
  /** 这一行是展开某一格才露出来的。 */
  revealed?: boolean
}

/** 一格正文里的一段：词级片段，内部还带着自己那几个着色记号。 */
export interface DiffViewSegment {
  text: string
  /** 这一段在配对的另一行里没有。 */
  changed: boolean
  /** 这一段内部的着色记号；不着色时为空数组。 */
  tokens: readonly CodeToken[]
}

export interface DiffViewRowProps {
  rowIndex: number
}

export interface DiffViewCellProps {
  rowIndex: number
  side: DiffSide
}

export interface DiffViewGapProps {
  gapId: string
}

export interface DiffViewSegmentProps {
  rowIndex: number
  /** 这一段是不是变更处。 */
  changed: boolean
}

export interface DiffViewSchema extends MachineSchema {
  props: {
    /** 差异模型，唯一入口。补丁与新旧两版文本都先归一到它。 */
    model?: DiffModel
    view?: DiffViewMode
    /** 变更两侧各露几行上下文，其余折起来；不给或非有限值即不折叠。 */
    contextLines?: number
    /** 展开的折叠格 id 集合，给了即受控。 */
    expanded?: readonly string[]
    defaultExpanded?: readonly string[]
    /** 长行原地折行，不再横向滚动；默认关。 */
    wrap?: boolean
    size?: Size
    translations?: Partial<DiffViewTranslations>
    onExpandedChange?: (details: DiffViewExpandedChangeDetails) => void
  }
  context: {
    expanded: string[]
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'GAP.EXPAND', id: string }
    | { type: 'GAP.COLLAPSE', id: string }
    // 受控回写：宿主改 expanded 后由 watch 派发，无条件写入、不再通知
    | { type: 'CONTROLLED.EXPANDED.SET', value: string[] }
  tag: never
  guard: 'isExpandedControlled'
  action: 'toggleGap' | 'invokeExpandedChange' | 'syncExpanded'
  effect: never
}

export interface DiffViewApi<T extends PropTypes = PropTypes> {
  view: DiffViewMode
  /** 折叠后的可见行序，含折起来的那些格。 */
  rows: readonly DiffViewRow[]
  expanded: string[]
  /** 增删各多少行。 */
  stats: { added: number, removed: number }
  /** 模型被上限截断过。 */
  truncated: boolean
  /** 被上限砍掉、压根没进这份模型的源文本行数；没截断就是 0。 */
  truncatedLines: number
  /** 截断提示条的文字，已把行数代进去；没截断时是空串。 */
  truncationText: string
  /** 一条变更都没有。 */
  isEmpty: boolean
  setExpanded: (next: string[]) => void
  toggleGap: (id: string) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  /** 头部右侧的增删统计位，增删各一个。 */
  getStatProps: (props: { change: DiffChange }) => T['element']
  getViewportProps: () => T['element']
  getBodyProps: () => T['element']
  getRowProps: (props: DiffViewRowProps) => T['element']
  getLineNumberProps: (props: DiffViewCellProps) => T['element']
  getLineContentProps: (props: DiffViewCellProps) => T['element']
  getChangeLabelProps: (props: { change: DiffChange }) => T['element']
  getSegmentProps: (props: DiffViewSegmentProps) => T['element']
  getTokenProps: (token: CodeToken) => T['element']
  getGapProps: (props: DiffViewGapProps) => T['element']
  getGapCellProps: () => T['element']
  getGapTriggerProps: (props: DiffViewGapProps) => T['button']
  getEmptyProps: () => T['element']
  /** 截断提示条；没截断时带 hidden。 */
  getTruncationProps: () => T['element']
  /** 变更类型对应的读屏文字，写进视觉隐藏的那一格。 */
  changeLabel: (change: DiffChange) => string
  /** 这一行在这一侧的文本；split 下空侧为 undefined。 */
  cellText: (props: DiffViewCellProps) => string | undefined
  /** 这一行在这一侧的行号；没有就是 undefined。 */
  cellNumber: (props: DiffViewCellProps) => number | undefined
  /** 这一行在这一侧的着色片段；不着色或空侧时为空数组。 */
  cellTokens: (props: DiffViewCellProps) => readonly CodeToken[]
  /**
   * 这一行在这一侧的词级片段，着色记号已按片段边界切好。
   * 没算词级差异时为空数组，此时照 cellTokens / cellText 铺。
   */
  cellSegments: (props: DiffViewCellProps) => readonly DiffViewSegment[]
}

export interface DiffViewTranslations {
  /** 新增行的读屏文字。 */
  added: string
  /** 删除行的读屏文字。 */
  removed: string
  /** 未改动行的读屏文字。 */
  unchanged: string
  /**
   * 展开按钮的可访问名。给函数能把折起来的行数念进名字里；给字符串则是固定名字。
   *
   * 两种都收是为了不推翻已经传字符串的调用方——只支持函数会让它们在运行时炸。
   */
  expandGap: string | ((count: number) => string)
  /** 没有文件名时表格的兜底可访问名。 */
  diff: string
  /** 一条变更都没有时的占位文案。 */
  noChanges: string
  /** 截断提示条的文案，入参是被砍掉的源文本行数。 */
  truncated: (count: number) => string
}
