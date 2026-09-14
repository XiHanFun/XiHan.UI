import { describe, expect, it } from 'vitest'
import { normalizeGridCount, normalizeGridTier } from '../src/grid'

describe('grid 作者声明归一', () => {
  it.each([
    [undefined, undefined],
    ['', undefined],
    ['3', 3],
    [4, 4],
    ['invalid', undefined],
    ['Infinity', undefined],
  ])('单值 %j 归一为 %j', (input, expected) => {
    expect(normalizeGridCount(input)).toEqual(expected)
  })

  it('统一对象、JSON 对象与逐档字符串数值', () => {
    expect(normalizeGridTier({ base: '1', md: 6, xl: '12' })).toEqual({ base: 1, md: 6, xl: 12 })
    expect(normalizeGridTier('{"base":"2","lg":8,"unknown":4}')).toEqual({ base: 2, lg: 8 })
  })

  it('拒绝非法 JSON、数组和非有限档位', () => {
    expect(normalizeGridTier('{bad json')).toBeUndefined()
    expect(normalizeGridTier([] as never)).toBeUndefined()
    expect(normalizeGridTier({ base: 'invalid', md: 'Infinity' })).toEqual({})
  })
})
