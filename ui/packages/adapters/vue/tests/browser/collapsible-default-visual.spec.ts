import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | null = null

afterEach(() => {
  host?.remove()
  host = null
})

function mount(state: 'closed' | 'open' = 'open') {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="collapsible" data-part="root">
      <button data-scope="collapsible" data-part="trigger" data-state="${state}">
        详情
        <span data-scope="collapsible" data-part="indicator" data-state="${state}"></span>
      </button>
      <div data-scope="collapsible" data-part="content">详情内容</div>
    </div>`
  document.body.append(host)
  return {
    trigger: host.querySelector<HTMLElement>('[data-part="trigger"]')!,
    content: host.querySelector<HTMLElement>('[data-part="content"]')!,
    indicator: host.querySelector<HTMLElement>('[data-part="indicator"]')!,
  }
}

describe('collapsible 默认视觉', () => {
  it('标题栏与正文沿同一边缘排布', () => {
    const collapsible = mount()
    const trigger = getComputedStyle(collapsible.trigger)
    const content = getComputedStyle(collapsible.content)
    const indicator = getComputedStyle(collapsible.indicator)

    expect(Number.parseFloat(trigger.paddingBlockStart)).toBe(16)
    expect(Number.parseFloat(trigger.paddingInlineStart)).toBe(16)
    expect(collapsible.trigger.getBoundingClientRect().height).toBeGreaterThanOrEqual(46)
    expect(Number.parseFloat(content.paddingBlockStart)).toBe(0)
    expect(Number.parseFloat(content.paddingBlockEnd)).toBe(16)
    expect(content.paddingInlineStart).toBe(trigger.paddingInlineStart)
    expect(content.color).not.toBe(trigger.color)
    expect(indicator.color).toBe(content.color)
  })

  it('收起状态悬停换面，展开状态保持稳定', async () => {
    const closed = mount('closed').trigger
    const closedRest = getComputedStyle(closed).backgroundColor
    await userEvent.hover(closed)
    expect(getComputedStyle(closed).backgroundColor).not.toBe(closedRest)

    host?.remove()
    const open = mount('open').trigger
    const openRest = getComputedStyle(open).backgroundColor
    await userEvent.hover(open)
    expect(getComputedStyle(open).backgroundColor).toBe(openRest)
  })
})
