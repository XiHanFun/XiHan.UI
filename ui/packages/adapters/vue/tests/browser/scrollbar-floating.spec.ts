// 缺省档的滚动条浮在内容之上：不占视口宽度（横条不占高度），滚动时与指针进来时露出，都停下后收起。
//
// 这四件只有真实浏览器量得出来：jsdom 不排版，clientWidth / getBoundingClientRect 恒是 0，
// 原生滚动条占不占位也无从谈起；滚动事件更是要真的滚过才派。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import {
  XhLogContent,
  XhLogLine,
  XhLogRoot,
  XhLogViewport,
  XhScrollAreaContent,
  XhScrollAreaRoot,
  XhScrollAreaScrollbar,
  XhScrollAreaThumb,
  XhScrollAreaTrack,
  XhScrollAreaViewport,
  XhScrollbarRoot,
  XhScrollbarThumb,
  XhScrollbarTrack,
} from '../../src'
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

/** 视口 240×160、内容远超两轴：竖横都溢出。 */
async function mountArea(type?: string): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)

  const lines = Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 行 ${'内容'.repeat(20)}`)

  app = createApp({
    setup: () => () =>
      h(
        XhScrollAreaRoot,
        { type, style: 'block-size: 160px; inline-size: 240px' },
        () => [
          h(XhScrollAreaViewport, null, () => [
            h(XhScrollAreaContent, null, () =>
              lines.map(line => h('div', { key: line, style: 'white-space: nowrap' }, line))),
          ]),
          h(XhScrollAreaScrollbar, { orientation: 'vertical' }, () => [
            h(XhScrollAreaTrack, null, () => [h(XhScrollAreaThumb)]),
          ]),
          h(XhScrollAreaScrollbar, { orientation: 'horizontal' }, () => [
            h(XhScrollAreaTrack, null, () => [h(XhScrollAreaThumb)]),
          ]),
        ],
      ),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  // 尺寸测量推迟一拍，等它跑完再断言
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function part(name: string, index = 0): HTMLElement {
  return host!.querySelectorAll<HTMLElement>(`[data-scope="scroll-area"][data-part="${name}"]`)[index]
}

function viewport(): HTMLElement {
  return part('viewport')
}

function verticalBar(): HTMLElement {
  return part('scrollbar', 0)
}

/** 真的滚一次并等它派完 scroll 事件。 */
async function scrollTo(top: number): Promise<void> {
  const vp = viewport()
  if (vp.scrollTop === top)
    return
  const settled = new Promise<void>((resolve) => {
    const done = (): void => {
      vp.removeEventListener('scroll', done)
      resolve()
    }
    vp.addEventListener('scroll', done)
    setTimeout(done, 500)
  })
  vp.scrollTop = top
  await settled
  await nextTick()
}

function enter(): Promise<void> {
  viewport().dispatchEvent(new PointerEvent('pointerenter'))
  return nextTick()
}

function leave(): Promise<void> {
  viewport().dispatchEvent(new PointerEvent('pointerleave'))
  return nextTick()
}

/** 等某个条件成立，最多等 ms 毫秒。 */
async function waitUntil(ok: () => boolean, ms = 2000): Promise<void> {
  const deadline = Date.now() + ms
  while (!ok() && Date.now() < deadline)
    await new Promise<void>(resolve => setTimeout(resolve, 30))
}

describe('缺省档的滚动条浮在内容上', () => {
  it('不占视口的宽与高：视口铺满根，两条道都不让', async () => {
    await mountArea()
    const root = part('root')
    const vp = viewport()
    expect(vp.getAttribute('data-lane-vertical')).toBeNull()
    expect(vp.getAttribute('data-lane-horizontal')).toBeNull()
    // 视口与根内框等宽等高：自绘条没占位，原生条也已经藏起来
    expect(vp.clientWidth).toBe(root.clientWidth)
    expect(vp.clientHeight).toBe(root.clientHeight)
    expect(vp.offsetWidth - vp.clientWidth).toBe(0)
    expect(vp.offsetHeight - vp.clientHeight).toBe(0)
  })

  it('always 档作对照：视口在两轴上各让出一条道', async () => {
    await mountArea('always')
    const root = part('root')
    const vp = viewport()
    expect(vp.getAttribute('data-lane-vertical')).toBe('')
    expect(vp.getAttribute('data-lane-horizontal')).toBe('')
    expect(root.clientWidth - vp.clientWidth).toBeGreaterThan(0)
    expect(root.clientHeight - vp.clientHeight).toBeGreaterThan(0)
  })

  it('不滚动也不悬停时收着，滚动与悬停各自都能让它露面', async () => {
    await mountArea()
    const bar = verticalBar()
    expect(bar.getAttribute('data-state')).toBe('hidden')
    expect(getComputedStyle(bar).visibility).toBe('hidden')

    await scrollTo(200)
    expect(bar.getAttribute('data-state')).toBe('visible')

    await waitUntil(() => bar.getAttribute('data-state') === 'hidden')
    expect(bar.getAttribute('data-state')).toBe('hidden')

    await enter()
    expect(bar.getAttribute('data-state')).toBe('visible')
    expect(getComputedStyle(bar).visibility).toBe('visible')

    await leave()
    await waitUntil(() => bar.getAttribute('data-state') === 'hidden')
    expect(bar.getAttribute('data-state')).toBe('hidden')
  })

  it('露面前后视口尺寸一个像素都不变', async () => {
    await mountArea()
    const vp = viewport()
    const before = { w: vp.clientWidth, h: vp.clientHeight }
    await enter()
    expect(verticalBar().getAttribute('data-state')).toBe('visible')
    expect({ w: vp.clientWidth, h: vp.clientHeight }).toEqual(before)
  })

  it('从头滚到底，条子本身的矩形一动不动', async () => {
    await mountArea()
    await enter()
    const bar = verticalBar()
    const at = (): string => JSON.stringify(bar.getBoundingClientRect().toJSON())
    const first = at()
    const max = viewport().scrollHeight - viewport().clientHeight
    for (const top of [0, Math.round(max / 4), Math.round(max / 2), max]) {
      await scrollTo(top)
      expect(at()).toBe(first)
    }
  })

  it('滚到底连跑两轮，内容尺寸不长大', async () => {
    await mountArea()
    await enter()
    const vp = viewport()
    const before = { h: vp.scrollHeight, w: vp.scrollWidth }
    for (let round = 0; round < 2; round++) {
      await scrollTo(vp.scrollHeight - vp.clientHeight)
      await scrollTo(0)
    }
    expect({ h: vp.scrollHeight, w: vp.scrollWidth }).toEqual(before)
  })
})

/** 日志的视口给个 id，滚动条用 controls 挂上去；条子与视口平级摆在日志根里。 */
async function mountLog(withBar: boolean): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)

  const lines = Array.from({ length: 40 }, (_, i) => `第 ${i + 1} 行`)
  const id = withBar ? 'log-with-bar' : 'log-native'

  app = createApp({
    setup: () => () =>
      h(XhLogRoot, { rows: 8, style: 'inline-size: 240px' }, () => [
        h(XhLogViewport, { id }, () => [
          h(XhLogContent, null, () => lines.map(line => h(XhLogLine, { key: line }, () => line))),
        ]),
        ...(withBar
          ? [h(XhScrollbarRoot, { controls: id }, () => [h(XhScrollbarTrack, null, () => [h(XhScrollbarThumb)])])]
          : []),
      ]),
  })
  app.mount(host)
  await nextTick()
  await nextTick()
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function logViewport(): HTMLElement {
  return host!.querySelector<HTMLElement>('[data-scope="log"][data-part="viewport"]')!
}

describe('日志换上自绘滚动条', () => {
  it('挂上后视口不再留空道，条子浮着不占宽', async () => {
    await mountLog(true)
    const vp = logViewport()
    // 作者写在部件上的 id 落到了真节点上，滚动条才查得到它
    expect(vp.id).toBe('log-with-bar')
    expect(vp.getAttribute('data-xh-scrollbar')).toBe('1')
    expect(getComputedStyle(vp).scrollbarGutter).not.toBe('stable')
    expect(vp.offsetWidth - vp.clientWidth).toBe(0)
  })

  it('没挂自绘条时空道照留：原生滚动条出现与消失不推动文字', async () => {
    await mountLog(false)
    const vp = logViewport()
    expect(vp.getAttribute('data-xh-scrollbar')).toBeNull()
    expect(getComputedStyle(vp).scrollbarGutter).toBe('stable')
    expect(vp.offsetWidth - vp.clientWidth).toBeGreaterThan(0)
  })
})
