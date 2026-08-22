// @vitest-environment jsdom
// slider 刻度：marks 呈现数据（百分比定位、分段上色）、点文案跳值；
// snapToMarks 让命令式赋值与键盘都只认刻度落点，方向键走「下一档刻度」。
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhSliderControl,
  XhSliderMarks,
  XhSliderRange,
  XhSliderRoot,
  XhSliderThumb,
  XhSliderTrack,
} from '../src'

async function tick(): Promise<void> {
  await nextTick()
  await nextTick()
  await new Promise(r => setTimeout(r, 0))
  await nextTick()
}

let cleanup: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanup) fn()
  cleanup = []
  document.body.innerHTML = ''
})

const MARKS = [
  { value: 0, label: '零' },
  { value: 40, label: '四十' },
  { value: 100, label: '百' },
]

async function mountSlider(props: Record<string, unknown>): Promise<void> {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({
    setup: () => () =>
      h(XhSliderRoot, { marks: MARKS, ...props }, () => [
        h(XhSliderControl, null, () => [
          h(XhSliderTrack, null, () => [h(XhSliderRange)]),
          h(XhSliderMarks),
          h(XhSliderThumb, { index: 0 }),
        ]),
      ]),
  })
  app.mount(host)
  cleanup.push(() => {
    app.unmount()
    host.remove()
  })
  await tick()
}

function el(selector: string): HTMLElement {
  const hit = document.querySelector<HTMLElement>(selector)
  if (!hit)
    throw new Error(`找不到 ${selector}`)
  return hit
}

function thumbValue(): string | null {
  return el('[data-scope="slider"][data-part="thumb"]').getAttribute('aria-valuenow')
}

describe('slider 刻度', () => {
  it('刻度点按百分比定位，落进已选区间的带 data-passed', async () => {
    await mountSlider({ defaultValue: [40] })
    const dots = [...document.querySelectorAll<HTMLElement>('[data-scope="slider"][data-part="mark"]')]
    expect(dots).toHaveLength(3)
    expect(dots[1]!.style.insetInlineStart).toBe('40%')
    expect(dots[0]!.hasAttribute('data-passed')).toBe(true)
    expect(dots[1]!.hasAttribute('data-passed')).toBe(true)
    expect(dots[2]!.hasAttribute('data-passed')).toBe(false)
  })

  it('点刻度文案：最近的滑块跳到这一档', async () => {
    await mountSlider({ defaultValue: [0] })
    const labels = [...document.querySelectorAll<HTMLElement>('[data-scope="slider"][data-part="mark-label"]')]
    expect(labels.map(l => l.textContent)).toEqual(['零', '四十', '百'])
    labels[2]!.click()
    await tick()
    expect(thumbValue()).toBe('100')
  })

  it('snapToMarks：命令式赋值吸到最近刻度，方向键走下一档', async () => {
    await mountSlider({ defaultValue: [33], snapToMarks: true })
    // 33 吸到 40
    expect(thumbValue()).toBe('40')
    const thumb = el('[data-scope="slider"][data-part="thumb"]')
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await tick()
    expect(thumbValue()).toBe('100')
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }))
    await tick()
    expect(thumbValue()).toBe('0')
  })

  it('不开 snapToMarks 时步进照旧走 step', async () => {
    await mountSlider({ defaultValue: [40] })
    const thumb = el('[data-scope="slider"][data-part="thumb"]')
    thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }))
    await tick()
    expect(thumbValue()).toBe('41')
  })
})
