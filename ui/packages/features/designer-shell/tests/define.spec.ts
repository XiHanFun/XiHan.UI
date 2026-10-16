// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { defineDesignerShell, DESIGNER_SHELL_ELEMENTS } from '../src'
import { designerShellZhCN } from '../src/locale'

describe('登记与注册', () => {
  it('登记表里的标签都以 xh-designer- 开头，全量注册可以重复调用', () => {
    expect(Object.keys(DESIGNER_SHELL_ELEMENTS).every(tag => tag.startsWith('xh-designer-'))).toBe(true)
    expect(() => {
      defineDesignerShell()
      defineDesignerShell()
    }).not.toThrow()
    for (const [tag, ctor] of Object.entries(DESIGNER_SHELL_ELEMENTS))
      expect(customElements.get(tag)).toBe(ctor)
  })

  it('中文语言包的键都是登记过的标签', () => {
    const tags = Object.keys(DESIGNER_SHELL_ELEMENTS)
    expect(Object.keys(designerShellZhCN.translations ?? {}).every(tag => tags.includes(tag))).toBe(true)
  })
})
