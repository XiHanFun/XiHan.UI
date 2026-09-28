// 段内图标：排在文字前、直径按尺寸档取、颜色随段的前景色，放进来的图标组件取同一直径；
// 指示器量的是整段，带图标的段同样要被它严丝合缝地罩住。几何与计算样式只有真实布局量得出。
import type { IconRecord } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhIcon, XhSegmentedIndicator, XhSegmentedItem, XhSegmentedItemIcon, XhSegmentedItemText, XhSegmentedRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

// 图标包不在本包依赖里，就地给两份最小记录
const STROKE = { 'fill': 'none', 'stroke': 'currentColor', 'stroke-width': '2' }
const LIST: IconRecord = { name: 'list', viewBox: '0 0 24 24', attrs: STROKE, nodes: [{ tag: 'path', attrs: { d: 'M8 6h13M8 12h13M8 18h13' } }] }
const GRID: IconRecord = { name: 'grid', viewBox: '0 0 24 24', attrs: STROKE, nodes: [{ tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18' } }] }

afterEach(() => {
  app?.unmount()
  app = null
  document.body.innerHTML = ''
})

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  for (const el of document.querySelectorAll<HTMLElement>('[data-part="indicator"]')) {
    for (const animation of el.getAnimations())
      animation.finish()
  }
}

function mount(render: () => ReturnType<typeof h>): void {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
}

function parts(name: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-scope='segmented'][data-part='${name}']`)]
}

/** 某一档图元直径的像素值：放一个探针量出来，不在测试里抄令牌的算式。 */
function glyphSize(tier: 'sm' | 'md' | 'lg', within: HTMLElement): number {
  const probe = document.createElement('span')
  probe.style.display = 'block'
  probe.style.inlineSize = `var(--xh-glyph-size-${tier})`
  within.append(probe)
  const size = probe.getBoundingClientRect().width
  probe.remove()
  return size
}

describe('segmented 段内图标（Chromium）', () => {
  it('collection 的 icon 铺成文字前的图标位：对读屏隐藏，直径按尺寸档取，颜色随段', async () => {
    mount(() => h(XhSegmentedRoot, {
      'defaultValue': 'list',
      'aria-label': '视图',
      'collection': [
        { value: 'list', label: '列表', icon: '☰' },
        { value: 'grid', label: '网格', icon: '▦' },
        { value: 'plain', label: '纯文字' },
      ],
    }))
    await settle()
    const icons = parts('item-icon')
    const items = parts('item')
    expect(icons).toHaveLength(2)
    expect(icons.every(icon => icon.getAttribute('aria-hidden') === 'true')).toBe(true)
    // 可及名只有文字，图标文本不混进去
    expect(items[0]!.textContent).toContain('列表')
    const [icon, text] = [icons[0]!, parts('item-text')[0]!]
    const iconBox = icon.getBoundingClientRect()
    const textBox = text.getBoundingClientRect()
    expect(iconBox.right).toBeLessThanOrEqual(textBox.left)
    const size = glyphSize('md', items[0]!)
    expect(iconBox.width).toBeCloseTo(size, 0)
    expect(iconBox.height).toBeCloseTo(size, 0)
    expect(getComputedStyle(icon).color).toBe(getComputedStyle(items[0]!).color)
    expect(getComputedStyle(icons[1]!).color).toBe(getComputedStyle(items[1]!).color)
    expect(getComputedStyle(icons[0]!).color).not.toBe(getComputedStyle(icons[1]!).color)
  })

  it('图标组件放进 item-icon 跟着尺寸档换直径，指示器罩住带图标的整段', async () => {
    mount(() => h(XhSegmentedRoot, { 'defaultValue': 'grid', 'size': 'sm', 'aria-label': '视图' }, () => [
      h(XhSegmentedIndicator),
      h(XhSegmentedItem, { value: 'list' }, () => [
        h(XhSegmentedItemIcon, null, () => h(XhIcon, { icon: LIST })),
        h(XhSegmentedItemText, null, () => '列表'),
      ]),
      h(XhSegmentedItem, { value: 'grid' }, () => [
        h(XhSegmentedItemIcon, null, () => h(XhIcon, { icon: GRID })),
        h(XhSegmentedItemText, null, () => '网格'),
      ]),
    ]))
    await settle()
    const icon = parts('item-icon')[1]!
    const glyph = icon.querySelector<HTMLElement>('[data-scope="icon"]')!
    const size = glyphSize('sm', parts('item')[1]!)
    expect(glyph.getBoundingClientRect().width).toBeCloseTo(size, 0)
    expect(glyph.getBoundingClientRect().height).toBeCloseTo(size, 0)
    const indicator = parts('indicator')[0]!.getBoundingClientRect()
    const item = parts('item')[1]!.getBoundingClientRect()
    expect(indicator.left).toBeCloseTo(item.left, 0)
    expect(indicator.width).toBeCloseTo(item.width, 0)
  })
})
