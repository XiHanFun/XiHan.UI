// @vitest-environment jsdom
//
// clipboard 的 connect 给只读框派了 focus：聚焦即全选，键盘用户的 Ctrl/Cmd+C 靠它。
// focus 不冒泡，而 React 的 onFocus 挂的是冒泡的 focusin，直接送到框上的那一种到不了处理器。
// 共用的一致性套件里没有这条通道，这里按 DOM 的送达路径直接派，核的是
// 「处理器装在它自己点名的那个事件上」。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardInput,
  XhClipboardLabel,
  XhClipboardRoot,
} from '../src'

const VALUE = 'xh-token-42'

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

function inputEl(): HTMLInputElement {
  const el = document.querySelector<HTMLInputElement>('[data-scope="clipboard"][data-part="input"]')
  if (!el)
    throw new Error('input 部件不在文档里')
  return el
}

describe('clipboard 的不冒泡事件按 DOM 语义送达', () => {
  const TREE = (
    <XhClipboardRoot value={VALUE}>
      <XhClipboardLabel>接口密钥</XhClipboardLabel>
      <XhClipboardControl>
        <XhClipboardInput />
        <XhClipboardCopyTrigger>复制</XhClipboardCopyTrigger>
      </XhClipboardControl>
    </XhClipboardRoot>
  )

  it('只读框自己得焦：整段文本被选中，Ctrl/Cmd+C 才复制得到东西', async () => {
    await mount(TREE)
    const input = inputEl()
    expect(input.value).toBe(VALUE)
    // 先把选区收成一个光标：不这么摆，起点本来就是「整段选中」，断言核不出这次全选
    input.setSelectionRange(3, 3)
    expect(input.selectionEnd).toBe(3)

    await act(async () => {
      input.dispatchEvent(new Event('focus'))
    })

    expect(input.selectionStart).toBe(0)
    expect(input.selectionEnd).toBe(VALUE.length)
  })
})
