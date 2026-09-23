import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhListboxRoot } from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 页内持久集合的选中：品牌淡底行面 + 淡底前景 + 前导对号；
// 悬停 100 → 按下 200 只换面，选中行悬停 20%；真实选择不改变行几何。
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

/** 在宿主的主题下把令牌解析成最终颜色，断言不写死任何色值。 */
function resolve(token: string, property: 'background-color' | 'color' = 'background-color'): string {
  const probe = document.createElement('span')
  probe.style.setProperty(property, `var(${token})`)
  host!.append(probe)
  const value = getComputedStyle(probe).getPropertyValue(property)
  probe.remove()
  return value
}

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

describe('列表框的页内选中反馈', () => {
  for (const selectionMode of ['single', 'multiple'] as const) {
    for (const [theme, dir] of [['light', 'ltr'], ['dark', 'rtl']] as const) {
      it(`${selectionMode}/${theme}/${dir}：选中行品牌淡底 + 前导对号，悬停 / 按下只换面，真实选择不改变行几何`, async () => {
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

        // 选中行：品牌淡底 + 淡底前景，字重与未选中一致；对号露面且在文字之前（起始侧）
        const appleStyle = getComputedStyle(apple)
        expect(appleStyle.backgroundColor).toBe(resolve('--xh-bg-brand-subtle'))
        expect(appleStyle.color).toBe(resolve('--xh-fg-on-brand-subtle', 'color'))
        expect(appleStyle.fontWeight).toBe(getComputedStyle(banana).fontWeight)
        expect(getComputedStyle(indicator(apple)).visibility).toBe('visible')
        expect(getComputedStyle(indicator(banana)).visibility).toBe('hidden')
        const appleMark = indicator(apple).getBoundingClientRect()
        const appleText = apple.querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect()
        expect(dir === 'ltr' ? appleMark.right <= appleText.left : appleMark.left >= appleText.right).toBe(true)

        // 未选中行：悬停 100 档，与选中面不同
        await userEvent.hover(banana)
        banana.focus()
        await nextTick()
        expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-subtle'))
        expect(getComputedStyle(banana).color).toBe(resolve('--xh-fg-default', 'color'))
        // 选中行悬停：20% 品牌淡底
        await userEvent.hover(apple)
        await nextTick()
        expect(getComputedStyle(apple).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))
        await userEvent.hover(banana)
        await nextTick()

        const rowBefore = banana.getBoundingClientRect()
        const markBefore = indicator(banana).getBoundingClientRect()
        await userEvent.click(banana)
        await nextTick()
        expect(banana.getAttribute('data-state')).toBe('checked')
        expect(apple.getAttribute('data-state')).toBe(selectionMode === 'single' ? 'unchecked' : 'checked')
        expect(getComputedStyle(indicator(banana)).visibility).toBe('visible')
        // 选中 + 悬停：面换到 20% 品牌淡底，行与对号的几何不动
        expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-hover'))
        expect(banana.getBoundingClientRect().width).toBe(rowBefore.width)
        expect(banana.getBoundingClientRect().height).toBe(rowBefore.height)
        expect(indicator(banana).getBoundingClientRect().x).toBe(markBefore.x)
        if (selectionMode === 'single') {
          // 让出的那一行回到透明底与默认前景
          expect(getComputedStyle(apple).backgroundColor).toBe('rgba(0, 0, 0, 0)')
          expect(getComputedStyle(apple).color).toBe(resolve('--xh-fg-default', 'color'))
        }

        const disabled = item('cherry')
        await userEvent.click(disabled, { force: true })
        await nextTick()
        expect(disabled.getAttribute('data-state')).toBe('unchecked')
        expect(getComputedStyle(disabled).color).toBe(resolve('--xh-fg-disabled', 'color'))
        expect(getComputedStyle(indicator(disabled)).color).toBe(getComputedStyle(disabled).color)
      })
    }
  }

  it('按下只换面不缩放：未选中行按住落 200 档，选中行按住落 28% 品牌淡底', async () => {
    host = document.createElement('div')
    host.style.inlineSize = '240px'
    document.body.append(host)
    app = createApp({ render: () => h(XhListboxRoot, { collection, defaultValue: ['apple'] }) })
    app.mount(host)
    await nextTick()
    const apple = item('apple')
    const banana = item('banana')
    for (const row of [apple, banana])
      row.style.transition = 'none'

    const before = banana.getBoundingClientRect()
    await userEvent.hover(banana)
    await pressPointer(banana)
    expect(banana.matches(':active')).toBe(true)
    expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    expect(getComputedStyle(banana).scale).toBe('none')
    expect(banana.getBoundingClientRect().width).toBe(before.width)
    await releasePointer(banana)
    await nextTick()

    // 松手后 banana 成为选中行；再按住它落 28%
    expect(banana.getAttribute('data-state')).toBe('checked')
    await pressPointer(banana)
    expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-brand-subtle-active'))
    await releasePointer(banana)
  })
})
