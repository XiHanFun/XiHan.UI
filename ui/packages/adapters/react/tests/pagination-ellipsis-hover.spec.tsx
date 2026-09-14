// @vitest-environment jsdom
//
// 省略位的 pointerenter / pointerleave 不冒泡：React 的同名合成事件挂在根容器上，
// 收不到直接派到节点上的这一份。共享套件只点得到它（click 冒泡），这条到达路径要单独核。
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhPaginationContent,
  XhPaginationEllipsisTrigger,
  XhPaginationPositioner,
  XhPaginationRoot,
} from '../src'

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

afterEach(() => {
  act(() => root?.unmount())
  host?.remove()
  host = null
  root = null
})

function mount(node: React.ReactNode): void {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  act(() => root!.render(node))
}

function trigger(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('[data-scope="pagination"][data-part="ellipsis-trigger"]')!
}

/** 派一个不冒泡的事件，与浏览器真派的那一份同形。 */
async function fire(type: string): Promise<void> {
  await act(async () => {
    trigger().dispatchEvent(new Event(type, { bubbles: false }))
    // 延时为 0 也要过一轮宏任务，机器的等待效应才落到下一态
    await new Promise<void>(resolve => setTimeout(resolve, 20))
  })
}

describe('省略位的悬停摊开', () => {
  it('pointerenter 停够时长即摊开，pointerleave 之后收起', async () => {
    mount(
      <XhPaginationRoot count={200} pageSize={10} defaultPage={1} openDelay={0} closeDelay={0}>
        <XhPaginationEllipsisTrigger side="end">…</XhPaginationEllipsisTrigger>
        <XhPaginationPositioner>
          <XhPaginationContent />
        </XhPaginationPositioner>
      </XhPaginationRoot>,
    )
    expect(trigger().getAttribute('aria-expanded')).toBe('false')

    await fire('pointerenter')
    expect(trigger().getAttribute('aria-expanded')).toBe('true')

    await fire('pointerleave')
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
  })
})
