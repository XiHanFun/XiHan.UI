import type { SelectionMode, SelectionState } from '../src/selection/types'
import { describe, expect, it } from 'vitest'
import { applySelection, clearSelection, EMPTY_SELECTION, rangeBetween, toggleSelectAll } from '../src/selection/select'

const ITEMS = ['a', 'b', 'c', 'd', 'e']

function state(selected: string[], anchor: string | null = null): SelectionState {
  return { selected, anchor }
}

function click(
  from: SelectionState,
  value: string,
  opts: { extend?: boolean, additive?: boolean, mode?: SelectionMode, disabled?: string[] } = {},
): SelectionState {
  return applySelection({
    state: from,
    mode: opts.mode ?? 'multiple',
    value,
    extend: opts.extend,
    additive: opts.additive,
    items: ITEMS,
    isDisabled: opts.disabled ? (v: string) => opts.disabled!.includes(v) : undefined,
  })
}

describe('裸点击', () => {
  it('整份换成这一项，锚点挪过来', () => {
    expect(click(state(['a', 'b'], 'a'), 'd')).toEqual({ selected: ['d'], anchor: 'd' })
  })

  it('点已选中的那一项也是只剩它——裸点击不是切换', () => {
    expect(click(state(['a', 'b'], 'a'), 'a')).toEqual({ selected: ['a'], anchor: 'a' })
  })
})

describe('按住 Ctrl 点击', () => {
  it('没选中就加上，锚点挪过来', () => {
    expect(click(state(['a']), 'c', { additive: true })).toEqual({ selected: ['a', 'c'], anchor: 'c' })
  })

  it('已选中就去掉', () => {
    expect(click(state(['a', 'c']), 'a', { additive: true })).toEqual({ selected: ['c'], anchor: 'a' })
  })

  it('去掉之后锚点仍落在刚点的那一项上——下一次 Shift 从这里起量', () => {
    expect(click(state(['a']), 'a', { additive: true }).anchor).toBe('a')
  })
})

describe('按住 Shift 点击', () => {
  it('选中锚点到这一项那一段', () => {
    expect(click(state(['b'], 'b'), 'd', { extend: true })).toEqual({ selected: ['b', 'c', 'd'], anchor: 'b' })
  })

  it('往回点选出来的是同一段——先后不看谁先点，看在全序里的位置', () => {
    expect(click(state(['d'], 'd'), 'b', { extend: true }).selected).toEqual(['b', 'c', 'd'])
  })

  it('锚点不动：连着按 Shift 能从同一个起点改选区大小', () => {
    const first = click(state(['b'], 'b'), 'd', { extend: true })
    expect(first.anchor).toBe('b')
    const second = click(first, 'c', { extend: true })
    expect(second.selected).toEqual(['b', 'c'])
    expect(second.anchor).toBe('b')
  })

  it('整份替换，不是并入——上一段选区会被这一段顶掉', () => {
    expect(click(state(['a', 'e'], 'b'), 'c', { extend: true }).selected).toEqual(['b', 'c'])
  })

  it('还没有锚点时退化成裸点击', () => {
    expect(click(EMPTY_SELECTION, 'c', { extend: true })).toEqual({ selected: ['c'], anchor: 'c' })
  })

  it('点锚点自己就是只有它那一项', () => {
    expect(click(state(['b'], 'b'), 'b', { extend: true }).selected).toEqual(['b'])
  })
})

describe('按住 Ctrl 与 Shift 点击', () => {
  it('那一段并进当前集合，原有的留着', () => {
    const next = click(state(['a'], 'c'), 'e', { extend: true, additive: true })
    expect(next.selected).toEqual(['a', 'c', 'd', 'e'])
    expect(next.anchor).toBe('c')
  })

  it('并入时不重复', () => {
    const next = click(state(['c', 'd'], 'c'), 'e', { extend: true, additive: true })
    expect(next.selected).toEqual(['c', 'd', 'e'])
  })
})

describe('禁用项', () => {
  it('点不动', () => {
    const before = state(['a'], 'a')
    expect(click(before, 'c', { disabled: ['c'] })).toBe(before)
  })

  it('范围选跳过它，但它仍占着顺序位置', () => {
    expect(click(state(['a'], 'a'), 'd', { extend: true, disabled: ['c'] }).selected).toEqual(['a', 'b', 'd'])
  })

  it('按住 Ctrl 点也点不动', () => {
    const before = state(['a'])
    expect(click(before, 'c', { additive: true, disabled: ['c'] })).toBe(before)
  })
})

describe('单选', () => {
  it('恒是换成这一项', () => {
    expect(click(state(['a'], 'a'), 'c', { mode: 'single' })).toEqual({ selected: ['c'], anchor: 'c' })
  })

  it('忽略两个修饰键——多选语义在单选下没有意义', () => {
    expect(click(state(['a'], 'a'), 'c', { mode: 'single', extend: true }).selected).toEqual(['c'])
    expect(click(state(['a'], 'a'), 'c', { mode: 'single', additive: true }).selected).toEqual(['c'])
  })
})

describe('不可选', () => {
  it('none 原样返回', () => {
    const before = state(['a'], 'a')
    expect(click(before, 'c', { mode: 'none' })).toBe(before)
    expect(click(before, 'c', { mode: 'none', additive: true })).toBe(before)
  })
})

describe('全选 / 全不选', () => {
  const order = { items: ITEMS }

  it('没全选就整段选上', () => {
    expect(toggleSelectAll(state(['a']), order).selected).toEqual(ITEMS)
  })

  it('已全选就整段清空', () => {
    expect(toggleSelectAll(state([...ITEMS]), order).selected).toEqual([])
  })

  it('只动可选项：禁用的既不会被选上，也不会挡住「已全选」的判定', () => {
    const withDisabled = { items: ITEMS, isDisabled: (v: string) => v === 'c' }
    const on = toggleSelectAll(state([]), withDisabled)
    expect(on.selected).toEqual(['a', 'b', 'd', 'e'])
    // 可选项已全在集合里，再按一次就该清空——不因为 c 没被选上而判成「还没全选」
    expect(toggleSelectAll(on, withDisabled).selected).toEqual([])
  })

  it('一个可选项都没有时清空', () => {
    expect(toggleSelectAll(state(['a']), { items: ITEMS, isDisabled: () => true }).selected).toEqual([])
  })

  it('不动锚点：全选不是「点了某一项」', () => {
    expect(toggleSelectAll(state(['a'], 'b'), order).anchor).toBe('b')
  })
})

describe('清空', () => {
  it('选中集与锚点一并清掉', () => {
    expect(clearSelection()).toEqual({ selected: [], anchor: null })
  })
})

describe('取两项之间那一段', () => {
  const order = { items: ITEMS }

  it('含两端', () => {
    expect(rangeBetween('b', 'd', order)).toEqual(['b', 'c', 'd'])
  })

  it('两端相同就只有那一项', () => {
    expect(rangeBetween('c', 'c', order)).toEqual(['c'])
  })

  it('反着给也是同一段', () => {
    expect(rangeBetween('d', 'b', order)).toEqual(['b', 'c', 'd'])
  })

  it('有一端不在全序里就是空段', () => {
    expect(rangeBetween('b', 'zzz', order)).toEqual([])
    expect(rangeBetween('zzz', 'b', order)).toEqual([])
  })

  it('跳过禁用项', () => {
    expect(rangeBetween('a', 'e', { items: ITEMS, isDisabled: v => v === 'b' || v === 'd' })).toEqual(['a', 'c', 'e'])
  })
})
