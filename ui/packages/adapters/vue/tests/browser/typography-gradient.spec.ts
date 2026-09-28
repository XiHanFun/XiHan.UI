// 渐变字：前景透明、渐变裁进字形；高对比、强制色与打印退回实色。
//
// 背景裁进字形、前景色经轴边界上的私有槽路由、系统媒体特性的兜底，这三件事都要层叠真正算过一遍：
// jsdom 不解析 background-clip 与媒体查询，只有真实浏览器的计算值能证明亮暗两态与高对比作用域各取了什么。
import type { App, VNode } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhTypographyParagraph, XhTypographyRoot, XhTypographyText } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(async () => {
  await cdp().send('Emulation.setEmulatedMedia', { media: '', features: [] })
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.theme
})

function mount(render: () => VNode): void {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ setup: () => render })
  app.mount(host)
}

/** 一段正文里夹一个渐变词；attrs 落在渐变词上。 */
function gradientWord(attrs: Record<string, unknown> = {}): VNode {
  return h(XhTypographyRoot, null, () => [
    h(XhTypographyParagraph, null, () => [
      '快速、轻量的',
      h(XhTypographyText, { variant: 'gradient', ...attrs }, () => '组件库'),
    ]),
  ])
}

function word(): HTMLElement {
  const el = host?.querySelector<HTMLElement>('[data-scope="typography"][data-part="text"][data-variant="gradient"]')
  if (!el)
    throw new Error('找不到渐变字')
  return el
}

/** 在渐变字旁边放一枚探针，按同一处的作用域求出一条声明的计算值。 */
function probe(property: 'backgroundImage' | 'color', value: string, attrs: Record<string, string> = {}): string {
  const el = document.createElement('span')
  for (const [name, attr] of Object.entries(attrs))
    el.setAttribute(name, attr)
  el.style[property] = value
  word().after(el)
  const computed = getComputedStyle(el)[property]
  el.remove()
  return computed
}

const BRAND = 'linear-gradient(to right, var(--xh-gradient-brand-from), var(--xh-gradient-brand-to))'

describe('typography 渐变字', () => {
  it('亮色：前景透明，背景是品牌渐变并裁进字形', async () => {
    mount(() => gradientWord())
    await nextTick()
    const style = getComputedStyle(word())
    expect(style.color).toBe(TRANSPARENT)
    expect(style.webkitTextFillColor).toBe(TRANSPARENT)
    expect(style.backgroundClip).toBe('text')
    expect(style.backgroundImage).toBe(probe('backgroundImage', BRAND))
  })

  it('暗色：前景仍透明，两端颜色随主题换成暗色档的品牌渐变', async () => {
    mount(() => gradientWord())
    await nextTick()
    const light = getComputedStyle(word()).backgroundImage

    document.documentElement.dataset.theme = 'dark'
    await nextTick()
    const style = getComputedStyle(word())
    expect(style.color).toBe(TRANSPARENT)
    expect(style.webkitTextFillColor).toBe(TRANSPARENT)
    expect(style.backgroundImage).toBe(probe('backgroundImage', BRAND))
    expect(style.backgroundImage).not.toBe(light)
  })

  it('contrast-more 作用域：前景取 --xh-fg-default 实色盖住渐变，局部退回 default 时再透明', async () => {
    mount(() => h('section', { 'data-contrast': 'more' }, [
      h('div', { 'data-contrast': 'more' }, [gradientWord()]),
    ]))
    await nextTick()
    const boundary = host!.querySelector<HTMLElement>('div[data-contrast]')!

    const solid = probe('color', 'var(--xh-fg-default)')
    expect(solid).not.toBe(TRANSPARENT)
    expect(getComputedStyle(word()).color).toBe(solid)
    expect(getComputedStyle(word()).webkitTextFillColor).toBe(solid)

    boundary.dataset.contrast = 'default'
    await nextTick()
    expect(getComputedStyle(word()).color).toBe(TRANSPARENT)
    expect(getComputedStyle(word()).webkitTextFillColor).toBe(TRANSPARENT)
    expect(getComputedStyle(word()).backgroundImage).toContain('linear-gradient')
  })

  it('语气换两端颜色：取该族主色与压深一档，前景照旧透明', async () => {
    mount(() => gradientWord({ tone: 'success' }))
    await nextTick()
    const style = getComputedStyle(word())
    expect(style.color).toBe(TRANSPARENT)
    expect(style.backgroundImage).toBe(probe(
      'backgroundImage',
      'linear-gradient(to right, var(--xh-tone-solid), var(--xh-tone-solid-active))',
      { 'data-tone': 'success' },
    ))
    expect(style.backgroundImage).not.toBe(probe('backgroundImage', BRAND))
  })

  it('两端颜色与走向由覆盖槽改写，语气写了也让位', async () => {
    mount(() => gradientWord({
      tone: 'danger',
      style: {
        '--xh-typography-gradient-from': 'rgb(255, 0, 0)',
        '--xh-typography-gradient-to': 'rgb(0, 0, 255)',
        '--xh-typography-gradient-direction': 'to bottom left',
      },
    }))
    await nextTick()
    expect(getComputedStyle(word()).backgroundImage).toBe(
      probe('backgroundImage', 'linear-gradient(to bottom left, rgb(255, 0, 0), rgb(0, 0, 255))'),
    )
  })

  it('打印与 forced-colors 都退回可见的单色文字', async () => {
    mount(() => gradientWord())
    await nextTick()
    await cdp().send('Emulation.setEmulatedMedia', { media: 'print', features: [] })
    expect(getComputedStyle(word()).backgroundImage).toBe('none')
    expect(getComputedStyle(word()).webkitTextFillColor).not.toBe(TRANSPARENT)

    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'forced-colors', value: 'active' }],
    })
    expect(matchMedia('(forced-colors: active)').matches).toBe(true)
    expect(getComputedStyle(word()).backgroundImage).toBe('none')
    expect(getComputedStyle(word()).webkitTextFillColor).not.toBe(TRANSPARENT)
  })

  it('系统高对比（没有环境控制器写 data-contrast）同样退回实色', async () => {
    mount(() => gradientWord())
    await nextTick()
    await cdp().send('Emulation.setEmulatedMedia', {
      media: '',
      features: [{ name: 'prefers-contrast', value: 'more' }],
    })
    expect(matchMedia('(prefers-contrast: more)').matches).toBe(true)
    expect(getComputedStyle(word()).backgroundImage).toBe('none')
    expect(getComputedStyle(word()).webkitTextFillColor).not.toBe(TRANSPARENT)
  })

  it('选择与复制仍是原文，不生成替代内容', async () => {
    mount(() => gradientWord())
    await nextTick()
    const range = document.createRange()
    range.selectNodeContents(word())
    const selection = getSelection()!
    selection.removeAllRanges()
    selection.addRange(range)
    expect(selection.toString()).toBe('组件库')
    selection.removeAllRanges()
  })
})
