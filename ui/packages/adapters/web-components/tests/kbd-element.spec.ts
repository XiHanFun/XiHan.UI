// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface KbdHost extends HTMLElement {
  keys: string[]
  updateComplete: Promise<unknown>
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('xh-kbd 原生语义', () => {
  it('拒绝用 span 伪装键帽', async () => {
    const host = document.createElement('xh-kbd') as KbdHost
    host.keys = ['S']
    const root = document.createElement('span')
    root.dataset.xhPart = 'root'
    host.append(root)
    document.body.append(host)
    await expect(host.updateComplete).rejects.toThrow(/原生 <kbd>/)
  })

  it('原生 kbd 接收逐键键帽与整组可读名称', async () => {
    const host = document.createElement('xh-kbd') as KbdHost
    host.keys = ['Mod', 'S']
    const root = document.createElement('kbd')
    root.dataset.xhPart = 'root'
    host.append(root)
    document.body.append(host)
    await host.updateComplete
    expect(root.dataset.scope).toBe('kbd')
    expect(root.dataset.part).toBe('root')
    const keys = Array.from(root.querySelectorAll('[data-part="key"]'))
    expect(keys).toHaveLength(2)
    expect(keys[0]!.textContent).toMatch(/^(Ctrl|⌘)$/)
    expect(keys[1]!.textContent).toBe('S')
    expect(root.getAttribute('aria-label')).toMatch(/^(Control|Command) \+ S$/)
  })
})
