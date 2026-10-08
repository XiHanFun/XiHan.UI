import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

function mount(variant?: 'ghost' | 'outline' | 'subtle') {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="accordion" class="xh-scope-accordion" data-part="root"${variant ? ` data-variant="${variant}"` : ''}>
      <div data-scope="accordion" class="xh-scope-accordion" data-part="item">
        <h3 data-scope="accordion" class="xh-scope-accordion" data-part="header">
          <button data-scope="accordion" class="xh-scope-accordion" data-part="trigger" data-state="open" data-xh-action-control data-xh-action-profile="disclosure-trigger" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="md">第一项</button>
        </h3>
        <div data-scope="accordion" class="xh-scope-accordion" data-part="content" data-state="open" data-instant>第一项内容</div>
      </div>
      <div data-scope="accordion" class="xh-scope-accordion" data-part="item">
        <h3 data-scope="accordion" class="xh-scope-accordion" data-part="header">
          <button data-scope="accordion" class="xh-scope-accordion" data-part="trigger" data-state="closed" data-xh-action-control data-xh-action-profile="disclosure-trigger" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="md">第二项</button>
        </h3>
        <div data-scope="accordion" class="xh-scope-accordion" data-part="content">第二项内容</div>
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
  it('标题栏上下 10px 加一行正文行高共 41px，正文与标题同起点、淡底正文色，展开时与标题栏之间一条分隔线', () => {
    const accordion = mount()
    const trigger = getComputedStyle(accordion.triggers[0]!)
    const content = getComputedStyle(accordion.content)

    expect(Number.parseFloat(trigger.paddingBlockStart)).toBe(10)
    expect(Number.parseFloat(trigger.paddingInlineStart)).toBe(12)
    expect(accordion.triggers[0]!.getBoundingClientRect().height).toBeCloseTo(41, 0)
    expect(Number.parseFloat(content.paddingBlockStart)).toBe(8)
    expect(Number.parseFloat(content.paddingBlockEnd)).toBe(8)
    expect(content.paddingInlineStart).toBe(trigger.paddingInlineStart)
    expect(content.color).toBe(tokenColor('--xh-fg-default'))
    expect(content.fontSize).toBe('14px')
    expect(content.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(content.borderTopWidth)).toBe(1)
    expect(content.borderTopColor).toBe(tokenColor('--xh-border-default'))
  })

  it('标题栏悬停换面到白底承载的 hover 档（100），展开态与收起态同档，按下只换面不缩放', async () => {
    const accordion = mount()
    const [open, closed] = accordion.triggers
    const openRest = getComputedStyle(open!).backgroundColor
    const closedRest = getComputedStyle(closed!).backgroundColor

    // 换面走 micro 过渡，等它落定再读
    await userEvent.hover(closed!)
    await expect.poll(() => getComputedStyle(closed!).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(closed!).backgroundColor).not.toBe(closedRest)
    expect(getComputedStyle(closed!).scale).toBe('none')

    await userEvent.hover(open!)
    await expect.poll(() => getComputedStyle(open!).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(open!).backgroundColor).not.toBe(openRest)
  })

  it('subtle 根是淡底承载面，标题栏悬停换面到 200 档', async () => {
    const accordion = mount('subtle')
    const closed = accordion.triggers[1]!

    await userEvent.hover(closed)
    await expect.poll(() => getComputedStyle(closed).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
  })

  it('outline 是一块 border-default 描边、无影的连续表面，分隔线通栏且末项不留尾线', () => {
    const accordion = mount('outline')
    const root = getComputedStyle(accordion.root)
    const firstSeparator = getComputedStyle(accordion.items[0]!, '::after')
    const lastSeparator = getComputedStyle(accordion.items[1]!, '::after')

    expect(root.gap).toBe('normal')
    expect(root.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(root.borderTopWidth)).toBe(1)
    expect(root.borderTopColor).toBe(tokenColor('--xh-border-default'))
    expect(root.boxShadow).toBe('none')
    expect(root.overflow).toBe('clip')
    expect(Number.parseFloat(root.borderRadius)).toBeGreaterThan(0)
    expect(firstSeparator.content).toBe('""')
    expect(Number.parseFloat(firstSeparator.blockSize)).toBeGreaterThan(0)
    expect(Number.parseFloat(firstSeparator.insetInlineStart)).toBe(0)
    expect(firstSeparator.backgroundColor).toBe(tokenColor('--xh-border-default'))
    expect(lastSeparator.content).toBe('none')
  })
})
