// 多选上限的归一规则：日历、时间、颜色选择器与选择器、组合框共用这一条。
import { describe, expect, it } from 'vitest'
import { resolveMaxSelected } from '../src/shared/max-selected'

describe('resolveMaxSelected', () => {
  it('正整数原样作上限，小数向下取整', () => {
    expect(resolveMaxSelected(3)).toBe(3)
    expect(resolveMaxSelected(2.9)).toBe(2)
  })

  it('没给、小于 1、不是有限数：不设上限', () => {
    expect(resolveMaxSelected(undefined)).toBeNull()
    expect(resolveMaxSelected(0)).toBeNull()
    expect(resolveMaxSelected(0.5)).toBeNull()
    expect(resolveMaxSelected(-2)).toBeNull()
    expect(resolveMaxSelected(Number.NaN)).toBeNull()
    expect(resolveMaxSelected(Number.POSITIVE_INFINITY)).toBeNull()
  })
})
