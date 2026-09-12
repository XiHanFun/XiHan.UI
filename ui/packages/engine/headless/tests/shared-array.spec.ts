import { describe, expect, it } from 'vitest'
import { sameArray, toArray, uniqueArray } from '../src/shared/array'

describe('shared array helpers', () => {
  it('逐位严格比较，不把新引用误判为变化', () => {
    expect(sameArray(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(sameArray(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(sameArray([Number.NaN], [Number.NaN])).toBe(false)
    expect(sameArray([], undefined)).toBe(false)
  })

  it('区分非受控 undefined、显式空 null、裸值与数组副本', () => {
    const values = ['a', 'b']
    expect(toArray(undefined)).toBeUndefined()
    expect(toArray(null)).toEqual([])
    expect(toArray('a')).toEqual(['a'])
    expect(toArray(values)).toEqual(values)
    expect(toArray(values)).not.toBe(values)
  })

  it('去重时保留首次出现顺序', () => {
    expect(uniqueArray(['b', 'a', 'b', 'c', 'a'])).toEqual(['b', 'a', 'c'])
  })
})
