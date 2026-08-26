// @vitest-environment jsdom
//
// 浮层族的自绘条：七个宿主一律把条子挂在作者写的 positioner 上、排在 content 之后。
// 这里钉住三件事：条子是 content 的兄弟且排在末尾（挂进 content 内部会撑高 scrollHeight）；
// 建出来的节点一个 data-xh-part 都不带（打了会被 discoverParts 收进 partMap）；
// 按住条子不会把浮层消解掉（条子在 content 之外，positioner 不记进层分支就会被判成层外交互）。
import { beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement { updateComplete: Promise<unknown> }

beforeEach(() => {
  document.body.innerHTML = ''
})

async function settle(el: Updatable): Promise<void> {
  await el.updateComplete
  await el.updateComplete
  await new Promise(r => setTimeout(r, 0))
  await el.updateComplete
  await el.updateComplete
}

/** 打字：写值、摆光标、派原生 input 事件——提及的入口就是这三件。 */
async function typeAt(el: Updatable): Promise<void> {
  const input = el.querySelector<HTMLTextAreaElement>('[data-xh-part="input"]')!
  input.focus()
  input.value = '@'
  input.setSelectionRange(1, 1)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle(el)
}

interface Host {
  scope: string
  tag: string
  markup: string
  attrs?: Record<string, string>
  /** 没有 default-open 的宿主靠交互摊开。 */
  open?: (el: Updatable) => Promise<void>
}

const PANEL = '<div data-xh-part="positioner"><div data-xh-part="content">正文</div></div>'

const HOSTS: Host[] = [
  {
    scope: 'menu',
    tag: 'xh-menu',
    markup: `
      <button data-xh-part="trigger">操作</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="copy">复制</div>
        </div>
      </div>
    `,
    attrs: { 'default-open': '' },
  },
  {
    scope: 'popover',
    tag: 'xh-popover',
    markup: `<button data-xh-part="trigger">打开</button>${PANEL}`,
    attrs: { 'default-open': '' },
  },
  {
    scope: 'popselect',
    tag: 'xh-popselect',
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="control"><button data-xh-part="trigger">选择</button></div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="item" value="apple"><span data-xh-part="item-text">苹果</span></div>
          </div>
        </div>
      </div>
    `,
    // 不用 default-open：两台机器分别在自己的 hostConnected 里建，
    // 而 popover 一上来就展开会在 listbox 建起来之前把接线拉起来
    open: async (el) => {
      el.querySelector<HTMLElement>('[data-xh-part="trigger"]')!.click()
      await settle(el)
    },
  },
  {
    scope: 'context-menu',
    tag: 'xh-context-menu',
    markup: `
      <div data-xh-part="root">
        <div data-xh-part="trigger">右键区</div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="item" value="copy"><span data-xh-part="item-text">复制</span></div>
          </div>
        </div>
      </div>
    `,
    attrs: { 'default-open': '' },
  },
  {
    scope: 'hover-card',
    tag: 'xh-hover-card',
    markup: `
      <div data-xh-part="root">
        <button data-xh-part="trigger">悬停</button>
        ${PANEL}
      </div>
    `,
    attrs: { 'default-open': '' },
  },
  {
    scope: 'mention',
    tag: 'xh-mention',
    markup: `
      <div data-xh-part="root">
        <textarea data-xh-part="input"></textarea>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="item" value="lilei"><span data-xh-part="item-text">李雷</span></div>
          </div>
        </div>
      </div>
    `,
    open: typeAt,
  },
  {
    scope: 'pagination',
    tag: 'xh-pagination',
    markup: `
      <div data-xh-part="root">
        <button data-xh-part="prev-trigger">上一页</button>
        <button data-xh-part="ellipsis" side="start">…</button>
        <button data-xh-part="next-trigger">下一页</button>
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
      </div>
    `,
    // 2000 条 / 每页 10 条 = 200 页，停在第 100 页：两侧各折一段
    attrs: { 'count': '2000', 'page-size': '10', 'default-page': '100' },
    open: async (el) => {
      el.querySelector<HTMLElement>('[data-xh-part="ellipsis"]')!.click()
      await settle(el)
    },
  },
]

async function mount(host: Host): Promise<Updatable> {
  const el = document.createElement(host.tag) as Updatable
  el.innerHTML = host.markup
  for (const [name, value] of Object.entries(host.attrs ?? {}))
    el.setAttribute(name, value)
  document.body.appendChild(el)
  await settle(el)
  await host.open?.(el)
  return el
}

function positioner(el: HTMLElement): HTMLElement {
  return el.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
}

describe.each(HOSTS)('$scope 的自绘条', (host) => {
  it('挂在 positioner 上，排在 content 之后', async () => {
    const el = await mount(host)

    const shell = positioner(el)
    const root = shell.querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="root"]')!
    expect(root).not.toBeNull()
    expect(shell.lastElementChild).toBe(root)
    expect(el.querySelector('[data-xh-part="content"]')!.parentElement).toBe(shell)
    expect(root.querySelector('[data-scope="scrollbar"][data-part="track"]')).not.toBeNull()
    expect(root.querySelector('[data-scope="scrollbar"][data-part="thumb"]')).not.toBeNull()
  })

  it('一个 data-xh-part 都不带', async () => {
    const el = await mount(host)

    const nodes = [...el.querySelectorAll<HTMLElement>('[data-scope="scrollbar"]')]
    expect(nodes.length).toBeGreaterThan(0)
    for (const node of nodes)
      expect(node.hasAttribute('data-xh-part')).toBe(false)
  })

  it('按在条子上不会把浮层消解掉', async () => {
    const el = await mount(host)

    const panel = el.querySelector<HTMLElement>('[data-xh-part="content"]')!
    expect(panel.getAttribute('data-state')).toBe('open')

    positioner(el)
      .querySelector<HTMLElement>('[data-scope="scrollbar"][data-part="track"]')!
      .dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, composed: true }))
    await settle(el)

    expect(panel.getAttribute('data-state')).toBe('open')
  })
})
