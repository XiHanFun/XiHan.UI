// 验证 React Kbd 显式注册与卸载行为。

// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhKbd } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  root = null
  host = null
})

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => root!.render(tree))
}

function press(target: EventTarget = document.body): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
  target.dispatchEvent(event)
  return event
}

describe('react Kbd 快捷键注册', () => {
  it('默认只显示，register 开启后才监听文档', async () => {
    let hits = 0
    await mount(
      <XhKbd
        keys={['Mod', 'S']}
        onHotKey={() => {
          hits += 1
        }}
      />,
    )
    expect(host?.querySelector('kbd')?.textContent).toBe('CtrlS')
    expect(press().defaultPrevented).toBe(false)

    await act(async () => root!.render(
      <XhKbd
        keys={['Mod', 'S']}
        register
        onHotKey={() => {
          hits += 1
        }}
      />,
    ))
    expect(press().defaultPrevented).toBe(true)
    expect(hits).toBe(1)
  })

  it('局部 resolver 只绑定指定节点，卸载后完整解绑', async () => {
    const local = document.createElement('section')
    document.body.append(local)
    let hits = 0
    await mount(
      <XhKbd
        keys={['Mod', 'S']}
        register
        target={() => local}
        onHotKey={() => {
          hits += 1
        }}
      />,
    )

    expect(press().defaultPrevented).toBe(false)
    expect(press(local).defaultPrevented).toBe(true)
    expect(hits).toBe(1)

    await act(async () => root?.unmount())
    root = null
    expect(press(local).defaultPrevented).toBe(false)
    local.remove()
  })
})
