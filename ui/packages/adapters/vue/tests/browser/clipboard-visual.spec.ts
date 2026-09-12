import type { App } from 'vue'
import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhClipboardControl,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardInput,
  XhClipboardRoot,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

async function mount(composed = true): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup: () => () => h(XhClipboardRoot, { value: 'pnpm add @xihan-ui/vue' }, () => composed
      ? h(XhClipboardControl, null, () => [
          h(XhClipboardInput),
          h(XhClipboardCopyTrigger, null, () => [
            h(XhClipboardIndicator, null, () => '复制'),
            h(XhClipboardIndicator, { copied: true }, () => '已复制'),
          ]),
        ])
      : h(XhClipboardCopyTrigger, null, () => [
          h(XhClipboardIndicator, null, () => '复制'),
          h(XhClipboardIndicator, { copied: true }, () => '已复制'),
        ])),
  })
  app.mount(host)
  await nextTick()
}

afterEach(async () => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('剪贴板视觉', () => {
  it('输入框与复制按钮共享连续轮廓', async () => {
    await mount()
    const input = host!.querySelector<HTMLInputElement>(`[data-scope='clipboard'][data-part='input']`)!
    const trigger = host!.querySelector<HTMLButtonElement>(`[data-scope='clipboard'][data-part='copy-trigger']`)!
    const inputStyle = getComputedStyle(input)
    const triggerStyle = getComputedStyle(trigger)

    expect(input.getBoundingClientRect().right).toBeCloseTo(trigger.getBoundingClientRect().left + 1, 1)
    expect(inputStyle.borderStartEndRadius).toBe('0px')
    expect(inputStyle.borderEndEndRadius).toBe('0px')
    expect(triggerStyle.borderStartStartRadius).toBe('0px')
    expect(triggerStyle.borderEndStartRadius).toBe('0px')
    expect(triggerStyle.backgroundColor).toBe(inputStyle.backgroundColor)

    const width = trigger.getBoundingClientRect().width
    const root = host!.querySelector<HTMLElement>(`[data-scope='clipboard'][data-part='root']`)!
    const indicators = [...trigger.querySelectorAll<HTMLElement>(`[data-part='indicator']`)]
    expect(getComputedStyle(indicators[0]!).visibility).toBe('visible')
    expect(getComputedStyle(indicators[1]!).visibility).toBe('hidden')
    root.setAttribute('data-state', 'copied')
    expect(trigger.getBoundingClientRect().width).toBeCloseTo(width, 4)
    expect(getComputedStyle(indicators[0]!).visibility).toBe('hidden')
    expect(getComputedStyle(indicators[1]!).visibility).toBe('visible')

    await userEvent.hover(trigger)
    expect(getComputedStyle(trigger).boxShadow).toBe('none')
  })

  it('独立复制按钮保留完整圆角', async () => {
    await mount(false)
    const trigger = host!.querySelector<HTMLButtonElement>(`[data-scope='clipboard'][data-part='copy-trigger']`)!
    const style = getComputedStyle(trigger)
    expect(Number.parseFloat(style.borderStartStartRadius)).toBeGreaterThan(0)
    expect(Number.parseFloat(style.borderStartEndRadius)).toBeGreaterThan(0)
  })
})
