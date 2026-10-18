import { afterEach, describe, expect, it } from 'vitest'
import { rasterizeSvg, serializeSvg, standaloneSvg } from '../../src/svg-export'

const SVG_NS = 'http://www.w3.org/2000/svg'

afterEach(() => {
  document.head.querySelectorAll('style[data-test]').forEach(style => style.remove())
  document.body.replaceChildren()
})

function sheet(css: string): void {
  const style = document.createElement('style')
  style.dataset.test = ''
  style.textContent = css
  document.head.append(style)
}

function svgFrom(markup: string): SVGSVGElement {
  const host = document.createElement('div')
  host.innerHTML = markup
  document.body.append(host)
  return host.querySelector('svg')!
}

/** PNG 解码后某一点的颜色。 */
async function pixel(blob: Blob, x: number, y: number): Promise<{ size: [number, number], rgba: number[] }> {
  const bitmap = await createImageBitmap(blob)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')!
  context.drawImage(bitmap, 0, 0)
  return { size: [bitmap.width, bitmap.height], rgba: Array.from(context.getImageData(x, y, 1, 1).data) }
}

describe('standaloneSvg（Chromium）', () => {
  it('白名单里的表现属性按算出的值写成属性，class、style、data-* 与事件属性去掉，隐藏与排除的元素不进克隆', () => {
    sheet(`
      .chart { --line: rgb(255, 0, 0); color: rgb(0, 0, 255); font: 600 14px serif; }
      .chart .line { stroke: var(--line); stroke-width: 3px; stroke-dasharray: 4 2; fill: none; }
      .chart .label { fill: currentColor; }
      .chart .gone { display: none; }
    `)
    const source = svgFrom(`<svg class="chart" width="40" height="20" viewBox="0 0 40 20">
      <path class="line" data-part="line" d="M0 10H40" onclick="void 0" style="stroke-miterlimit: 7"></path>
      <text class="label" x="2" y="12" style="letter-spacing: 1px; font-style: italic">审批</text>
      <rect class="gone" width="4" height="4"></rect>
      <rect data-hit="" width="40" height="20" fill="transparent"></rect>
      <defs><clipPath id="clip"><rect width="10" height="10"></rect></clipPath></defs>
    </svg>`)

    const copy = standaloneSvg(source, { include: element => !element.hasAttribute('data-hit') })
    expect(copy.isConnected).toBe(false)
    expect(copy.getAttribute('xmlns')).toBe(SVG_NS)
    expect([copy.getAttribute('width'), copy.getAttribute('viewBox'), copy.hasAttribute('class')]).toEqual(['40', '0 0 40 20', false])
    const line = copy.querySelector('path')!
    expect([line.getAttribute('stroke'), line.getAttribute('stroke-width'), line.getAttribute('stroke-dasharray'), line.getAttribute('fill')])
      .toEqual(['rgb(255, 0, 0)', '3px', '4px, 2px', 'none'])
    expect(['data-part', 'class', 'onclick', 'style', 'stroke-miterlimit'].filter(name => line.hasAttribute(name))).toEqual([])
    const text = copy.querySelector('text')!
    expect([text.textContent, text.getAttribute('fill'), text.getAttribute('font-size'), text.getAttribute('font-weight'), text.getAttribute('font-style')])
      .toEqual(['审批', 'rgb(0, 0, 255)', '14px', '600', 'italic'])
    expect(text.hasAttribute('style') || text.hasAttribute('letter-spacing')).toBe(false)
    expect(copy.querySelectorAll('rect')).toHaveLength(1)
    expect(copy.querySelector('clipPath')!.id).toBe('clip')
  })

  it('遇到 foreignObject 抛 TypeError，不悄悄丢掉', () => {
    const source = svgFrom('<svg width="10" height="10"><foreignObject width="10" height="10"><div>x</div></foreignObject></svg>')
    expect(() => standaloneSvg(source)).toThrow(TypeError)
  })

  it('序列化出的文本单独载入后画法不变：线是令牌算出的颜色', async () => {
    sheet('.chart { --line: rgb(255, 0, 0); } .chart rect { fill: var(--line); }')
    const source = svgFrom('<svg class="chart" width="10" height="10"><rect width="10" height="10"></rect></svg>')
    const text = serializeSvg(standaloneSvg(source))
    expect(text.startsWith('<svg')).toBe(true)
    expect(text).toContain(`xmlns="${SVG_NS}"`)
    expect(text).not.toContain('class=')
    const blob = await rasterizeSvg(text)
    expect((await pixel(blob, 5, 5)).rgba).toEqual([255, 0, 0, 255])
  })
})

describe('rasterizeSvg（Chromium）', () => {
  it('按倍率出 PNG，先铺底色再画 SVG', async () => {
    const svg = svgFrom(`<svg xmlns="${SVG_NS}" width="20" height="10"><rect width="10" height="10" fill="rgb(0, 0, 255)"></rect></svg>`)
    const blob = await rasterizeSvg(svg, { scale: 2, background: 'rgb(0, 255, 0)' })
    expect(blob.type).toBe('image/png')
    const left = await pixel(blob, 5, 5)
    expect(left.size).toEqual([40, 20])
    expect(left.rgba).toEqual([0, 0, 255, 255])
    expect((await pixel(blob, 30, 10)).rgba).toEqual([0, 255, 0, 255])
  })

  it('不给底色时空白处透明；宽高缺省先取 viewBox，也可以显式给', async () => {
    const svg = svgFrom(`<svg xmlns="${SVG_NS}" width="16" height="8" viewBox="0 0 8 4"><rect width="4" height="4" fill="rgb(255, 0, 0)"></rect></svg>`)
    const blob = await rasterizeSvg(svg)
    const right = await pixel(blob, 6, 2)
    expect(right.size).toEqual([8, 4])
    expect(right.rgba[3]).toBe(0)
    expect((await pixel(await rasterizeSvg(svg, { width: 16, height: 8 }), 1, 1)).size).toEqual([16, 8])
  })

  it('宽高算不出或倍率不是正数时以 RangeError 拒绝', async () => {
    const svg = svgFrom(`<svg xmlns="${SVG_NS}"><rect width="4" height="4"></rect></svg>`)
    await expect(rasterizeSvg(svg)).rejects.toBeInstanceOf(RangeError)
    await expect(rasterizeSvg(svg, { width: 4, height: 4, scale: 0 })).rejects.toBeInstanceOf(RangeError)
  })

  it('超过浏览器画布上限时缺省以 RangeError 拒绝；oversize 写 shrink 时降倍率按比例缩小，不出空白图', async () => {
    const svg = svgFrom(`<svg xmlns="${SVG_NS}" viewBox="0 0 40000 10"><rect width="40000" height="10" fill="rgb(255, 0, 0)"></rect></svg>`)
    await expect(rasterizeSvg(svg)).rejects.toBeInstanceOf(RangeError)
    const shrunk = await pixel(await rasterizeSvg(svg, { oversize: 'shrink' }), 100, 4)
    expect(shrunk.size).toEqual([32767, 8])
    expect(shrunk.rgba).toEqual([255, 0, 0, 255])
  })

  it('带 foreignObject 的 SVG 以 TypeError 拒绝', async () => {
    const text = `<svg xmlns="${SVG_NS}" width="10" height="10"><foreignObject width="10" height="10"></foreignObject></svg>`
    await expect(rasterizeSvg(text)).rejects.toBeInstanceOf(TypeError)
  })
})
