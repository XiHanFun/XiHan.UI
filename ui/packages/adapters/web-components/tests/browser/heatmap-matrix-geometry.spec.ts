// 矩阵格子的两个方向必须各有各的尺寸来源。
//
// 栽过一次：皮肤只给了 inline-size，block-size 仍沿用日历那档 cell-size（给「一天一个小方块」
// 定的，md 约 10px），而行高由行名那行字（12px）定死，格子在行里被摊成 44×10 的细条。
// 33 道门禁、四个包的单测、一致性与逐帧比对全绿——因为没有任何一处断言碰过「解析后的尺寸」。
// jsdom 不做布局，这条只有真实浏览器量得出来。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

interface Cell {
  inline: number
  block: number
  labelInline: number
}

/** 铺一个最小的矩阵：一行表头加一行数据，量首个数据格与它头顶那个列名。 */
function probe(size: string | null, vars: Record<string, string> = {}): Cell {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="heatmap" data-part="root" data-variant="matrix"${size ? ` data-size="${size}"` : ''}>
      <div data-scope="heatmap" data-part="grid">
        <div data-scope="heatmap" data-part="row">
          <span data-scope="heatmap" data-part="row-label"></span>
          <span data-scope="heatmap" data-part="column-label">09:00</span>
        </div>
        <div data-scope="heatmap" data-part="row">
          <span data-scope="heatmap" data-part="row-label">周一</span>
          <div data-scope="heatmap" data-part="cell" data-level="0"></div>
        </div>
      </div>
    </div>
  `
  document.body.append(host)
  const root = host.firstElementChild as HTMLElement
  for (const [key, value] of Object.entries(vars))
    root.style.setProperty(key, value)
  const cell = root.querySelector<HTMLElement>('[data-part="cell"]')!
  const label = root.querySelector<HTMLElement>('[data-part="column-label"]')!
  return {
    inline: cell.getBoundingClientRect().width,
    block: cell.getBoundingClientRect().height,
    labelInline: label.getBoundingClientRect().width,
  }
}

describe('矩阵格子的几何', () => {
  it('作者一个令牌都不给时是正方，不是被行名压出来的细条', () => {
    const cell = probe(null)
    expect(cell.block).toBeGreaterThan(0)
    // 允许亚像素误差，但不允许一个方向塌掉
    expect(Math.abs(cell.inline - cell.block)).toBeLessThan(1)
  })

  it('块向尺寸不随行名的字高走：字调大，格子不跟着变形', () => {
    const base = probe(null)
    const bigger = probe(null, { '--xh-heatmap-font-size': '24px' })
    expect(bigger.block).toBeCloseTo(base.block, 1)
  })

  it('三档尺寸的格子都保持正方，且逐档变大', () => {
    const sm = probe('sm')
    const md = probe(null)
    const lg = probe('lg')
    for (const cell of [sm, md, lg])
      expect(Math.abs(cell.inline - cell.block)).toBeLessThan(1)
    expect(sm.block).toBeLessThan(md.block)
    expect(md.block).toBeLessThan(lg.block)
  })

  it('两个方向各自可调：只调列宽不会把行高一起拽走', () => {
    const base = probe(null)
    const wide = probe(null, { '--xh-heatmap-column-w': '80px' })
    expect(wide.inline).toBeCloseTo(80, 0)
    expect(wide.block).toBeCloseTo(base.block, 1)
  })

  it('只调行高不会把列宽一起拽走', () => {
    const base = probe(null, { '--xh-heatmap-column-w': '80px' })
    const tall = probe(null, { '--xh-heatmap-column-w': '80px', '--xh-heatmap-row-h': '40px' })
    expect(tall.block).toBeCloseTo(40, 0)
    expect(tall.inline).toBeCloseTo(base.inline, 1)
  })

  it('列名与它那一列的格子同宽，调宽之后仍然同宽', () => {
    for (const vars of [{}, { '--xh-heatmap-column-w': '80px' }]) {
      const cell = probe(null, vars)
      expect(Math.abs(cell.labelInline - cell.inline)).toBeLessThan(1)
    }
  })
})
