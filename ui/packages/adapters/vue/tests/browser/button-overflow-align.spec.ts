// 按钮的文字放不下时（表格窄格里的长串标识）从起始边排起、只在末端被裁：
// 居中会让溢出往两边同时冒，开头那截被裁掉。放得下时照旧居中。文字的几何只有 Chromium 量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import { XhButton } from '../../src'
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

function mount(width: number, text: string, dir: 'ltr' | 'rtl' = 'ltr'): HTMLElement {
  host = document.createElement('div')
  host.dir = dir
  // 与表格单元格同一种宿主：弹性行、裁掉溢出
  host.style.cssText = `display: flex; inline-size: ${width}px; overflow: hidden`
  document.body.append(host)
  app = createApp({ render: () => h(XhButton, { variant: 'ghost' }, () => text) })
  app.mount(host)
  return host.querySelector<HTMLElement>('[data-scope="button"][data-part="root"]')!
}

/** 按钮里那段文字的外接框。 */
function textBox(button: HTMLElement): DOMRect {
  const range = document.createRange()
  range.selectNodeContents(button)
  return range.getBoundingClientRect()
}

describe('按钮文字放不下时', () => {
  it.each(['ltr', 'rtl'] as const)('%s：从起始边排起，开头不被裁，溢出只落在末端', (dir) => {
    const button = mount(120, '4229944570a5e54b0ba26911643be4ec3f50141dba3', dir)
    const box = button.getBoundingClientRect()
    const text = textBox(button)
    const pad = Number.parseFloat(getComputedStyle(button).paddingInlineStart)
    expect(text.width).toBeGreaterThan(box.width)
    if (dir === 'ltr')
      expect(text.left).toBeGreaterThanOrEqual(box.left + pad - 0.5)
    else
      expect(text.right).toBeLessThanOrEqual(box.right - pad + 0.5)
  })

  it('放得下时照旧居中', () => {
    const button = mount(240, '保存')
    host!.style.display = 'block'
    button.style.inlineSize = '200px'
    const box = button.getBoundingClientRect()
    const text = textBox(button)
    expect(Math.abs((text.left + text.right) / 2 - (box.left + box.right) / 2)).toBeLessThanOrEqual(1)
  })
})
