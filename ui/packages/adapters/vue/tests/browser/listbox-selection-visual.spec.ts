import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhListboxRoot } from '../../src'
import { pressPointer, releasePointer } from './pointer-press'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

// 列表框的选中与树选择同一种读法：透明底 + 行尾对号，正文颜色与字重保持 rest；
// 悬停 100 → 按下 200 只换面，选中行叠悬停 / 按下沿用同一条阶梯；真实选择不改变行几何。
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

afterEach(async () => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
})

async function mount(defaultValue = ['apple']): Promise<void> {
  host = document.createElement('div')
  host.style.inlineSize = '240px'
  document.body.append(host)
  app = createApp({ render: () => h(XhListboxRoot, { collection, defaultValue }) })
  app.mount(host)
  await nextTick()
}

describe('列表框的选中反馈', () => {
  for (const selectionMode of ['single', 'multiple'] as const) {
    for (const [theme, dir] of [['light', 'ltr'], ['dark', 'rtl']] as const) {
      it(`${selectionMode}/${theme}/${dir}：选中行透明底 + 行尾对号，悬停 / 按下只换面，真实选择不改变行几何`, async () => {
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

        // 选中行：不换面、不换字色，字重与未选中一致；对号露面且在文字之后（行尾侧）
        const appleStyle = getComputedStyle(apple)
        expect(appleStyle.backgroundColor).toBe('rgba(0, 0, 0, 0)')
        expect(appleStyle.color).toBe(resolve('--xh-fg-default', 'color'))
        expect(appleStyle.fontWeight).toBe(getComputedStyle(banana).fontWeight)
        expect(getComputedStyle(indicator(apple)).visibility).toBe('visible')
        expect(getComputedStyle(indicator(banana)).visibility).toBe('hidden')
        const appleMark = indicator(apple).getBoundingClientRect()
        const appleText = apple.querySelector<HTMLElement>(`[data-part='item-text']`)!.getBoundingClientRect()
        expect(dir === 'ltr' ? appleMark.left >= appleText.right : appleMark.right <= appleText.left).toBe(true)

        // 未选中行：悬停 100 档
        await userEvent.hover(banana)
        banana.focus()
        await nextTick()
        expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-subtle'))
        expect(getComputedStyle(banana).color).toBe(resolve('--xh-fg-default', 'color'))
        // 选中行悬停：与未选中行同为 100 档
        await userEvent.hover(apple)
        await nextTick()
        expect(getComputedStyle(apple).backgroundColor).toBe(resolve('--xh-bg-subtle'))
        await userEvent.hover(banana)
        await nextTick()

        const rowBefore = banana.getBoundingClientRect()
        const markBefore = indicator(banana).getBoundingClientRect()
        await userEvent.click(banana)
        await nextTick()
        expect(banana.getAttribute('data-state')).toBe('checked')
        expect(apple.getAttribute('data-state')).toBe(selectionMode === 'single' ? 'unchecked' : 'checked')
        expect(getComputedStyle(indicator(banana)).visibility).toBe('visible')
        // 选中 + 悬停：仍是 100 档，行与对号的几何不动
        expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-subtle'))
        expect(getComputedStyle(banana).color).toBe(resolve('--xh-fg-default', 'color'))
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

  it('按下只换面不缩放：选中与未选中的行按住同为 200 档', async () => {
    await mount()
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

    // 松手后 banana 成为选中行；再按住它仍落 200 档
    expect(banana.getAttribute('data-state')).toBe('checked')
    await pressPointer(banana)
    expect(getComputedStyle(banana).backgroundColor).toBe(resolve('--xh-bg-subtle-hover'))
    await releasePointer(banana)
  })

  it('forced-colors：选中行与未选中行同为静息面，选中只由对号表达', async () => {
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    await mount()
    const apple = item('apple')
    const banana = item('banana')
    // 指针可能还停在上一条用例松手的 banana 上：移开时的 120ms 淡出会让它读到过渡中途的面
    for (const row of [apple, banana])
      row.style.transition = 'none'
    await userEvent.hover(item('cherry'))
    expect(getComputedStyle(apple).backgroundColor).toBe(getComputedStyle(banana).backgroundColor)
    expect(getComputedStyle(apple).color).toBe(getComputedStyle(banana).color)
    expect(getComputedStyle(indicator(apple)).visibility).toBe('visible')
  })

  it('打印：对号是遮罩出来的一块底色，按原样印出，不随打印丢底色', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    await mount()
    expect(getComputedStyle(indicator(item('apple'))).printColorAdjust).toBe('exact')
  })
})
