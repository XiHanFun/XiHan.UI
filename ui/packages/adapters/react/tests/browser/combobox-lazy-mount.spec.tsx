// 组合框的 lazyMount / unmountOnExit 要在真浏览器里验：方向键展开那一帧候选才挂上，高亮照样落到首项、不闪空态；
// 打开前输入框里的选中文字按 collection 算；退场动画得真播完才卸。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import type { XhComboboxRootProps } from '../../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { XhComboboxContent, XhComboboxControl, XhComboboxEmpty, XhComboboxInput, XhComboboxItem, XhComboboxItemText, XhComboboxPositioner, XhComboboxRoot } from '../../src'
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
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
]

function part(name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='${name}']`)
}

const items = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>(`[data-scope='combobox'][data-part='item']`)]
const highlighted = (): string | null => document.querySelector<HTMLElement>(`[data-scope='combobox'][data-part='item'][data-highlighted]`)?.getAttribute('data-value') ?? null

function view(props: XhComboboxRootProps, handWritten: boolean): ReactNode {
  if (!handWritten)
    return <XhComboboxRoot {...props} label="水果" collection={COLLECTION} />
  return (
    <XhComboboxRoot {...props}>
      <XhComboboxControl><XhComboboxInput aria-label="水果" /></XhComboboxControl>
      <XhComboboxPositioner>
        <XhComboboxContent>
          {COLLECTION.map(node => <XhComboboxItem key={node.value} value={node.value}><XhComboboxItemText>{node.label}</XhComboboxItemText></XhComboboxItem>)}
        </XhComboboxContent>
        <XhComboboxEmpty>没有结果</XhComboboxEmpty>
      </XhComboboxPositioner>
    </XhComboboxRoot>
  )
}

async function render(props: XhComboboxRootProps, handWritten = false): Promise<(next: XhComboboxRootProps) => Promise<void>> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(view(props, handWritten)))
  return next => inAct(() => root!.render(view(next, handWritten)))
}

describe.each([
  { name: '按数据铺', handWritten: false },
  { name: '手写候选', handWritten: true },
])('组合框 lazyMount（$name）', ({ handWritten }) => {
  it('第一次展开前 content 在、候选不在；方向键展开后候选挂上、高亮落在首项且不闪空态，收起后候选留着', async () => {
    await render({ lazyMount: true }, handWritten)
    expect(part('content')).not.toBeNull()
    expect(items()).toHaveLength(0)

    const empties: boolean[] = []
    const watcher = new MutationObserver(() => empties.push(!part('empty')!.hidden))
    watcher.observe(part('empty')!, { attributes: true, attributeFilter: ['hidden'] })
    part('input')!.focus()
    await userEvent.keyboard('{ArrowDown}')
    await expect.poll(highlighted).toBe('apple')
    watcher.disconnect()
    expect(items()).toHaveLength(2)
    expect(empties).not.toContain(true)

    // 第一下 Escape 先清高亮，第二下才收起列表
    await userEvent.keyboard('{Escape}{Escape}')
    await expect.poll(() => getComputedStyle(part('content')!).display).toBe('none')
    expect(items()).toHaveLength(2)
  })
})

describe('组合框 lazyMount 的选中文字', () => {
  it('打开前输入框里就是 collection 里的选中文字', async () => {
    await render({ lazyMount: true, defaultValue: 'banana' })
    await expect.poll(() => (part('input') as HTMLInputElement).value).toBe('香蕉')
    expect(items()).toHaveLength(0)
  })
})

describe('组合框 unmountOnExit', () => {
  it('退场播完才撤候选，下次展开重新铺上', async () => {
    const rerender = await render({ unmountOnExit: true, open: true })
    await expect.poll(() => items().length).toBe(2)
    const first = items()[0]
    await expect.poll(() => part('positioner')!.hasAttribute('data-positioned')).toBe(true)

    await rerender({ unmountOnExit: true, open: false })
    // 退场正在播：候选还在
    expect(items()[0]).toBe(first)
    await expect.poll(() => items().length).toBe(0)
    expect(getComputedStyle(part('content')!).display).toBe('none')

    await rerender({ unmountOnExit: true, open: true })
    await expect.poll(() => items().length).toBe(2)
    expect(items()[0]).not.toBe(first)
  })
})
