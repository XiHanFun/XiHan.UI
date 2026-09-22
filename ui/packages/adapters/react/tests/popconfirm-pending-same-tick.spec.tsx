// @vitest-environment jsdom
// 点确认与 Escape 落在同一个 act 块里：React 还没重渲，机器此刻读到的拦截态是哪一份。
import type { ReactNode } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
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

const CONTENT = '[data-scope="popconfirm"][data-part="content"]'
const CONFIRM = '[data-scope="popconfirm"][data-part="confirm-trigger"]'
const TRIGGER = '[data-scope="popconfirm"][data-part="trigger"]'

function el(selector: string): HTMLElement {
  return document.querySelector<HTMLElement>(selector)!
}

function tree(onConfirm: () => Promise<void>): ReactNode {
  return (
    <XhPopconfirmRoot onConfirm={onConfirm}>
      <XhPopconfirmTrigger>删除</XhPopconfirmTrigger>
      <XhPopconfirmPositioner>
        <XhPopconfirmContent>
          <XhPopconfirmTitle>确认删除</XhPopconfirmTitle>
          <XhPopconfirmDescription>不可撤销</XhPopconfirmDescription>
          <XhPopconfirmCancelTrigger>取消</XhPopconfirmCancelTrigger>
          <XhPopconfirmConfirmTrigger>确认</XhPopconfirmConfirmTrigger>
        </XhPopconfirmContent>
      </XhPopconfirmPositioner>
    </XhPopconfirmRoot>
  )
}

describe('popconfirm 挂起期的拦截', () => {
  it('点确认之后、React 重渲之前到达的 Escape 不收起浮层', async () => {
    const onConfirm = vi.fn(() => new Promise<void>(() => {}))
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => {
      root!.render(tree(onConfirm))
    })
    await act(async () => {
      el(TRIGGER).click()
    })
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)

    // 同一个 act 块：点确认排出的状态更新还没提交，Escape 就到了
    await act(async () => {
      el(CONFIRM).click()
      el(CONTENT).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
  })
})
