// 上下文菜单的 lazyMount / unmountOnExit 要在真浏览器里验：Shift+F10 展开那一帧条目才挂上，焦点照样落到首项；退场动画得真播完才卸。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { XhContextMenuRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhContextMenuContent, XhContextMenuItem, XhContextMenuItemText, XhContextMenuPositioner, XhContextMenuRoot, XhContextMenuTrigger } from '../../src'
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
  return document.querySelector<HTMLElement>(`[data-scope='context-menu'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='context-menu'][data-part='item']`)]

function view(props: XhContextMenuRootProps, handWritten: boolean): ReactNode {
  if (!handWritten)
    return <XhContextMenuRoot {...props} trigger="在这里右键" collection={COLLECTION} />
  return (
    <XhContextMenuRoot {...props}>
      <XhContextMenuTrigger>在这里右键</XhContextMenuTrigger>
      <XhContextMenuPositioner>
        <XhContextMenuContent>
          {COLLECTION.map(node => <XhContextMenuItem key={node.value} value={node.value}><XhContextMenuItemText>{node.label}</XhContextMenuItemText></XhContextMenuItem>)}
        </XhContextMenuContent>
      </XhContextMenuPositioner>
    </XhContextMenuRoot>
  )
}

async function render(props: XhContextMenuRootProps, handWritten = false): Promise<(next: XhContextMenuRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(view(props, handWritten)))
  return next => inAct(() => root!.render(view(next, handWritten)))
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写条目', handWritten: true },
])('上下文菜单 lazyMount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、条目不在；Shift+F10 展开后条目挂上、焦点落在首项，收起后条目留着', async () => {
    await render({ lazyMount: true }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    part('trigger')!.focus()
    await userEvent.keyboard('{Shift>}{F10}{/Shift}')
    await expect.poll(() => document.activeElement?.getAttribute('data-value')).toBe('copy')
    expect(items()).toHaveLength(2)

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe('上下文菜单 unmountOnExit', () => {
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
