// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

type Scope = 'select' | 'cascader' | 'combobox' | 'tree-select' | 'date-picker' | 'time-picker' | 'mention' | 'color-picker'

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
  if (scope === 'date-picker')
    return `<xh-date-picker open><div data-xh-part="control"></div><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="calendar"></div></div></div></xh-date-picker>`
  if (scope === 'time-picker')
    return `<xh-time-picker open default-value="09:30"><div data-xh-part="root"><div data-xh-part="control"><span data-xh-part="segment" segment="hour"></span><button data-xh-part="trigger"></button></div><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-time-picker>`
  if (scope === 'mention')
    return `<xh-mention><div data-xh-part="root"><input data-xh-part="input"><div data-xh-part="positioner"><div data-xh-part="content"></div></div></div></xh-mention>`
  if (scope === 'color-picker')
    return `<xh-color-picker open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="saturation-area"><span data-xh-part="area-thumb"></span></div></div></div></xh-color-picker>`
  return `<xh-tree-select open><button data-xh-part="trigger"></button><div data-xh-part="positioner"><div data-xh-part="content"><div data-xh-part="tree"></div></div></div></xh-tree-select>`
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<OverlayElement>('xh-select, xh-cascader, xh-combobox, xh-tree-select, xh-date-picker, xh-time-picker, xh-mention, xh-color-picker'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

function openMention(element: OverlayElement): void {
  const input = element.querySelector<HTMLInputElement>('[data-xh-part="input"]')!
  input.value = '@a'
  input.setSelectionRange(2, 2)
  const EventCtor = element.ownerDocument.defaultView!.Event
  input.dispatchEvent(new EventCtor('input', { bubbles: true }))
}

function close(scope: Scope, element: OverlayElement): void {
  if (scope !== 'mention') {
    element.open = false
    return
  }
  const doc = element.ownerDocument
  const KeyboardEventCtor = doc.defaultView!.KeyboardEvent
  doc.body.dispatchEvent(new KeyboardEventCtor('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe.each(['select', 'cascader', 'combobox', 'tree-select', 'date-picker', 'time-picker', 'mention', 'color-picker'] as const)('wc %s Portal 所属 realm', (scope) => {
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
    if (scope === 'mention') {
      openMention(element)
      await settle(document)
    }
    const originalShell = positioner.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!
    expect(originalShell.parentElement).toBe(originalRoot)

    stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(stage))
    await settle(frameDoc)
    if (scope === 'mention') {
      openMention(element)
      await settle(frameDoc)
    }

    const shell = positioner.parentElement!
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(positioner.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()

    close(scope, element)
    await settle(frameDoc)
    expect(element.contains(positioner)).toBe(true)
    frame.remove()
  })
})
