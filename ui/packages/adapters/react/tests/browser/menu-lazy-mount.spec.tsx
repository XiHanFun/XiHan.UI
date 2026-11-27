// 菜单的 lazyMount / unmountOnExit 要在真浏览器里验：键盘展开那一帧条目才挂上（unmountOnExit 下也是），焦点照样落到首项；退场动画得真播完才卸。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { XhMenuRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhMenuContent, XhMenuItem, XhMenuPositioner, XhMenuRoot, XhMenuTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }

let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

afterEach(async () => {
  await inAct(() => root?.unmount())
  root = null
  host?.remove()
  host = null
})

const COLLECTION = [
  { value: 'copy', label: '复制' },
  { value: 'paste', label: '粘贴' },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='menu'][data-part='item']`)]

function view(props: XhMenuRootProps, handWritten: boolean): ReactNode {
  if (!handWritten)
    return <XhMenuRoot {...props} label="操作" collection={COLLECTION} />
  return (
    <XhMenuRoot {...props}>
      <XhMenuTrigger>操作</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          {COLLECTION.map(node => <XhMenuItem key={node.value} value={node.value}>{node.label}</XhMenuItem>)}
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  )
}

async function render(props: XhMenuRootProps, handWritten = false): Promise<(next: XhMenuRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(view(props, handWritten)))
  return next => inAct(() => root!.render(view(next, handWritten)))
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目', handWritten: true },
])('菜单 lazyMount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、条目不在；键盘展开后条目挂上、焦点落在首项，收起后条目留着', async () => {
    await render({ lazyMount: true }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('copy')
    expect(items()).toHaveLength(2)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目', handWritten: true },
])('菜单 unmountOnExit 的键盘展开（$name）', ({ handWritten }) => {
  // React 的退场闸门要等提交之后的布局效应才翻真：条目得跟展开态同一轮挂上，挑首项那一拍才查得到
  it('条目还不在时键盘展开，焦点照样落在首项', async () => {
    await render({ unmountOnExit: true }, handWritten)
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('copy')
    expect(items()).toHaveLength(2)
  })
})

describe('菜单 unmountOnExit', () => {
  it('退场播完才撤条目，下次展开重新铺上', async () => {
    const rerender = await render({ unmountOnExit: true, open: true })
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await rerender({ unmountOnExit: true, open: false })
    // 退场正在播：条目还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    await rerender({ unmountOnExit: true, open: true })
    await expect.poll(() => items().length).toBe(2)
    expect(items()[0]).not.toBe(first)
  })
})
