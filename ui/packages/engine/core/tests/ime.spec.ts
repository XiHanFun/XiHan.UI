import { describe, expect, it } from 'vitest'
import { isComposingEvent } from '../src/kernel/capability/ime'

describe('输入法组合态探测', () => {
  it('isComposing 为真即组合中', () => {
    expect(isComposingEvent({ isComposing: true })).toBe(true)
  })

  it('keyCode 229 兜住不上报 isComposing 的输入法', () => {
    expect(isComposingEvent({ keyCode: 229 })).toBe(true)
    expect(isComposingEvent({ isComposing: false, keyCode: 229 })).toBe(true)
  })

  it('普通按键不算组合中', () => {
    expect(isComposingEvent({ isComposing: false, keyCode: 13 })).toBe(false)
    expect(isComposingEvent({})).toBe(false)
  })

  it('只认 true 与 229，不做宽松真值判断', () => {
    expect(isComposingEvent({ isComposing: undefined })).toBe(false)
    expect(isComposingEvent({ keyCode: 0 })).toBe(false)
    expect(isComposingEvent({ keyCode: 230 })).toBe(false)
  })
})
