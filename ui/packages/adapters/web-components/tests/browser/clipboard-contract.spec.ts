import type { XhClipboardElement } from '../../src/elements/clipboard'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineXhElements } from '../../src/define'

defineXhElements()

function installClipboard(writeText: (text: string) => Promise<void>): () => void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  return () => Reflect.deleteProperty(navigator, 'clipboard')
}

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  await Promise.resolve()
}

async function mount(): Promise<XhClipboardElement> {
  const host = document.createElement('div')
  host.innerHTML = `
    <xh-clipboard value="secret" timeout="0">
      <div data-xh-part="root">
        <button data-xh-part="copy-trigger">复制</button>
      </div>
    </xh-clipboard>
  `
  document.body.append(host)
  await settle()
  return host.firstElementChild as XhClipboardElement
}

function trigger(root: XhClipboardElement): HTMLButtonElement {
  return root.querySelector<HTMLButtonElement>('[data-scope="clipboard"][data-part="copy-trigger"]')!
}

function state(root: XhClipboardElement): string | undefined {
  return root.querySelector<HTMLElement>('[data-scope="clipboard"][data-part="root"]')?.dataset.state
}

afterEach(() => {
  document.body.querySelectorAll('xh-clipboard').forEach(node => node.parentElement?.remove())
  Reflect.deleteProperty(navigator, 'clipboard')
})

describe('web components Clipboard 浏览器合同', () => {
  it('权限拒绝保留原始 DOMException，并从 copying 回到 idle', async () => {
    const reason = new DOMException('Permission denied', 'NotAllowedError')
    installClipboard(() => Promise.reject(reason))
    const root = await mount()
    const errors: unknown[] = []
    root.addEventListener('copy-error', event => errors.push((event as CustomEvent).detail))

    await userEvent.click(trigger(root))
    await settle()

    expect(state(root)).toBe('idle')
    expect(errors).toEqual([{ error: reason, value: 'secret' }])
  })

  it('安全上下文接口缺席时显式失败，不宣称已复制', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined })
    const root = await mount()
    const errors: unknown[] = []
    root.addEventListener('copy-error', event => errors.push((event as CustomEvent).detail))

    trigger(root).focus()
    await userEvent.keyboard('{Enter}')
    await settle()

    expect(state(root)).toBe('idle')
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatchObject({ value: 'secret' })
    expect((errors[0] as { error: unknown }).error).toBeInstanceOf(Error)
  })

  it('写入在途的连续激活只发一次，成功后才能开始下一次', async () => {
    const pending: Array<() => void> = []
    const writeText = vi.fn(() => new Promise<void>(resolve => pending.push(resolve)))
    installClipboard(writeText)
    const root = await mount()

    trigger(root).click()
    trigger(root).click()
    trigger(root).click()
    await settle()
    expect(state(root)).toBe('copying')
    expect(writeText).toHaveBeenCalledTimes(1)

    pending[0]!()
    await settle()
    expect(state(root)).toBe('copied')

    trigger(root).click()
    await settle()
    expect(state(root)).toBe('copying')
    expect(writeText).toHaveBeenCalledTimes(2)
  })
})
