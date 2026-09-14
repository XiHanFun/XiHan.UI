import type { XhPopoverElement } from '../../src/elements/popover'
import type { XhTourElement } from '../../src/elements/tour'
import { getLayerRegistry, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'

interface OverlayElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

defineXhElements()

async function settle(): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const element of document.querySelectorAll<OverlayElement>('xh-popover, xh-popconfirm, xh-tour'))
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
  document.head.querySelectorAll('style[data-test-popover-tour-portal]').forEach(style => style.remove())
  setDiagnosticsLevel('warn')
})

describe.each(['popover', 'popconfirm'] as const)('wc %s 锚定 Portal', (scope) => {
  it('模态策略不改变物理落点，退场结束后 positioner 精确归位', async () => {
    const style = document.createElement('style')
    style.dataset.testPopoverTourPortal = ''
    style.textContent = `
      @keyframes test-popover-tour-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='${scope}'][data-part='content'][data-state='closed'] {
        animation: test-popover-tour-exit 60s linear forwards;
      }
    `
    document.head.append(style)

    const outside = document.createElement('button')
    const stage = document.createElement('section')
    stage.dataset.theme = 'dark'
    stage.dataset.density = 'compact'
    stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden;--test-portal-accent:rgb(1, 2, 3)'
    stage.innerHTML = scope === 'popover'
      ? `<xh-popover open modal="false"><button data-xh-part="trigger"></button><i data-before></i>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i></xh-popover>`
      : `<xh-popconfirm open><div data-xh-part="root"><button data-xh-part="trigger"></button><i data-before></i>
          <div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i></div></xh-popconfirm>`
    const element = stage.firstElementChild as OverlayElement
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const content = positioner.querySelector<HTMLElement>('[data-xh-part="content"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling
    document.body.append(outside, stage)
    await settle()

    const shell = positioner.parentElement!
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(stage.contains(positioner)).toBe(false)
    expect(shell.dataset.theme).toBe('dark')
    expect(shell.dataset.density).toBe('compact')
    expect(shell.style.getPropertyValue('--test-portal-accent')).toBe('rgb(1, 2, 3)')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(false)

    if (scope === 'popover') {
      ;(element as XhPopoverElement).modal = true
      await settle()
      expect(positioner.parentElement).toBe(shell)
      expect(getLayerRegistry(document).top()?.isModal()).toBe(true)
      expect(outside.inert).toBe(true)
    }

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
    expect(outside.inert).toBe(false)
  })
})

describe('wc Tour 混合 Portal', () => {
  it('锚定与居中步骤共用三根租约，并在全部退场完成后逐根精确归位', async () => {
    const style = document.createElement('style')
    style.dataset.testPopoverTourPortal = ''
    style.textContent = `
      @keyframes test-tour-portal-exit { from { opacity: 1 } to { opacity: 0 } }
      [data-scope='tour'][data-part='content'][data-state='closed'],
      [data-scope='tour'][data-part='backdrop'][data-state='closed'],
      [data-scope='tour'][data-part='spotlight'][data-state='closed'] {
        animation: test-tour-portal-exit 60s linear forwards;
      }
    `
    document.head.append(style)

    const stage = document.createElement('section')
    stage.dataset.theme = 'dark'
    stage.style.cssText = 'transform:translateZ(0);contain:paint;overflow:hidden'
    stage.innerHTML = `<button id="tour-portal-target"></button><xh-tour open>
      <div data-xh-part="root">
        <i data-before></i><div data-xh-part="backdrop"></div>
        <div data-xh-part="spotlight"></div>
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i>
      </div>
    </xh-tour>`
    const element = stage.querySelector<XhTourElement>('xh-tour')!
    element.steps = [
      { id: 'anchored', target: '#tour-portal-target', title: '锚定步骤' },
      { id: 'center', title: '居中步骤' },
    ]
    const roots = ['backdrop', 'spotlight', 'positioner']
      .map(part => element.querySelector<HTMLElement>(`[data-xh-part="${part}"]`)!)
    const slots = roots.map(root => ({
      root,
      parent: root.parentNode,
      previous: root.previousSibling,
      next: root.nextSibling,
    }))
    const content = element.querySelector<HTMLElement>('[data-xh-part="content"]')!
    document.body.append(stage)
    await settle()

    const shell = roots[0]!.parentElement!
    expect(roots.every(root => root.parentElement === shell)).toBe(true)
    expect(shell.dataset.xhPortalShell).toBe('')
    expect(shell.parentElement?.id).toBe('xh-portal-root')
    expect(shell.dataset.theme).toBe('dark')
    expect(roots.every(root => root.closest('section') === null)).toBe(true)
    expect(roots[2]!.dataset.position).toBe('anchored')
    expect(getLayerRegistry(document).top()?.isModal()).toBe(true)

    element.value = 1
    await settle()
    expect(roots.every(root => root.parentElement === shell)).toBe(true)
    expect(roots[2]!.dataset.position).toBe('center')
    expect(roots[1]!.hidden).toBe(true)

    element.value = 0
    await settle()
    element.open = false
    await settle()
    expect(roots.every(root => root.parentElement === shell)).toBe(true)

    for (const node of [content, roots[0]!, roots[1]!]) {
      const animations = finiteAnimations(node)
      expect(animations).toHaveLength(1)
      animations[0]!.finish()
      await settle()
    }

    for (const slot of slots) {
      expect(slot.root.parentNode).toBe(slot.parent)
      expect(slot.root.previousSibling).toBe(slot.previous)
      expect(slot.root.nextSibling).toBe(slot.next)
    }
    expect(shell.isConnected).toBe(false)
  })
})
