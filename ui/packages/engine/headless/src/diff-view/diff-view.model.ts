import type { CodeToken, HighlighterPort } from '@xihan-ui/kernel'
import { splitCodeLines } from '../code-view'

/** 一行的变更类型。 */
export type DiffChange = 'context' | 'added' | 'removed'

export interface DiffLine {
  change: DiffChange
  /** 旧文件里的行号，新增行没有。 */
  oldNumber?: number
  /** 新文件里的行号，删除行没有。 */
  newNumber?: number
  text: string
  /** 该行的着色片段，由 computeTextDiff 在建模时一次算好；不着色时缺席。 */
  tokens?: readonly CodeToken[]
  /** 字级差异，本期不产出，位先留着。 */
  segments?: readonly { text: string, changed: boolean }[]
}

export interface DiffHunk {
  /** 形如 `@@ -1,4 +1,6 @@` 的那一行。 */
  header: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: readonly DiffLine[]
}

export interface DiffModel {
  hunks: readonly DiffHunk[]
  oldPath?: string
  newPath?: string
  /** 超过上限被截断了。 */
  truncated?: boolean
}

export interface ComputeTextDiffOptions {
  /** 变更两侧各留几行上下文，默认 3。 */
  contextLines?: number
  /** 两份文本的行数之和超过它就截断，默认 20000。AI 会吐超大文件。 */
  maxLines?: number
  lang?: string
  highlighter?: HighlighterPort
}

/** 编辑脚本一条：保留、删除或新增。 */
interface Edit {
  change: DiffChange
  oldIndex: number
  newIndex: number
}

const DEFAULT_CONTEXT = 3
const DEFAULT_MAX_LINES = 20_000
/** Myers 的编辑距离上限；超过它就不再细算，整段按「全删全增」处理。 */
const MAX_EDIT_DISTANCE = 4000

/**
 * Myers 的贪心算法求最短编辑脚本，O((N+M)D)。
 *
 * 编辑距离超过上限时返回 null：那种情况下两份文本几乎没有共同行，
 * 逐行对齐既算不快也读不出意义，不如整段按「全删全增」呈现。
 */
function myers(a: readonly string[], b: readonly string[]): Edit[] | null {
  const n = a.length
  const m = b.length
  const max = Math.min(n + m, MAX_EDIT_DISTANCE)
  const offset = max
  const v = new Int32Array(2 * max + 2)
  const trace: Int32Array[] = []

  for (let d = 0; d <= max; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      // 往下走（新增）还是往右走（删除）
      const down = k === -d || (k !== d && v[offset + k - 1]! < v[offset + k + 1]!)
      let x = down ? v[offset + k + 1]! : v[offset + k - 1]! + 1
      let y = x - k
      // 沿着相同的行一路对角线走到底
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[offset + k] = x
      if (x >= n && y >= m)
        return backtrack(trace, a, b, d, offset)
    }
  }
  return null
}

/** 顺着记录下来的每一轮 v 往回走，还原编辑脚本。 */
function backtrack(trace: readonly Int32Array[], a: readonly string[], b: readonly string[], d: number, offset: number): Edit[] {
  const edits: Edit[] = []
  let x = a.length
  let y = b.length

  for (let step = d; step > 0; step--) {
    const v = trace[step]!
    const k = x - y
    const down = k === -step || (k !== step && v[offset + k - 1]! < v[offset + k + 1]!)
    const prevK = down ? k + 1 : k - 1
    const prevX = v[offset + prevK]!
    const prevY = prevX - prevK

    while (x > prevX && y > prevY) {
      x--
      y--
      edits.push({ change: 'context', oldIndex: x, newIndex: y })
    }
    if (down) {
      y--
      edits.push({ change: 'added', oldIndex: x, newIndex: y })
    }
    else {
      x--
      edits.push({ change: 'removed', oldIndex: x, newIndex: y })
    }
  }
  while (x > 0 && y > 0) {
    x--
    y--
    edits.push({ change: 'context', oldIndex: x, newIndex: y })
  }
  return edits.reverse()
}

/** 两份文本都当不同：整段全删全增。 */
function replaceAll(a: readonly string[], b: readonly string[]): Edit[] {
  const edits: Edit[] = []
  for (let i = 0; i < a.length; i++) edits.push({ change: 'removed', oldIndex: i, newIndex: 0 })
  for (let j = 0; j < b.length; j++) edits.push({ change: 'added', oldIndex: a.length, newIndex: j })
  return edits
}

/** 逐行着色：整体切一次再按行取，跨行的块注释与多行字符串才不会着错色。 */
function tokenizeLines(text: string, lang: string | undefined, highlighter: HighlighterPort | undefined): readonly (readonly CodeToken[])[] | null {
  if (!highlighter || !lang)
    return null
  const tokens = highlighter.highlight(text, lang)
  if (!tokens)
    return null
  return splitCodeLines(text, tokens).map(line => line.tokens)
}

/**
 * 把编辑脚本切成 hunk：离变更超过 contextLines 行的上下文整段丢掉。
 */
function toHunks(edits: readonly Edit[], contextLines: number, lineOf: (edit: Edit) => DiffLine): DiffHunk[] {
  const changed = edits.map(e => e.change !== 'context')
  if (!changed.includes(true))
    return []

  // 先标出哪些下标要留：变更本身，以及它两侧各 contextLines 行
  const keep = Array.from({ length: edits.length }).fill(false)
  for (let i = 0; i < edits.length; i++) {
    if (!changed[i])
      continue
    for (let j = Math.max(0, i - contextLines); j <= Math.min(edits.length - 1, i + contextLines); j++)
      keep[j] = true
  }

  const hunks: DiffHunk[] = []
  let i = 0
  while (i < edits.length) {
    if (!keep[i]) {
      i++
      continue
    }
    const start = i
    while (i < edits.length && keep[i]) i++
    const slice = edits.slice(start, i)
    const lines = slice.map(lineOf)
    const oldNums = lines.map(l => l.oldNumber).filter((n): n is number => n !== undefined)
    const newNums = lines.map(l => l.newNumber).filter((n): n is number => n !== undefined)
    const oldStart = oldNums[0] ?? 0
    const newStart = newNums[0] ?? 0
    hunks.push({
      header: `@@ -${oldStart},${oldNums.length} +${newStart},${newNums.length} @@`,
      oldStart,
      oldLines: oldNums.length,
      newStart,
      newLines: newNums.length,
      lines,
    })
  }
  return hunks
}

/**
 * 拿新旧两版全文算差异。
 *
 * 着色在这里一次算好并逐行写进 `DiffLine.tokens`：这里手里有两份完整文本，
 * 整体切一次再按行取，跨行的块注释与多行字符串才不会着错色。
 * 连接层因此只做投影、不承担任何词法成本。
 */
export function computeTextDiff(before: string, after: string, options: ComputeTextDiffOptions = {}): DiffModel {
  const contextLines = Number.isFinite(options.contextLines) && options.contextLines! >= 0
    ? Math.floor(options.contextLines!)
    : DEFAULT_CONTEXT
  const maxLines = Number.isFinite(options.maxLines) && options.maxLines! > 0
    ? Math.floor(options.maxLines!)
    : DEFAULT_MAX_LINES

  const oldLines = before.split('\n')
  const newLines = after.split('\n')
  const truncated = oldLines.length + newLines.length > maxLines
  const a = truncated ? oldLines.slice(0, maxLines) : oldLines
  const b = truncated ? newLines.slice(0, maxLines) : newLines

  const edits = myers(a, b) ?? replaceAll(a, b)
  const oldTokens = tokenizeLines(before, options.lang, options.highlighter)
  const newTokens = tokenizeLines(after, options.lang, options.highlighter)

  const lineOf = (edit: Edit): DiffLine => {
    if (edit.change === 'added') {
      return {
        change: 'added',
        newNumber: edit.newIndex + 1,
        text: b[edit.newIndex] ?? '',
        tokens: newTokens?.[edit.newIndex],
      }
    }
    if (edit.change === 'removed') {
      return {
        change: 'removed',
        oldNumber: edit.oldIndex + 1,
        text: a[edit.oldIndex] ?? '',
        tokens: oldTokens?.[edit.oldIndex],
      }
    }
    return {
      change: 'context',
      oldNumber: edit.oldIndex + 1,
      newNumber: edit.newIndex + 1,
      text: a[edit.oldIndex] ?? '',
      tokens: oldTokens?.[edit.oldIndex],
    }
  }

  return { hunks: toHunks(edits, contextLines, lineOf), truncated: truncated || undefined }
}

const HUNK_HEADER = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/

/**
 * 解析统一格式的补丁，一份补丁里可以有多个文件。
 *
 * **一律不填 tokens**：这里拿不到完整文件，跨行的记号切不准。
 * 宁可不着色也不错着色——与代码视图「未闭合默认不着色」是同一条取舍。
 */
export function parseUnifiedPatch(patch: string): readonly DiffModel[] {
  const models: DiffModel[] = []
  let current: { hunks: DiffHunk[], oldPath?: string, newPath?: string } | null = null
  let hunk: { header: string, oldStart: number, oldLines: number, newStart: number, newLines: number, lines: DiffLine[] } | null = null
  let oldNumber = 0
  let newNumber = 0

  const closeHunk = (): void => {
    if (hunk && current)
      current.hunks.push({ ...hunk, lines: hunk.lines })
    hunk = null
  }
  const closeFile = (): void => {
    closeHunk()
    if (current && (current.hunks.length > 0 || current.oldPath || current.newPath))
      models.push({ hunks: current.hunks, oldPath: current.oldPath, newPath: current.newPath })
    current = null
  }

  for (const raw of patch.replace(/\r\n?/g, '\n').split('\n')) {
    if (raw.startsWith('diff --git ')) {
      closeFile()
      current = { hunks: [] }
      continue
    }
    if (raw.startsWith('--- ')) {
      if (!current)
        current = { hunks: [] }
      closeHunk()
      current.oldPath = raw.slice(4).trim()
      continue
    }
    if (raw.startsWith('+++ ')) {
      if (!current)
        current = { hunks: [] }
      current.newPath = raw.slice(4).trim()
      continue
    }
    const header = HUNK_HEADER.exec(raw)
    if (header) {
      if (!current)
        current = { hunks: [] }
      closeHunk()
      oldNumber = Number(header[1])
      newNumber = Number(header[3])
      hunk = {
        header: raw,
        oldStart: oldNumber,
        oldLines: header[2] === undefined ? 1 : Number(header[2]),
        newStart: newNumber,
        newLines: header[4] === undefined ? 1 : Number(header[4]),
        lines: [],
      }
      continue
    }
    if (!hunk)
      continue
    // 「\ No newline at end of file」不是内容行
    if (raw.startsWith('\\'))
      continue
    const marker = raw[0]
    const text = raw.slice(1)
    if (marker === '+') {
      hunk.lines.push({ change: 'added', newNumber, text })
      newNumber++
    }
    else if (marker === '-') {
      hunk.lines.push({ change: 'removed', oldNumber, text })
      oldNumber++
    }
    else if (marker === ' ' || raw === '') {
      hunk.lines.push({ change: 'context', oldNumber, newNumber, text })
      oldNumber++
      newNumber++
    }
  }
  closeFile()
  return models
}

/** 数一份差异里增删各多少行。 */
export function diffStats(model: DiffModel): { added: number, removed: number } {
  let added = 0
  let removed = 0
  for (const hunk of model.hunks) {
    for (const line of hunk.lines) {
      if (line.change === 'added')
        added++
      else if (line.change === 'removed')
        removed++
    }
  }
  return { added, removed }
}
