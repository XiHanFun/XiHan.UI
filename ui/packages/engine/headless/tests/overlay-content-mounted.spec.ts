// 锚定浮层共用的内容挂卸判定：展开中一律算在场，不等适配器的退场闸门跟上。
import { describe, expect, it } from 'vitest'
import { overlayContentMounted } from '../src/shared/disclosure-mount'

type Key = 'lazyMount' | 'unmountOnExit'
function props(on: Partial<Record<Key, boolean>>): (key: Key) => boolean | undefined {
  return key => on[key]
}

describe('overlayContentMounted', () => {
  it('缺省恒挂载', () => {
    expect(overlayContentMounted(props({}), false, false)(false)).toBe(true)
  })

  it('unmountOnExit：展开中闸门还没跟上也挂着；收起后闸门开着挂着、落下即卸', () => {
    const on = props({ unmountOnExit: true })
    expect(overlayContentMounted(on, true, true)(false)).toBe(true)
    expect(overlayContentMounted(on, true, false)(true)).toBe(true)
    expect(overlayContentMounted(on, true, false)(false)).toBe(false)
  })

  it('lazyMount：没展开过不挂，展开过之后闸门落下也挂着', () => {
    const on = props({ lazyMount: true })
    expect(overlayContentMounted(on, false, false)(false)).toBe(false)
    expect(overlayContentMounted(on, true, false)(false)).toBe(true)
  })
})
