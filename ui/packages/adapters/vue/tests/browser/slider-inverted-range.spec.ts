// 滑块的反向、整段拖动与不填充：拇指与区间在真实轨道上落在哪、真实指针按在区间里时两端是不是一起走。
// 落点与命中都要真实排版与真实指针：jsdom 不排版，也不做命中测试。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhSliderControl, XhSliderRange, XhSliderRoot, XhSliderThumb, XhSliderTrack } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

const SCOPE = `[data-scope='slider']`

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  host?.remove()
  app = null
  host = null
})

async function mount(props: Record<string, unknown>): Promise<{ track: HTMLElement, range: HTMLElement, thumbs: HTMLElement[], changes: number[][] }> {
  const changes: number[][] = []
  const count = (props.defaultValue as number[]).length
  host = document.createElement('div')
  host.style.cssText = 'padding: 32px; inline-size: 240px'
  document.body.prepend(host)
  app = createApp({
    render: () => h(XhSliderRoot, { ...props, 'onValue-change': (d: { value: number[] }) => changes.push(d.value) }, () => [
      h(XhSliderControl, null, () => [
        h(XhSliderTrack, null, () => [h(XhSliderRange)]),
        ...Array.from({ length: count }, (_, index) => h(XhSliderThumb, { index })),
      ]),
    ]),
  })
  app.mount(host)
  await nextTick()
  return {
    track: host.querySelector<HTMLElement>(`${SCOPE}[data-part='track']`)!,
    range: host.querySelector<HTMLElement>(`${SCOPE}[data-part='range']`)!,
    thumbs: [...host.querySelectorAll<HTMLElement>(`${SCOPE}[data-part='thumb']`)],
    changes,
  }
}

/** 测试文档里的坐标换算成外层页面（CDP 坐标系）的坐标。 */
function toPage(x: number, y: number): { x: number, y: number } {
  const frame = window.frameElement?.getBoundingClientRect()
  if (!frame)
    return { x, y }
  return { x: frame.left + x * (frame.width / window.innerWidth), y: frame.top + y * (frame.height / window.innerHeight) }
}

function centerX(el: Element): number {
  const r = el.getBoundingClientRect()
  return r.left + r.width / 2
}

describe('slider 反向、整段拖动与不填充（真实浏览器）', () => {
  it('反向：值 30 的拇指落在轨道 70% 处，已选区间从行尾画到拇指', async () => {
    const { track, range, thumbs } = await mount({ defaultValue: [30], inverted: true })
    const t = track.getBoundingClientRect()
    expect(centerX(thumbs[0]!)).toBeCloseTo(t.left + t.width * 0.7, 0)
    const r = range.getBoundingClientRect()
    expect(r.right).toBeCloseTo(t.right, 0)
    expect(r.left).toBeCloseTo(t.left + t.width * 0.7, 0)
  })

  it('不填充：区间部件不占画面，只剩底槽与拇指', async () => {
    const { range } = await mount({ defaultValue: [60], trackFill: false })
    expect(getComputedStyle(range).display).toBe('none')
  })

  it('整段拖动：真实指针按在两端拇指之间往右拖，两个拇指一起走、间距不变', async () => {
    const { track, thumbs, changes } = await mount({ defaultValue: [20, 60], draggableRange: true })
    const t = track.getBoundingClientRect()
    const y = t.top + t.height / 2
    const start = toPage(t.left + t.width * 0.4, y)
    const end = toPage(t.left + t.width * 0.6, y)
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...start })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', ...start, button: 'left', buttons: 1, clickCount: 1 })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...end, button: 'left', buttons: 1 })
    await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...end, button: 'left', buttons: 0, clickCount: 1 })
    await nextTick()
    expect(changes.at(-1)).toEqual([40, 80])
    expect(centerX(thumbs[1]!) - centerX(thumbs[0]!)).toBeCloseTo(t.width * 0.4, 0)
  })
})
