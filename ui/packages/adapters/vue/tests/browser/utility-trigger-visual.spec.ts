import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
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

  it('按下同时换底并缩到 0.97：定尺的独立动作钮由家族按压块给触感，布局盒不变', async () => {
    host = document.createElement('div')
    document.body.append(host)
    // 过渡即时完成：断言的是按住的稳定态，不是过渡中间帧
    host.style.setProperty('--xh-motion-duration-micro', '0ms')
    host.style.setProperty('--xh-motion-duration-press', '0ms')
    host.style.setProperty('--xh-motion-duration-release', '0ms')
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
      { el: host.querySelector<HTMLElement>(`[data-scope='download-trigger'][data-part='root']`)!, scale: '0.97' },
      { el: host.querySelector<HTMLElement>(`[data-scope='clipboard'][data-part='copy-trigger']`)!, scale: '0.97' },
    ]

    for (const { el: utility, scale } of utilities) {
      const before = utility.getBoundingClientRect()
      const rest = getComputedStyle(utility).backgroundColor
      await press(utility)
      const pressedStyle = getComputedStyle(utility)
      expect(utility.matches(':active')).toBe(true)
      expect(pressedStyle.backgroundColor).not.toBe(rest)
      expect(pressedStyle.scale).toBe(scale)
      // scale 不改变布局盒：getBoundingClientRect 量的是变换后的盒，布局尺寸看 offsetWidth / offsetHeight
      expect(utility.offsetWidth).toBeCloseTo(before.width, 4)
      expect(utility.offsetHeight).toBeCloseTo(before.height, 4)
      await release()
    }
  })
})
