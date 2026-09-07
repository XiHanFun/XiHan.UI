// @vitest-environment jsdom
//
// select 的条目上，connect 派的是 focus 与 pointerleave 两个不冒泡的事件。
// React 的合成事件全部委派在根容器上、只在冒泡阶段派发：onFocus 挂的是 focusin，
// onPointerLeave 是从 pointerout 合出来的，直接送到节点上的那一种一个都到不了。
// 这里按 DOM 的送达路径直接派发，核的是「处理器装在它自己点名的那个事件上」。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhSelectContent,
  XhSelectItem,
  XhSelectItemText,
  XhSelectList,
  XhSelectPositioner,
  XhSelectRoot,
  XhSelectTrigger,
} from '../src'

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

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
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

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('[data-scope="select"][data-part="item"]')]
}

/** 按 DOM 的送达路径派：这两样都不冒泡。 */
async function fire(el: HTMLElement, event: Event): Promise<void> {
  await act(async () => {
    el.dispatchEvent(event)
  })
  await settle()
}

const TREE = (
  <XhSelectRoot defaultOpen>
    <XhSelectTrigger>选一个</XhSelectTrigger>
    <XhSelectPositioner>
      <XhSelectContent>
        <XhSelectList>
          <XhSelectItem value="a"><XhSelectItemText>甲</XhSelectItemText></XhSelectItem>
          <XhSelectItem value="b"><XhSelectItemText>乙</XhSelectItemText></XhSelectItem>
        </XhSelectList>
      </XhSelectContent>
    </XhSelectPositioner>
  </XhSelectRoot>
)

describe('select 的不冒泡事件按 DOM 语义送达', () => {
  it('条目自己得焦：高亮改记它，roving tabindex 跟着换人', async () => {
    await mount(TREE)
    const [first, second] = items()

    await fire(second!, new Event('focus'))

    expect(second!.getAttribute('data-highlighted')).toBe('')
    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('data-highlighted')).toBeNull()
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })

  it('指针离开列表：高亮收掉，hover 不留漆', async () => {
    await mount(TREE)
    const [, second] = items()

    // 先让指针把这一条焐热——离开那一步只认之前进来过的节点
    await fire(second!, new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse' }))
    expect(second!.getAttribute('data-highlighted')).toBe('')

    await fire(second!, new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget: document.body }))

    expect(second!.getAttribute('data-highlighted')).toBeNull()
  })
})
