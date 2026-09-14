// 验证 Web Component Kbd 显式注册与断开行为。

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface KbdHost extends HTMLElement {
  keys: string[]
  register: boolean
  target?: 'document' | (() => EventTarget | null)
  updateComplete: Promise<unknown>
}

afterEach(() => {
  document.body.innerHTML = ''
})

function press(target: EventTarget): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

function createHost(): KbdHost {
  const host = document.createElement('xh-kbd') as KbdHost
  const root = document.createElement('kbd')
  root.dataset.xhPart = 'root'
  host.append(root)
  return host
}

describe('xh-kbd 快捷键注册', () => {
  it('显示组合键并在 register 开启后监听 ownerDocument', async () => {
    const host = createHost()
    host.keys = ['Mod', 'S']
    host.register = true
    let hits = 0
    host.addEventListener('hot-key', () => {
      hits += 1
    })
    document.body.append(host)
    await host.updateComplete

    expect(host.querySelector('kbd')?.textContent).toBe('CtrlS')
    expect(press(document.body).defaultPrevented).toBe(true)
    expect(hits).toBe(1)
  })

  it('显式 resolver 限定局部目标，断开后解绑', async () => {
    const local = document.createElement('section')
    const host = createHost()
    host.keys = ['Mod', 'S']
    host.register = true
    host.target = () => local
    document.body.append(local, host)
    await host.updateComplete

    expect(press(document.body).defaultPrevented).toBe(false)
    expect(press(local).defaultPrevented).toBe(true)
    host.remove()
    await Promise.resolve()
    expect(press(local).defaultPrevented).toBe(false)
  })
})
