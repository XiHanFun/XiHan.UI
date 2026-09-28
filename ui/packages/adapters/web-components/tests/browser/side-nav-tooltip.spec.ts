// Web Components 的图标栏名称提示：作者手写的两个节点接线成 tooltip 的 positioner 与 content，
// 显示期间定位层搬到浮层落点、贴在行尾一侧，文字由元素填成行的标签；收起播完退场即精确归位。
//
// 判据是真实布局与节点去向：jsdom 里没有几何，也跑不出退场动画的结束。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

interface SideNavElement extends HTMLElement {
  updateComplete: Promise<unknown>
  collection: Array<{ value: string, label: string, href: string }>
}

let nav: SideNavElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  document.body.innerHTML = ''
  document.getElementById('xh-portal-root')?.remove()
  nav = null
  setDiagnosticsLevel('warn')
})

async function settle(): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await nav?.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(): Promise<void> {
  document.body.insertAdjacentHTML('beforeend', `<xh-side-nav collapsed style="margin-inline-start: 200px">
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item"><a data-xh-part="link" value="home"><span aria-hidden="true">◆</span><span data-xh-part="link-text">工作台</span></a></li>
        <li data-xh-part="item"><a data-xh-part="link" value="logs"><span aria-hidden="true">◆</span><span data-xh-part="link-text">操作日志</span></a></li>
      </ul>
      <div data-xh-part="tooltip-positioner"><div data-xh-part="tooltip"></div></div>
    </nav>
  </xh-side-nav>`)
  nav = document.querySelector<SideNavElement>('xh-side-nav')!
  nav.collection = [
    { value: 'home', label: '工作台', href: '#home' },
    { value: 'logs', label: '操作日志', href: '#logs' },
  ]
  await settle()
}

function link(index: number): HTMLElement {
  return document.querySelectorAll<HTMLElement>(`[data-scope='side-nav'][data-part='link']`)[index]!
}

function hint(): HTMLElement {
  return document.querySelector<HTMLElement>(`[data-xh-part='tooltip']`)!
}

describe('wc side-nav 图标栏名称提示', () => {
  it('聚焦只剩图标的叶子：接线成 tooltip 的部件，定位层搬到浮层落点，贴在行尾一侧，文字是行的标签', async () => {
    await mount()
    const home = nav!.querySelector('[data-xh-part="tooltip-positioner"]')!.parentNode
    link(1).focus()
    await expect.poll(async () => {
      await settle()
      return hint().getAttribute('data-state')
    }).toBe('open')
    await Promise.all(document.getAnimations().map(a => a.finished.catch(() => undefined)))
    await settle()
    const positioner = hint().parentElement!
    expect(positioner.getAttribute('data-scope')).toBe('tooltip')
    expect(positioner.getAttribute('data-part')).toBe('positioner')
    expect(hint().getAttribute('data-scope')).toBe('tooltip')
    expect(hint().getAttribute('data-part')).toBe('content')
    expect(hint().getAttribute('aria-hidden')).toBe('true')
    expect(hint().textContent).toBe('操作日志')
    expect(nav!.contains(positioner), '显示期间搬到浮层落点').toBe(false)
    const row = link(1).getBoundingClientRect()
    const tip = hint().getBoundingClientRect()
    expect(tip.left).toBeGreaterThan(row.right)
    expect(tip.top + tip.height / 2).toBeCloseTo(row.top + row.height / 2, 0)

    link(1).blur()
    await expect.poll(async () => {
      await Promise.all(document.getAnimations().map(a => a.finished.catch(() => undefined)))
      await settle()
      return nav!.contains(positioner)
    }, { timeout: 3000 }).toBe(true)
    expect(positioner.parentNode, '收起播完退场即归位').toBe(home)
    expect(getComputedStyle(hint()).display).toBe('none')
  })
})
