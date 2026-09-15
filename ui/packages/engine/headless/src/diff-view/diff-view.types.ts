/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 diff view 类型契约。

import type { CodeToken, MachineSchema, PropTypes, Size } from '@xihan-ui/core'
import type { DiffChange, DiffLine, DiffModel } from './diff-view.model'

export type DiffViewMode = 'unified' | 'split'

/** split 视图中的两侧。unified 只有一列，恒为 old。 */
export type DiffSide = 'old' | 'new'

export interface DiffViewExpandedValueChangeDetails {
  value: string[]
}

/** 铺设出的一行：一行差异，或折叠的一格。 */
export interface DiffViewRow {
  kind: 'line' | 'gap'
  /** 1 基可见行序，与 aria-rowcount 同一口径。 */
  rowIndex: number
  /** kind 为 line 时存在。 */
  line?: DiffLine
  /** kind 为 gap 时存在：该格的身份。 */
  gapId?: string
  /** kind 为 gap 时存在：折叠的行数。 */
  hiddenCount?: number
  /** 该行由展开某一格后显示。 */
  revealed?: boolean
}

/** 一格正文中的一段：词级片段，内部带有自身的着色记号。 */
export interface DiffViewSegment {
  text: string
  /** 该段在配对的另一行中不存在。 */
  changed: boolean
  /** 该段内部的着色记号；不着色时为空数组。 */
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

export interface DiffViewInlineChangeProps {
  rowIndex: number
  /** 该段是否为变更处。 */
  changed: boolean
}

export interface DiffViewSchema extends MachineSchema {
  props: {
    /** 差异模型，唯一入口。补丁与新旧两版文本都先归一到它。 */
    model?: DiffModel
    view?: DiffViewMode
    /** 变更两侧各显示的上下文行数，其余折叠；未提供或非有限值时不折叠。 */
    contextLines?: number
    /** 展开的折叠格 id 集合，提供即受控。 */
    expandedValue?: readonly string[]
    defaultExpandedValue?: readonly string[]
    /** 长行原地折行，不再横向滚动；默认关闭。 */
    wrap?: boolean
    size?: Size
    translations?: Partial<DiffViewTranslations>
    onExpandedValueChange?: (details: DiffViewExpandedValueChangeDetails) => void
  }
  context: {
    expandedValue: string[]
  }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'idle'
  event:
    | { type: 'GAP.EXPAND', id: string }
    | { type: 'GAP.COLLAPSE', id: string }
    // 受控回写：宿主改 expandedValue 后由 watch 派发，无条件写入、不再通知
    | { type: 'CONTROLLED.EXPANDED.SET', value: string[] }
  tag: never
  guard: 'isExpandedControlled'
  action: 'toggleGap' | 'invokeExpandedChange' | 'syncExpanded'
  effect: never
}

export interface DiffViewApi<T extends PropTypes = PropTypes> {
  view: DiffViewMode
  /** 折叠后的可见行序，含折叠的格。 */
  rows: readonly DiffViewRow[]
  expandedValue: string[]
  /** 增删的行数。 */
  stats: { added: number, removed: number }
  /** 模型被上限截断过。 */
  truncated: boolean
  /** 被上限截断、未进入模型的源文本行数；未截断时为 0。 */
  truncatedLines: number
  /** 截断提示条的文字，已代入行数；未截断时为空串。 */
  truncationText: string
  /** 没有任何变更。 */
  isEmpty: boolean
  setExpandedValue: (next: string[]) => void
  toggleGap: (id: string) => void
  getRootProps: () => T['element']
  getHeaderProps: () => T['element']
  /** 头部右侧的增删统计位，增删各一个。 */
  getSummaryProps: (props: { change: DiffChange }) => T['element']
  getViewportProps: () => T['element']
  getBodyProps: () => T['element']
  getRowProps: (props: DiffViewRowProps) => T['element']
  getLineNumberProps: (props: DiffViewCellProps) => T['element']
  getLineContentProps: (props: DiffViewCellProps) => T['element']
  getChangeLabelProps: (props: { change: DiffChange }) => T['element']
  getInlineChangeProps: (props: DiffViewInlineChangeProps) => T['element']
  getTokenProps: (token: CodeToken) => T['element']
  getGapProps: (props: DiffViewGapProps) => T['element']
  getGapCellProps: () => T['element']
  getGapTriggerProps: (props: DiffViewGapProps) => T['button']
  getEmptyProps: () => T['element']
  /** 截断提示条；未截断时带 hidden。 */
  getTruncationProps: () => T['element']
  /** 变更类型对应的读屏文字，写入视觉隐藏的格。 */
  changeLabel: (change: DiffChange) => string
  /** 该行在该侧的文本；split 下空侧为 undefined。 */
  cellText: (props: DiffViewCellProps) => string | undefined
  /** 该行在该侧的行号；不存在时为 undefined。 */
  cellNumber: (props: DiffViewCellProps) => number | undefined
  /** 该行在该侧的着色片段；不着色或空侧时为空数组。 */
  cellTokens: (props: DiffViewCellProps) => readonly CodeToken[]
  /**
   * 该行在该侧的词级片段，着色记号已按片段边界切分。
   * 未计算词级差异时为空数组，此时按 cellTokens / cellText 铺设。
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
  /** 展开按钮的可访问名，入参为该格折叠的行数。 */
  expandGap: (count: number) => string
  /** 没有文件名时表格的兜底可访问名。 */
  diff: string
  /** 没有任何变更时的占位文案。 */
  noChanges: string
  /** 截断提示条的文案，入参为被截断的源文本行数。 */
  truncated: (count: number) => string
}
