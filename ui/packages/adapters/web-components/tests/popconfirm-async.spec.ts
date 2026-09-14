// @vitest-environment jsdom

import type { PopconfirmConfirmErrorDetails } from '@xihan-ui/headless'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type PopconfirmElement = HTMLElement & {
  open?: boolean
  confirmAction?: () => void | PromiseLike<unknown>
  readonly pending: boolean
  readonly actionError: PopconfirmConfirmErrorDetails | null
  readonly updateComplete: Promise<boolean>
}

async function tick(): Promise<void> {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve()
    await new Promise(resolve => setTimeout(resolve, 0))
  }
}

async function mountPop(controlled = false): Promise<PopconfirmElement> {
  const host = document.createElement('xh-popconfirm') as PopconfirmElement
  if (controlled)
    host.open = true
  else
    host.setAttribute('default-open', '')
  host.innerHTML = `
    <div data-xh-part="root">
      <button data-xh-part="trigger">删除</button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h2 data-xh-part="title">确定吗</h2>
        <p data-xh-part="description">删了就没了</p>
        <button data-xh-part="cancel-trigger">再想想</button>
        <button data-xh-part="confirm-trigger">确定</button>
      </div>
    </div>
  `
  document.body.append(host)
  await host.updateComplete
  await tick()
  return host
}

function part(host: HTMLElement, name: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(`[data-part="${name}"]`)
  if (!element)
    throw new Error(`找不到 ${name}`)
  return element
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('web components popconfirm 确认事务', () => {
  it('thenable 挂起时同步拦重复确认、trigger 与 Escape，兑现后才关闭', async () => {
    const host = await mountPop()
    let resolve!: (value: unknown) => void
    const action = vi.fn(() => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证非原生 Promise 的 thenable。
      then(onFulfilled: (value: unknown) => void) {
        resolve = onFulfilled
      },
    }) as unknown as PromiseLike<unknown>)
    host.confirmAction = action
    const confirm = part(host, 'confirm-trigger')

    confirm.click()
    confirm.click()
    part(host, 'trigger').click()
    part(host, 'content').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    document.body.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'mouse', button: 0, bubbles: true, cancelable: true }))
    await tick()

    expect(action).toHaveBeenCalledTimes(1)
    expect(host.pending).toBe(true)
    expect(confirm.getAttribute('aria-disabled')).toBe('true')
    expect(part(host, 'content').hasAttribute('hidden')).toBe(false)

    resolve(undefined)
    await tick()
    expect(host.pending).toBe(false)
    expect(part(host, 'content').hasAttribute('hidden')).toBe(true)
  })

  it('同步抛错与 thenable 拒绝都用 confirm-error 原样暴露 cause', async () => {
    const host = await mountPop()
    const details: PopconfirmConfirmErrorDetails[] = []
    host.addEventListener('confirm-error', event => details.push((event as CustomEvent<PopconfirmConfirmErrorDetails>).detail))
    const syncCause = new Error('同步失败')
    host.confirmAction = () => {
      throw syncCause
    }

    part(host, 'confirm-trigger').click()
    await tick()
    expect(host.actionError?.cause).toBe(syncCause)
    expect(details[0]).toBe(host.actionError)
    expect(part(host, 'content').hasAttribute('hidden')).toBe(false)

    let reject!: (cause: unknown) => void
    host.confirmAction = () => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证非原生 Promise 的 thenable。
      then(_resolve: (value: unknown) => void, onRejected: (cause: unknown) => void) {
        reject = onRejected
      },
    }) as unknown as PromiseLike<unknown>
    part(host, 'confirm-trigger').click()
    reject(undefined)
    await tick()

    expect(host.actionError).toEqual({ cause: undefined })
    expect(details[1]).toBe(host.actionError)
  })

  it.each([
    ['兑现', true],
    ['拒绝', false],
  ])('断开重连后，旧 thenable 的迟到%s不能关闭或污染新会话', async (_label, resolveOld) => {
    const host = await mountPop()
    let resolve!: (value: unknown) => void
    let reject!: (cause: unknown) => void
    host.confirmAction = () => ({
      // oxlint-disable-next-line unicorn/no-thenable -- 本用例专门验证非原生 Promise 的 thenable。
      then(onFulfilled: (value: unknown) => void, onRejected: (cause: unknown) => void) {
        resolve = onFulfilled
        reject = onRejected
      },
    }) as unknown as PromiseLike<unknown>
    const errors = vi.fn()
    host.addEventListener('confirm-error', errors)
    part(host, 'confirm-trigger').click()
    expect(host.pending).toBe(true)

    host.remove()
    document.body.append(host)
    await host.updateComplete
    await tick()
    expect(host.pending).toBe(false)
    expect(part(host, 'content').hasAttribute('hidden')).toBe(false)

    if (resolveOld)
      resolve(undefined)
    else
      reject(new Error('迟到失败'))
    await tick()

    expect(part(host, 'content').hasAttribute('hidden')).toBe(false)
    expect(host.actionError).toBeNull()
    expect(errors).not.toHaveBeenCalled()
  })

  it('受控宿主关闭再重开会解除 pending，旧兑现不再派关闭意图', async () => {
    const host = await mountPop(true)
    let resolve!: (value: unknown) => void
    host.confirmAction = () => new Promise((onFulfilled) => {
      resolve = onFulfilled
    })
    const openChanges = vi.fn()
    host.addEventListener('open-change', openChanges)

    part(host, 'confirm-trigger').click()
    await tick()
    expect(host.pending).toBe(true)
    host.open = false
    await host.updateComplete
    await tick()
    host.open = true
    await host.updateComplete
    await tick()

    expect(host.pending).toBe(false)
    expect(part(host, 'content').hasAttribute('hidden')).toBe(false)
    resolve(undefined)
    await tick()
    expect(part(host, 'content').hasAttribute('hidden')).toBe(false)
    expect(openChanges).not.toHaveBeenCalled()
  })
})
