// asChild：作者把一台嵌套组件当作外层的部件——<xh-button data-xh-part="trigger"> 当菜单 / 浮层的触发器。
// 外层的接线合进按钮自己的根节点：按钮保留自己的解剖与外观（data-scope="button"、形态轴），
// 触发器的 ARIA、开合与键盘落在同一个原生 button 上，与 Vue / React 的 asChild 合并规则一致。
// 此前嵌套的 xh-* 子树一律跳过，WC 的触发器只能写原生 button，没法套组件库按钮的外观。
// 焦点、定位与开合要真实浏览器才看得出。
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

async function settle(): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => requestAnimationFrame(resolve))
  await new Promise(resolve => requestAnimationFrame(resolve))
  await Promise.resolve()
}

async function mount(html: string): Promise<void> {
  host = document.createElement('div')
  host.innerHTML = html
  document.body.append(host)
  await settle()
}

function q<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = host!.querySelector<T>(selector) ?? document.querySelector<T>(selector)
  if (!el)
    throw new Error(`找不到 ${selector}`)
  return el
}

const MENU = `
  <xh-menu>
    <xh-button data-xh-part="trigger" variant="subtle">
      <button data-xh-part="root">操作</button>
    </xh-button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="new">新建</div>
        <div data-xh-part="item" value="open">打开</div>
      </div>
    </div>
  </xh-menu>`

describe('asChild：xh-button 当菜单触发器', () => {
  it('按钮保留自己的解剖与形态，触发器的 ARIA 合进同一个原生 button', async () => {
    await mount(MENU)
    const button = q('xh-button > button')
    expect(button.dataset.scope).toBe('button')
    expect(button.dataset.part).toBe('root')
    expect(button.dataset.xhActionVariant).toBe('subtle')
    expect(button.getAttribute('aria-haspopup')).toBe('menu')
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(button.getAttribute('aria-controls')).toBe(q(`[data-scope='menu'][data-part='content']`).id)
    // 宿主自己不接任何触发器属性
    expect(q('xh-button').hasAttribute('aria-haspopup')).toBe(false)
  })

  it('点按钮展开，Escape 收起后焦点回到按钮', async () => {
    await mount(MENU)
    const button = q('xh-button > button')
    await userEvent.click(button)
    await settle()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(q(`[data-scope='menu'][data-part='content']`).dataset.state).toBe('open')
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(button.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(button)
  })

  it('按钮上按 ArrowDown 展开并高亮第一项', async () => {
    await mount(MENU)
    const button = q('xh-button > button')
    button.focus()
    await userEvent.keyboard('{ArrowDown}')
    await settle()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    expect(q(`[data-scope='menu'][data-part='item'][data-value='new']`).hasAttribute('data-highlighted')).toBe(true)
  })

  it('按钮离开菜单后触发器属性一并撤回', async () => {
    await mount(MENU)
    const trigger = q('xh-button')
    const button = q('xh-button > button')
    host!.append(trigger)
    await settle()
    expect(button.hasAttribute('aria-haspopup')).toBe(false)
    expect(button.hasAttribute('aria-expanded')).toBe(false)
    expect(button.dataset.scope).toBe('button')
  })
})

describe('asChild：xh-button 当浮层触发器', () => {
  it('icon-only 的 subtle 按钮当触发器：点开浮层，浮层定位在按钮下方', async () => {
    await mount(`
      <xh-popover placement="bottom-start" style="display: block; padding: 80px">
        <xh-button data-xh-part="trigger" variant="subtle" icon-only>
          <button data-xh-part="root" aria-label="还有 4 位成员">+4</button>
        </xh-button>
        <div data-xh-part="positioner">
          <div data-xh-part="content"><p data-xh-part="description">成员列表</p></div>
        </div>
      </xh-popover>`)
    const button = q('xh-button > button')
    expect(button.dataset.xhActionVariant).toBe('subtle')
    expect(button.dataset.xhActionProfile).toBe('icon')
    expect(button.getAttribute('aria-haspopup')).toBe('dialog')
    await userEvent.click(button)
    await settle()
    expect(button.getAttribute('aria-expanded')).toBe('true')
    const content = q(`[data-scope='popover'][data-part='content']`)
    expect(content.dataset.state).toBe('open')
    // 定位锚点是按钮本身：浮层落在它下方、左缘对齐（离视口边留出余量，避让不会把它推开）
    const anchor = button.getBoundingClientRect()
    const floating = q(`[data-scope='popover'][data-part='positioner']`).getBoundingClientRect()
    expect(floating.top).toBeGreaterThanOrEqual(anchor.bottom - 1)
    expect(Math.abs(floating.left - anchor.left)).toBeLessThanOrEqual(1)
  })
})
