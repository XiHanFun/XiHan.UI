import type { XhClipboardElement } from '../../src/elements/clipboard'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

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
        <button data-xh-part="copy-trigger">
          <span data-xh-part="indicator">复制</span>
          <span data-xh-part="indicator" copied>已复制</span>
        </button>
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
  it('两个指示器共享宽度，复制成功时按钮不位移', async () => {
    installClipboard(async () => {})
    const root = await mount()
    const button = trigger(root)
    const indicators = [...button.querySelectorAll<HTMLElement>(`[data-part='indicator']`)]
    const width = button.getBoundingClientRect().width

    expect(indicators.map(indicator => getComputedStyle(indicator).display)).toEqual(['flex', 'flex'])
    expect(indicators.map(indicator => getComputedStyle(indicator).visibility)).toEqual(['visible', 'hidden'])
    await userEvent.click(button)
    await settle()
    expect(state(root)).toBe('copied')
    expect(button.getBoundingClientRect().width).toBeCloseTo(width, 4)
    // 新侧立即参与淡入，旧侧等淡出完成后才隐藏；切换首帧不能两侧同时不可见。
    // 旧侧按它 visibility 的延时过渡还在不在跑来断：读的时刻落在淡出之前或之后都成立（CI 上 settle 可能拖过整段淡出）
    const [previous, next] = indicators
    expect(getComputedStyle(next!).visibility).toBe('visible')
    const fading = previous!.getAnimations().some(animation =>
      animation instanceof CSSTransition && animation.transitionProperty === 'visibility' && animation.playState !== 'finished')
    expect(getComputedStyle(previous!).visibility).toBe(fading ? 'visible' : 'hidden')
    // 「等淡出完成后才隐藏」本身由延时承诺：旧侧的 visibility 过渡必须带正的延时，否则点下去当场就藏
    const previousStyle = getComputedStyle(previous!)
    const properties = previousStyle.transitionProperty.split(',').map(value => value.trim())
    const delays = previousStyle.transitionDelay.split(',').map(value => Number.parseFloat(value))
    expect(delays[properties.indexOf('visibility')]).toBeGreaterThan(0)
    const duration = Number.parseFloat(getComputedStyle(indicators[0]!).transitionDuration) * 1000
    await new Promise(resolve => setTimeout(resolve, duration + 40))
    expect(indicators.map(indicator => getComputedStyle(indicator).visibility)).toEqual(['hidden', 'visible'])
  })

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
