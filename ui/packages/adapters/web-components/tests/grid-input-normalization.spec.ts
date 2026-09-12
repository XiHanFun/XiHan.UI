// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface GridElement extends HTMLElement {
  updateComplete: Promise<boolean>
}

describe('wc grid 输入归一接线', () => {
  it('把 JSON 断点声明交给 Headless 后落成逐档属性', async () => {
    const host = document.createElement('div')
    host.innerHTML = `<xh-grid cols='{"base":"2","md":"6"}'>
      <div data-xh-part="root"><div data-xh-part="item" span='{"base":"1","lg":"4"}'>内容</div></div>
    </xh-grid>`
    document.body.append(host)
    const element = host.firstElementChild as GridElement
    await element.updateComplete
    const root = element.querySelector<HTMLElement>('[data-xh-part="root"]')!
    const item = element.querySelector<HTMLElement>('[data-xh-part="item"]')!
    expect(root.dataset.cols).toBe('2')
    expect(root.dataset.colsMd).toBe('6')
    expect(item.dataset.span).toBe('1')
    expect(item.dataset.spanLg).toBe('4')
    host.remove()
  })
})
