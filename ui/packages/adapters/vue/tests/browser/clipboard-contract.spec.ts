import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhClipboardCopyTrigger, XhClipboardRoot } from '../../src'

let app: App | null = null
let host: HTMLElement | null = null

function installClipboard(writeText: (text: string) => Promise<void>): () => void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  return () => Reflect.deleteProperty(navigator, 'clipboard')
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function trigger(): HTMLButtonElement {
  return host!.querySelector<HTMLButtonElement>('[data-scope="clipboard"][data-part="copy-trigger"]')!
}

function state(): string | undefined {
  return host!.querySelector<HTMLElement>('[data-scope="clipboard"][data-part="root"]')?.dataset.state
}

async function mount(props: Record<string, unknown>): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhClipboardRoot, props, () => [
      h(XhClipboardCopyTrigger, null, () => '复制'),
    ]),
  })
  app.mount(host)
  await nextTick()
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('vue Clipboard 浏览器合同', () => {
  it('权限拒绝保留原始 DOMException，并从 copying 回到 idle', async () => {
    const reason = new DOMException('Permission denied', 'NotAllowedError')
    const onError = vi.fn()
    installClipboard(() => Promise.reject(reason))
    await mount({ value: 'secret', timeout: 0, onCopyError: onError })

    await userEvent.click(trigger())
    await settle()

    expect(state()).toBe('idle')
    expect(onError).toHaveBeenCalledWith({ error: reason, value: 'secret' })
  })

  it('安全上下文接口缺席时显式失败，不宣称已复制', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    const onError = vi.fn()
    await mount({ value: 'secret', onCopyError: onError })

    trigger().focus()
    await userEvent.keyboard('{Enter}')
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
    await mount({ value: 'secret', timeout: 0 })

    trigger().click()
    trigger().click()
    trigger().click()
    await settle()
    expect(state()).toBe('copying')
    expect(writeText).toHaveBeenCalledTimes(1)

    pending[0]!()
    await settle()
    expect(state()).toBe('copied')

    trigger().click()
    await settle()
    expect(state()).toBe('copying')
    expect(writeText).toHaveBeenCalledTimes(2)
  })
})
