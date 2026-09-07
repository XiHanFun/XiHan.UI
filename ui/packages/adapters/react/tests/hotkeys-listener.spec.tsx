// @vitest-environment jsdom
//
// hotkeys 的监听装在组件之外的节点上（缺省是整篇文档）：组件卸载时 React 只摘自己那棵子树，
// 挂在文档上的那只监听器不会跟着走。摘不干净的话，页面早已换过一屏，旧组件仍在接管
// Ctrl+S 并拦下浏览器的默认动作——全程零报错。
//
// 共用的一致性套件只在挂载态里按键，卸载之后那一段没有判据，由这一份认领。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhHotkeys } from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  host?.remove()
  root = null
  host = null
})

async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

async function mount(tree: ReactNode): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(tree)
  })
  await settle()
}

/** 往文档上按一次组合，回答「被接住了没有」。 */
function press(): boolean {
  const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
  document.body.dispatchEvent(event)
  return event.defaultPrevented
}

describe('hotkeys 的全局监听', () => {
  it('装在文档上：组件不在按键的路径上，照样接得住', async () => {
    const hits: string[][] = []
    await mount(<XhHotkeys keys={['Mod', 'S']} onHotKey={details => hits.push(details.keys)} />)

    expect(press()).toBe(true)
    expect(hits).toEqual([['Mod', 'S']])
  })

  it('卸载后摘干净：这一枚组合还给页面，回调也不再被叫到', async () => {
    const hits: string[][] = []
    await mount(<XhHotkeys keys={['Mod', 'S']} onHotKey={details => hits.push(details.keys)} />)
    expect(press()).toBe(true)

    await act(async () => {
      root?.unmount()
    })
    root = null

    expect(press()).toBe(false)
    expect(hits).toHaveLength(1)
  })
})
