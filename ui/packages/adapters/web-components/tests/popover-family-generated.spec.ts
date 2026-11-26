// @vitest-environment jsdom
// 浮层一族在 Web Components 里补上的几件事：xh-tooltip / xh-popconfirm 不写部件时按标准结构生成；
// content 里一个 <template> 的内容按 lazy-mount / unmount-on-exit 克隆或撤走；xh-popover / xh-popconfirm 退场后派发 exit-complete。

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface OverlayHost extends HTMLElement {
  updateComplete: Promise<unknown>
  open?: boolean
}

afterEach(() => {
  document.body.replaceChildren()
})

async function settle(el: OverlayHost): Promise<void> {
  for (let i = 0; i < 6; i++) {
    await el.updateComplete
    await new Promise(r => setTimeout(r, 0))
  }
}

function mount(tag: string, attrs: Record<string, string>, inner = ''): OverlayHost {
  const el = document.createElement(tag) as OverlayHost
  for (const [name, value] of Object.entries(attrs))
    el.setAttribute(name, value)
  el.innerHTML = inner
  document.body.append(el)
  return el
}

function part(scope: string, name: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-scope="${scope}"][data-part="${name}"]`)
}

describe('xh-tooltip 标准结构', () => {
  it('trigger-text 与 content 两个属性生成触发按钮、content 里的提示文字与箭头', async () => {
    const el = mount('xh-tooltip', { 'default-open': '', 'trigger-text': '保存', 'content': '写入草稿箱' })
    await settle(el)
    const trigger = part('tooltip', 'trigger')!
    expect(trigger.localName).toBe('button')
    expect(trigger.textContent).toBe('保存')
    const text = part('tooltip', 'text')!
    expect(text.localName).toBe('span')
    expect(text.textContent).toBe('写入草稿箱')
    const content = part('tooltip', 'content')!
    expect([...content.children].map(node => node.getAttribute('data-part'))).toEqual(['text', 'arrow'])
    expect(trigger.getAttribute('aria-describedby')).toBe(content.id)
  })

  it('slot="trigger" 与 slot="content" 的作者节点搬进触发器与提示文字', async () => {
    const el = mount('xh-tooltip', { 'default-open': '' }, '<svg slot="trigger" aria-label="删除"></svg><b slot="content">删除后不可恢复</b>')
    await settle(el)
    expect(part('tooltip', 'trigger')!.querySelector('svg')).not.toBeNull()
    expect(part('tooltip', 'text')!.querySelector('b')?.textContent).toBe('删除后不可恢复')
  })

  it('委托模式下生成的触发器是容器，提示文字照旧由元素按锚点铺，箭头不被它撤走', async () => {
    const el = mount('xh-tooltip', { delegate: '[data-tip]', content: '不用它' }, '<span slot="trigger"><button data-tip data-xh-tooltip="撤销">↶</button></span>')
    await settle(el)
    expect(part('tooltip', 'trigger')!.localName).toBe('div')
    el.open = true
    await settle(el)
    // content 里只有一份 text，是委托那一份（不是结构按 content 属性铺的），箭头也还在
    const texts = part('tooltip', 'content')!.querySelectorAll('[data-part="text"]')
    expect(texts).toHaveLength(1)
    expect(texts[0]!.getAttribute('data-xh-gen')).toBe('tooltip-delegate')
    expect(part('tooltip', 'content')!.querySelector('[data-part="arrow"]')).not.toBeNull()
  })
})

describe('xh-popconfirm 标准结构', () => {
  it('title-text、description、confirm-text 生成标题、说明与两颗钮；取消钮文字缺省取语言包，排在确认钮之前', async () => {
    const el = mount('xh-popconfirm', { 'default-open': '', 'trigger-text': '删除这条记录', 'title-text': '删除后不可恢复', 'description': '附件一起清掉。', 'confirm-text': '删除' })
    await settle(el)
    expect(part('popconfirm', 'root')).not.toBeNull()
    expect(part('popconfirm', 'trigger')!.textContent).toBe('删除这条记录')
    expect(part('popconfirm', 'title')!.localName).toBe('h2')
    expect(part('popconfirm', 'title')!.textContent).toBe('删除后不可恢复')
    expect(part('popconfirm', 'description')!.textContent).toBe('附件一起清掉。')
    const content = part('popconfirm', 'content')!
    expect([...content.children].map(node => node.getAttribute('data-part')).filter(Boolean)).toEqual(['title', 'description', 'cancel-trigger', 'confirm-trigger', 'arrow'])
    expect(part('popconfirm', 'cancel-trigger')!.textContent).toBe('Cancel')
    expect(part('popconfirm', 'confirm-trigger')!.textContent).toBe('删除')
    expect(content.getAttribute('aria-labelledby')).toBe(part('popconfirm', 'title')!.id)
  })

  it('点取消派发 cancel-press，收起后派发 exit-complete', async () => {
    const el = mount('xh-popconfirm', { 'default-open': '', 'title-text': '确认？' })
    await settle(el)
    const events: string[] = []
    for (const type of ['cancel-press', 'open-change', 'exit-complete'])
      el.addEventListener(type, () => events.push(type))
    part('popconfirm', 'cancel-trigger')!.click()
    await settle(el)
    expect(events).toEqual(['cancel-press', 'open-change', 'exit-complete'])
  })
})

describe('content 里的 <template>：lazy-mount / unmount-on-exit', () => {
  const STRUCTURE = `
    <button data-xh-part="trigger">打开</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content" aria-label="面板">
        <template><p data-testid="body">内容</p></template>
      </div>
    </div>`

  it('lazy-mount：第一次打开前不克隆，打开过之后收起也留着', async () => {
    const el = mount('xh-popover', { 'lazy-mount': '' }, STRUCTURE)
    await settle(el)
    expect(document.querySelector('[data-testid="body"]')).toBeNull()
    el.open = true
    await settle(el)
    expect(document.querySelector('[data-testid="body"]')).not.toBeNull()
    el.open = false
    await settle(el)
    expect(document.querySelector('[data-testid="body"]')).not.toBeNull()
  })

  it('unmount-on-exit：退场落定后撤走克隆，再打开重新克隆；xh-popover 收起后派发 exit-complete', async () => {
    const el = mount('xh-popover', { 'unmount-on-exit': '' }, STRUCTURE)
    let exits = 0
    el.addEventListener('exit-complete', () => {
      exits += 1
    })
    el.open = true
    await settle(el)
    const first = document.querySelector('[data-testid="body"]')
    expect(first).not.toBeNull()
    el.open = false
    await settle(el)
    expect(document.querySelector('[data-testid="body"]')).toBeNull()
    expect(exits).toBe(1)
    el.open = true
    await settle(el)
    const second = document.querySelector('[data-testid="body"]')
    expect(second).not.toBeNull()
    expect(second).not.toBe(first)
  })

  it.each(['xh-hover-card', 'xh-tooltip'])('%s 同一套挂卸', async (tag) => {
    const scope = tag.slice(3)
    const el = mount(tag, { 'lazy-mount': '', 'unmount-on-exit': '' }, STRUCTURE)
    await settle(el)
    expect(part(scope, 'content')).not.toBeNull()
    expect(document.querySelector('[data-testid="body"]')).toBeNull()
    el.open = true
    await settle(el)
    expect(document.querySelector('[data-testid="body"]')).not.toBeNull()
    el.open = false
    await settle(el)
    expect(document.querySelector('[data-testid="body"]')).toBeNull()
  })
})
