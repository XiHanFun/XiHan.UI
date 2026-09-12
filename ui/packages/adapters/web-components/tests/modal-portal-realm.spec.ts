// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type OverlayScope = 'dialog' | 'drawer'

interface OverlayElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

async function settle(doc: Document = document): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const el of doc.querySelectorAll<OverlayElement>('xh-dialog, xh-drawer'))
      await el.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

function mount(scope: OverlayScope): {
  readonly stage: HTMLElement
  readonly element: OverlayElement
  readonly backdrop: HTMLElement
  readonly positioner: HTMLElement
} {
  const stage = document.createElement('section')
  stage.innerHTML = scope === 'dialog'
    ? `<xh-dialog><div data-xh-part="backdrop"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></xh-dialog>`
    : `<xh-drawer><div data-xh-part="root"><div data-xh-part="backdrop"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-drawer>`
  document.body.append(stage)
  const element = stage.querySelector<OverlayElement>(`xh-${scope}`)!
  return {
    stage,
    element,
    backdrop: element.querySelector<HTMLElement>('[data-xh-part="backdrop"]')!,
    positioner: element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!,
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['dialog', 'drawer'] as const)('wc %s Portal 所属 realm', (scope) => {
  it('adopt 到 iframe 后只在宿主当前 Document 建立双根 Portal', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const f = mount(scope)
    await settle()

    f.stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(f.stage))
    await settle(frameDoc)
    f.element.open = true
    await settle(frameDoc)

    const shell = f.backdrop.parentElement!
    expect(shell).toBe(f.positioner.parentElement)
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(document.getElementById('xh-portal-root')).toBeNull()
    frame.remove()
  })
})
