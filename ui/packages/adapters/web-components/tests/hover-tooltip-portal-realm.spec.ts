// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface OverlayElement extends HTMLElement {
  open: boolean
  updateComplete: Promise<unknown>
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<OverlayElement>('xh-hover-card, xh-tooltip'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['hover-card', 'tooltip'] as const)('wc %s Portal 所属 realm', (scope) => {
  it('打开后 adopt 到 iframe，只在宿主当前 Document 重建租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-${scope} open><button data-xh-part="trigger"></button><i data-before></i><div data-xh-part="positioner"><div data-xh-part="content"></div></div><i data-after></i></xh-${scope}>`
    const element = stage.firstElementChild as OverlayElement
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    const originalParent = positioner.parentNode
    const originalPrevious = positioner.previousSibling
    const originalNext = positioner.nextSibling
    document.body.append(stage)
    await settle(document)

    const originalShell = positioner.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!
    expect(originalShell.parentElement).toBe(originalRoot)

    stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(stage))
    await settle(frameDoc)

    const shell = positioner.parentElement!
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(positioner.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()

    element.open = false
    await settle(frameDoc)
    expect(positioner.parentNode).toBe(originalParent)
    expect(positioner.previousSibling).toBe(originalPrevious)
    expect(positioner.nextSibling).toBe(originalNext)
    frame.remove()
  })
})
