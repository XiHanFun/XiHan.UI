// @vitest-environment jsdom
// ContextMenu / Menubar 通过内部 owner 接住 xh-menu 子层，不依赖 Portal 后的 DOM 冒泡祖先。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

async function settle(): Promise<void> {
  for (let round = 0; round < 7; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-menu,xh-context-menu,xh-menubar'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(async () => {
  document.body.innerHTML = ''
  await Promise.resolve()
})

function submenuTrigger(): HTMLElement {
  return document.querySelector<HTMLElement>('xh-menu > [data-xh-part="trigger"]')!
}

function submenuItem(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-xh-part="item"][value="email"]')!
}

describe('web Components 菜单族子菜单 owner', () => {
  it('contextMenu 给子 trigger 补父 item 身份，并接回一次根选择与关闭', async () => {
    const host = document.createElement('xh-context-menu') as Updatable
    host.setAttribute('default-open', '')
    host.innerHTML = `
      <div data-xh-part="root">
        <div data-xh-part="trigger">右键区域</div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <xh-menu submenu>
              <div data-xh-part="trigger" value="share">发送到…</div>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <div data-xh-part="item" value="email">邮件</div>
                </div>
              </div>
            </xh-menu>
          </div>
        </div>
      </div>
    `
    const select = vi.fn()
    host.addEventListener('select', select)
    document.body.appendChild(host)
    await settle()
    const trigger = submenuTrigger()
    expect(trigger.getAttribute('data-scope')).toBe('context-menu')
    expect(trigger.getAttribute('role')).toBe('menuitem')
    expect(trigger.getAttribute('tabindex')).not.toBeNull()

    trigger.click()
    await settle()
    submenuItem().click()
    await settle()
    expect(select).toHaveBeenCalledTimes(1)
    expect((select.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ value: 'email' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(host.querySelector('[data-xh-part="content"]')?.getAttribute('data-state')).toBe('closed')
  })

  it('menubar 给子 trigger 补所属菜单 item 身份，并补全 menu 后上报与关闭', async () => {
    const host = document.createElement('xh-menubar') as Updatable
    host.setAttribute('default-value', 'file')
    host.innerHTML = `
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <xh-menu submenu>
              <div data-xh-part="trigger" value="share">发送到…</div>
              <div data-xh-part="positioner">
                <div data-xh-part="content">
                  <div data-xh-part="item" value="email">邮件</div>
                </div>
              </div>
            </xh-menu>
          </div>
        </div>
      </div>
    `
    const select = vi.fn()
    host.addEventListener('select', select)
    document.body.appendChild(host)
    await settle()
    const trigger = submenuTrigger()
    expect(trigger.getAttribute('data-scope')).toBe('menubar')
    expect(trigger.getAttribute('role')).toBe('menuitem')

    trigger.click()
    await settle()
    submenuItem().click()
    await settle()
    expect(select).toHaveBeenCalledTimes(1)
    expect((select.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ menu: 'file', value: 'email' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(host.querySelector<HTMLElement>('[data-xh-part="content"][value="file"]')?.getAttribute('data-state')).toBe('closed')
  })
})
