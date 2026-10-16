// 表尾吸底：root 自己滚动时，stickyFooter 把表尾钉在 root 的下沿，滚过的行从它底下经过；两行表尾一起钉住，行号按 level 接在数据行之后。
import type { CSSProperties } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhTableBody, XhTableCell, XhTableColumnHeader, XhTableColumnLabel, XhTableFooter, XhTableHeader, XhTableRoot, XhTableRow } from '../../src'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let unmount: (() => void) | null = null
let host: HTMLElement | null = null

afterEach(() => {
  unmount?.()
  host?.remove()
  unmount = null
  host = null
})

const ROWS = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}` }))

async function mount(stickyFooter: boolean): Promise<{ root: HTMLElement, footer: HTMLElement }> {
  host = document.createElement('div')
  host.style.inlineSize = '360px'
  document.body.append(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      <XhTableRoot columns={[{ id: 'name', label: '名称' }]} rows={ROWS} footerRows={2} stickyFooter={stickyFooter} style={{ '--xh-table-max-h': '240px' } as CSSProperties}>
        <XhTableHeader>
          <XhTableRow>
            <XhTableColumnHeader value="name"><XhTableColumnLabel>名称</XhTableColumnLabel></XhTableColumnHeader>
          </XhTableRow>
        </XhTableHeader>
        <XhTableBody>
          {ROWS.map((row, i) => <XhTableRow key={row.id} value={row.id}><XhTableCell value="name">{`第 ${i + 1} 行`}</XhTableCell></XhTableRow>)}
        </XhTableBody>
        <XhTableFooter>
          <XhTableRow level={1}><XhTableCell value="name">小计</XhTableCell></XhTableRow>
          <XhTableRow level={2}><XhTableCell value="name">合计</XhTableCell></XhTableRow>
        </XhTableFooter>
      </XhTableRoot>,
    )
  })
  unmount = () => act(() => root.unmount())
  for (let i = 0; i < 3; i++)
    await act(() => new Promise(resolve => requestAnimationFrame(resolve)))
  return {
    root: host.querySelector<HTMLElement>('[data-scope="table"][data-part="root"]')!,
    footer: host.querySelector<HTMLElement>('[data-scope="table"][data-part="footer"]')!,
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

describe('表格表尾吸底（React）', () => {
  it('stickyFooter：滚到顶时表尾已贴在 root 下沿，两行表尾的行号接在数据行之后', async () => {
    const { root, footer } = await mount(true)
    expect(root.scrollHeight).toBeGreaterThan(root.clientHeight)
    root.scrollTop = 0
    const rootBox = root.getBoundingClientRect()
    expect(Math.abs(footer.getBoundingClientRect().bottom - (rootBox.top + root.clientTop + root.clientHeight))).toBeLessThan(1.5)
    expect(getComputedStyle(footer).position).toBe('sticky')
    expect([...footer.querySelectorAll('[data-part="row"]')].map(row => row.getAttribute('aria-rowindex'))).toEqual(['32', '33'])
    expect(root.getAttribute('aria-rowcount')).toBe('33')
  })

  it('吸底的表尾底色是实色：滚过的行不会从底下透出来', async () => {
    const { footer } = await mount(true)
    expect(alphaOf(getComputedStyle(footer).backgroundColor)).toBe(1)
  })

  it('不写 stickyFooter：表尾跟着内容走，滚到顶时在可视区之外', async () => {
    const { root, footer } = await mount(false)
    root.scrollTop = 0
    expect(footer.getBoundingClientRect().top).toBeGreaterThan(root.getBoundingClientRect().bottom)
  })
})
