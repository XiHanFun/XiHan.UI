// @vitest-environment jsdom
//
// 气泡确认的异步确认门：onConfirm 返回 thenable 即挂起——浮层等兑现才收、确认按钮转圈
// 且再点无效；拒绝留在原地；取消把在途结果作废。挂起布尔住在适配器里，connect 只发变化意图，
// 这一层没接上的话按钮永远不转圈、点第二下会把回调再跑一遍。
import type { PopconfirmConfirmErrorDetails, PopconfirmNotifiers } from '@xihan-ui/headless'
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

async function mountPop(
  onConfirm: NonNullable<PopconfirmNotifiers['onConfirm']>,
  onConfirmError?: (details: PopconfirmConfirmErrorDetails) => void,
  controlledOpen?: boolean,
  onOpenChange?: PopconfirmNotifiers['onOpenChange'],
): Promise<{ setControlledOpen: (next: boolean) => Promise<void> }> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  const render = async (open: boolean | undefined): Promise<void> => {
    await act(async () => {
      root!.render(
        <XhPopconfirmRoot open={open} onOpenChange={onOpenChange} onConfirm={onConfirm} onConfirmError={onConfirmError}>
          {({ actionError, setOpen }) => (
            <>
              <button data-programmatic-close type="button" onClick={() => setOpen(false)}>程序收起</button>
              <output data-action-error={actionError ? 'true' : 'false'} />
              <XhPopconfirmTrigger>删除</XhPopconfirmTrigger>
              <XhPopconfirmPositioner>
                <XhPopconfirmContent>
                  <XhPopconfirmTitle>确定吗</XhPopconfirmTitle>
                  <XhPopconfirmDescription>删了就没了</XhPopconfirmDescription>
                  <XhPopconfirmCancelTrigger>再想想</XhPopconfirmCancelTrigger>
                  <XhPopconfirmConfirmTrigger>确定</XhPopconfirmConfirmTrigger>
                </XhPopconfirmContent>
              </XhPopconfirmPositioner>
            </>
          )}
        </XhPopconfirmRoot>,
      )
    })
    await tick()
  }
  await render(controlledOpen)
  return { setControlledOpen: next => render(next) }
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
    expect(el(CONFIRM).getAttribute('aria-disabled')).toBe('true')

    await act(async () => {
      el(CONFIRM).click()
      el(CONFIRM).click()
      el('[data-programmatic-close]').click()
      el(TRIGGER).click()
      el(CONTENT).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
      document.body.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0, bubbles: true, cancelable: true }))
    })
    await tick()
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)

    await act(async () => {
      release()
    })
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(true)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
  })

  it('落空（reject）留在原地，挂起解除并把原始 cause 同步给状态与 confirm-error', async () => {
    let fail!: (e: unknown) => void
    const onConfirmError = vi.fn()
    await mountPop(() => new Promise<void>((_r, rej) => {
      fail = rej
    }), onConfirmError)
    await click(TRIGGER)
    await click(CONFIRM)
    const cause = new Error('后端说不行')
    await act(async () => {
      fail(cause)
    })
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)
    expect(el('[data-action-error]').getAttribute('data-action-error')).toBe('true')
    expect(onConfirmError).toHaveBeenCalledTimes(1)
    expect(onConfirmError.mock.calls[0]?.[0].cause).toBe(cause)
  })

  it('同步抛错也留在原地并暴露原始 cause', async () => {
    const cause = new Error('同步失败')
    const onConfirmError = vi.fn()
    await mountPop(() => {
      throw cause
    }, onConfirmError)
    await click(TRIGGER)
    await click(CONFIRM)

    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el('[data-action-error]').getAttribute('data-action-error')).toBe('true')
    expect(onConfirmError.mock.calls[0]?.[0].cause).toBe(cause)
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

  it('受控宿主关闭再重开会解除 pending，旧兑现不再发关闭意图', async () => {
    let release!: () => void
    const openChanges = vi.fn()
    const mounted = await mountPop(() => new Promise<void>((resolve) => {
      release = resolve
    }), undefined, true, openChanges)
    await click(CONFIRM)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(true)

    await mounted.setControlledOpen(false)
    await mounted.setControlledOpen(true)
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(el(CONFIRM).hasAttribute('data-loading')).toBe(false)

    await act(async () => release())
    await tick()
    expect(el(CONTENT).hasAttribute('hidden')).toBe(false)
    expect(openChanges).not.toHaveBeenCalled()
  })
})
