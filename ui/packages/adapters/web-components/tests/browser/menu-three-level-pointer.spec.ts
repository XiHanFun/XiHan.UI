// docs menu/10-submenu 的 WC 同构结构：三级 Light DOM 在视觉上分离，逻辑上仍是一棵悬停树。
import { afterEach, describe, expect, it, vi } from 'vitest'
import { userEvent } from 'vitest/browser'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

const OPEN_WAIT = 140
const CLOSE_WAIT = 360

interface UpdatableMenu extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

let stage: HTMLElement | null = null
let rootMenu: UpdatableMenu | null = null

const MARKUP = `
  <xh-menu>
    <button data-xh-part="trigger">文件操作</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="open">打开</div>
        <div data-xh-part="item" value="rename">重命名</div>
        <div data-xh-part="separator"></div>
        <xh-menu submenu open-on-hover>
          <div data-xh-part="trigger" value="share">发送到…</div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="item" value="share-email">邮件</div>
              <div data-xh-part="item" value="share-sms">短信</div>
              <xh-menu submenu open-on-hover>
                <div data-xh-part="trigger" value="share-im">即时通讯…</div>
                <div data-xh-part="positioner">
                  <div data-xh-part="content">
                    <div data-xh-part="item" value="share-wecom">企业微信</div>
                    <div data-xh-part="item" value="share-dingtalk">钉钉</div>
                  </div>
                </div>
              </xh-menu>
            </div>
          </div>
        </xh-menu>
        <div data-xh-part="separator"></div>
        <div data-xh-part="item" value="delete">删除</div>
      </div>
    </div>
  </xh-menu>
`

async function settle(delay = 0): Promise<void> {
  if (delay > 0)
    await new Promise(resolve => setTimeout(resolve, delay))
  for (let round = 0; round < 6; round++) {
    await Promise.resolve()
    for (const menu of document.querySelectorAll<UpdatableMenu>('xh-menu'))
      await menu.updateComplete
  }
}

async function mountMenu(onSelect: (event: Event) => void, markup = MARKUP): Promise<void> {
  stage = document.createElement('div')
  stage.style.margin = '64px'
  stage.innerHTML = markup
  document.body.append(stage)
  rootMenu = stage.querySelector<UpdatableMenu>('xh-menu')
  if (!rootMenu)
    throw new Error('找不到根 xh-menu')
  rootMenu.addEventListener('select', onSelect)
  await settle()
}

function byValue(value: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(`[data-scope='menu'][data-part='item'][data-value='${value}']`)
  if (!element)
    throw new Error(`找不到菜单条目 ${value}`)
  return element
}

function rootTrigger(): HTMLElement {
  const element = rootMenu?.querySelector<HTMLElement>(`:scope > [data-scope='menu'][data-part='trigger']`)
  if (!element)
    throw new Error('找不到根菜单触发器')
  return element
}

function contentOf(value: string): HTMLElement {
  const content = byValue(value).closest<HTMLElement>(`[data-scope='menu'][data-part='content']`)
  if (!content)
    throw new Error(`找不到 ${value} 所属的 content`)
  return content
}

async function finishExit(value: string): Promise<void> {
  for (const animation of contentOf(value).getAnimations()) {
    if (Number.isFinite(animation.effect?.getComputedTiming().endTime))
      animation.finish()
  }
  await settle()
}

async function click(element: HTMLElement): Promise<void> {
  await userEvent.click(element)
  await settle()
}

async function hover(element: HTMLElement, delay: number): Promise<void> {
  await userEvent.hover(element)
  await settle(delay)
}

async function openThreeLevels(): Promise<void> {
  await click(rootTrigger())
  await hover(byValue('share'), OPEN_WAIT)
  expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
  await hover(byValue('share-im'), OPEN_WAIT)
  expect(byValue('share-im').getAttribute('aria-expanded')).toBe('true')
}

function expectThreeLevelsOpen(): void {
  expect(rootTrigger().getAttribute('aria-expanded')).toBe('true')
  expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
  expect(byValue('share-im').getAttribute('aria-expanded')).toBe('true')
  for (const value of ['open', 'share-email', 'share-wecom'])
    expect(getComputedStyle(contentOf(value)).display, value).not.toBe('none')
  const shells = ['open', 'share-email', 'share-wecom'].map(value => contentOf(value).parentElement?.parentElement)
  expect(new Set(shells).size).toBe(3)
  for (const shell of shells) {
    expect(shell?.dataset.xhPortalShell).toBe('')
    expect(shell?.parentElement?.id).toBe('xh-portal-root')
  }
}

afterEach(async () => {
  const menus = [...document.querySelectorAll<UpdatableMenu>('xh-menu')].reverse()
  for (const menu of menus) {
    menu.open = false
    await menu.updateComplete
  }
  stage?.remove()
  stage = null
  rootMenu = null
})

describe('web Components Menu 三级真实指针', () => {
  it('更深的 Portal 后代也属于全部悬停祖先，第四层停留不误关第二层', async () => {
    const onSelect = vi.fn()
    const markup = MARKUP.replace('<div data-xh-part="item" value="share-wecom">企业微信</div>', `
      <xh-menu submenu open-on-hover>
        <div data-xh-part="trigger" value="share-wecom">企业微信</div>
        <div data-xh-part="positioner"><div data-xh-part="content">
          <div data-xh-part="item" value="share-team">产品团队</div>
        </div></div>
      </xh-menu>
    `)
    await mountMenu(onSelect, markup)
    await openThreeLevels()
    await hover(byValue('share-wecom'), OPEN_WAIT)
    await hover(byValue('share-team'), CLOSE_WAIT)
    expectThreeLevelsOpen()
    expect(byValue('share-wecom').getAttribute('aria-expanded')).toBe('true')
    await click(byValue('share-team'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect((onSelect.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ value: 'share-team' })
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('false')
  })

  it('三级叶项停留超过默认关闭延时仍保留整棵树，返回二级后可重进并选中关闭', async () => {
    const onSelect = vi.fn()
    await mountMenu(onSelect)
    await openThreeLevels()

    await hover(byValue('share-wecom'), CLOSE_WAIT)
    expectThreeLevelsOpen()

    await hover(byValue('share-email'), CLOSE_WAIT)
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('true')
    expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')

    await hover(byValue('share-im'), OPEN_WAIT)
    await hover(byValue('share-dingtalk'), CLOSE_WAIT)
    expectThreeLevelsOpen()
    await click(byValue('share-dingtalk'))

    expect(onSelect).toHaveBeenCalledTimes(1)
    expect((onSelect.mock.calls[0]?.[0] as CustomEvent<{ value: string }>).detail).toEqual({ value: 'share-dingtalk' })
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share').getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')
  })

  it('键盘仍逐层进入和返回，Escape 只关闭当前顶层', async () => {
    await mountMenu(vi.fn())
    await click(rootTrigger())
    byValue('share').focus()
    expect(document.activeElement).toBe(byValue('share'))
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(byValue('share').getAttribute('aria-expanded')).toBe('true')

    byValue('share-im').focus()
    expect(document.activeElement).toBe(byValue('share-im'))
    await userEvent.keyboard('{ArrowRight}')
    await settle()
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('true')

    byValue('share-wecom').focus()
    await userEvent.keyboard('{ArrowLeft}')
    await settle()
    expect(byValue('share-im').getAttribute('aria-expanded')).toBe('false')
    expect(byValue('share').getAttribute('aria-expanded')).toBe('true')
    const exitingShell = contentOf('share-wecom').parentElement?.parentElement
    expect(exitingShell?.dataset.xhPortalShell).toBe('')
    // 退场中的子层继续占栈顶，先完成它的视觉退出，下一次 Escape 才轮到父层。
    await finishExit('share-wecom')
    expect(exitingShell?.isConnected).toBe(false)
    expect(contentOf('share-email').parentElement?.parentElement?.dataset.xhPortalShell).toBe('')

    byValue('share-email').focus()
    await userEvent.keyboard('{Escape}')
    await settle()
    expect(byValue('share').getAttribute('aria-expanded')).toBe('false')
    expect(rootTrigger().getAttribute('aria-expanded')).toBe('true')
  })
})
