// Layout 的侧栏里装着 SideNav 时，侧栏内衬缺省归零。
// Web Components 在侧栏与导航根之间隔着 <xh-side-nav> 宿主，导航根不是侧栏的直接子节点，这里单独核一遍。
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<Updatable>('xh-layout, xh-side-nav'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

afterEach(() => {
  document.body.innerHTML = ''
})

async function mount(withNav: boolean) {
  const nav = withNav
    ? `<xh-side-nav><nav data-xh-part="root"><ul data-xh-part="list"><li data-xh-part="item">
         <a data-xh-part="link" value="home"><span data-xh-part="link-text">工作台</span></a>
       </li></ul></nav></xh-side-nav>`
    : '侧栏'
  document.body.innerHTML = `<xh-layout style="display: contents">
    <div data-xh-part="root">
      <div data-xh-part="sider">${nav}</div>
      <div data-xh-part="content">内容</div>
    </div>
  </xh-layout>`
  await settle()
  return {
    sider: document.querySelector<HTMLElement>(`[data-scope='layout'][data-part='sider']`)!,
    root: document.querySelector<HTMLElement>(`[data-scope='side-nav'][data-part='root']`),
  }
}

describe('wc layout 侧栏里的 SideNav', () => {
  it('没有 SideNav 时侧栏照旧留内衬', async () => {
    const { sider } = await mount(false)
    expect(getComputedStyle(sider).paddingInlineStart).not.toBe('0px')
  })

  it('隔着 <xh-side-nav> 宿主也认得出来：内衬归零，导航与侧栏同宽', async () => {
    const { sider, root } = await mount(true)
    expect(root!.parentElement!.localName).toBe('xh-side-nav')
    expect(getComputedStyle(sider).paddingInlineStart).toBe('0px')
    expect(getComputedStyle(sider).paddingBlockStart).toBe('0px')
    const siderBox = sider.getBoundingClientRect()
    const navBox = root!.getBoundingClientRect()
    expect(navBox.width).toBe(siderBox.width)
    expect(navBox.right).toBe(siderBox.right)
  })
})
