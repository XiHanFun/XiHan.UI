import { describe, expect, it } from 'vitest'
import { wheelPixels } from '../src'

describe('滚轮像素换算', () => {
  it('按像素计量时原样返回', () => {
    expect(wheelPixels({ deltaX: 3, deltaY: -120, deltaMode: 0 })).toEqual({ x: 3, y: -120 })
  })

  it('按行、按页计量时缺省一行 16、一页 400 像素', () => {
    expect(wheelPixels({ deltaX: 0, deltaY: 3, deltaMode: 1 })).toEqual({ x: 0, y: 48 })
    expect(wheelPixels({ deltaX: -1, deltaY: 1, deltaMode: 2 })).toEqual({ x: -400, y: 400 })
  })

  it('一行、一页的像素可以指定', () => {
    expect(wheelPixels({ deltaX: 2, deltaY: 2, deltaMode: 1 }, { line: 20 })).toEqual({ x: 40, y: 40 })
    expect(wheelPixels({ deltaX: 0, deltaY: 1, deltaMode: 2 }, { page: 600 })).toEqual({ x: 0, y: 600 })
  })

  it('未知的计量方式按像素处理', () => {
    expect(wheelPixels({ deltaX: 1, deltaY: 2, deltaMode: 7 })).toEqual({ x: 1, y: 2 })
  })
})
