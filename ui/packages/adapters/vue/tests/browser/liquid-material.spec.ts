// 液态材质的静态形态：data-material="liquid" 下，投影了 data-xh-liquid 的导航层部件换成液态面；
// standard 档（缺省）下同一部件保持磨砂。静态形态色调随主题极性、不透明度取可读下限，
// 液态面按下层写墨色域与通透档后，按主题取值的通道随之落到对应色调。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null
let app: App | null = null

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
})

async function mountTrigger(attrs: Record<string, string> = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  for (const [k, v] of Object.entries(attrs))
    host.setAttribute(k, v)
  host.style.cssText = 'position: relative; block-size: 200px; background: oklch(0.7 0.19 50)'
  document.body.append(host)
  app = createApp({ render: () => h(XhFloatButtonRoot, null, () => h(XhFloatButtonTrigger, { 'aria-label': '新建' })) })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="float-button"][data-part="trigger"]')!
}

function rgba(color: string): [number, number, number, number] {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const context = canvas.getContext('2d')!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const d = context.getImageData(0, 0, 1, 1).data
  return [d[0]! / 255, d[1]! / 255, d[2]! / 255, d[3]! / 255]
}

describe('液态材质的静态形态', () => {
  it('standard 档（缺省）保持磨砂：16px 模糊', async () => {
    const trigger = await mountTrigger()
    expect(trigger.hasAttribute('data-xh-liquid')).toBe(true)
    expect(getComputedStyle(trigger).backdropFilter).toBe('blur(16px) saturate(1.08)')
  })

  it('liquid 档：浅色主题下是白色 48% 的面、8px 模糊 + 1.4 饱和、墨色细线与两道内阴影亮边', async () => {
    const trigger = await mountTrigger({ 'data-material': 'liquid' })
    const style = getComputedStyle(trigger)
    expect(style.backdropFilter).toBe('blur(8px) saturate(1.4)')
    const [r, g, b, a] = rgba(style.backgroundColor)
    expect([r, g, b]).toEqual([1, 1, 1])
    expect(a).toBeCloseTo(0.48, 1)
    expect(rgba(style.borderTopColor)[3]).toBeCloseTo(0.12, 1)
    // 两道 inset 亮边在前，浮起投影在后
    expect(style.boxShadow.match(/inset/g)).toHaveLength(2)
    // 面内不加顶光：Action Control 的顶光渐变落成透明
    expect(style.backgroundImage).toContain('rgba(0, 0, 0, 0)')
  })

  it('深色主题下是 neutral 900 的 61% 面', async () => {
    const trigger = await mountTrigger({ 'data-material': 'liquid', 'data-theme': 'dark' })
    expect(rgba(getComputedStyle(trigger).backgroundColor)[3]).toBeCloseTo(0.61, 1)
  })

  it('通透档与墨色域：下层均匀时换成通透档，色调随墨色域走，与页面主题无关', async () => {
    const trigger = await mountTrigger({ 'data-material': 'liquid', 'data-theme': 'dark' })
    // 液态面按下层写的两样东西：浅色调（黑墨域）+ 通透档
    trigger.setAttribute('data-xh-ink', 'dark')
    trigger.setAttribute('data-xh-liquid-clarity', 'clear')
    const [r, g, b, a] = rgba(getComputedStyle(trigger).backgroundColor)
    expect([r, g, b]).toEqual([1, 1, 1])
    expect(a).toBeCloseTo(0.24, 1)
    expect(rgba(getComputedStyle(trigger).color)).toEqual([0, 0, 0, 1])
  })

  it('减弱透明下是实体面、没有背景滤镜，亮边与细线保留', async () => {
    const trigger = await mountTrigger({ 'data-material': 'liquid', 'data-transparency': 'reduce' })
    const style = getComputedStyle(trigger)
    expect(style.backdropFilter).toBe('none')
    expect(rgba(style.backgroundColor)[3]).toBe(1)
    expect(style.boxShadow.match(/inset/g)).toHaveLength(2)
  })

  it('光源方向决定亮边落在哪一侧：写入的单位向量直接进入内阴影偏移', async () => {
    const trigger = await mountTrigger({ 'data-material': 'liquid' })
    const before = getComputedStyle(trigger).boxShadow
    trigger.style.setProperty('--xh-_liquid-light-x', '0.71')
    trigger.style.setProperty('--xh-_liquid-light-y', '0.71')
    expect(getComputedStyle(trigger).boxShadow).not.toBe(before)
  })
})
