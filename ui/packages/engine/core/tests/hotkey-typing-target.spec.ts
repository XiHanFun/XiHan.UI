// @vitest-environment jsdom
// 打字的落点：快捷键的单键组合落在这些地方时让路。
import { describe, expect, it } from 'vitest'
import { isTypingTarget } from '../src/hotkey'

describe('isTypingTarget', () => {
  it('打字的地方：文本域、文本输入与可编辑区算，复选框不算', () => {
    expect(isTypingTarget(document.createElement('textarea'))).toBe(true)
    expect(isTypingTarget(document.createElement('input'))).toBe(true)
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    expect(isTypingTarget(checkbox)).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})
