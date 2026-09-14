// @vitest-environment jsdom

import type { XhTourElement } from '../src/elements/tour'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

type Scope = 'popover' | 'popconfirm' | 'tour'

interface OverlayElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

defineXhElements()

function markup(scope: Scope): string {
  if (scope === 'popover') {
    return `<xh-popover open modal>
      <button data-xh-part="trigger"></button>
      <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
    </xh-popover>`
  }
  if (scope === 'popconfirm') {
    return `<xh-popconfirm open>
      <div data-xh-part="root"><button data-xh-part="trigger"></button>
        <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
      </div>
    </xh-popconfirm>`
  }
  return `<button id="tour-realm-target"></button><xh-tour open>
    <div data-xh-part="root">
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="spotlight"></div>
      <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
    </div>
  </xh-tour>`
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<OverlayElement>('xh-popover, xh-popconfirm, xh-tour'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['popover', 'popconfirm', 'tour'] as const)('wc %s Portal 所属 realm', (scope) => {
  it('已打开并建立 Portal 后 adopt 到 iframe，只在宿主当前 Document 重建租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const stage = document.createElement('section')
    stage.innerHTML = markup(scope)
    const element = stage.querySelector<OverlayElement>(`xh-${scope}`)!
    const roots = scope === 'tour'
      ? ['backdrop', 'spotlight', 'positioner'].map(part => element.querySelector<HTMLElement>(`[data-xh-part="${part}"]`)!)
      : [element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!]
    if (scope === 'tour') {
      ;(element as XhTourElement).steps = [
        { id: 'one', target: '#tour-realm-target', title: '第一步' },
      ]
    }
    document.body.append(stage)
    await settle(document)

    const originalShell = roots[0]!.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!
    expect(roots.every(root => root.parentElement === originalShell)).toBe(true)
    expect(originalShell.parentElement).toBe(originalRoot)

    stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(stage))
    await settle(frameDoc)

    const shell = roots[0]!.parentElement!
    expect(roots.every(root => root.parentElement === shell)).toBe(true)
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()

    element.open = false
    await settle(frameDoc)
    expect(roots.every(root => element.contains(root))).toBe(true)
    frame.remove()
  })
})
