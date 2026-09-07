// @vitest-environment jsdom
//
// 消解开关要现读：消解层的回调只在展开那一刻挂一次，在那之前把 closeOnEscape /
// closeOnInteractOutside 求好值交进去，等于「浮层开着的时候改它不生效」。
// 这里在展开态里翻开关，Escape 与层外点击各验一次。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import {
  XhPopconfirmCancelTrigger,
  XhPopconfirmConfirmTrigger,
  XhPopconfirmContent,
  XhPopconfirmDescription,
  XhPopconfirmPositioner,
  XhPopconfirmRoot,
  XhPopconfirmTitle,
  XhPopconfirmTrigger,
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

async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
  }
}

function tree(props: { closeOnEscape?: boolean, closeOnInteractOutside?: boolean }): ReactNode {
  return (
    <XhPopconfirmRoot {...props}>
      <XhPopconfirmTrigger>删除</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmTitle>确定吗</XhPopconfirmTitle>
          <XhPopconfirmDescription>删了就没了</XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>再想想</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>确定</XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
  )
}

async function render(props: { closeOnEscape?: boolean, closeOnInteractOutside?: boolean }): Promise<void> {
  await act(async () => {
    root!.render(tree(props))
  })
  await tick()
}

async function mount(props: { closeOnEscape?: boolean, closeOnInteractOutside?: boolean }): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await render(props)
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

const CONTENT = '[data-scope="popconfirm"][data-part="content"]'
const TRIGGER = '[data-scope="popconfirm"][data-part="trigger"]'

function opened(): boolean {
  return !el(CONTENT).hasAttribute('hidden')
}

async function open(): Promise<void> {
  await act(async () => {
    el(TRIGGER).click()
  })
  await tick()
}

async function pressEscape(): Promise<void> {
  await act(async () => {
    el(CONTENT).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
  })
  await tick()
}

async function clickOutside(): Promise<void> {
  const outside = document.createElement('button')
  document.body.append(outside)
  await act(async () => {
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }))
    outside.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  })
  await tick()
  outside.remove()
}

describe('popconfirm 的消解开关现读', () => {
  it('展开着把 closeOnEscape 翻成 false：Escape 不再收起，翻回来又收得掉', async () => {
    await mount({ closeOnEscape: true })
    await open()
    expect(opened()).toBe(true)

    await render({ closeOnEscape: false })
    await pressEscape()
    expect(opened()).toBe(true)

    await render({ closeOnEscape: true })
    await pressEscape()
    expect(opened()).toBe(false)
  })

  it('展开着把 closeOnInteractOutside 翻成 false：点层外不再收起', async () => {
    await mount({ closeOnInteractOutside: true })
    await open()
    expect(opened()).toBe(true)

    await render({ closeOnInteractOutside: false })
    await clickOutside()
    expect(opened()).toBe(true)

    await render({ closeOnInteractOutside: true })
    await clickOutside()
    expect(opened()).toBe(false)
  })
})
