import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhListboxRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null
const collection = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'cherry', label: '缺货', disabled: true },
]

function item(value: string): HTMLElement {
  const el = host?.querySelector<HTMLElement>(`[data-part='item'][data-value='${value}']`)
  if (!el)
    throw new Error(`找不到列表项 ${value}`)
  return el
}

function indicator(el: HTMLElement): HTMLElement {
  const mark = el.querySelector<HTMLElement>(`[data-part='item-indicator']`)
  if (!mark)
    throw new Error('自动条目必须提供选中标记')
  return mark
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('列表框与下拉选项的统一选择反馈', () => {
  for (const selectionMode of ['single', 'multiple'] as const) {
    for (const [theme, dir] of [['light', 'ltr'], ['dark', 'rtl']] as const) {
      it(`${selectionMode}/${theme}/${dir}：对号、正文与高亮独立，真实选择不改变行几何`, async () => {
        host = document.createElement('div')
        host.dataset.theme = theme
        host.dir = dir
        host.style.inlineSize = '240px'
        document.body.append(host)
        app = createApp({ render: () => h(XhListboxRoot, { collection, selectionMode, defaultValue: ['apple'], dir }) })
        app.mount(host)
        await nextTick()
        const apple = item('apple')
        const banana = item('banana')
        for (const row of [apple, banana])
          row.style.transition = 'none'
        await userEvent.hover(banana)
        banana.focus()
        await nextTick()
        const appleStyle = getComputedStyle(apple)
        const bananaStyle = getComputedStyle(banana)
        expect(appleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(appleStyle.color).toBe(bananaStyle.color)
        expect(appleStyle.fontWeight).toBe(bananaStyle.fontWeight)
        expect(getComputedStyle(indicator(apple)).visibility).toBe('visible')
        expect(getComputedStyle(indicator(banana)).visibility).toBe('hidden')
        const rowBefore = banana.getBoundingClientRect()
        const markBefore = indicator(banana).getBoundingClientRect()
        const hoverColor = bananaStyle.backgroundColor
        await userEvent.click(banana)
        await nextTick()
        expect(banana.getAttribute('data-state')).toBe('checked')
        expect(apple.getAttribute('data-state')).toBe(selectionMode === 'single' ? 'unchecked' : 'checked')
        expect(getComputedStyle(indicator(banana)).visibility).toBe('visible')
        expect(getComputedStyle(banana).backgroundColor).toBe(hoverColor)
        expect(banana.getBoundingClientRect().width).toBe(rowBefore.width)
        expect(banana.getBoundingClientRect().height).toBe(rowBefore.height)
        expect(indicator(banana).getBoundingClientRect().x).toBe(markBefore.x)
        const text = banana.querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect()
        expect(dir === 'ltr' ? markBefore.left >= text.right : markBefore.right <= text.left).toBe(true)
        const disabled = item('cherry')
        await userEvent.click(disabled, { force: true })
        await nextTick()
        expect(disabled.getAttribute('data-state')).toBe('unchecked')
        expect(getComputedStyle(indicator(disabled)).color).toBe(getComputedStyle(disabled).color)
      })
    }
  }
})
