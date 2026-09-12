import { describe, expect, it } from 'vitest'
import { groupAdjacentRuns } from '../src'

interface Item {
  value: string
  group?: string | null
}

describe('groupAdjacentRuns', () => {
  it('只合并相邻且同键的条目', () => {
    const items: Item[] = [
      { value: 'a', group: 'file' },
      { value: 'b', group: 'file' },
      { value: 'c', group: 'edit' },
      { value: 'd', group: 'file' },
    ]

    expect(groupAdjacentRuns(items, item => item.group).map(run => run.map(item => item.value)))
      .toEqual([['a', 'b'], ['c'], ['d']])
  })

  it('没有键的条目即使相邻也各自成段', () => {
    const items: Item[] = [
      { value: 'a' },
      { value: 'b', group: null },
      { value: 'c' },
    ]

    expect(groupAdjacentRuns(items, item => item.group).map(run => run.map(item => item.value)))
      .toEqual([['a'], ['b'], ['c']])
  })

  it('不改写输入集合或条目', () => {
    const items = Object.freeze([
      Object.freeze({ value: 'a', group: 'file' }),
      Object.freeze({ value: 'b', group: 'file' }),
    ])

    const runs = groupAdjacentRuns(items, item => item.group)
    expect(runs).toEqual([[items[0], items[1]]])
    expect(items).toHaveLength(2)
  })
})
