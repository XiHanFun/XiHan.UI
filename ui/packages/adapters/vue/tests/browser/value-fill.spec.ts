// 值类填充不动尺寸：进度条与加载条的填充铺满轨道、按比例平移，倒计时条靠裁切收起。
// 露出多少、从哪一侧收只有真实布局量得出来：jsdom 不算 translate 与 clip-path。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick, ref } from 'vue'
import { XhLoadingBarPeg, XhLoadingBarRange, XhLoadingBarRoot, XhLoadingBarTrack, XhProgress, XhToastProgress, XhToastRoot, XhToastTitle } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  document.documentElement.removeAttribute('dir')
  delete document.documentElement.dataset.motion
  document.body.innerHTML = ''
})

async function mount(render: () => ReturnType<typeof h>): Promise<void> {
  const host = document.createElement('div')
  host.style.inlineSize = '400px'
  document.body.append(host)
  app = createApp({ render })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
}

function part(scope: string, name: string): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-scope='${scope}'][data-part='${name}']`)!
}

/** 让进行中的过渡直接落到终点，量的是这一刻的终态。 */
function settle(el: HTMLElement): void {
  for (const animation of el.getAnimations())
    animation.finish()
}

/** 填充露在轨道里的那一段占轨道的比例，以及露出的是行首还是行尾那一侧。 */
function visible(track: HTMLElement, fill: HTMLElement): { ratio: number, fromStart: boolean } {
  const t = track.getBoundingClientRect()
  const f = fill.getBoundingClientRect()
  const left = Math.max(t.left, f.left)
  const right = Math.min(t.right, f.right)
  const rtl = getComputedStyle(track).direction === 'rtl'
  return {
    ratio: Math.max(0, right - left) / t.width,
    fromStart: rtl ? Math.abs(right - t.right) < 0.5 : Math.abs(left - t.left) < 0.5,
  }
}

describe('进度条的填充', () => {
  it.each(['ltr', 'rtl'] as const)('%s：填充与轨道同宽，按比例平移后从行首露出走完的那一段', async (dir) => {
    document.documentElement.dir = dir
    await mount(() => h(XhProgress, { value: 30 }))
    const track = part('progress', 'track')
    const range = part('progress', 'range')
    settle(range)

    expect(range.getBoundingClientRect().width).toBeCloseTo(track.getBoundingClientRect().width, 0)
    const shown = visible(track, range)
    expect(shown.ratio).toBeCloseTo(0.3, 2)
    expect(shown.fromStart).toBe(true)
  })

  it('进度变化只平移、不改宽度', async () => {
    let value = 20
    await mount(() => h(XhProgress, { value }))
    const range = part('progress', 'range')
    const width = range.getBoundingClientRect().width

    value = 80
    app!._instance!.proxy!.$forceUpdate()
    await nextTick()
    expect(getComputedStyle(range).transitionProperty).toBe('translate')
    settle(range)
    expect(range.getBoundingClientRect().width).toBe(width)
    expect(visible(part('progress', 'track'), range).ratio).toBeCloseTo(0.8, 2)
  })

  it.each([['ltr', '-100%'], ['rtl', '100%']] as const)('%s：不定进度是一段固定宽度从行首外扫起', async (dir, from) => {
    document.documentElement.dir = dir
    await mount(() => h(XhProgress, { indeterminate: true }))
    const range = part('progress', 'range')
    const [sweep] = range.getAnimations().filter(a => (a as CSSAnimation).animationName === 'xh-progress-indeterminate')
    sweep!.pause()
    sweep!.currentTime = 0
    expect(getComputedStyle(range).translate).toBe(from)
    expect(range.getBoundingClientRect().width).toBeCloseTo(part('progress', 'track').getBoundingClientRect().width * 0.4, 0)
  })

  it('减弱动效下不定进度是一整条静止的条子', async () => {
    document.documentElement.dataset.motion = 'reduce'
    await mount(() => h(XhProgress, { indeterminate: true }))
    const range = part('progress', 'range')
    expect(getComputedStyle(range).animationName).toBe('none')
    expect(visible(part('progress', 'track'), range).ratio).toBeCloseTo(1, 2)
  })
})

describe('加载条的填充', () => {
  it.each(['ltr', 'rtl'] as const)('%s：进度段按比例平移露出，末端亮边落在露出的前端', async (dir) => {
    document.documentElement.dir = dir
    await mount(() => h(XhLoadingBarRoot, { loading: true, value: 40, trickle: false }, () => [
      h(XhLoadingBarTrack, null, () => [h(XhLoadingBarRange, null, () => [h(XhLoadingBarPeg)])]),
    ]))
    const track = part('loading-bar', 'track')
    const range = part('loading-bar', 'range')
    settle(range)

    const shown = visible(track, range)
    expect(shown.ratio).toBeCloseTo(0.4, 2)
    expect(shown.fromStart).toBe(true)
    const t = track.getBoundingClientRect()
    const peg = part('loading-bar', 'peg').getBoundingClientRect()
    const front = dir === 'ltr' ? t.left + t.width * 0.4 : t.right - t.width * 0.4
    expect(dir === 'ltr' ? peg.right : peg.left).toBeCloseTo(front, 0)
  })

  it('收尾时留在满格等淡出过渡真正播完才归零：淡出时长给多长就等多长', async () => {
    const loading = ref(true)
    await mount(() => h(XhLoadingBarRoot, { loading: loading.value, trickle: false, fadeDuration: 400 }, () => [
      h(XhLoadingBarTrack, null, () => [h(XhLoadingBarRange, null, () => [h(XhLoadingBarPeg)])]),
    ]))
    const root = part('loading-bar', 'root')
    loading.value = false
    await nextTick()
    const started = performance.now()
    expect(root.dataset.state).toBe('finishing')
    // 淡出时长写进了皮肤的时长槽，过渡按它播
    expect(getComputedStyle(root).transitionDuration.split(', ')[0]).toBe('0.4s')

    await new Promise(resolve => setTimeout(resolve, 200))
    expect(root.dataset.state).toBe('finishing')
    expect(root.getAttribute('aria-valuenow')).toBeNull()

    await expect.poll(() => root.dataset.state, { timeout: 2000 }).toBe('idle')
    expect(performance.now() - started).toBeGreaterThanOrEqual(380)
    expect(root.hidden).toBe(true)
  })
})

describe('倒计时条', () => {
  async function countdown(): Promise<{ bar: HTMLElement, animation: Animation }> {
    await mount(() => h(XhToastRoot, { title: '已保存', duration: 4000 }, () => [h(XhToastTitle), h(XhToastProgress)]))
    const bar = part('toast', 'progress')
    const [animation] = bar.getAnimations().filter(a => (a as CSSAnimation).animationName === 'xh-countdown')
    animation!.pause()
    return { bar, animation: animation! }
  }

  it.each([['ltr', 'inset(0px 50% 0px 0px)'], ['rtl', 'inset(0px 0px 0px 50%)']] as const)('%s：条子不改宽度，从行尾往行首裁掉走过的时间', async (dir, half) => {
    document.documentElement.dir = dir
    const { bar, animation } = await countdown()
    const width = bar.getBoundingClientRect().width
    animation.currentTime = 2000
    expect(getComputedStyle(bar).clipPath).toBe(half)
    expect(bar.getBoundingClientRect().width).toBe(width)
  })

  it('减弱动效下按秒分段：4 秒的倒计时走 4 格', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const { bar, animation } = await countdown()
    expect(getComputedStyle(bar).animationTimingFunction).toBe('steps(4)')
    animation.currentTime = 1500
    expect(getComputedStyle(bar).clipPath).toBe('inset(0px 25% 0px 0px)')
  })
})
