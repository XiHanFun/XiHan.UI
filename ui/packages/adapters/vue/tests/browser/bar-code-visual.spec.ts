// 条形码的真实几何：条的落位、人读数字是否真的坐在自己那格下面、字体与整体尺寸，都得在 Chromium 里量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhBarCode } from '../../src'
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

async function mount(props: Record<string, unknown>): Promise<SVGSVGElement> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({ render: () => h(XhBarCode, props) })
  app.mount(host)
  await nextTick()
  return host.querySelector('[data-scope="bar-code"][data-part="root"]') as SVGSVGElement
}

function bbox(el: Element): DOMRect {
  return (el as SVGGraphicsElement).getBBox()
}

describe('bar-code 真实几何', () => {
  it('根按 viewBox 的像素尺寸落地，条那条 path 从静区起点起、到静区终点止', async () => {
    const root = await mount({ format: 'ean13', value: '4006381333931', barWidth: 2, height: 50 })
    const rect = root.getBoundingClientRect()
    // (95 + 22) × 2 宽，50 + 20 高
    expect(rect.width).toBe(234)
    expect(rect.height).toBe(70)
    const bars = root.querySelector('[data-xh-geom="bars"]')!
    const box = bbox(bars)
    expect(box.x).toBe(22)
    expect(box.x + box.width).toBe(22 + 190)
    expect(box.y).toBe(0)
    // 守卫条延长 5X，整条 path 的高就是 50 + 10
    expect(box.height).toBe(60)
  })

  it('eAN-13 每位数字真的坐在自己那 7 格的正下方，且不压到条', async () => {
    const root = await mount({ format: 'ean13', value: '4006381333931', barWidth: 3, height: 60 })
    const texts = Array.from(root.querySelectorAll('[data-xh-geom="text"]'))
    expect(texts).toHaveLength(13)
    const margin = 11 * 3
    // 首位在左静区里、右缘贴着守卫条左侧一格
    const first = bbox(texts[0]!)
    expect(first.x + first.width).toBeLessThanOrEqual(margin - 3 + 0.5)
    expect(first.x).toBeGreaterThanOrEqual(0)
    // 左半六位：第 i 位的格子是 [3 + 7i, 10 + 7i) 模块
    for (let i = 0; i < 6; i++) {
      const box = bbox(texts[1 + i]!)
      const cellLeft = margin + (3 + 7 * i) * 3
      const cellRight = cellLeft + 21
      const center = box.x + box.width / 2
      expect(Math.abs(center - (cellLeft + cellRight) / 2)).toBeLessThan(1)
      expect(box.width).toBeLessThan(21)
      // 数字在条底之下、且起于守卫条延长段（60..75）之内：数字与延长段并排，不是挂在它下面
      expect(box.y).toBeGreaterThan(60)
      expect(box.y).toBeLessThan(75)
    }
    // 右半六位同理，格子从 50 模块起
    for (let i = 0; i < 6; i++) {
      const box = bbox(texts[7 + i]!)
      const cellLeft = margin + (50 + 7 * i) * 3
      const center = box.x + box.width / 2
      expect(Math.abs(center - (cellLeft + 10.5))).toBeLessThan(1)
    }
  })

  it('人读文字走等宽字体、跟着条色；字号是 8X', async () => {
    const root = await mount({ value: 'XH-001', barWidth: 2 })
    const text = root.querySelector('[data-xh-geom="text"]')!
    const style = getComputedStyle(text)
    expect(style.fontFamily).toMatch(/monospace|Menlo|Consolas|SFMono/i)
    expect(style.fontSize).toBe('16px')
    expect(style.fill).toBe(getComputedStyle(root).color)
    // 文字整体落在静区与条宽之内
    const box = bbox(text)
    expect(box.x).toBeGreaterThan(0)
    expect(box.x + box.width).toBeLessThan(root.getBoundingClientRect().width)
  })

  it('关掉 text 后根矮下来，DOM 里一个 <text> 都没有', async () => {
    const withText = await mount({ value: 'XH-001' })
    const tall = withText.getBoundingClientRect().height
    app?.unmount()
    host?.remove()
    const without = await mount({ value: 'XH-001', text: false })
    expect(without.querySelectorAll('[data-xh-geom="text"]')).toHaveLength(0)
    expect(without.getBoundingClientRect().height).toBe(tall - 20)
  })

  it('itf14 的承载条通宽压在条的上下两端', async () => {
    const root = await mount({ format: 'itf14', value: '15400141288763', barWidth: 2, height: 40 })
    const bars = root.querySelector('[data-xh-geom="bars"]')!
    const box = bbox(bars)
    const width = root.getBoundingClientRect().width
    expect(box.x).toBe(0)
    expect(box.width).toBe(width)
    expect(box.y).toBe(0)
    // 承载 4 + 条 40 + 承载 4
    expect(box.height).toBe(48)
  })

  it('没有内容与内容出错时是一块带描边的占位，尺寸只剩静区与条高', async () => {
    const empty = await mount({ value: '' })
    expect(getComputedStyle(empty).boxShadow).not.toBe('none')
    expect(empty.getBoundingClientRect().width).toBe(40)
    expect(empty.getBoundingClientRect().height).toBe(64)
    app?.unmount()
    host?.remove()
    const broken = await mount({ format: 'ean13', value: '123' })
    expect(broken.getAttribute('data-state')).toBe('error')
    expect(getComputedStyle(broken).boxShadow).not.toBe('none')
    expect(broken.querySelector('[data-xh-geom="bars"]')).toBeNull()
  })
})
