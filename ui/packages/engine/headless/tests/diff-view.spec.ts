import type { DiffViewSchema } from '../src/diff-view'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { computeTextDiff, connectDiffView, diffStats, diffViewMachine, parseUnifiedPatch } from '../src/diff-view'

type Props = DiffViewSchema['props']
type Dict = Record<string, unknown>

function makeDiffView(initial: Props = {}) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(diffViewMachine, { props: () => props.get(), runtime })
  runtime.start()
  return connectDiffView(service, normalizeProps)
}

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

  it('超过上限即截断并标出来，还要带上砍掉了多少行：AI 会吐超大文件', () => {
    const big = Array.from({ length: 40 }, (_, i) => `l${i}`).join('\n')
    const model = computeTextDiff(big, `${big}\nmore`, { maxLines: 10 })
    expect(model.truncated).toBe(true)
    // 旧的 40 行砍到 10 行、新的 41 行砍到 10 行
    expect(model.truncatedLines).toBe(61)
    expect(computeTextDiff('a', 'b').truncated).toBeUndefined()
  })

  it('两侧各自都没超上限就是一行没掉，不报截断', () => {
    // 上限按两侧分别计。按两侧行数之和判的话这里会报「截断了」却一行也没砍，
    // 界面上就多出一条说「省略了 0 行」的提示
    const model = computeTextDiff('a\nb\nc', 'a\nB\nc', { maxLines: 4 })
    expect(model.truncated).toBeUndefined()
    expect(model.truncatedLines).toBeUndefined()
    expect(model.hunks.flatMap(h => h.lines)).toHaveLength(4)
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

describe('connectDiffView 截断提示', () => {
  const big = Array.from({ length: 40 }, (_, i) => `l${i}`).join('\n')
  const cut = computeTextDiff(big, `${big}\nmore`, { maxLines: 10 })

  it('截断了就把提示条露出来，并说清砍掉了多少行', () => {
    const api = makeDiffView({ model: cut })
    expect(api.truncated).toBe(true)
    expect(api.truncatedLines).toBe(61)
    // 断掉的差异看着仍像一份完整差异，这条提示是读的人唯一的线索
    expect((api.getTruncationProps() as Dict).hidden).toBeUndefined()
    expect(api.truncationText).toContain('61')
    expect((api.getRootProps() as Dict)['data-truncated']).toBe('')
  })

  it('没截断时提示条带 hidden，文字是空串', () => {
    const api = makeDiffView({ model: computeTextDiff('a\nb', 'a\nB') })
    expect(api.truncated).toBe(false)
    expect(api.truncatedLines).toBe(0)
    expect((api.getTruncationProps() as Dict).hidden).toBe(true)
    expect(api.truncationText).toBe('')
    expect((api.getRootProps() as Dict)['data-truncated']).toBeUndefined()
  })

  it('translations.truncated 拿到的是被砍掉的行数', () => {
    const api = makeDiffView({
      model: cut,
      translations: { truncated: count => `还有 ${count} 行没显示出来` },
    })
    expect(api.truncationText).toBe('还有 61 行没显示出来')
  })
})

describe('connectDiffView 展开按钮', () => {
  // 整份文件先收进一个 hunk，再由组件按 contextLines 把中间那段上下文折起来
  const before = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')
  const after = before.replace('line 5', 'X').replace('line 25', 'Y')
  const model = computeTextDiff(before, after, { contextLines: 20 })

  it('可访问名自带动作与行数，不是光秃秃的一个数', () => {
    const api = makeDiffView({ model, contextLines: 2 })
    const gap = api.rows.find(row => row.kind === 'gap')
    expect(gap?.hiddenCount).toBeGreaterThan(0)
    // 按钮上写的是「⋯ 15」，没有名字时读屏念的就是这一句，什么都没说明
    expect((api.getGapTriggerProps({ gapId: gap!.gapId! }) as Dict)['aria-label'])
      .toBe(`Show ${gap!.hiddenCount} hidden lines`)
  })

  it('translations.expandGap 拿到的是这一格自己折起来的行数', () => {
    const api = makeDiffView({
      model,
      contextLines: 2,
      translations: { expandGap: count => `展开折起的 ${count} 行` },
    })
    const gaps = api.rows.filter(row => row.kind === 'gap')
    expect(gaps.length).toBeGreaterThan(0)
    for (const gap of gaps) {
      expect((api.getGapTriggerProps({ gapId: gap.gapId! }) as Dict)['aria-label'])
        .toBe(`展开折起的 ${gap.hiddenCount} 行`)
    }
  })

  it('translations.expandGap 只收函数：给字符串不过类型', () => {
    // @ts-expect-error 名字要把行数念进去，固定串念不出这一格折了多少行
    makeDiffView({ model, contextLines: 2, translations: { expandGap: '展开' } })
    // 这一行的 @ts-expect-error 是判据本身：形状若又放宽回并集，它会因「没有错可期待」而报错
  })
})
