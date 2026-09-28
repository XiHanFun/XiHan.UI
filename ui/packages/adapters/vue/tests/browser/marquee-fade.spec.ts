// 跑马灯两端渐隐：遮罩画在窗口上，两端透明、中段不透明；有暂停开关时行尾那一段淡到开关之前，
// 开关所在那一块整块露出来。减弱动效下轨道停住、窗口改成可滚，两端不再淡。
// 遮罩的实际效果只有真实浏览器画得出来：逐点取窗口上的遮罩透明度要靠计算样式与截图，这里断言计算后的遮罩层。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMarqueeAutoplayTrigger, XhMarqueeContent, XhMarqueeRoot } from '../../src'
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

async function mount(props: Record<string, unknown>, options: { trigger?: boolean, motion?: 'reduce' } = {}): Promise<HTMLElement> {
  host = document.createElement('div')
  if (options.motion)
    host.dataset.motion = options.motion
  host.style.cssText = 'padding: 24px; inline-size: 480px'
  document.body.append(host)
  app = createApp({
    render: () => h(XhMarqueeRoot, props, () => [
      h(XhMarqueeContent, null, () => '曦寒前端组件库'),
      options.trigger ? h(XhMarqueeAutoplayTrigger) : null,
    ]),
  })
  app.mount(host)
  await nextTick()
  return host.querySelector<HTMLElement>('[data-scope="marquee"][data-part="root"]')!
}

function mask(el: HTMLElement): string {
  const style = getComputedStyle(el)
  return style.maskImage || style.webkitMaskImage
}

describe('跑马灯两端渐隐', () => {
  it('不写 fade 不画遮罩', async () => {
    const root = await mount({})
    expect(mask(root)).toBe('none')
  })

  it('写了 fade：沿滚动方向两端透明、中段不透明', async () => {
    const root = await mount({ fade: true })
    const value = mask(root)
    expect(value).toMatch(/^linear-gradient\(to right, rgba\(0, 0, 0, 0\) 0px/)
    expect(value).toContain('rgba(0, 0, 0, 0) 100%')
  })

  it('竖着滚时遮罩沿块轴', async () => {
    const root = await mount({ fade: true, direction: 'up' })
    // to bottom 是渐变的缺省方向，计算值里省略不写
    expect(mask(root)).toMatch(/^linear-gradient\(rgba\(0, 0, 0, 0\) 0px/)
  })

  it('有暂停开关：行尾那段淡到开关之前，第二层遮罩的尺寸与开关所占的宽度一致', async () => {
    const root = await mount({ fade: true }, { trigger: true })
    const trigger = root.querySelector<HTMLElement>('[data-part="autoplay-trigger"]')!
    const style = getComputedStyle(root)
    const size = (style.maskSize || style.webkitMaskSize).split(',').map(s => s.trim())
    const reserve = Number.parseFloat(size[1]!)
    const rootRect = root.getBoundingClientRect()
    const triggerRect = trigger.getBoundingClientRect()
    // 露出的那一块从开关的起始边一直到窗口尽头
    expect(reserve).toBeCloseTo(rootRect.right - triggerRect.left, 0)
  })

  it('减弱动效：轨道停住、窗口可滚，两端不再淡', async () => {
    const root = await mount({ fade: true }, { motion: 'reduce' })
    expect(mask(root)).toBe('none')
  })
})
