// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface CommandElement extends HTMLElement {
  open: boolean
  updateComplete: Promise<unknown>
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<CommandElement>('xh-command'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wc command Portal 所属 realm', () => {
  it('打开后 adopt 到 iframe，只在宿主当前 Document 重建双根租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-command open>
      <button data-xh-part="trigger">命令</button>
      <div data-xh-part="backdrop"></div>
      <div data-xh-part="positioner"><div data-xh-part="content"><input data-xh-part="input"><div data-xh-part="list"></div></div></div>
    </xh-command>`
    const element = stage.firstElementChild as CommandElement
    const backdrop = element.querySelector<HTMLElement>('[data-xh-part="backdrop"]')!
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    document.body.append(stage)
    await settle(document)

    const originalShell = backdrop.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!
    expect(originalShell).toBe(positioner.parentElement)
    expect(originalShell.parentElement).toBe(originalRoot)

    stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(stage))
    await settle(frameDoc)

    const shell = backdrop.parentElement!
    expect(shell).toBe(positioner.parentElement)
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()
    frame.remove()
  })
})
