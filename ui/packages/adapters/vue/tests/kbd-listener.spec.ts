/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 验证 Vue Kbd 显式注册、重绑与销毁行为。

// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhKbd } from '../src'

const cleanup: Array<() => void> = []

afterEach(() => {
  cleanup.splice(0).forEach(fn => fn())
  document.body.innerHTML = ''
})

function press(target: EventTarget): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

describe('vue Kbd 快捷键注册', () => {
  it('target 变化后从旧节点解绑并绑定新节点', async () => {
    const first = document.createElement('div')
    const second = document.createElement('div')
    const current = ref<HTMLElement>(first)
    const host = document.createElement('div')
    let hits = 0
    document.body.append(first, second, host)
    const app = createApp({
      setup: () => () => h(XhKbd, {
        keys: ['Mod', 'K'],
        register: true,
        target: () => current.value,
        onHotKey: () => { hits += 1 },
      }),
    })
    app.mount(host)
    cleanup.push(() => app.unmount())

    expect(press(first).defaultPrevented).toBe(true)
    expect(press(second).defaultPrevented).toBe(false)
    current.value = second
    await nextTick()
    expect(press(first).defaultPrevented).toBe(false)
    expect(press(second).defaultPrevented).toBe(true)
    expect(hits).toBe(2)
  })

  it('卸载后不再接管文档快捷键', async () => {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ setup: () => () => h(XhKbd, { keys: ['Mod', 'K'], register: true }) })
    app.mount(host)
    expect(press(document).defaultPrevented).toBe(true)
    app.unmount()
    await nextTick()
    expect(press(document).defaultPrevented).toBe(false)
  })
})
