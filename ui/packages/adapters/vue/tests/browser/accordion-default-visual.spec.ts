import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(variant?: 'ghost' | 'outline' | 'subtle') {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="accordion" data-part="root"${variant ? ` data-variant="${variant}"` : ''}>
      <div data-scope="accordion" data-part="item">
        <h3 data-scope="accordion" data-part="header">
          <button data-scope="accordion" data-part="trigger" data-state="open">第一项</button>
        </h3>
        <div data-scope="accordion" data-part="content">第一项内容</div>
      </div>
      <div data-scope="accordion" data-part="item">
        <h3 data-scope="accordion" data-part="header">
          <button data-scope="accordion" data-part="trigger" data-state="closed">第二项</button>
        </h3>
        <div data-scope="accordion" data-part="content">第二项内容</div>
      </div>
    </div>`
  document.body.append(host)
  return {
    root: host.querySelector<HTMLElement>('[data-part="root"]')!,
    items: [...host.querySelectorAll<HTMLElement>('[data-part="item"]')],
    triggers: [...host.querySelectorAll<HTMLElement>('[data-part="trigger"]')],
    content: host.querySelector<HTMLElement>('[data-part="content"]')!,
  }
}

describe('accordion 默认视觉', () => {
  it('标题栏使用舒展内边距，正文与标题对齐并保持次级层级', () => {
    const accordion = mount()
    const trigger = getComputedStyle(accordion.triggers[0]!)
    const content = getComputedStyle(accordion.content)

    expect(Number.parseFloat(trigger.paddingBlockStart)).toBe(16)
    expect(Number.parseFloat(trigger.paddingInlineStart)).toBe(16)
    expect(accordion.triggers[0]!.getBoundingClientRect().height).toBeGreaterThanOrEqual(46)
    expect(Number.parseFloat(content.paddingBlockStart)).toBe(0)
    expect(Number.parseFloat(content.paddingBlockEnd)).toBe(16)
    expect(content.paddingInlineStart).toBe(trigger.paddingInlineStart)
    expect(content.color).not.toBe(trigger.color)
  })

  it('只有收起的标题栏在悬停时换面', async () => {
    const accordion = mount()
    const [open, closed] = accordion.triggers
    const openRest = getComputedStyle(open!).backgroundColor
    const closedRest = getComputedStyle(closed!).backgroundColor

    await userEvent.hover(closed!)
    expect(getComputedStyle(closed!).backgroundColor).not.toBe(closedRest)

    await userEvent.hover(open!)
    expect(getComputedStyle(open!).backgroundColor).toBe(openRest)
  })

  it('outline 是一块连续表面，分隔线内收且末项不留尾线', () => {
    const accordion = mount('outline')
    const root = getComputedStyle(accordion.root)
    const firstSeparator = getComputedStyle(accordion.items[0]!, '::after')
    const lastSeparator = getComputedStyle(accordion.items[1]!, '::after')

    expect(root.gap).toBe('normal')
    expect(root.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(root.boxShadow).toBe('none')
    expect(root.overflow).toBe('clip')
    expect(Number.parseFloat(root.borderRadius)).toBeGreaterThan(0)
    expect(firstSeparator.content).toBe('""')
    expect(Number.parseFloat(firstSeparator.blockSize)).toBeGreaterThan(0)
    expect(Number.parseFloat(firstSeparator.insetInlineStart) / accordion.root.clientWidth).toBeCloseTo(0.03, 2)
    expect(lastSeparator.content).toBe('none')
  })
})
