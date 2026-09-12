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
import { useHotkeys, XhHotkeys } from '../src'

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
    expect(host?.innerHTML).toBe('')
  })

  it('局部监听只认作者显式 resolver，不创建节点猜父级', async () => {
    const local = document.createElement('section')
    document.body.append(local)
    const hits: string[][] = []
    await mount(<XhHotkeys keys={['Mod', 'S']} target={() => local} onHotKey={details => hits.push(details.keys)} />)

    expect(press()).toBe(false)
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
    local.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(hits).toEqual([['Mod', 'S']])
    expect(host?.innerHTML).toBe('')
    local.remove()
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

  it('组合式手动 stop 后重渲也不会重新绑定', async () => {
    let hits = 0
    let stop = () => {}
    function Probe({ enabled }: { enabled: boolean }): null {
      stop = useHotkeys({
        keys: ['Mod', 'S'],
        enabled,
        onHotKey: () => { hits += 1 },
      }).stop
      return null
    }

    await mount(<Probe enabled />)
    expect(press()).toBe(true)
    expect(hits).toBe(1)
    stop()
    await act(async () => {
      root?.render(<Probe enabled={false} />)
      root?.render(<Probe enabled />)
    })
    await settle()
    expect(press()).toBe(false)
    expect(hits).toBe(1)
  })
})
