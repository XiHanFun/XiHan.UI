// 滑动指示器量的是排布位：祖先带缩放（对话框进场）、整页 RTL 而组件没传 dir 时，
// 指示器仍要与选中项严丝合缝。位置走 transform，只有真实布局量得出它落在哪。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhSegmentedIndicator, XhSegmentedItem, XhSegmentedItemText, XhSegmentedRoot } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.documentElement.removeAttribute('dir')
  document.body.innerHTML = ''
})

const ITEMS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '按周统计' },
  { value: 'month', label: '月' },
]

async function mountSegmented(options: { scale?: number, value?: string } = {}): Promise<{ value: ReturnType<typeof ref<string>> }> {
  const value = ref(options.value ?? 'week')
  const host = document.createElement('div')
  if (options.scale)
    host.style.transform = `scale(${options.scale})`
  document.body.append(host)
  app = createApp({
    render: () => h(XhSegmentedRoot, { 'value': value.value, 'onUpdate:value': (next: string | null) => (value.value = next ?? '') }, () => [
      h(XhSegmentedIndicator),
      ...ITEMS.map(item => h(XhSegmentedItem, { value: item.value }, () => [h(XhSegmentedItemText, null, () => item.label)])),
    ]),
  })
  app.mount(host)
  await settle()
  return { value }
}

async function settle(): Promise<void> {
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  for (const el of document.querySelectorAll<HTMLElement>('[data-part="indicator"]')) {
    for (const animation of el.getAnimations())
      animation.finish()
  }
}

function part(name: string, value?: string): HTMLElement {
  const selector = value ? `[data-scope='segmented'][data-part='${name}'][data-value='${value}']` : `[data-scope='segmented'][data-part='${name}']`
  return document.querySelector<HTMLElement>(selector)!
}

/** 指示器的屏幕矩形与选中段重合（祖先缩放同样作用于两者）。 */
function expectCovers(value: string): void {
  const indicator = part('indicator').getBoundingClientRect()
  const item = part('item', value).getBoundingClientRect()
  expect(indicator.left).toBeCloseTo(item.left, 0)
  expect(indicator.top).toBeCloseTo(item.top, 0)
  expect(indicator.width).toBeCloseTo(item.width, 0)
  expect(indicator.height).toBeCloseTo(item.height, 0)
}

describe('segmented 的滑块几何', () => {
  it('祖先带 scale(0.5) 时量排布位，滑块与选中段重合而不是再缩一半', async () => {
    await mountSegmented({ scale: 0.5 })
    expectCovers('week')
  })

  it('整页 RTL 而组件没传 dir：滑块照样落在选中段上', async () => {
    document.documentElement.dir = 'rtl'
    await mountSegmented()
    expectCovers('week')
  })

  it('换段只动 transform 与尺寸，不动 inset', async () => {
    const { value } = await mountSegmented()
    value.value = 'month'
    await nextTick()
    await new Promise(resolve => requestAnimationFrame(resolve))
    const style = getComputedStyle(part('indicator'))
    expect(style.transitionProperty.split(', ')).toEqual(['transform', 'inline-size', 'block-size', 'box-shadow'])
    await settle()
    expectCovers('month')
  })
})
