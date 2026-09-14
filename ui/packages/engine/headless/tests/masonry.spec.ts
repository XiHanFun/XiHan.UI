import { normalizeProps } from '@xihan-ui/core'
import { describe, expect, it } from 'vitest'
import { connectMasonry, distributeMasonry, resolveMasonryColumns } from '../src/masonry/index'

/** 按列汇总落格结果，便于断言"哪几项落在同一列"。 */
function byColumn(assign: readonly number[], columns: number): number[][] {
  const out: number[][] = Array.from({ length: columns }, () => [])
  assign.forEach((column, index) => out[column]!.push(index))
  return out
}

/** 各列的累计高度。 */
function columnHeights(assign: readonly number[], heights: readonly number[], columns: number): number[] {
  const out = Array.from<number>({ length: columns }).fill(0)
  assign.forEach((column, index) => {
    out[column] = out[column]! + heights[index]!
  })
  return out
}

describe('masonry 列数换档', () => {
  it('不写列数按三列：这是组件的缺省版面', () => {
    expect(resolveMasonryColumns(undefined, 1440)).toBe(3)
  })

  it('整数各档同一个列数：宽度再怎么变都不换档', () => {
    expect(resolveMasonryColumns(4, 0)).toBe(4)
    expect(resolveMasonryColumns(4, 1920)).toBe(4)
  })

  it('断点对象自窄到宽逐档接管：宽度落在哪一档就用哪一档的列数', () => {
    const columns = { base: 1, md: 2, xl: 4 }
    expect(resolveMasonryColumns(columns, 0)).toBe(1)
    expect(resolveMasonryColumns(columns, 640)).toBe(1)
    expect(resolveMasonryColumns(columns, 768)).toBe(2)
    expect(resolveMasonryColumns(columns, 1024)).toBe(2)
    expect(resolveMasonryColumns(columns, 1280)).toBe(4)
  })

  it('没写的档沿用比它窄的那一档，最窄那一档也没写就用缺省列数', () => {
    expect(resolveMasonryColumns({ lg: 5 }, 0)).toBe(3)
    expect(resolveMasonryColumns({ lg: 5 }, 1024)).toBe(5)
  })

  it('列数下限是一列：写 0、负数或小数都不会算出零列或半列', () => {
    expect(resolveMasonryColumns(0, 0)).toBe(1)
    expect(resolveMasonryColumns(-3, 0)).toBe(1)
    expect(resolveMasonryColumns(2.7, 0)).toBe(2)
  })

  it('列数不是有限数时退回缺省列数：算出 NaN 列会让整副版面消失', () => {
    expect(resolveMasonryColumns(Number.NaN, 0)).toBe(3)
  })
})

describe('masonry 最短列优先', () => {
  it('每一项落进当前最矮的那一列', () => {
    // 三列：前三项各开一列，第四项该补在最矮的第 1 列（高度 10）上
    const heights = [30, 10, 20, 5]
    expect(distributeMasonry(heights, 3)).toEqual([0, 1, 2, 1])
  })

  it('高度打平时先给装得少的那一列，再看谁靠前', () => {
    expect(distributeMasonry([10, 10, 10, 10], 2)).toEqual([0, 1, 0, 1])
  })

  it('高度全是 0（还没量到）时退成逐列轮流，首帧不会把项全堆在第一列', () => {
    expect(distributeMasonry([0, 0, 0, 0, 0], 3)).toEqual([0, 1, 2, 0, 1])
  })

  it('量不到的高度当 0：负数、NaN 与缺项都不该把某一列算成无穷高', () => {
    const heights = [Number.NaN, -50, 10]
    expect(distributeMasonry(heights, 2)).toEqual([0, 1, 0])
  })

  it('比逐列轮流更齐平：这正是最短列优先存在的理由', () => {
    const heights = [100, 20, 20, 20, 20, 20]
    const assign = distributeMasonry(heights, 3)
    const totals = columnHeights(assign, heights, 3)
    const spread = Math.max(...totals) - Math.min(...totals)
    // 逐列轮流会得到 [120, 40, 40]，落差 80
    expect(spread).toBeLessThan(80)
  })

  it('一列时全落第 0 列', () => {
    expect(distributeMasonry([10, 20, 30], 1)).toEqual([0, 0, 0])
  })

  it('列比项多时空着的列就空着，不挪用别列的项', () => {
    expect(distributeMasonry([10, 20], 4)).toEqual([0, 1])
  })

  it('一项都没有时返回空数组', () => {
    expect(distributeMasonry([], 3)).toEqual([])
  })
})

describe('masonry 逐列填', () => {
  it('每一列拿到的是文档序上连着的一段', () => {
    const heights = [10, 10, 10, 10, 10, 10]
    const assign = distributeMasonry(heights, 3, true)
    expect(byColumn(assign, 3)).toEqual([[0, 1], [2, 3], [4, 5]])
  })

  it('分界线按累计高度走，不按项数：高的那一项独占一列', () => {
    const heights = [100, 10, 10, 10]
    const assign = distributeMasonry(heights, 2, true)
    expect(byColumn(assign, 2)).toEqual([[0], [1, 2, 3]])
  })

  it('总高为 0（还没量到）时按项数均分', () => {
    expect(distributeMasonry([0, 0, 0, 0], 2, true)).toEqual([0, 0, 1, 1])
  })

  it('末尾的列不空着：剩下的项数正好等于没开张的列数时强行换列', () => {
    const heights = [1, 1, 1, 100]
    const assign = distributeMasonry(heights, 3, true)
    // 分界线一直没被走过，全靠"给后面的列各留一项"这条把项分了出去
    expect(byColumn(assign, 3).every(column => column.length > 0)).toBe(true)
  })

  it('项数少于列数时逐项各开一列，不把两项挤在第一列', () => {
    expect(distributeMasonry([0, 0], 3, true)).toEqual([0, 1])
  })

  it('顺序始终不倒：任何一项的列号都不小于它前一项的列号', () => {
    const heights = [40, 5, 60, 5, 5, 30, 5]
    const assign = distributeMasonry(heights, 3, true)
    expect(assign.every((column, index) => index === 0 || column >= assign[index - 1]!)).toBe(true)
  })
})

describe('connectMasonry 属性', () => {
  const api = (props: Parameters<typeof connectMasonry>[0]) => connectMasonry(props, normalizeProps)

  it('根只报排布参数：不写 role，间距与落格策略缺省时一个属性都不输出', () => {
    const root = api({}).getRootProps() as Record<string, unknown>
    expect(root['data-scope']).toBe('masonry')
    expect(root['data-part']).toBe('root')
    expect(root.role).toBeUndefined()
    expect(root['data-gap']).toBeUndefined()
    // 布尔状态位走 dataAttr，假值不输出，皮肤的 [data-sequential] 才不会误命中
    expect(root['data-sequential']).toBeUndefined()
  })

  it('间距档位与逐列填如实落到根上', () => {
    const root = api({ gap: 'lg', sequential: true }).getRootProps() as Record<string, unknown>
    expect(root['data-gap']).toBe('lg')
    expect(root['data-sequential']).toBe('')
  })

  it('列报自己排第几', () => {
    const column = api({}).getColumnProps({ index: 2 }) as Record<string, unknown>
    expect(column['data-part']).toBe('column')
    expect(column['data-index']).toBe('2')
  })

  it('项报原序与落点：重排后 DOM 序等于列序，原序只剩 data-index 认得出来', () => {
    const item = api({}).getItemProps({ index: 5, column: 1 }) as Record<string, unknown>
    expect(item['data-part']).toBe('item')
    expect(item['data-index']).toBe('5')
    expect(item['data-column']).toBe('1')
  })
})
