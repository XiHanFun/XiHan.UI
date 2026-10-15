// planWatermark：不经状态机算出平铺图样，颜色、透明度与分轴间距作输入；组件的图样与它逐字相同。
import type { WatermarkPatternOptions, WatermarkProps } from '../src/watermark'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectWatermark, planWatermark, watermarkMachine } from '../src/watermark'

const IMAGE_PREFIX = 'data:image/svg+xml,'
const PNG = 'data:image/png;base64,iVBORw0KGgo='

function svgOf(image: string): string {
  expect(image.startsWith(IMAGE_PREFIX)).toBe(true)
  return decodeURIComponent(image.slice(IMAGE_PREFIX.length))
}

describe('planWatermark', () => {
  it.each<[WatermarkProps]>([
    [{ text: '曦寒' }],
    [{ text: ['机密', 'XiHan UI'], rotate: 30, gap: 40, fontSize: 18, opacity: 0.3, fontFamily: 'PingFang SC, sans-serif' }],
    [{ text: 'a\n\nb', rotate: 400, gap: -5, fontSize: 1000, opacity: 2 }],
    [{ text: '曦寒', image: PNG, imageSize: { width: 32, height: 48 } }],
    [{}],
  ])('组件 %j 的图样与纯函数两轴取同一 gap 的结果逐字相同', (props) => {
    const service = createService(watermarkMachine, { runtime: createVanillaRuntime(), props: () => props })
    const api = connectWatermark(service, normalizeProps)
    const options: WatermarkPatternOptions = { ...props, gapX: props.gap, gapY: props.gap }
    const pattern = planWatermark(options)
    expect({ lines: api.lines, tile: api.tile, image: api.image, state: api.state }).toEqual(pattern)
  })

  it('横向与纵向间距分开计入步距', () => {
    const base = planWatermark({ text: '曦寒', gapX: 0, gapY: 0 })
    const wide = planWatermark({ text: '曦寒', gapX: 50, gapY: 0 })
    const tall = planWatermark({ text: '曦寒', gapX: 0, gapY: 30 })
    expect(wide.tile).toEqual({ width: base.tile.width + 50, height: base.tile.height })
    expect(tall.tile).toEqual({ width: base.tile.width, height: base.tile.height + 30 })
  })

  it('缺省填纯黑作遮罩，给了颜色就按颜色填，透明度写在 fill-opacity 上', () => {
    expect(svgOf(planWatermark({ text: 'x' }).image)).toContain('fill="#000" fill-opacity="0.15"')
    expect(svgOf(planWatermark({ text: 'x', color: '#999999', opacity: 0.4 }).image)).toContain('fill="#999999" fill-opacity="0.4"')
  })

  it('颜色里的引号与尖括号转义，出不了自己的属性', () => {
    const doc = svgOf(planWatermark({ text: 'x', color: '"><script>alert(1)</script>' }).image)
    expect(doc).not.toContain('<script>')
    expect(doc).toContain('fill="&quot;&gt;&lt;script&gt;')
  })

  it('只收内联图片：地址形式与被挡的协议都不进图样', () => {
    expect(planWatermark({ image: PNG }).state).toBe('ready')
    expect(planWatermark({ image: 'https://example.test/a.png' }).state).toBe('empty')
    expect(planWatermark({ image: 'javascript:alert(1)' }).state).toBe('empty')
  })

  it('没有可印的内容时图样为空', () => {
    expect(planWatermark({ text: ['  ', ''] })).toEqual({ lines: [], tile: { width: 0, height: 0 }, image: '', state: 'empty' })
  })
})
