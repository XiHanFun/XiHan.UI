// Alert 关闭的退场：先淡出，再把占位收起，下面的内容跟着一路平移上来，而不是整块跳上来。
// 盒子的高度、下方元素的位置与不透明度只有真实布局量得出来。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { createApp, h, nextTick } from 'vue'
import { XhAlertCloseTrigger, XhAlertContent, XhAlertDescription, XhAlertRoot, XhAlertTitle } from '../../src'
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

function part(name: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='alert'][data-part='${name}']`)
  if (!element)
    throw new Error(`找不到 alert/${name}`)
  return element
}

async function mount(): Promise<HTMLElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  document.body.append(host)
  app = createApp({
    render: () => [
      h(XhAlertRoot, { tone: 'warning' }, () => [
        h(XhAlertContent, null, () => [
          h(XhAlertTitle, null, () => '存储空间不足'),
          h(XhAlertDescription, null, () => '剩余空间低于 10%，请尽快清理'),
        ]),
        h(XhAlertCloseTrigger),
      ]),
      h('p', { 'data-testid': 'below', 'style': 'margin:0' }, () => '下面的内容'),
    ],
  })
  app.mount(host)
  await nextTick()
  await new Promise(resolve => requestAnimationFrame(resolve))
  return host.querySelector<HTMLElement>('[data-testid="below"]')!
}

const frame = (): Promise<unknown> => new Promise(resolve => requestAnimationFrame(resolve))

describe('alert 关闭的退场', () => {
  it('先淡出、再收起占位：下面的内容一路平移上来，不整块跳；收完才藏起', async () => {
    const below = await mount()
    const root = part('root')
    const height = root.getBoundingClientRect().height
    const top = below.getBoundingClientRect().top

    await userEvent.click(part('close-trigger'))
    const samples: Array<{ top: number, height: number, opacity: number }> = []
    for (let i = 0; i < 120 && !root.hidden; i++) {
      samples.push({
        top: below.getBoundingClientRect().top,
        height: root.getBoundingClientRect().height,
        opacity: Number(getComputedStyle(root).opacity),
      })
      await frame()
    }
    expect(root.hidden).toBe(true)
    expect(root.dataset.state).toBe('closed')

    // 关掉那一刻下面的内容原地不动，退场期间一路往上挪，落点正好让出提示的整块高度
    expect(samples[0]!.top).toBeCloseTo(top, 0)
    const moves = new Set(samples.map(s => Math.round(s.top)))
    expect(moves.size).toBeGreaterThan(3)
    expect(below.getBoundingClientRect().top).toBeCloseTo(top - height, 0)
    // 先淡出、后收高：高度开始变小时已经看不见了
    const shrinking = samples.find(s => s.height < height - 0.5)!
    expect(shrinking.opacity).toBeLessThan(0.05)
  })

  it('减弱动效下收高瞬时完成，淡出照常', async () => {
    document.documentElement.dataset.motion = 'reduce'
    const below = await mount()
    const root = part('root')
    const top = below.getBoundingClientRect().top

    await userEvent.click(part('close-trigger'))
    expect(root.hidden).toBe(false)
    expect(getComputedStyle(root).animationName).toContain('xh-fade-out')
    await expect.poll(() => root.hidden, { timeout: 2000 }).toBe(true)
    expect(below.getBoundingClientRect().top).toBeLessThan(top)
  })
})
