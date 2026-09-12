import { setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

type Scope = 'select' | 'cascader' | 'combobox' | 'tree-select'

interface OverlayElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

defineXhElements()

function markup(scope: Scope): string {
  if (scope === 'select') {
    return `<xh-select open>
      <button data-xh-part="trigger">选择</button><i data-before></i>
      <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list"></div></div></div><i data-after></i>
    </xh-select>`
  }
  if (scope === 'cascader') {
    return `<xh-cascader open>
      <button data-xh-part="trigger">路径</button><i data-before></i>
      <div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i>
    </xh-cascader>`
  }
  if (scope === 'combobox') {
    return `<xh-combobox open>
      <div data-xh-part="control"><input data-xh-part="input"></div><i data-before></i>
      <div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i>
    </xh-combobox>`
  }
  return `<xh-tree-select open>
    <button data-xh-part="trigger">节点</button><i data-before></i>
    <div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div><i data-after></i>
  </xh-tree-select>`
}

async function settle(doc: Document = document): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<OverlayElement>('xh-select, xh-cascader, xh-combobox, xh-tree-select'))
      await element.updateComplete
  }
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
}

function finiteAnimations(node: HTMLElement): Animation[] {
  return node.getAnimations().filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
}

beforeEach(() => setDiagnosticsLevel('silent'))

afterEach(() => {
  document.body.innerHTML = ''
  document.head.querySelectorAll('style[data-test-anchored-portal]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe.each(['select', 'cascader', 'combobox', 'tree-select'] as const)('wc %s 锚定 Portal', (scope) => {
  it('positioner 脱离裁剪祖先，退场完成前保持租约，随后精确归位', async () => {
    const style = document.createElement('style')
    style.dataset.testAnchoredPortal = ''
    style.textContent = `
      @keyframes test-anchored-portal-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-anchored-portal-exit 60s linear forwards;
      }
    `
    document.head.append(style)

    const stage = document.createElement('section')
    stage.dataset.theme = 'dark'
    stage.dataset.density = 'compact'
    stage.dir = 'rtl'
    stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden;--test-portal-accent:rgb(1, 2, 3)'
    stage.innerHTML = markup(scope)
    document.body.append(stage)
    const element = stage.firstElementChild as OverlayElement
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling

    await settle()
    const shell = positioner.parentElement!
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(stage.contains(positioner)).toBe(false)
    expect(shell.dataset.theme).toBe('dark')
    expect(shell.dataset.density).toBe('compact')
    expect(shell.dir).toBe('rtl')
    expect(shell.style.getPropertyValue('--test-portal-accent')).toBe('rgb(1, 2, 3)')
    expect(content.getAttribute('data-scope')).toBe(scope)

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
