// 逐家族豁免表只减不增：tooling/scripts/family-backlog.json 的每一段条目数钉在快照与 CEILING 上，
// 键集合只能是快照键集合的子集。迁走一个组件 = 删 JSON 条目 + `vitest -u` 重录快照 + 下调 CEILING，
// 三者在同一提交里可见；新增一条豁免（新键）在这里直接失败，存量之外的违规只能修实现。
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const BACKLOG = new URL('../../scripts/family-backlog.json', import.meta.url)
const SNAPSHOT = new URL('./__snapshots__/family-backlog.spec.mjs.snap', import.meta.url)

/** 每段的条目上限：初始值 = 首次进仓时的条目数，只许下调。 */
const CEILING = {
  edge: 45,
  selection: 19,
  ladder: 88,
  shape: 25,
  scroll: 28,
  press: 66,
  text: 92,
  motion: 1,
}

const backlog = JSON.parse(readFileSync(BACKLOG, 'utf8'))
const sections = Object.keys(CEILING)

describe('family-backlog 条目数', () => {
  it('七段各一数，与快照一致', () => {
    const counts = Object.fromEntries(sections.map(section => [section, Object.keys(backlog[section] ?? {}).length]))
    expect(counts).toMatchSnapshot()
  })

  it.each(sections)('%s 段不超过 CEILING', (section) => {
    const count = Object.keys(backlog[section] ?? {}).length
    expect(count, `${section} 段 ${count} 条，超过 CEILING ${CEILING[section]}——存量只减不增，新的违规去修实现`).toBeLessThanOrEqual(CEILING[section])
  })

  it('没有 CEILING 之外的分段', () => {
    const extra = Object.keys(backlog).filter(name => name !== '$description' && !sections.includes(name))
    expect(extra).toEqual([])
  })
})

describe('family-backlog 键集合', () => {
  it.each(sections)('%s', (section) => {
    const keys = Object.keys(backlog[section] ?? {}).sort()
    expect(keys).toMatchSnapshot()
  })

  it.each(sections)('%s 段的键是快照键集合的子集', (section) => {
    const keys = Object.keys(backlog[section] ?? {})
    const recorded = snapshotKeys(section)
    if (recorded == null)
      return
    const added = keys.filter(key => !recorded.has(key))
    expect(added, `${section} 段新增了豁免键——表只减不增，新的违规去修实现`).toEqual([])
  })
})

/** 从快照文件里读出某段上一次录下的键集合；首次运行还没有快照时返回 null。 */
function snapshotKeys(section) {
  let text
  try {
    text = readFileSync(SNAPSHOT, 'utf8')
  }
  catch {
    return null
  }
  const block = new RegExp(`exports\\[\`family-backlog 键集合 > ${section} 1\`\\] = \`([\\s\\S]*?)\`;`).exec(text)
  if (!block)
    return null
  return new Set([...block[1].matchAll(/"([^"]+)"/g)].map(m => m[1]))
}
