import { userEvent } from '@vitest/browser/context'
import { afterEach, describe, expect, it } from 'vitest'
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

/** 静态夹具带上 connect 投影的家族属性：触发器的盒型与三态面由 Action Control 的 disclosure-trigger 档按它们画。 */
const TRIGGER_ATTRS = 'data-xh-action-control data-xh-action-profile="disclosure-trigger" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="md"'

function mount(state: 'closed' | 'open' = 'open') {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="collapsible" data-part="root">
      <button data-scope="collapsible" data-part="trigger" data-state="${state}" ${TRIGGER_ATTRS}>
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

  it('标题栏悬停换面到画布承载的 hover 档（100），展开态与收起态同档，按下只换面不缩放', async () => {
    const closed = mount('closed').trigger
    const closedRest = getComputedStyle(closed).backgroundColor

    // 换面走 micro 过渡，等它落定再读
    await userEvent.hover(closed)
    await expect.poll(() => getComputedStyle(closed).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(closed).backgroundColor).not.toBe(closedRest)
    expect(getComputedStyle(closed).scale).toBe('none')

    host?.remove()
    const open = mount('open').trigger
    const openRest = getComputedStyle(open).backgroundColor
    await userEvent.hover(open)
    await expect.poll(() => getComputedStyle(open).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(getComputedStyle(open).backgroundColor).not.toBe(openRest)
  })
})
