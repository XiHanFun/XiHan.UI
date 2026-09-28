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

/**
 * 输入宿主标签由作者写在标记里，元素直接读它。
 * 作者摆 textarea 与摆 input 是两套属性表：type / role / aria-expanded 只属于后者。
 */
function markup(tag: 'input' | 'textarea'): string {
  return `
    <div data-xh-part="root">
      <${tag} data-xh-part="input" aria-label="正文"></${tag}>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="lilei"><span data-xh-part="item-text">李雷</span></div>
          <div data-xh-part="item" value="hanmeimei"><span data-xh-part="item-text">韩梅梅</span></div>
        </div>
      </div>
    </div>
  `
}

async function mount(tag: 'input' | 'textarea'): Promise<{ host: Updatable, el: HTMLInputElement | HTMLTextAreaElement }> {
  const host = document.createElement('xh-mention') as unknown as Updatable
  host.innerHTML = markup(tag)
  document.body.appendChild(host)
  await settle(host)
  return { host, el: host.querySelector<HTMLInputElement | HTMLTextAreaElement>('[data-part="input"]')! }
}

function key(el: HTMLElement, name: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })
  el.dispatchEvent(event)
  return event
}

describe('xh-mention 的输入宿主', () => {
  it('作者摆 input：照旧写 type、role 与 aria-expanded', async () => {
    const { el } = await mount('input')
    expect(el.getAttribute('type')).toBe('text')
    expect(el.getAttribute('role')).toBe('combobox')
    expect(el.getAttribute('aria-expanded')).toBe('false')
  })

  it('作者摆 textarea：那三条一并缺席，其余组合框属性照样在，换多行布局', async () => {
    const { el } = await mount('textarea')
    expect(el.hasAttribute('type')).toBe(false)
    expect(el.hasAttribute('role')).toBe(false)
    expect(el.hasAttribute('aria-expanded')).toBe(false)
    expect(el.getAttribute('aria-haspopup')).toBe('listbox')
    expect(el.getAttribute('data-xh-field-layout')).toBe('textarea')
  })

  it('textarea 宿主换行之后照样触发、插入；光标紧贴提及按 Backspace 整条删掉，元素的 mentions 跟着撤掉', async () => {
    const { host, el } = await mount('textarea')
    el.focus()
    el.value = '第一行\n@li'
    el.setSelectionRange(el.value.length, el.value.length)
    el.dispatchEvent(new Event('input', { bubbles: true }))
    await settle(host)
    expect(document.querySelector('[data-part="content"]')!.hasAttribute('hidden')).toBe(false)
    expect(key(el, 'Enter').defaultPrevented).toBe(true)
    await settle(host)
    expect(el.value).toBe('第一行\n@李雷 ')
    expect((host as unknown as { mentions: unknown[] }).mentions).toEqual([{ value: 'lilei', label: '李雷', prefix: '@', start: 4, end: 7 }])

    el.setSelectionRange(7, 7)
    expect(key(el, 'Backspace').defaultPrevented).toBe(true)
    await settle(host)
    expect(el.value).toBe('第一行\n ')
    expect((host as unknown as { mentions: unknown[] }).mentions).toEqual([])
  })
})
