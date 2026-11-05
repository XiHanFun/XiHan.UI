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
  it('标题栏上下 12px 加一行正文行高共 45px，正文与标题同起点、弱一档字色，不铺底不占线', () => {
    const accordion = mount()
    const trigger = getComputedStyle(accordion.triggers[0]!)
    const content = getComputedStyle(accordion.content)

    expect(Number.parseFloat(trigger.paddingBlockStart)).toBe(12)
    expect(Number.parseFloat(trigger.paddingInlineStart)).toBe(12)
    expect(accordion.triggers[0]!.getBoundingClientRect().height).toBeCloseTo(45, 0)
    expect(Number.parseFloat(content.paddingBlockStart)).toBe(4)
    expect(Number.parseFloat(content.paddingBlockEnd)).toBe(16)
    expect(content.paddingInlineStart).toBe(trigger.paddingInlineStart)
    expect(content.color).toBe(tokenColor('--xh-fg-muted'))
    expect(content.fontSize).toBe('14px')
    expect(content.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(content.borderTopWidth)).toBe(0)
  })

  it('字重不随开合变：展开与收起的标题同一字重，一换字重标题宽度就跳', () => {
    const accordion = mount()
    const [open, closed] = accordion.triggers
    expect(getComputedStyle(open!).fontWeight).toBe(getComputedStyle(closed!).fontWeight)
  })

  it('缺省不写 variant 也是无壳：条目之间一条 border-subtle 细线，不画外框', () => {
    const accordion = mount()
    const root = getComputedStyle(accordion.root)
    const second = getComputedStyle(accordion.items[1]!)

    expect(Number.parseFloat(root.borderTopWidth)).toBe(0)
    expect(root.backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(second.borderTopWidth)).toBeGreaterThan(0)
    expect(second.borderTopColor).toBe(tokenColor('--xh-border-subtle'))
  })

  it('指示器写在最前面：紧贴标题排在起始缘，收起转向行尾，展开回正，rtl 反着转', () => {
    host = document.createElement('div')
    host.style.inlineSize = '360px'
    const trigger = (state: string): string => `
      <button data-scope="accordion" class="xh-scope-accordion" data-part="trigger" data-state="${state}" data-xh-action-control data-xh-action-profile="disclosure-trigger" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="md">
        <span data-scope="accordion" class="xh-scope-accordion" data-part="indicator" data-state="${state}" data-instant></span><span>标题</span>
      </button>`
    host.innerHTML = `<div data-scope="accordion" class="xh-scope-accordion" data-part="root">${trigger('closed')}${trigger('open')}</div>`
    document.body.append(host)
    const buttons = [...host.querySelectorAll<HTMLElement>('[data-part="trigger"]')]
    const [closedIndicator, openIndicator] = buttons.map(button => button.querySelector<HTMLElement>('[data-part="indicator"]')!)
    const label = buttons[0]!.querySelector<HTMLElement>('span:not([data-part])')!

    // offset 系不计旋转：转过的盒子外接矩形比它自己宽
    expect(label.offsetLeft - (closedIndicator!.offsetLeft + closedIndicator!.offsetWidth)).toBeCloseTo(6, 0)
    expect(label.getBoundingClientRect().right).toBeLessThan(buttons[0]!.getBoundingClientRect().right - 100)
    expect(getComputedStyle(closedIndicator!).rotate).toBe('-90deg')
    expect(getComputedStyle(openIndicator!).rotate).toBe('0deg')

    host.setAttribute('dir', 'rtl')
    expect(getComputedStyle(closedIndicator!).rotate).toBe('90deg')
    expect(getComputedStyle(openIndicator!).rotate).toBe('0deg')
  })

  it('指示器与正文同时长同曲线：转向走开合档，不走强减速', () => {
    host = document.createElement('div')
    host.innerHTML = `
      <span data-scope="accordion" class="xh-scope-accordion" data-part="indicator" data-state="closed"></span>
      <span data-scope="accordion" class="xh-scope-accordion" data-part="indicator" data-state="open"></span>`
    document.body.append(host)
    const [closing, opening] = [...host.querySelectorAll<HTMLElement>('[data-part="indicator"]')]
    expect(getComputedStyle(closing!).transitionDuration).toBe('0.2s')
    expect(getComputedStyle(opening!).transitionDuration).toBe('0.2s')
    expect(getComputedStyle(closing!).transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    expect(getComputedStyle(opening!).transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
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

  it('outline 是一块 border-default 描边、无影的连续表面，分隔线取 border-subtle 通栏且末项不留尾线', () => {
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
    expect(firstSeparator.backgroundColor).toBe(tokenColor('--xh-border-subtle'))
    expect(lastSeparator.content).toBe('none')
  })

  it('outline / subtle 的标题栏通栏贴面，悬停面不带圆角；ghost 留圆角', () => {
    for (const [variant, radius] of [['outline', '0px'], ['subtle', '0px']] as const) {
      const accordion = mount(variant)
      expect(getComputedStyle(accordion.triggers[0]!).borderTopLeftRadius).toBe(radius)
      host?.remove()
    }
    const ghost = mount('ghost')
    expect(Number.parseFloat(getComputedStyle(ghost.triggers[0]!).borderTopLeftRadius)).toBeGreaterThan(0)
  })
})
