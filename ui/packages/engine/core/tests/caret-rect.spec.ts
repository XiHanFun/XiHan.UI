// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { caretClientRect } from '../src/behavior/caret/caret-rect'

afterEach(() => {
  document.body.replaceChildren()
})

describe('caretClientRect', () => {
  it('元素不在文档里时返回 null', () => {
    const input = document.createElement('input')
    input.value = 'abc'
    expect(caretClientRect(input, 1)).toBeNull()
  })

  it('没有布局时返回 null，也不在文档里留下镜像', () => {
    const textarea = document.createElement('textarea')
    textarea.value = 'abc'
    document.body.append(textarea)
    expect(caretClientRect(textarea, 2)).toBeNull()
    expect(document.body.children).toHaveLength(1)
  })
})
