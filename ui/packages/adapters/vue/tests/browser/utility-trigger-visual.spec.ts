import type { App } from 'vue'
import { cdp, userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhButton,
  XhClipboardCopyTrigger,
  XhClipboardIndicator,
  XhClipboardRoot,
  XhDownloadTrigger,
} from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
let pointer = { x: 1, y: 1 }
let pressed = false

async function press(el: HTMLElement): Promise<void> {
  await userEvent.hover(el)
  const rect = el.getBoundingClientRect()
  pointer = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mousePressed',
    ...pointer,
    button: 'left',
    buttons: 1,
    clickCount: 1,
  })
  pressed = true
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function release(): Promise<void> {
  if (!pressed)
    return
  await cdp().send('Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    ...pointer,
    button: 'left',
    buttons: 0,
    clickCount: 1,
  })
  pressed = false
}

afterEach(async () => {
  await release()
  app?.unmount()
  app = null
  host?.remove()
  host = null
  await userEvent.hover(document.querySelector<HTMLElement>('[data-test-park-pointer]')!)
})

describe('工具触发器视觉合同', () => {
  it('沿用 Button 几何，但默认使用中性工具面', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () => h('div', null, [
        h(XhButton, null, () => '操作'),
        h(XhDownloadTrigger, { data: 'XiHan.UI', fileName: 'xihan-ui.txt' }, () => '下载'),
        h(XhClipboardRoot, { value: 'XiHan.UI' }, () => [
          h(XhClipboardCopyTrigger, null, () => [
            h(XhClipboardIndicator, null, () => '复制'),
            h(XhClipboardIndicator, { copied: true }, () => '完成'),
          ]),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()

    const button = host.querySelector<HTMLElement>(`[data-scope='button'][data-part='root']`)!
    const download = host.querySelector<HTMLElement>(`[data-scope='download-trigger'][data-part='root']`)!
    const clipboard = host.querySelector<HTMLElement>(`[data-scope='clipboard'][data-part='copy-trigger']`)!
    const buttonStyle = getComputedStyle(button)

    for (const utility of [download, clipboard]) {
      const style = getComputedStyle(utility)
      expect(utility.getAttribute('data-xh-action-control')).toBe('')
      expect(utility.getAttribute('data-xh-action-profile')).toBe('text')
      expect(utility.getBoundingClientRect().height).toBeCloseTo(button.getBoundingClientRect().height, 1)
      expect(style.fontSize).toBe(buttonStyle.fontSize)
      expect(style.borderRadius).toBe(buttonStyle.borderRadius)
      expect(style.backgroundColor).not.toBe(buttonStyle.backgroundColor)
    }
  })

  it('按下只换面，不改变按钮几何', async () => {
    host = document.createElement('div')
    document.body.append(host)
    app = createApp({
      setup: () => () => h('div', null, [
        h(XhDownloadTrigger, { data: 'XiHan.UI', fileName: 'xihan-ui.txt' }, () => '下载'),
        h(XhClipboardRoot, { value: 'XiHan.UI' }, () => [
          h(XhClipboardCopyTrigger, null, () => [
            h(XhClipboardIndicator, null, () => '复制'),
            h(XhClipboardIndicator, { copied: true }, () => '完成'),
          ]),
        ]),
      ]),
    })
    app.mount(host)
    await nextTick()

    const utilities = [
      host.querySelector<HTMLElement>(`[data-scope='download-trigger'][data-part='root']`)!,
      host.querySelector<HTMLElement>(`[data-scope='clipboard'][data-part='copy-trigger']`)!,
    ]

    for (const utility of utilities) {
      const before = utility.getBoundingClientRect()
      const rest = getComputedStyle(utility).backgroundColor
      await press(utility)
      const pressedStyle = getComputedStyle(utility)
      const during = utility.getBoundingClientRect()
      expect(utility.matches(':active')).toBe(true)
      expect(pressedStyle.backgroundColor).not.toBe(rest)
      expect(pressedStyle.scale).toBe('none')
      expect(during.width).toBeCloseTo(before.width, 4)
      expect(during.height).toBeCloseTo(before.height, 4)
      await release()
    }
  })
})
