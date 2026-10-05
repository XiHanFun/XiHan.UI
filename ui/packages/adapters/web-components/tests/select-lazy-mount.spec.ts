// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface SelectElement extends HTMLElement {
  updateComplete: Promise<unknown>
  collection?: Array<{ value: string, label: string }>
}

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: SelectElement): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

/** lazy-mount：list 里 <template> 写的条目第一次展开才克隆、之后常驻；打开前选中文字取自 collection。 */
function mount(attrs: string): SelectElement {
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-select ${attrs} default-value="apple">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <button data-xh-part="trigger"><span data-xh-part="value-text"></span></button>
        </div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="list"><template>
              <div data-xh-part="item" value="apple"><span data-xh-part="item-text">苹果</span></div>
              <div data-xh-part="item" value="banana"><span data-xh-part="item-text">香蕉</span></div>
            </template></div>
          </div>
        </div>
      </div>
    </xh-select>`
  document.body.appendChild(host)
  const el = host.querySelector('xh-select') as SelectElement
  el.collection = [{ value: 'apple', label: '苹果' }, { value: 'banana', label: '香蕉' }]
  return el
}

const items = (): number => document.querySelectorAll('[data-xh-part="item"]:not(template *)').length

describe('<xh-select lazy-mount>', () => {
  it('缺省把模板里的条目照常克隆进来', async () => {
    const el = mount('')
    await settle(el)
    expect(items()).toBe(2)
  })

  it('打开前不克隆，选中文字取自 collection；第一次展开克隆并接线，收起后留着', async () => {
    const el = mount('lazy-mount')
    await settle(el)
    expect(items()).toBe(0)
    expect(document.querySelector('[data-xh-part="value-text"]')!.textContent).toBe('苹果')
    el.setAttribute('open', '')
    await settle(el)
    expect(items()).toBe(2)
    expect(document.querySelector('[data-xh-part="item"]')!.getAttribute('data-scope')).toBe('select')
    el.setAttribute('open', 'false')
    await settle(el)
    expect(items()).toBe(2)
  })
})
