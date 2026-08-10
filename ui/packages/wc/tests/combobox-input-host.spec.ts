// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
}

/**
 * 输入宿主标签由作者写在标记里，元素直接读它。
 * 作者摆 textarea 与摆 input 是两套属性表：type / role / aria-expanded 只属于后者。
 */
function markup(tag: 'input' | 'textarea'): string {
  return `
    <div data-xh-part="root">
      <label data-xh-part="label">水果</label>
      <div data-xh-part="control">
        <${tag} data-xh-part="input"></${tag}>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="apple"><span data-xh-part="item-text">Apple</span></div>
        </div>
      </div>
    </div>
  `
}

async function mount(tag: 'input' | 'textarea'): Promise<HTMLElement> {
  const host = document.createElement('xh-combobox')
  host.innerHTML = markup(tag)
  document.body.appendChild(host)
  await settle(host as Updatable)
  return host.querySelector<HTMLElement>('[data-part="input"]')!
}

describe('xh-combobox 的输入宿主', () => {
  it('作者摆 input：照旧写 type、role 与 aria-expanded', async () => {
    const el = await mount('input')
    expect(el.tagName).toBe('INPUT')
    expect(el.getAttribute('type')).toBe('text')
    expect(el.getAttribute('role')).toBe('combobox')
    expect(el.getAttribute('aria-expanded')).toBe('false')
  })

  it('作者摆 textarea：那三条一并缺席，其余组合框属性照样在', async () => {
    const el = await mount('textarea')
    expect(el.tagName).toBe('TEXTAREA')
    // textarea 没有 type；它的允许角色只有自带的 textbox；aria-expanded 不在 textbox 的支持属性里
    expect(el.hasAttribute('type')).toBe(false)
    expect(el.hasAttribute('role')).toBe(false)
    expect(el.hasAttribute('aria-expanded')).toBe(false)
    expect(el.getAttribute('aria-haspopup')).toBe('listbox')
    expect(el.getAttribute('aria-autocomplete')).toBe('list')
    expect(el.getAttribute('aria-controls')).toBe(
      document.querySelector('[data-part="content"]')!.getAttribute('id'),
    )
  })

  it('textarea 宿主照样驱动机器：打字展开，方向键把高亮报进 aria-activedescendant', async () => {
    const el = await mount('textarea') as HTMLTextAreaElement
    const host = document.querySelector('xh-combobox') as Updatable
    el.focus()
    el.value = 'App'
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(host)
    expect(document.querySelector('[data-part="content"]')!.hasAttribute('hidden')).toBe(false)

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }))
    await settle(host)
    const item = document.querySelector('[data-part="item"]')!
    expect(el.getAttribute('aria-activedescendant')).toBe(item.getAttribute('id'))
  })
})
