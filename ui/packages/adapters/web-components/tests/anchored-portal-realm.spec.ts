// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

type Scope = 'select' | 'cascader' | 'combobox' | 'tree-select'

interface OverlayElement extends HTMLElement {
  open?: boolean
  updateComplete: Promise<unknown>
}

defineXhElements()

function markup(scope: Scope): string {
  if (scope === 'select')
    return `<xh-select open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="list"></div></div></div></xh-select>`
  if (scope === 'cascader')
    return `<xh-cascader open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"></div></div></xh-cascader>`
  if (scope === 'combobox')
    return `<xh-combobox open><div data-xh-part="control"><input data-xh-part="input"></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></xh-combobox>`
  return `<xh-tree-select open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div></xh-tree-select>`
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<OverlayElement>('xh-select, xh-cascader, xh-combobox, xh-tree-select'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['select', 'cascader', 'combobox', 'tree-select'] as const)('wc %s Portal 所属 realm', (scope) => {
  it('已打开并建立 Portal 后 adopt 到 iframe，只在宿主当前 Document 重建 positioner 租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const stage = document.createElement('section')
    stage.innerHTML = markup(scope)
    document.body.append(stage)
    const element = stage.firstElementChild as OverlayElement
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
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
    expect(element.contains(positioner)).toBe(true)
    frame.remove()
  })
})
