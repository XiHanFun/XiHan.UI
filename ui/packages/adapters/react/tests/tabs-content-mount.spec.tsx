// @vitest-environment jsdom
import type { XhTabsRootProps } from '../src'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { XhTabsContent, XhTabsList, XhTabsRoot, XhTabsTrigger } from '../src'

const VALUES = ['one', 'two', 'three'] as const

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(async () => {
  await act(async () => root?.unmount())
  host?.remove()
  root = null
  host = null
})

async function render(node: React.ReactNode): Promise<HTMLElement> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => root!.render(node))
  return host
}

function Tabs(props: Partial<XhTabsRootProps>): React.ReactNode {
  return (
    <XhTabsRoot defaultValue="one" {...props}>
      <XhTabsList>
        {VALUES.map(v => <XhTabsTrigger key={v} value={v}>{v}</XhTabsTrigger>)}
      </XhTabsList>
      {VALUES.map(v => (
        <XhTabsContent key={v} value={v}>
          <span data-testid={`panel-${v}`}>{v}</span>
        </XhTabsContent>
      ))}
    </XhTabsRoot>
  )
}

function rendered(el: HTMLElement): string[] {
  return VALUES.filter(v => el.querySelector(`[data-testid="panel-${v}"]`))
}

async function clickTrigger(el: HTMLElement, index: number): Promise<void> {
  await act(async () => {
    el.querySelectorAll<HTMLElement>('[data-part="trigger"]')[index]!.click()
  })
}

describe('tabs 面板内容的挂载时机', () => {
  it('缺省三块面板内容都在', async () => {
    const el = await render(<Tabs />)
    expect(rendered(el)).toEqual(['one', 'two', 'three'])
  })

  it('lazyMount：第一次选中才渲染，之后一直留着；面板节点本身常在', async () => {
    const el = await render(<Tabs lazyMount />)
    expect(rendered(el)).toEqual(['one'])
    expect(el.querySelectorAll('[data-part="content"]')).toHaveLength(3)
    await clickTrigger(el, 2)
    expect(rendered(el)).toEqual(['one', 'three'])
  })

  it('unmountOnExit + lazyMount：只有选中面板有内容', async () => {
    const el = await render(<Tabs lazyMount unmountOnExit />)
    await clickTrigger(el, 1)
    expect(rendered(el)).toEqual(['two'])
  })
})

describe('tabs 关闭钮', () => {
  it('按 collection 铺开且可关闭时每个标签后面跟一枚关闭钮，点它发 onTabClose', async () => {
    const onTabClose = vi.fn()
    const el = await render(
      <XhTabsRoot collection={VALUES.map(value => ({ value }))} closable defaultValue="one" onTabClose={onTabClose} />,
    )
    const list = el.querySelector('[data-part="list"]')!
    expect([...list.children].map(child => child.getAttribute('data-part'))).toEqual([
      'trigger',
      'close-trigger',
      'trigger',
      'close-trigger',
      'trigger',
      'close-trigger',
    ])
    await act(async () => {
      el.querySelectorAll<HTMLElement>('[data-part="close-trigger"]')[0]!.click()
    })
    expect(onTabClose).toHaveBeenCalledWith({ value: 'one', values: ['two', 'three'] })
  })
})
