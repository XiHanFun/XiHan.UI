// 二维码的真实几何：矩形 Data Matrix 的宽高比、定位图形落在符号边缘、码面占满静区之内，都得在 Chromium 里量。
import type { App } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhMatrixCode } from '../../src'
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
  app = createApp({ render: () => h(XhMatrixCode, props) })
  app.mount(host)
  await nextTick()
  return host.querySelector('[data-scope="matrix-code"][data-part="root"]') as SVGSVGElement
}

function bbox(el: Element): DOMRect {
  return (el as SVGGraphicsElement).getBBox()
}

describe('matrix-code 真实几何', () => {
  it('正方形 Data Matrix：根 160×160，模块那条 path 从静区起、到静区止，L 形定位图形贴着符号左缘与底缘', async () => {
    const root = await mount({ format: 'data-matrix', value: 'Hello, World!' })
    const rect = root.getBoundingClientRect()
    expect(rect.width).toBe(160)
    expect(rect.height).toBe(160)
    expect(root.querySelector('[data-xh-geom="eyes"]')).toBeNull()
    const box = bbox(root.querySelector('[data-xh-geom="modules"]')!)
    const columns = Number(root.getAttribute('data-columns'))
    // 静区 1 格：path 的用户坐标从 1 起、到 columns + 1 止（左列与底行全深，所以四边都贴满）
    expect(box.x).toBe(1)
    expect(box.y).toBe(1)
    expect(box.width).toBe(columns)
    expect(box.height).toBe(columns)
  })

  it('矩形 Data Matrix：宽是 pixelSize，高按含静区的模块比例', async () => {
    const root = await mount({ format: 'data-matrix', value: 'SN-2026-0915-0001', rectangular: true, pixelSize: 240 })
    const rect = root.getBoundingClientRect()
    const columns = Number(root.getAttribute('data-columns'))
    const rows = Number(root.getAttribute('data-rows'))
    expect(columns).toBeGreaterThan(rows)
    expect(rect.width).toBe(240)
    expect(rect.height).toBeCloseTo((240 * (rows + 2)) / (columns + 2), 3)
    const box = bbox(root.querySelector('[data-xh-geom="modules"]')!)
    expect(box.width).toBe(columns)
    expect(box.height).toBe(rows)
  })

  it('码制 PDF417：横长的堆叠条码，宽是 pixelSize、高按含静区的模块比例；条从静区起止', async () => {
    const root = await mount({ format: 'pdf417', value: 'Hello, World!', pixelSize: 320 })
    const rect = root.getBoundingClientRect()
    const columns = Number(root.getAttribute('data-columns'))
    const rows = Number(root.getAttribute('data-rows'))
    expect(columns).toBeGreaterThan(rows)
    expect(rect.width).toBe(320)
    // 布局把分数像素归到 1/64，误差留 0.05
    expect(rect.height).toBeCloseTo((320 * (rows + 4)) / (columns + 4), 1)
    const box = bbox(root.querySelector('[data-xh-geom="modules"]')!)
    // 起始图形第一根条在最左、终止图形最后一根条在最右，两侧静区各 2 格
    expect(box.x).toBe(2)
    expect(box.width).toBe(columns)
    expect(box.height).toBe(rows)
  })

  it('码制 Aztec：不留静区，牛眼贴着正方形根的正中', async () => {
    const root = await mount({ format: 'aztec', value: 'Hello, World!', pixelSize: 190 })
    const rect = root.getBoundingClientRect()
    expect(rect.width).toBe(190)
    expect(rect.height).toBe(190)
    const size = Number(root.getAttribute('data-columns'))
    expect(root.getAttribute('viewBox')).toBe(`0 0 ${size} ${size}`)
    // 正中那一格是牛眼中心：用 SVG 的坐标换算取到那一点，isPointInFill 直接问渲染器
    const path = root.querySelector('[data-xh-geom="modules"]') as SVGGeometryElement
    const point = root.createSVGPoint()
    const center = Math.floor(size / 2) + 0.5
    point.x = center
    point.y = center
    expect(path.isPointInFill(point)).toBe(true)
    point.x = center + 1
    expect(path.isPointInFill(point)).toBe(false)
  })

  it('换成 qr 仍是两条 path、正方形根；两种码制的皮肤底色一致', async () => {
    const dm = await mount({ format: 'data-matrix', value: 'x' })
    const dmBg = getComputedStyle(dm).backgroundColor
    app?.unmount()
    host?.remove()
    const qr = await mount({ format: 'qr', value: 'x' })
    expect(qr.querySelectorAll('path')).toHaveLength(2)
    expect(qr.getBoundingClientRect().width).toBe(qr.getBoundingClientRect().height)
    expect(getComputedStyle(qr).backgroundColor).toBe(dmBg)
  })
})
