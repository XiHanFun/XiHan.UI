// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

function mount(html: string): Updatable {
  const host = document.createElement('div')
  host.innerHTML = html
  document.body.appendChild(host)
  return host.firstElementChild as Updatable
}

function flags(el: HTMLElement): string[] {
  return [...el.querySelectorAll<HTMLElement>('[data-xh-part="item"]')].map(item => item.getAttribute('aria-disabled') ?? '(无)')
}

function item(el: HTMLElement, value: string): HTMLButtonElement {
  return el.querySelector<HTMLButtonElement>(`[data-xh-part="item"][value="${value}"]`)!
}

const TOOLBAR = `
  <xh-toolbar>
    <div data-xh-part="root" aria-label="编辑">
      <button data-xh-part="item" type="button" value="undo" disabled>撤销</button>
      <button data-xh-part="item" type="button" value="redo">重做</button>
      <button data-xh-part="item" type="button" value="save" aria-disabled="true">保存</button>
    </div>
  </xh-toolbar>
`

/**
 * connect 每帧把 aria-disabled 写回条目。作者用原生 disabled 禁用条目、之后再去掉时，
 * 条目上还留着元素自己写回的 aria-disabled="true"，若把它当作者声明读回来，条目就再也解不开。
 */
describe('条目禁用声明随作者的修改变化', () => {
  it('增删原生 disabled：条目随之禁用与解禁', async () => {
    const el = mount(TOOLBAR)
    await settle(el)
    expect(flags(el)).toEqual(['true', 'false', 'true'])

    item(el, 'undo').disabled = false
    await settle(el)
    expect(flags(el)).toEqual(['false', 'false', 'true'])

    item(el, 'redo').disabled = true
    await settle(el)
    expect(flags(el)).toEqual(['false', 'true', 'true'])

    item(el, 'redo').disabled = false
    item(el, 'undo').disabled = true
    await settle(el)
    expect(flags(el)).toEqual(['true', 'false', 'true'])
  })

  it('改写 aria-disabled：作者写 false 即解禁，写 true 即禁用', async () => {
    const el = mount(TOOLBAR)
    await settle(el)
    item(el, 'save').setAttribute('aria-disabled', 'false')
    await settle(el)
    expect(flags(el)).toEqual(['true', 'false', 'false'])

    item(el, 'redo').setAttribute('aria-disabled', 'true')
    await settle(el)
    expect(flags(el)).toEqual(['true', 'true', 'false'])
  })

  it('整条禁用再解禁，以及解禁期间作者改过的声明，都按作者的声明还原', async () => {
    const el = mount(TOOLBAR)
    await settle(el)
    el.toggleAttribute('disabled', true)
    await settle(el)
    expect(flags(el)).toEqual(['true', 'true', 'true'])

    item(el, 'undo').disabled = false
    await settle(el)
    expect(flags(el)).toEqual(['true', 'true', 'true'])

    el.toggleAttribute('disabled', false)
    await settle(el)
    expect(flags(el)).toEqual(['false', 'false', 'true'])
  })

  it('挂载时就整条禁用，解禁后仍按作者的声明', async () => {
    const el = mount(TOOLBAR.replace('<xh-toolbar>', '<xh-toolbar disabled>'))
    await settle(el)
    expect(flags(el)).toEqual(['true', 'true', 'true'])
    el.toggleAttribute('disabled', false)
    await settle(el)
    expect(flags(el)).toEqual(['true', 'false', 'true'])
  })
})

describe('同一读取器下的其它条目集合', () => {
  it('切换组：增删条目的原生 disabled', async () => {
    const el = mount(`
      <xh-toggle-group>
        <div data-xh-part="root">
          <button data-xh-part="item" value="bold" disabled>B</button>
          <button data-xh-part="item" value="italic">I</button>
        </div>
      </xh-toggle-group>
    `)
    await settle(el)
    expect(flags(el)).toEqual(['true', 'false'])
    item(el, 'bold').disabled = false
    await settle(el)
    expect(flags(el)).toEqual(['false', 'false'])
  })

  it('标签页：增删 trigger 的原生 disabled', async () => {
    const el = mount(`
      <xh-tabs default-value="a">
        <div data-xh-part="root">
          <div data-xh-part="list" aria-label="视图">
            <button data-xh-part="trigger" value="a">A</button>
            <button data-xh-part="trigger" value="b" disabled>B</button>
          </div>
          <div data-xh-part="content" value="a">a</div>
          <div data-xh-part="content" value="b">b</div>
        </div>
      </xh-tabs>
    `)
    await settle(el)
    const b = el.querySelector<HTMLButtonElement>('[data-xh-part="trigger"][value="b"]')!
    expect(b.getAttribute('aria-disabled')).toBe('true')
    b.disabled = false
    await settle(el)
    expect(b.getAttribute('aria-disabled')).toBe('false')
    b.disabled = true
    await settle(el)
    expect(b.getAttribute('aria-disabled')).toBe('true')
  })
})
