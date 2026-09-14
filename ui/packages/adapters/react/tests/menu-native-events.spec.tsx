// @vitest-environment jsdom
//
// 菜单族的条目与 content 上，connect 派的是 pointerenter / pointerleave / focus 三个
// 不冒泡的事件。React 的合成事件全部委派在根容器上、只在冒泡阶段派发，直接送到节点上的
// 这三样一个都到不了——接线看着还在，指针划过不搬焦点、content 得焦不清锚点，全程零报错。
// 这里按 DOM 的送达路径直接派发，核的就是「处理器装在它自己点名的那个事件上」。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhContextMenuContent,
  XhContextMenuItem,
  XhContextMenuPositioner,
  XhContextMenuRoot,
  XhContextMenuTrigger,
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuTrigger,
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

/** 机器的效应排在提交之后，多催几拍让 DOM 落定。 */
async function settle(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await Promise.resolve()
    })
  }
}

function items(scope: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope="${scope}"][data-part="item"]`)]
}

function content(scope: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="content"]`)!
}

/** 按 DOM 的送达路径派：这三样都不冒泡。 */
async function fire(el: HTMLElement, type: string): Promise<void> {
  await act(async () => {
    el.dispatchEvent(new Event(type))
  })
  await settle()
}

const MENU_TREE = (
  <XhMenuRoot defaultOpen>
    <XhMenuTrigger>操作</XhMenuTrigger>
    <XhMenuPositioner>
      <XhMenuContent>
        <XhMenuItem value="copy">复制</XhMenuItem>
        <XhMenuItem value="paste">粘贴</XhMenuItem>
      </XhMenuContent>
    </XhMenuPositioner>
  </XhMenuRoot>
)

const CONTEXT_MENU_TREE = (
  <XhContextMenuRoot defaultOpen>
    <XhContextMenuTrigger>右键这块区域</XhContextMenuTrigger>
    <XhContextMenuPositioner>
      <XhContextMenuContent>
        <XhContextMenuItem value="copy">复制</XhContextMenuItem>
        <XhContextMenuItem value="paste">粘贴</XhContextMenuItem>
      </XhContextMenuContent>
    </XhContextMenuPositioner>
  </XhContextMenuRoot>
)

describe('menu 的不冒泡事件按 DOM 语义送达', () => {
  it('指针划过条目：焦点搬过去，roving tabindex 跟着换人', async () => {
    await mount(MENU_TREE)
    const [first, second] = items('menu')
    expect(first!.getAttribute('tabindex')).toBe('0')

    await fire(second!, 'pointerenter')

    expect(document.activeElement).toBe(second)
    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(second!.getAttribute('data-highlighted')).toBe('')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })

  it('条目自己得焦：锚点改记它', async () => {
    await mount(MENU_TREE)
    const [first, second] = items('menu')

    await fire(second!, 'focus')

    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })

  it('content 自己得焦：锚点清空，Tab 停靠点回容器兜底', async () => {
    await mount(MENU_TREE)
    const [first] = items('menu')
    expect(first!.getAttribute('tabindex')).toBe('0')

    await fire(content('menu'), 'focus')

    expect(content('menu').getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
    expect(first!.getAttribute('data-highlighted')).toBeNull()
  })
})

describe('context-menu 的不冒泡事件按 DOM 语义送达', () => {
  it('指针划过条目：焦点搬过去，roving tabindex 跟着换人', async () => {
    await mount(CONTEXT_MENU_TREE)
    const [first, second] = items('context-menu')

    await fire(second!, 'pointerenter')

    expect(document.activeElement).toBe(second)
    expect(second!.getAttribute('tabindex')).toBe('0')
    expect(second!.getAttribute('data-highlighted')).toBe('')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })

  it('content 自己得焦：锚点清空，Tab 停靠点回容器兜底', async () => {
    await mount(CONTEXT_MENU_TREE)
    const [first] = items('context-menu')

    await fire(first!, 'focus')
    expect(first!.getAttribute('tabindex')).toBe('0')

    await fire(content('context-menu'), 'focus')

    expect(content('context-menu').getAttribute('tabindex')).toBe('0')
    expect(first!.getAttribute('tabindex')).toBe('-1')
  })
})
