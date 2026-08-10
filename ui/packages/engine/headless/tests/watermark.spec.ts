import type { WatermarkApi, WatermarkProps } from '../src/watermark'
import { normalizeProps } from '@xihan-ui/kernel'
import { describe, expect, it } from 'vitest'
// 直接从组件目录导入，不经包主入口
import { connectWatermark } from '../src/watermark'

const IMAGE_PREFIX = 'data:image/svg+xml,'

function api(props: WatermarkProps = {}): WatermarkApi {
  return connectWatermark(props, normalizeProps)
}

/** 图样那张 SVG 的原文。 */
function svg(props: WatermarkProps): string {
  const { image } = api(props)
  expect(image.startsWith(IMAGE_PREFIX)).toBe(true)
  return decodeURIComponent(image.slice(IMAGE_PREFIX.length))
}

/** 根上那条内联 style。 */
function style(props: WatermarkProps): string {
  return String((api(props).getRootProps() as Record<string, unknown>).style ?? '')
}

/** 图样里铺了几行字。 */
function lineCount(text: string): number {
  return text.split('<text').length - 1
}

describe('watermark 的图样', () => {
  it('是一张自带尺寸与 viewBox 的 SVG，不是位图', () => {
    const doc = svg({ text: '曦寒' })
    expect(doc).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="\d+" height="\d+" viewBox="0 0 \d+ \d+">/)
    expect(doc.endsWith('</svg>')).toBe(true)
  })

  it('同一份 props 每次算出逐字相同的一张图', () => {
    const props: WatermarkProps = { text: ['甲', '乙'], rotate: -30, gap: 18, fontSize: 15, opacity: 0.2 }
    expect(api(props).image).toBe(api(props).image)
  })

  it('步距随文字与字号一起长，且与 SVG 自报的尺寸一致', () => {
    const one = api({ text: '曦寒前端组件库' })
    const two = api({ text: ['曦寒前端组件库', '仅供内部评审'] })
    expect(two.tile.height).toBeGreaterThan(one.tile.height)
    expect(svg({ text: '曦寒前端组件库' })).toContain(`width="${one.tile.width}" height="${one.tile.height}"`)

    const big = api({ text: '曦寒前端组件库', fontSize: 28 })
    expect(big.tile.width).toBeGreaterThan(one.tile.width)
  })

  it('没有可印的文字时不算图样：空串、纯空白、空数组都落 empty', () => {
    for (const text of [undefined, '', '   ', '\n\n', [], ['', '  ']] as (string | string[] | undefined)[]) {
      const current = api({ text })
      expect(current.state).toBe('empty')
      expect(current.image).toBe('')
      expect(current.tile).toEqual({ width: 0, height: 0 })
      expect((current.getRootProps() as Record<string, unknown>).style).toBeUndefined()
    }
  })

  it('多行：数组按行铺开，字符串里的换行同样断行，空白行不占位', () => {
    expect(api({ text: ['甲', '乙', '丙'] }).lines).toEqual(['甲', '乙', '丙'])
    expect(api({ text: '甲\n乙' }).lines).toEqual(['甲', '乙'])
    expect(api({ text: ['甲', '   ', '乙'] }).lines).toEqual(['甲', '乙'])
    expect(lineCount(svg({ text: ['甲', '乙', '丙'] }))).toBe(3)
  })
})

// 文字是作者给的，可能原样来自用户输入。图样是一段现拼的标记再拼进一条 CSS 声明，
// 两处收口都必须由本连接层自己兜住：下面这些用例照着"想从哪儿钻出去"写，
// 不照实现里的转义表写——转义表改了、这些用例仍然成立才算数。
describe('watermark 文字的收口', () => {
  const ATTACKS = [
    '<script>alert(1)</script>',
    '</text></g></svg><script>alert(1)</script>',
    '"><image href="x" onerror="alert(1)"/>',
    '&lt;已经转义过的&gt;',
    'a & b < c > d',
    '单引号 \' 与双引号 "',
    '"); background: url(evil); --x: "',
  ]

  it.each(ATTACKS)('%s：出不了自己那对 <text> 标签', (text) => {
    const doc = svg({ text })
    // 除了本连接层自己生成的那几个标签，图样里不该多出任何一个标记
    const tags = [...doc.matchAll(/<\/?([a-z]+)/gi)].map(m => m[1]!.toLowerCase())
    expect(new Set(tags)).toEqual(new Set(['svg', 'g', 'text']))
    expect(lineCount(doc)).toBe(1)
  })

  it.each(ATTACKS)('%s：编码后的 data URI 里不剩能提前收尾一条 CSS 声明的字符', (text) => {
    const uri = api({ text }).image.slice(IMAGE_PREFIX.length)
    // 先摘掉所有百分号转义序列，剩下的才是真正原样留在串里的字符
    expect(uri.replace(/%[0-9a-f]{2}/gi, '')).not.toMatch(/[;"#%<>]/)
  })

  it.each(ATTACKS)('%s：整条内联 style 仍然只有图样与步距两条声明', (text) => {
    const declarations = style({ text })
      .split(';')
      .map(d => d.trim())
      .filter(Boolean)
    expect(declarations).toHaveLength(2)
    expect(declarations[0]!.startsWith('--xh-watermark-image: url("')).toBe(true)
    expect(declarations[1]).toMatch(/^--xh-watermark-tile: \d+px \d+px$/)
  })

  it('原文能从图样里原样取回来，转义没有吞字也没有多字', () => {
    for (const text of ATTACKS) {
      const inner = /<text[^>]*>([\s\S]*?)<\/text>/.exec(svg({ text }))?.[1] ?? ''
      const restored = inner
        .replaceAll('&lt;', '<')
        .replaceAll('&gt;', '>')
        .replaceAll('&quot;', '"')
        .replaceAll('&apos;', '\'')
        .replaceAll('&amp;', '&')
      expect(restored).toBe(text)
    }
  })
})

describe('watermark 的数值', () => {
  it('非数字与非有限值退回缺省', () => {
    const fallback = api({ text: '曦寒' }).image
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, undefined]) {
      expect(api({ text: '曦寒', rotate: bad, gap: bad, fontSize: bad, opacity: bad }).image).toBe(fallback)
    }
  })

  it('深浅夹在 0 与 1 之间', () => {
    expect(svg({ text: '曦寒', opacity: 5 })).toContain('fill-opacity="1"')
    expect(svg({ text: '曦寒', opacity: -3 })).toContain('fill-opacity="0"')
  })

  it('角度收进一圈之内，转 400 度与转 40 度是同一张图', () => {
    expect(api({ text: '曦寒', rotate: 400 }).image).toBe(api({ text: '曦寒', rotate: 40 }).image)
    expect(svg({ text: '曦寒', rotate: 1e21 })).not.toMatch(/rotate\([^)]*e[+-]/i)
  })

  it('字号不为零也不为负：图样不会塌成一条线', () => {
    expect(api({ text: '曦寒', fontSize: 0 }).tile.height).toBeGreaterThan(0)
    expect(api({ text: '曦寒', fontSize: -20 }).tile.height).toBeGreaterThan(0)
  })

  it('空白只加宽步距，不进图样的标记', () => {
    const tight = api({ text: '曦寒', gap: 0 })
    const loose = api({ text: '曦寒', gap: 60 })
    expect(loose.tile.width - tight.tile.width).toBe(60)
    expect(loose.tile.height - tight.tile.height).toBe(60)
  })
})
