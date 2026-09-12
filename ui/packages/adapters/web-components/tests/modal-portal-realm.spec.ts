// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

type OverlayScope = 'dialog' | 'drawer' | 'image-viewer'

interface OverlayElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

async function settle(doc: Document = document): Promise<void> {
  for (let round = 0; round < 4; round++) {
    await Promise.resolve()
    for (const el of doc.querySelectorAll<OverlayElement>('xh-dialog, xh-drawer, xh-image-viewer'))
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
    : scope === 'drawer'
      ? `<xh-drawer><div data-xh-part="root"><div data-xh-part="backdrop"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-drawer>`
      : `<xh-image-viewer><div data-xh-part="backdrop"></div><div data-xh-part="positioner"><div data-xh-part="content"><img data-xh-part="image"></div></div></xh-image-viewer>`
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

describe.each(['dialog', 'drawer', 'image-viewer'] as const)('wc %s Portal 所属 realm', (scope) => {
  it('已打开并建立 Portal 后 adopt 到 iframe，只在宿主当前 Document 重建双根 Portal', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const f = mount(scope)
    f.element.open = true
    await settle()
    const originalShell = f.backdrop.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!
    expect(originalShell).toBe(f.positioner.parentElement)
    expect(originalShell.parentElement).toBe(originalRoot)

    f.stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(f.stage))
    await settle(frameDoc)

    const shell = f.backdrop.parentElement!
    expect(shell).toBe(f.positioner.parentElement)
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()
    frame.remove()
  })
})
