// multiple 的勾选框排在一行的最前面：在 item-prefix（头像、图标）之前、正文之前，两种书写方向都量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhListboxContent, XhListboxItem, XhListboxItemIndicator, XhListboxItemPrefix, XhListboxItemText, XhListboxRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('列表框 multiple 的行首勾选框', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    it(`${dir}：勾选框在行首内容之前，再往后是正文`, async () => {
      host = document.createElement('div')
      host.dir = dir
      host.style.inlineSize = '240px'
      document.body.append(host)
      app = createApp({
        render: () => h(XhListboxRoot, { 'selectionMode': 'multiple', 'defaultValue': ['ann'], dir, 'aria-label': '成员' }, () => [
          h(XhListboxContent, null, () => [
            h(XhListboxItem, { value: 'ann' }, () => [
              h(XhListboxItemPrefix, null, () => h('span', { style: 'display:inline-block;inline-size:24px;block-size:24px' })),
              h(XhListboxItemText, null, () => '安妮'),
              h(XhListboxItemIndicator),
            ]),
          ]),
        ]),
      })
      app.mount(host)
      await nextTick()
      const item = host.querySelector<HTMLElement>(`[data-scope='listbox'][data-part='item']`)!
      const box = item.querySelector<HTMLElement>(`[data-part='item-indicator']`)!.getBoundingClientRect()
      const prefix = item.querySelector<HTMLElement>(`[data-part='item-prefix']`)!.getBoundingClientRect()
      const text = item.querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect()
      if (dir === 'ltr') {
        expect(box.right).toBeLessThanOrEqual(prefix.left)
        expect(prefix.right).toBeLessThanOrEqual(text.left)
      }
      else {
        expect(box.left).toBeGreaterThanOrEqual(prefix.right)
        expect(prefix.left).toBeGreaterThanOrEqual(text.right)
      }
    })
  }
})
