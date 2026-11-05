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

/** 静态夹具带上 connect 投影的家族属性：触发器的盒型与三态面由 Action Control 的 disclosure-trigger 档按它们画。 */
const TRIGGER_ATTRS = 'data-xh-action-control data-xh-action-profile="disclosure-trigger" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="md"'

function mount(state: 'closed' | 'open' = 'open') {
  host = document.createElement('div')
  host.innerHTML = `
    <div data-scope="collapsible" class="xh-scope-collapsible" data-part="root">
      <button data-scope="collapsible" class="xh-scope-collapsible" data-part="trigger" data-state="${state}" ${TRIGGER_ATTRS}>
        详情
        <span data-scope="collapsible" class="xh-scope-collapsible" data-part="indicator" data-state="${state}"></span>
      </button>
      <div data-scope="collapsible" class="xh-scope-collapsible" data-part="content">详情内容</div>
    </div>`
  document.body.append(host)
  return {
    trigger: host.querySelector<HTMLElement>('[data-part="trigger"]')!,
    content: host.querySelector<HTMLElement>('[data-part="content"]')!,
    indicator: host.querySelector<HTMLElement>('[data-part="indicator"]')!,
  }
}

describe('collapsible 默认视觉', () => {
  it('标题栏与正文沿同一边缘排布：标题栏 45px 高，正文贴着标题、弱一档字色 14px，指示器取更弱一档的前景，字重不随开合变', () => {
    const collapsible = mount()
    const trigger = getComputedStyle(collapsible.trigger)
    const content = getComputedStyle(collapsible.content)
    const indicator = getComputedStyle(collapsible.indicator)

    expect(Number.parseFloat(trigger.paddingBlockStart)).toBe(12)
    expect(Number.parseFloat(trigger.paddingInlineStart)).toBe(12)
    expect(collapsible.trigger.getBoundingClientRect().height).toBeCloseTo(45, 0)
    expect(trigger.fontWeight).toBe('400')
    expect(Number.parseFloat(content.paddingBlockStart)).toBe(4)
    expect(Number.parseFloat(content.paddingBlockEnd)).toBe(16)
    expect(content.paddingInlineStart).toBe(trigger.paddingInlineStart)
    expect(content.color).toBe(tokenColor('--xh-fg-muted'))
    expect(content.fontSize).toBe('14px')
    expect(indicator.color).toBe(tokenColor('--xh-fg-subtle'))
  })

  it('收起转向行尾，展开回正，rtl 反着转；转向与正文同曲线', async () => {
    const closed = mount('closed').indicator
    expect(getComputedStyle(closed).rotate).toBe('-90deg')
    expect(getComputedStyle(closed).transitionTimingFunction).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
    host?.setAttribute('dir', 'rtl')
    // 夹具没带 data-instant，换方向这一下走过渡，等它落定再读
    await expect.poll(() => getComputedStyle(closed).rotate).toBe('90deg')
    host?.remove()
    const opened = mount('open').indicator
    expect(getComputedStyle(opened).rotate).toBe('0deg')
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
