import { describe, expect, it } from 'vitest'
import { TYPEWRITER_DEFAULT_CHARS_PER_SEC, visibleLength } from '../src/store/typewriter'

describe('visibleLength', () => {
  it('mode=off 恒返回 fullLength，不受时间影响', () => {
    expect(visibleLength(120, 0, { mode: 'off' })).toBe(120)
    expect(visibleLength(120, 5, { mode: 'off' })).toBe(120)
    expect(visibleLength(120, 1e9, { mode: 'off' })).toBe(120)
    // off 模式连 charsPerSec 都不该看
    expect(visibleLength(120, 0, { mode: 'off', charsPerSec: 1 })).toBe(120)
  })

  it('mode=fixed 按 charsPerSec 匀速推进', () => {
    const opts = { mode: 'fixed', charsPerSec: 100 } as const
    expect(visibleLength(1000, 100, opts)).toBe(10)
    expect(visibleLength(1000, 250, opts)).toBe(25)
    expect(visibleLength(1000, 1000, opts)).toBe(100)
  })

  it('推进量向下取整，不吐出半个字', () => {
    expect(visibleLength(1000, 15, { mode: 'fixed', charsPerSec: 100 })).toBe(1)
    expect(visibleLength(1000, 9, { mode: 'fixed', charsPerSec: 100 })).toBe(0)
  })

  it('被 fullLength 夹住，绝不超出全文', () => {
    expect(visibleLength(5, 10_000, { mode: 'fixed', charsPerSec: 100 })).toBe(5)
    expect(visibleLength(0, 10_000, { mode: 'fixed', charsPerSec: 100 })).toBe(0)
  })

  it('elapsedMs 为 0 或负时返回 0（时钟回拨不吐负长度）', () => {
    expect(visibleLength(100, 0, { mode: 'fixed', charsPerSec: 60 })).toBe(0)
    expect(visibleLength(100, -1, { mode: 'fixed', charsPerSec: 60 })).toBe(0)
    expect(visibleLength(100, -99_999, { mode: 'fixed', charsPerSec: 60 })).toBe(0)
  })

  it('缺省速率取 TYPEWRITER_DEFAULT_CHARS_PER_SEC', () => {
    expect(TYPEWRITER_DEFAULT_CHARS_PER_SEC).toBe(60)
    expect(visibleLength(1000, 1000, { mode: 'fixed' })).toBe(TYPEWRITER_DEFAULT_CHARS_PER_SEC)
    expect(visibleLength(1000, 2000, { mode: 'fixed' })).toBe(TYPEWRITER_DEFAULT_CHARS_PER_SEC * 2)
  })

  it('单调不减：时间只往前走，可见长度就只增不减', () => {
    const opts = { mode: 'fixed', charsPerSec: 37 } as const
    let prev = 0
    for (let ms = 0; ms <= 3000; ms += 37) {
      const now = visibleLength(500, ms, opts)
      expect(now).toBeGreaterThanOrEqual(prev)
      prev = now
    }
  })
})
