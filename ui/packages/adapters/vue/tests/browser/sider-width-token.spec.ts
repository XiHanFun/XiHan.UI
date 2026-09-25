// 侧栏宽度只有一处真源：--xh-sider-w（展开）与 --xh-sider-collapsed-w（折叠）。
// 改这两支令牌，页面上所有侧栏一起变宽变窄，不必逐个组件改槽。
//
// 宽度过渡挂在侧栏上：先挂上再改令牌会读到过渡中途的宽度，所以令牌在挂进文档之前就写好。
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(tokens: Record<string, string> = {}) {
  host = document.createElement('div')
  for (const [name, value] of Object.entries(tokens))
    host.style.setProperty(name, value)
  host.innerHTML = `
    <div data-scope="layout" data-part="root">
      <aside data-scope="layout" data-part="sider" data-sider="expanded"></aside>
      <main data-scope="layout" data-part="content"></main>
    </div>
    <div data-scope="layout" data-part="root">
      <aside data-scope="layout" data-part="sider" data-collapsed data-sider="collapsed"></aside>
      <main data-scope="layout" data-part="content"></main>
    </div>`
  document.body.append(host)
  const width = (selector: string) => host!.querySelector<HTMLElement>(selector)!.getBoundingClientRect().width
  return {
    layoutExpanded: width('[data-sider="expanded"]'),
    layoutCollapsed: width('[data-sider="collapsed"]'),
  }
}

/** 根字号下 n rem 合多少像素。 */
function rem(n: number): number {
  return n * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
}

describe('侧栏宽度令牌', () => {
  it('缺省展开 15rem、折叠 4rem', () => {
    const widths = mount()
    expect(widths.layoutExpanded).toBe(rem(15))
    expect(widths.layoutCollapsed).toBe(rem(4))
  })

  it('改令牌，Layout 侧栏跟着变', () => {
    const widths = mount({ '--xh-sider-w': '18rem', '--xh-sider-collapsed-w': '3.5rem' })
    expect(widths.layoutExpanded).toBe(rem(18))
    expect(widths.layoutCollapsed).toBe(rem(3.5))
  })

  it('组件槽仍压过令牌', () => {
    const widths = mount({ '--xh-sider-w': '18rem', '--xh-layout-sider-w': '12rem' })
    expect(widths.layoutExpanded).toBe(rem(12))
  })
})
