import { describe, expect, it } from 'vitest'
import { normalizeHeatmapNumber, normalizeHeatmapString } from '../src/heatmap'

describe('heatmap 作者身份归一', () => {
  it.each([
    [undefined, undefined],
    [null, undefined],
    ['', undefined],
    ['12', 12],
    [3, 3],
    ['Infinity', undefined],
    ['not-a-number', undefined],
  ])('数字身份 %j 归一为 %j', (input, expected) => {
    expect(normalizeHeatmapNumber(input)).toBe(expected)
  })

  it.each([
    [undefined, undefined],
    [null, undefined],
    ['', undefined],
    ['row-a', 'row-a'],
    [0, '0'],
  ])('字符串身份 %j 归一为 %j', (input, expected) => {
    expect(normalizeHeatmapString(input)).toBe(expected)
  })
})
