// @vitest-environment jsdom
//
// 气泡确认的异步确认门：onConfirm 返回 Promise 即挂起——浮层等兑现才收、确认按钮转圈
// 且再点无效；落空留在原地；取消把在途结果作废。挂起布尔住在适配器里，connect 只发变化意图，
// 这一层没接上的话按钮永远不转圈、点第二下会把回调再跑一遍。
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

/** 机器的效应与 Promise 的兑现各排一拍，多催几轮让 DOM 落定。 */
async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
  }
}

async function mountPop(onConfirm: () => void | Promise<unknown>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  await act(async () => {
    root!.render(
      <XhPopconfirmRoot onConfirm={onConfirm}>
        <XhPopconfirmTrigger>删除</XhPopconfirmTrigger>
        <XhPopconfirmPositioner>
          <XhPopconfirmContent>
            <XhPopconfirmTitle>确定吗</XhPopconfirmTitle>
            <XhPopconfirmDescription>删了就没了</XhPopconfirmDescription>
            <XhPopconfirmCancelTrigger>再想想</XhPopconfirmCancelTrigger>
            <XhPopconfirmConfirmTrigger>确定</XhPopconfirmConfirmTrigger>
          </XhPopconfirmContent>
        </XhPopconfirmPositioner>
      </XhPopconfirmRoot>,
    )
  })
  await tick()
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

async function click(selector: string): Promise<void> {
  await act(async () => {
    el(selector).click()
  })
  await tick()
}

const CONTENT = '[data-scope="popconfirm"][data-part="content"]'
const CONFIRM = '[data-scope="popconfirm"][data-part="confirm-trigger"]'
const CANCEL = '[data-scope="popconfirm"][data-part="cancel-trigger"]'
const TRIGGER = '[data-scope="popconfirm"][data-part="trigger"]'

describe('popconfirm 异步确认门', () => {
  it('挂起期间浮层不收、按钮转圈、再点无效；兑现即收起', async () => {
    let release!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((r) => {
      release = r
    }))
    await mountPop(onConfirm)
    await click(TRIGGER)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)

    await click(CONFIRM)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(true)
    expect(el(CONFIRM).getAttribute('aria-busy')).toBe('true')

    await click(CONFIRM)
    expect(onConfirm).toHaveBeenCalledTimes(1)

    await act(async () => {
      release()
    })
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
  })

  it('落空（reject）留在原地，挂起解除', async () => {
    let fail!: (e: unknown) => void
    await mountPop(() => new Promise<void>((_r, rej) => {
      fail = rej
    }))
    await click(TRIGGER)
    await click(CONFIRM)
    await act(async () => {
      fail(new Error('后端说不行'))
    })
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
  })

  it('挂起中点取消：立即收起，在途兑现不再翻案', async () => {
    let release!: () => void
    await mountPop(() => new Promise<void>((r) => {
      release = r
    }))
    await click(TRIGGER)
    await click(CONFIRM)
    await click(CANCEL)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)

    await act(async () => {
      release()
    })
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })

  it('同步 onConfirm 照旧立即收起', async () => {
    const onConfirm = vi.fn()
    await mountPop(onConfirm)
    await click(TRIGGER)
    await click(CONFIRM)
    expect(onConfirm).toHaveBeenCalled()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
  })
})
