import type { App } from 'vue'
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

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
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
})
