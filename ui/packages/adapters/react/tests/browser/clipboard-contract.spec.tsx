import type { ComponentProps } from 'react'
import type { Root } from 'react-dom/client'
import { userEvent } from '@vitest/browser/context'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { XhClipboardCopyTrigger, XhClipboardRoot } from '../../src'

let root: Root | null = null
let host: HTMLElement | null = null

function installClipboard(writeText: (text: string) => Promise<void>): () => void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  return () => Reflect.deleteProperty(navigator, 'clipboard')
}

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  })
}

function trigger(): HTMLButtonElement {
  return host!.querySelector<HTMLButtonElement>('[data-scope="clipboard"][data-part="copy-trigger"]')!
}

function state(): string | undefined {
  return host!.querySelector<HTMLElement>('[data-scope="clipboard"][data-part="root"]')?.dataset.state
}

async function render(props: ComponentProps<typeof XhClipboardRoot>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await act(async () => {
    root!.render(
      <XhClipboardRoot {...props}>
        <XhClipboardCopyTrigger>复制</XhClipboardCopyTrigger>
      </XhClipboardRoot>,
    )
  })
}

beforeEach(() => vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true))
afterEach(() => {
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  Reflect.deleteProperty(navigator, 'clipboard')
  vi.unstubAllGlobals()
})

describe('react Clipboard 浏览器合同', () => {
  it('权限拒绝保留原始 DOMException，并从 copying 回到 idle', async () => {
    const reason = new DOMException('Permission denied', 'NotAllowedError')
    const onError = vi.fn()
    installClipboard(() => Promise.reject(reason))
    await render({ value: 'secret', timeout: 0, onCopyError: onError })

    await act(async () => userEvent.click(trigger()))
    await settle()

    expect(state()).toBe('idle')
    expect(onError).toHaveBeenCalledWith({ error: reason, value: 'secret' })
  })

  it('安全上下文接口缺席时显式失败，不宣称已复制', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    const onError = vi.fn()
    await render({ value: 'secret', onCopyError: onError })

    trigger().focus()
    await act(async () => userEvent.keyboard('{Enter}'))
    await settle()

    expect(state()).toBe('idle')
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0]![0]).toMatchObject({ value: 'secret' })
    expect(onError.mock.calls[0]![0].error).toBeInstanceOf(Error)
  })

  it('写入在途的连续激活只发一次，成功后才能开始下一次', async () => {
    const pending: Array<() => void> = []
    const writeText = vi.fn(() => new Promise<void>(resolve => pending.push(resolve)))
    installClipboard(writeText)
    await render({ value: 'secret', timeout: 0 })

    act(() => {
      trigger().click()
      trigger().click()
      trigger().click()
    })
    expect(state()).toBe('copying')
    expect(writeText).toHaveBeenCalledTimes(1)

    await act(async () => pending[0]!())
    await settle()
    expect(state()).toBe('copied')

    act(() => trigger().click())
    expect(state()).toBe('copying')
    expect(writeText).toHaveBeenCalledTimes(2)
  })
})
