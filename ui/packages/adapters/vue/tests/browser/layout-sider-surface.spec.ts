import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

/* 同一用例会挂两副骨架（行首 / 行尾各一），覆盖档的侧栏是 fixed 面，留下一副就会盖住后面用例的把手 */
const hosts: HTMLElement[] = []

afterEach(() => {
  for (const host of hosts.splice(0))
    host.remove()
})

function tokenColor(name: string): string {
  const probe = document.createElement('span')
  probe.style.color = `var(${name})`
  document.body.append(probe)
  const color = getComputedStyle(probe).color
  probe.remove()
  return color
}

/** 静态夹具带上 connect 投影的家族属性：把手的盒型与三态面由 Action Control 配方按它们画。 */
const TRIGGER_ATTRS = 'data-xh-action-control data-xh-action-profile="text" data-xh-action-variant="ghost" data-xh-action-display="always" data-xh-action-size="sm"'

function mount(options: { presentation?: 'inline' | 'sheet', placement?: 'start' | 'end' } = {}) {
  const host = document.createElement('div')
  hosts.push(host)
  const presentation = options.presentation ?? 'inline'
  host.innerHTML = `
    <div data-scope="layout" data-part="root" data-sider-presentation="${presentation}">
      <header data-scope="layout" data-part="header">
        <button data-scope="layout" data-part="sider-trigger" ${TRIGGER_ATTRS}>菜单</button>
      </header>
      <aside data-scope="layout" data-part="sider" data-presentation="${presentation}" data-placement="${options.placement ?? 'start'}">
        <button data-scope="layout" data-part="sider-trigger" ${TRIGGER_ATTRS}>收起</button>
      </aside>
      <main data-scope="layout" data-part="content">内容</main>
    </div>`
  document.body.append(host)
  const triggers = [...host.querySelectorAll<HTMLElement>('[data-part="sider-trigger"]')]
  return {
    sider: host.querySelector<HTMLElement>('[data-part="sider"]')!,
    headerTrigger: triggers[0]!,
    siderTrigger: triggers[1]!,
  }
}

describe('layout 侧栏面与折叠把手', () => {
  it('覆盖档的侧栏走 sheet 三件套：elevated 底 + 贴内容侧描边 + elevated 落影', () => {
    const start = mount({ presentation: 'sheet' })
    const style = getComputedStyle(start.sider)

    expect(style.backgroundColor).toBe(tokenColor('--xh-material-elevated-bg'))
    expect(style.boxShadow).not.toBe('none')
    expect(Number.parseFloat(style.borderInlineEndWidth)).toBe(1)
    expect(style.borderInlineEndColor).toBe(tokenColor('--xh-material-elevated-border'))
    expect(Number.parseFloat(style.borderInlineStartWidth)).toBe(0)

    const end = mount({ presentation: 'sheet', placement: 'end' })
    const endStyle = getComputedStyle(end.sider)
    expect(Number.parseFloat(endStyle.borderInlineEndWidth)).toBe(0)
    expect(Number.parseFloat(endStyle.borderInlineStartWidth)).toBe(1)
    expect(endStyle.borderInlineStartColor).toBe(tokenColor('--xh-material-elevated-border'))
  })

  it('占位档的侧栏是淡底区块：无描边、无影', () => {
    const layout = mount()
    const style = getComputedStyle(layout.sider)

    expect(style.backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
    expect(style.boxShadow).toBe('none')
    expect(Number.parseFloat(style.borderInlineEndWidth)).toBe(0)
  })

  it('把手随所在面走阶梯：顶栏白底 hover 100，占位档侧栏淡底 hover 200；按下缩放走令牌', async () => {
    const layout = mount()
    expect(getComputedStyle(layout.headerTrigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(Number.parseFloat(getComputedStyle(layout.headerTrigger).blockSize)).toBe(32)

    await userEvent.hover(layout.headerTrigger)
    await expect.poll(() => getComputedStyle(layout.headerTrigger).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))

    await userEvent.hover(layout.siderTrigger)
    await expect.poll(() => getComputedStyle(layout.siderTrigger).backgroundColor).toBe(tokenColor('--xh-bg-subtle-hover'))
    expect(getComputedStyle(layout.siderTrigger).transitionProperty).toContain('scale')
  })

  it('覆盖档侧栏是 elevated 白底：摆进去的把手 hover 回到 100，不沿用占位档的 200', async () => {
    const layout = mount({ presentation: 'sheet' })
    expect(getComputedStyle(layout.siderTrigger).backgroundColor).toBe('rgba(0, 0, 0, 0)')

    await userEvent.hover(layout.siderTrigger)
    await expect.poll(() => getComputedStyle(layout.siderTrigger).backgroundColor).toBe(tokenColor('--xh-bg-subtle'))
  })
})
