// 指示条的出没与引导换步：锚点与导航菜单的指示条没有可指的项时先在原处淡出、播完才藏起，之前落过位、又有了可指的项时原地淡入；
// 漫游引导展开着换步时，气泡里的标题原地淡入。
import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type XhElement = HTMLElement & { updateComplete: Promise<unknown>, [key: string]: unknown }

let host: HTMLElement | null = null

beforeEach(() => {
  setDiagnosticsLevel('silent')
})

afterEach(() => {
  host?.remove()
  host = null
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

async function settle(el: XhElement, count = 2): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    await el.updateComplete
  }
  for (let i = 0; i < count; i++)
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

async function mount(markup: string): Promise<XhElement> {
  host = document.createElement('div')
  host.style.inlineSize = '480px'
  for (const name of ['enter', 'exit'])
    host.style.setProperty(`--xh-motion-duration-${name}`, '10s')
  host.innerHTML = markup
  document.body.append(host)
  const el = host.firstElementChild as XhElement
  await settle(el, 3)
  return el
}

function scripted(el: Element): Animation | undefined {
  return el.getAnimations().find(a => !(a instanceof CSSAnimation) && !(a instanceof CSSTransition))
}

function shown(el: HTMLElement): boolean {
  return !el.hidden && getComputedStyle(el).display !== 'none'
}

describe('xh-anchor 与 xh-navigation-menu 指示条的出没', () => {
  it('锚点指示条没有可指的项时原地淡出、播完才藏起；再有了可指的项时原地淡入', async () => {
    const anchor = await mount(`<xh-anchor value="a"><nav data-xh-part="root"><ul data-xh-part="list">
      <li data-xh-part="item"><a data-xh-part="link" value="a">概览</a></li>
      <li data-xh-part="item"><a data-xh-part="link" value="b">安装</a></li>
      <li data-xh-part="indicator"></li>
    </ul></nav></xh-anchor>`)
    const indicator = host!.querySelector<HTMLElement>(`[data-scope='anchor'][data-part='indicator']`)!
    expect(shown(indicator)).toBe(true)
    expect(scripted(indicator)).toBeUndefined()
    anchor.value = null
    await settle(anchor, 1)
    const leaving = scripted(indicator)!
    expect(leaving).toBeDefined()
    expect(shown(indicator)).toBe(true)
    leaving.finish()
    await expect.poll(() => shown(indicator)).toBe(false)
    anchor.value = 'b'
    await settle(anchor, 2)
    expect(shown(indicator)).toBe(true)
    expect(scripted(indicator)).toBeDefined()
  })

  it('导航菜单收起面板时指示条原地淡出、播完才藏起', async () => {
    const menu = await mount(`<xh-navigation-menu value="docs"><nav data-xh-part="root"><ul data-xh-part="list">
      <li data-xh-part="item">
        <button data-xh-part="trigger" value="docs">文档</button>
        <div data-xh-part="content" value="docs"><a data-xh-part="link" href="#a">快速上手</a></div>
      </li>
      <li data-xh-part="indicator"></li>
    </ul></nav></xh-navigation-menu>`)
    const indicator = host!.querySelector<HTMLElement>(`[data-scope='navigation-menu'][data-part='indicator']`)!
    expect(shown(indicator)).toBe(true)
    menu.value = null
    await settle(menu, 1)
    const leaving = scripted(indicator)!
    expect(leaving).toBeDefined()
    leaving.finish()
    await expect.poll(() => shown(indicator)).toBe(false)
  })
})

describe('xh-tour 换步', () => {
  it('展开着换到下一步：气泡里的标题原地淡入', async () => {
    host = document.createElement('div')
    host.style.setProperty('--xh-motion-duration-enter', '10s')
    host.innerHTML = `
      <button id="tour-fade-a" style="position: fixed; left: 40px; top: 60px; inline-size: 120px; block-size: 32px">一</button>
      <button id="tour-fade-b" style="position: fixed; left: 360px; top: 240px; inline-size: 80px; block-size: 48px">二</button>
      <xh-tour open><div data-xh-part="root"><div data-xh-part="positioner"><div data-xh-part="content"><h2 data-xh-part="title"></h2></div></div></div></xh-tour>`
    const el = host.querySelector<XhElement>('xh-tour')!
    // 步骤在接进文档之前给齐：与文档站的示例同一种写法
    el.steps = [{ id: 'a', target: '#tour-fade-a', title: '第一站' }, { id: 'b', target: '#tour-fade-b', title: '第二站' }]
    document.body.append(host)
    await settle(el, 3)
    await expect.poll(() => document.querySelector(`[data-scope='tour'][data-part='positioner']`)?.hasAttribute('data-positioned')).toBe(true)
    await settle(el, 2)
    const title = document.querySelector<HTMLElement>(`[data-scope='tour'][data-part='title']`)!
    for (const animation of document.getAnimations())
      animation.finish()
    expect(scripted(title)).toBeUndefined()
    el.value = 1
    await settle(el, 1)
    expect(title.textContent).toContain('第二站')
    expect(scripted(title)).toBeDefined()
  })
})
