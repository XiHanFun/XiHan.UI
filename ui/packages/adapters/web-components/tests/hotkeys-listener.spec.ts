// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface HotkeysHost extends HTMLElement {
  keys: string[]
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

describe('xh-hotkeys 纯行为宿主', () => {
  it('不生成任何展示节点，默认在 ownerDocument 监听', async () => {
    const host = document.createElement('xh-hotkeys') as HotkeysHost
    host.keys = ['Mod', 'S']
    let hits = 0
    host.addEventListener('hot-key', () => {
      hits += 1
    })
    document.body.append(host)
    await host.updateComplete

    expect(host.children).toHaveLength(0)
    expect(host.querySelector('[data-scope]')).toBeNull()
    expect(press(document.body).defaultPrevented).toBe(true)
    expect(hits).toBe(1)
  })

  it('显式 resolver 限定局部目标，断开后解绑', async () => {
    const local = document.createElement('section')
    const host = document.createElement('xh-hotkeys') as HotkeysHost
    host.keys = ['Mod', 'S']
    host.target = () => local
    let hits = 0
    host.addEventListener('hot-key', () => {
      hits += 1
    })
    document.body.append(local, host)
    await host.updateComplete

    expect(press(document.body).defaultPrevented).toBe(false)
    expect(press(local).defaultPrevented).toBe(true)
    expect(hits).toBe(1)

    host.remove()
    await Promise.resolve()
    expect(press(local).defaultPrevented).toBe(false)
    expect(hits).toBe(1)
  })
})
