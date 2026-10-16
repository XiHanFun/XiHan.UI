// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import * as define from '../src/define'
import { defineXhElement, defineXhElements, XhStatisticElement, XhTableElement } from '../src/define'

/** 注册表挂在全局上：标签 → { 版本, 构造器 }。 */
function registered(): Map<string, { version: string, ctor: CustomElementConstructor }> {
  return (globalThis as Record<string, unknown>).__XIHAN_UI_WC__ as Map<string, { version: string, ctor: CustomElementConstructor }>
}

describe('define exports', () => {
  it('全量注册的每一个元素类都从 /define 导出', () => {
    defineXhElements()
    const exported = new Set<unknown>(Object.values(define).filter(value => typeof value === 'function'))
    const missing = [...registered()].filter(([, entry]) => !exported.has(entry.ctor)).map(([tag]) => tag)
    expect(missing).toEqual([])
    expect(registered().size).toBeGreaterThan(100)
  })

  it('按需注册与全量注册同一张注册表：同一版本重复注册不报错，标签被别的构造器占着时抛错', () => {
    defineXhElements()
    expect(() => defineXhElement('xh-statistic', XhStatisticElement)).not.toThrow()
    expect(customElements.get('xh-statistic')).toBe(XhStatisticElement)
    class Other extends HTMLElement {}
    customElements.define('xh-other-probe', Other)
    expect(() => defineXhElement('xh-other-probe' as 'xh-statistic', XhStatisticElement)).toThrow()
  })

  it('标签与元素类对不上时类型不通过', () => {
    const misuse = (): void => {
      // @ts-expect-error xh-statistic 只接 XhStatisticElement
      defineXhElement('xh-statistic', XhTableElement)
    }
    expect(misuse).toBeTypeOf('function')
  })
})
