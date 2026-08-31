import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { computeTextDiff, diffStats, parseUnifiedPatch } from '../src/diff-view'

describe('computeTextDiff', () => {
  it('一行改一处：删一行、增一行，两侧行号各自推进', () => {
    const model = computeTextDiff('a\nb\nc', 'a\nB\nc')
    const lines = model.hunks.flatMap(h => h.lines)
    expect(lines.map(l => `${l.change}:${l.text}`)).toEqual([
      'context:a',
      'removed:b',
      'added:B',
      'context:c',
    ])
    expect(lines[1]!.oldNumber).toBe(2)
    expect(lines[1]!.newNumber).toBeUndefined()
    expect(lines[2]!.newNumber).toBe(2)
    expect(lines[2]!.oldNumber).toBeUndefined()
  })

  it('两份一模一样时一个 hunk 都不出', () => {
    expect(computeTextDiff('a\nb', 'a\nb').hunks).toEqual([])
  })

  it('离变更超过上下文行数的那些行整段丢掉', () => {
    const before = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n')
    const after = before.replace('line 10', 'LINE 10')
    const model = computeTextDiff(before, after, { contextLines: 2 })
    const lines = model.hunks.flatMap(h => h.lines)
    // 变更两行 + 两侧各 2 行上下文
    expect(lines).toHaveLength(6)
    expect(lines[0]!.text).toBe('line 8')
    expect(lines.at(-1)!.text).toBe('line 12')
  })

  it('远隔两处的变更切成两个 hunk', () => {
    const before = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')
    const after = before.replace('line 2', 'X').replace('line 27', 'Y')
    expect(computeTextDiff(before, after, { contextLines: 2 }).hunks).toHaveLength(2)
  })

  it('超过上限即截断并标出来：AI 会吐超大文件', () => {
    const big = Array.from({ length: 40 }, (_, i) => `l${i}`).join('\n')
    expect(computeTextDiff(big, `${big}\nmore`, { maxLines: 10 }).truncated).toBe(true)
    expect(computeTextDiff('a', 'b').truncated).toBeUndefined()
  })

  it('增删统计只数变更行', () => {
    expect(diffStats(computeTextDiff('a\nb', 'a\nB\nc'))).toEqual({ added: 2, removed: 1 })
  })
})

describe('parseUnifiedPatch', () => {
  const patch = [
    'diff --git a/src/a.ts b/src/a.ts',
    '--- a/src/a.ts',
    '+++ b/src/a.ts',
    '@@ -1,3 +1,4 @@',
    ' const a = 1',
    '-const b = 2',
    '+const b = 3',
    '+const c = 4',
    ' export { a }',
  ].join('\n')

  it('解析出文件名、hunk 头与逐行变更', () => {
    const [model] = parseUnifiedPatch(patch)
    expect(model!.oldPath).toBe('a/src/a.ts')
    expect(model!.newPath).toBe('b/src/a.ts')
    expect(model!.hunks).toHaveLength(1)
    expect(model!.hunks[0]!.lines.map(l => l.change)).toEqual([
      'context',
      'removed',
      'added',
      'added',
      'context',
    ])
  })

  it('行号按各自的一侧推进', () => {
    const lines = parseUnifiedPatch(patch)[0]!.hunks[0]!.lines
    expect(lines[0]!.oldNumber).toBe(1)
    expect(lines[0]!.newNumber).toBe(1)
    expect(lines[1]!.oldNumber).toBe(2)
    expect(lines[3]!.newNumber).toBe(3)
    expect(lines[4]!.oldNumber).toBe(3)
    expect(lines[4]!.newNumber).toBe(4)
  })

  it('一律不填着色：这里拿不到完整文件，跨行的记号切不准', () => {
    // 宁可不着色也不错着色，与代码视图「未闭合默认不着色」是同一条取舍
    const lines = parseUnifiedPatch(patch)[0]!.hunks[0]!.lines
    expect(lines.every(l => l.tokens === undefined)).toBe(true)
  })

  it('一份补丁里的多个文件各成一份模型', () => {
    const two = `${patch}\ndiff --git a/src/b.ts b/src/b.ts\n--- a/src/b.ts\n+++ b/src/b.ts\n@@ -1 +1 @@\n-x\n+y`
    expect(parseUnifiedPatch(two)).toHaveLength(2)
  })

  it('「没有行尾换行」那一行不是内容行', () => {
    const withMarker = `${patch}\n\\ No newline at end of file`
    const lines = parseUnifiedPatch(withMarker)[0]!.hunks[0]!.lines
    expect(lines.every(l => !l.text.startsWith('No newline'))).toBe(true)
  })
})
