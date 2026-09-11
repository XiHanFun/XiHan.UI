// docs menu/10-submenu 的真实三级菜单：二、三级经 Portal 分离，必须仍是一棵指针悬停树。
import type { ReactNode } from 'react'
import type { Root } from 'react-dom/client'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import {
  XhMenuContent,
  XhMenuItem,
  XhMenuPositioner,
  XhMenuRoot,
  XhMenuSeparator,
  XhMenuSub,
  XhMenuSubTrigger,
  XhMenuTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const OPEN_WAIT = 140
const CLOSE_WAIT = 360
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

async function settle(delay = 0): Promise<void> {
  if (delay > 0)
    await new Promise(resolve => setTimeout(resolve, delay))
  for (let i = 0; i < 4; i++)
    await inAct(async () => Promise.resolve())
}

function tree(onSelect: (details: { value: string }) => void): ReactNode {
  return (
    <XhMenuRoot onSelect={onSelect}>
      <XhMenuTrigger>文件操作</XhMenuTrigger>
      <XhMenuPositioner>
        <XhMenuContent>
          <XhMenuItem value="open">打开</XhMenuItem>
          <XhMenuItem value="rename">重命名</XhMenuItem>
          <XhMenuSeparator />
          <XhMenuSub value="share">
            <XhMenuSubTrigger>发送到…</XhMenuSubTrigger>
            <XhMenuPositioner>
              <XhMenuContent>
                <XhMenuItem value="share-email">邮件</XhMenuItem>
                <XhMenuItem value="share-sms">短信</XhMenuItem>
                <XhMenuSub value="share-im">
                  <XhMenuSubTrigger>即时通讯…</XhMenuSubTrigger>
                  <XhMenuPositioner>
                    <XhMenuContent>
                      <XhMenuItem value="share-wecom">企业微信</XhMenuItem>
                      <XhMenuItem value="share-dingtalk">钉钉</XhMenuItem>
                    </XhMenuContent>
                  </XhMenuPositioner>
                </XhMenuSub>
              </XhMenuContent>
            </XhMenuPositioner>
          </XhMenuSub>
          <XhMenuSeparator />
          <XhMenuItem value="delete">删除</XhMenuItem>
        </XhMenuContent>
      </XhMenuPositioner>
    </XhMenuRoot>
  )
}

async function mountMenu(onSelect: (details: { value: string }) => void): Promise<void> {
  host = document.createElement('div')
  host.style.cssText = 'position:fixed;inset:64px auto auto 64px'
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(tree(onSelect)))
  await settle()
}

function byValue(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`找不到菜单条目 ${value}`)
  return element
}

function rootTrigger(): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='trigger']`)
  if (!element)
    throw new Error('找不到根菜单触发器')
  return element
}

function contentOf(value: string): HTMLElement {
  const content = byValue(value).closest<HTMLElement>(`[data-scope='menu'][data-part='content']`)
  if (!content)
    throw new Error(`找不到 ${value} 所属的 content`)
  return content
}

async function click(element: HTMLElement): Promise<void> {
  await inAct(() => userEvent.click(element))
  await settle()
}

async function hover(element: HTMLElement, delay: number): Promise<void> {
  await inAct(() => userEvent.hover(element))
  await settle(delay)
}

async function openThreeLevels(): Promise<void> {
  await click(rootTrigger())
  await hover(byValue('share'), OPEN_WAIT)
  expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
  await hover(byValue('share-im'), OPEN_WAIT)
  expect(byValue('share-im').getAttribute('aria-expanded')).toBe('true')
}

function expectThreeLevelsOpen(): void {
  expect(rootTrigger().getAttribute('aria-expanded')).toBe('true')
  expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
  expect(byValue('share-im').getAttribute('aria-expanded')).toBe('true')
  for (const value of ['open', 'share-email', 'share-wecom'])
    expect(getComputedStyle(contentOf(value)).display, value).not.toBe('none')
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.getElementById('xh-portal-root')?.remove()
})

describe('react Menu 三级真实指针', () => {
  it('三级叶项停留超过默认关闭延时仍保留整棵树，返回二级后可重进并选中关闭', async () => {
    const onSelect = vi.fn()
    await mountMenu(onSelect)
    await openThreeLevels()
    const middle = contentOf('share-email')
    const leaf = contentOf('share-wecom')
    expect(middle.contains(leaf), '二、三级经 Portal 后必须是物理分离的内容面').toBe(false)

    await hover(byValue('share-wecom'), CLOSE_WAIT)
    expectThreeLevelsOpen()

    await hover(byValue('share-email'), CLOSE_WAIT)
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('true')
    expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')

    await hover(byValue('share-im'), OPEN_WAIT)
    await hover(byValue('share-dingtalk'), CLOSE_WAIT)
    expectThreeLevelsOpen()
    await click(byValue('share-dingtalk'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith({ value: 'share-dingtalk' })
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share').getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')
  })

  it('键盘仍逐层进入和返回，Escape 只关闭当前顶层', async () => {
    await mountMenu(vi.fn())
    await click(rootTrigger())
    byValue('share').focus()
    expect(document.activeElement).toBe(byValue('share'))
    await inAct(() => userEvent.keyboard('{ArrowRight}'))
    await settle()
    expect(byValue('share').getAttribute('aria-expanded')).toBe('true')

    byValue('share-im').focus()
    expect(document.activeElement).toBe(byValue('share-im'))
    await inAct(() => userEvent.keyboard('{ArrowRight}'))
    await settle()
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('true')

    byValue('share-wecom').focus()
    await inAct(() => userEvent.keyboard('{ArrowLeft}'))
    await settle()
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share').getAttribute('aria-expanded')).toBe('true')

    byValue('share-email').focus()
    await inAct(() => userEvent.keyboard('{Escape}'))
    await settle()
    expect(byValue('share').getAttribute('aria-expanded')).toBe('false')
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('true')
  })
})
