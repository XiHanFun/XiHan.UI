import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

let host: HTMLElement | undefined
afterEach(() => host?.remove())

describe('空菜单的实体焦点保护面', () => {
  it.each(['light', 'dark'] as const)('%s：键盘焦点不画在透明背景上', async (theme) => {
    host = document.createElement('div')
    host.dataset.theme = theme
    const content = document.createElement('div')
    content.dataset.scope = 'context-menu'
    content.dataset.part = 'content'
    content.tabIndex = 0
    content.setAttribute('role', 'menu')
    content.setAttribute('aria-label', '空菜单')
    content.style.minBlockSize = '40px'
    const arrow = document.createElement('div')
    arrow.dataset.scope = 'context-menu'
    arrow.dataset.part = 'arrow'
    arrow.dataset.placement = 'bottom'
    content.append(arrow)
    host.append(content)
    document.body.append(host)
    await userEvent.tab()
    content.focus()
    expect(content.matches(':focus-visible')).toBe(true)
    const style = getComputedStyle(content)
    const probe = document.createElement('span')
    probe.style.background = 'var(--xh-material-frosted-focus-surface)'
    host.append(probe)
    expect(style.backgroundColor).toBe(getComputedStyle(probe).backgroundColor)
    expect(getComputedStyle(arrow).backgroundColor).toBe(style.backgroundColor)
    expect(style.outlineStyle).toBe('solid')
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThan(0)
  })
})
