// 表尾吸底：root 自己滚动时，sticky-footer 把表尾钉在 root 的下沿，滚过的行从它底下经过；两行表尾一起钉住。
import type { XhTableElement } from '../../src/elements/table'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

afterEach(() => {
  document.body.querySelectorAll('[data-test="table-sticky-footer"]').forEach(node => node.remove())
})

async function mount(attrs: string): Promise<{ table: XhTableElement, root: HTMLElement, footer: HTMLElement }> {
  const stage = document.createElement('div')
  stage.dataset.test = 'table-sticky-footer'
  stage.style.inlineSize = '360px'
  const rows = Array.from({ length: 30 }, (_, i) => `
    <div data-xh-part="row" value="r${i}"><div data-xh-part="cell" value="name">第 ${i + 1} 行</div></div>`).join('')
  stage.innerHTML = `
    <xh-table footer-rows="2"${attrs}>
      <div data-xh-part="root" style="--xh-table-max-h: 240px">
        <div data-xh-part="header">
          <div data-xh-part="row"><div data-xh-part="column-header" value="name"><span data-xh-part="column-label">名称</span></div></div>
        </div>
        <div data-xh-part="body">${rows}</div>
        <div data-xh-part="footer">
          <div data-xh-part="row" level="1"><div data-xh-part="cell" value="name">小计</div></div>
          <div data-xh-part="row" level="2"><div data-xh-part="cell" value="name">合计</div></div>
        </div>
      </div>
    </xh-table>
  `
  document.body.append(stage)
  const table = stage.querySelector<XhTableElement>('xh-table')!
  table.columns = [{ id: 'name', label: '名称' }]
  table.rows = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}` }))
  await table.updateComplete
  await table.updateComplete
  return {
    table,
    root: stage.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!,
    footer: stage.querySelector<HTMLElement>('[data-scope="table"][data-part="footer"]')!,
  }
}

/** 计算出的颜色的不透明度：rgb() / rgba() 与 color(srgb … / a) 两种写法都认。 */
function alphaOf(color: string): number {
  const slash = /\/\s*([\d.]+%?)\s*\)$/.exec(color)
  if (slash)
    return slash[1]!.endsWith('%') ? Number.parseFloat(slash[1]!) / 100 : Number(slash[1])
  const rgba = /^rgba\(([^)]+)\)$/.exec(color)
  if (rgba)
    return Number(rgba[1]!.split(',')[3])
  return /^(?:rgb|color)\(/.test(color) ? 1 : Number.NaN
}

describe('表格表尾吸底（Web Components）', () => {
  it('sticky-footer：滚到顶时表尾已贴在 root 下沿，两行表尾的行号接在数据行之后', async () => {
    const { root, footer } = await mount(' sticky-footer')
    expect(root.scrollHeight).toBeGreaterThan(root.clientHeight)
    root.scrollTop = 0
    const rootBox = root.getBoundingClientRect()
    const footerBox = footer.getBoundingClientRect()
    expect(Math.abs(footerBox.bottom - (rootBox.top + root.clientTop + root.clientHeight))).toBeLessThan(1.5)
    expect(getComputedStyle(footer).position).toBe('sticky')
    const rows = footer.querySelectorAll('[data-part="row"]')
    expect([...rows].map(row => row.getAttribute('aria-rowindex'))).toEqual(['32', '33'])
    expect(root.getAttribute('aria-rowcount')).toBe('33')
  })

  it('吸底的表尾底色是实色：滚过的行不会从底下透出来', async () => {
    const { footer } = await mount(' sticky-footer')
    expect(alphaOf(getComputedStyle(footer).backgroundColor)).toBe(1)
  })

  it('不写 sticky-footer：表尾跟着内容走，滚到顶时在可视区之外', async () => {
    const { root, footer } = await mount('')
    root.scrollTop = 0
    expect(footer.getBoundingClientRect().top).toBeGreaterThan(root.getBoundingClientRect().bottom)
  })
})
