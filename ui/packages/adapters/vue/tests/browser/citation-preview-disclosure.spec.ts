// 引用预览是正文流里的静态面：展开收起按 surface 级披露走——高度从 0 长到整块、再收回 0，
// 后面的段落跟着一路平移，而不是被瞬间推开、瞬间拉回；首帧就开着的预览直接呈现。
// 盒高与下方段落的位置只有真实布局量得出来。
import type { CitationSource } from '@xihan-ui/headless'
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhCitationPreview, XhCitationRoot, XhCitationText, XhCitationTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null
let host: HTMLElement | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  delete document.documentElement.dataset.motion
})

const sources: CitationSource[] = [
  { type: 'source-url', sourceId: 'report', title: '报告', url: 'https://example.com/report', anchors: [{ sourceId: 'report', quote: '共享原语可以减少产品之间的不一致。' }] },
  { type: 'source-url', sourceId: 'spec', title: '规范', url: 'https://example.com/spec', anchors: [{ sourceId: 'spec', quote: '可访问关系在读屏中必须仍可追踪。' }] },
]

async function mount(props: Record<string, unknown> = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => [
      h(XhCitationRoot, { sources, ...props }, () => [
        h(XhCitationText, null, () => [
          '正文',
          h(XhCitationTrigger, { sourceId: 'report', citationId: 'c1' }, () => '1'),
          h(XhCitationTrigger, { sourceId: 'spec', citationId: 'c2' }, () => '2'),
        ]),
        h(XhCitationPreview, { sourceId: 'report' }),
        h(XhCitationPreview, { sourceId: 'spec' }),
      ]),
      h('p', { 'data-testid': 'after', 'style': 'margin:0' }, () => '后面的段落'),
    ],
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return host.querySelector<HTMLElement>('[data-testid="after"]')!
}

function preview(sourceId: string): HTMLElement {
  return host!.querySelector<HTMLElement>(`[data-scope='citation'][data-part='preview'][id$='${sourceId}']`)!
}

function trigger(index: number): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope='citation'][data-part='trigger']`)[index]!
}

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

/** 同步派发点击再等宿主提交：逐帧取样从开合那一刻起算，不被驱动真指针的往返时延吃掉开头几帧。 */
async function press(el: HTMLElement): Promise<void> {
  el.click()
  await nextTick()
}

/** 逐帧记下后面段落的位置，直到条件成立。 */
async function track(below: HTMLElement, done: () => boolean): Promise<number[]> {
  const tops: number[] = []
  for (let i = 0; i < 120; i++) {
    tops.push(below.getBoundingClientRect().top)
    if (done())
      break
    await frame()
  }
  return tops
}

describe('citation 预览的披露', () => {
  it('展开时高度从 0 长到整块，后面的段落一路下移；收起时收回 0，段落一路上移，收完才藏起', async () => {
    const below = await mount()
    const closedTop = below.getBoundingClientRect().top

    await press(trigger(0))
    const report = preview('report')
    expect(report.hidden).toBe(false)
    const opening = await track(below, () => report.getAnimations().every(a => a.playState === 'finished'))
    const openTop = below.getBoundingClientRect().top
    expect(openTop).toBeGreaterThan(closedTop + 20)
    // 第一帧还没推开，之后一路下移
    expect(opening[0]!).toBeLessThan(closedTop + 2)
    expect(new Set(opening.map(Math.round)).size).toBeGreaterThan(3)

    await press(trigger(0))
    expect(report.hidden).toBe(false)
    expect(report.dataset.state).toBe('closed')
    const closing = await track(below, () => report.hidden === true)
    expect(report.hidden).toBe(true)
    expect(closing[0]!).toBeGreaterThan(openTop - 2)
    expect(new Set(closing.map(Math.round)).size).toBeGreaterThan(3)
    expect(below.getBoundingClientRect().top).toBeCloseTo(closedTop, 0)
  })

  it('首帧就开着的预览直接呈现，不播展开', async () => {
    await mount({ defaultOpen: true, defaultActiveSourceId: 'report' })
    const report = preview('report')
    expect(report.hidden).toBe(false)
    expect(report.hasAttribute('data-instant')).toBe(true)
    expect(getComputedStyle(report).animationName).toBe('none')
  })

  it('换一个来源：旧预览收起、新预览展开，同时进行', async () => {
    await mount()
    await press(trigger(0))
    await frame()
    await press(trigger(1))
    const report = preview('report')
    const spec = preview('spec')
    expect(report.dataset.state).toBe('closed')
    expect(report.hidden).toBe(false)
    expect(spec.dataset.state).toBe('open')
    await expect.poll(() => report.hidden, { timeout: 2000 }).toBe(true)
    expect(spec.hidden).toBe(false)
  })
})
