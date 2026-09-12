import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

defineXhElements()

type Scope = 'hover-card' | 'tooltip'

interface OverlayElement extends HTMLElement {
  open: boolean
  updateComplete: Promise<unknown>
}

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<OverlayElement>('xh-hover-card, xh-tooltip'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function markup(scope: Scope): string {
  return `<xh-${scope} open>
    <button data-xh-part="trigger">说明</button><i data-before></i>
    <div data-xh-part="positioner"><div data-xh-part="content">详情</div></div><i data-after></i>
  </xh-${scope}>`
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-core14-portal]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe.each(['hover-card', 'tooltip'] as const)('wc %s 物理 Portal', (scope) => {
  it('positioner 脱离裁剪祖先，Presence 退场结束后精确归位', async () => {
    const style = document.createElement('style')
    style.dataset.testCore14Portal = ''
    style.textContent = `
      @keyframes test-core14-tip-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-core14-tip-exit 60s linear forwards;
      }
    `
    document.head.append(style)

    const stage = document.createElement('section')
    stage.dataset.theme = 'dark'
    stage.style.cssText = 'contain:paint;overflow:hidden;--test-core14-accent:rgb(1, 2, 3)'
    stage.innerHTML = markup(scope)
    const element = stage.firstElementChild as OverlayElement
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling
    document.body.append(stage)

    await settle()
    const shell = positioner.parentElement!
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(stage.contains(positioner)).toBe(false)
    expect(shell.dataset.theme).toBe('dark')
    expect(shell.style.getPropertyValue('--test-core14-accent')).toBe('rgb(1, 2, 3)')

    element.open = false
    await settle()
    expect(positioner.parentElement).toBe(shell)
    const animations = finiteAnimations(content)
    expect(animations).toHaveLength(1)
    animations[0]!.finish()
    await settle()

    expect(positioner.parentNode).toBe(originalParent)
    expect(positioner.previousSibling).toBe(originalPrevious)
    expect(positioner.nextSibling).toBe(originalNext)
    expect(shell.isConnected).toBe(false)
  })
})
