// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface Updatable extends HTMLElement {
  updateComplete: Promise<unknown>
}

interface SideNavElement extends Updatable {
  collection: Array<{ value: string, children: Array<{ value: string }> }>
}

async function settle(doc: Document): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await Promise.resolve()
    for (const element of doc.querySelectorAll<Updatable>('xh-pagination, xh-side-nav'))
      await element.updateComplete
  }
  await new Promise(resolve => setTimeout(resolve, 0))
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('wc pagination 与 side-nav Portal 所属 realm', () => {
  it('pagination 省略位 adopt 后在新 Document 重建锚定租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-pagination count="2000" default-page="100"><nav data-xh-part="root">
      <button data-xh-part="item" value="100">100</button><button data-xh-part="ellipsis-trigger" side="start">更多</button>
      <div data-xh-part="positioner"><div data-xh-part="content"></div></div>
    </nav></xh-pagination>`
    const element = stage.firstElementChild as Updatable
    const trigger = element.querySelector<HTMLElement>('[data-xh-part="ellipsis-trigger"]')!
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    document.body.append(stage)
    await settle(document)
    trigger.click()
    await settle(document)
    const originalShell = positioner.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!

    stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(stage))
    await settle(frameDoc)
    trigger.click()
    await settle(frameDoc)

    const shell = positioner.parentElement!
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()
    frame.remove()
  })

  it('side-nav popout adopt 后在新 Document 重建锚定租约', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    const stage = document.createElement('section')
    stage.innerHTML = `<xh-side-nav collapsed><nav data-xh-part="root"><ul data-xh-part="list"><li data-xh-part="branch" value="products">
      <button data-xh-part="branch-trigger">产品</button><div data-xh-part="positioner"><ul data-xh-part="branch-content"><li data-xh-part="item"><a data-xh-part="link" value="product-a">产品一</a></li></ul></div>
    </li></ul></nav></xh-side-nav>`
    const element = stage.firstElementChild as SideNavElement
    element.collection = [{ value: 'products', children: [{ value: 'product-a' }] }]
    const trigger = element.querySelector<HTMLElement>('[data-xh-part="branch-trigger"]')!
    const positioner = element.querySelector<HTMLElement>('[data-xh-part="positioner"]')!
    document.body.append(stage)
    await settle(document)
    trigger.click()
    await settle(document)
    const originalShell = positioner.parentElement!
    const originalRoot = document.getElementById('xh-portal-root')!

    stage.remove()
    frameDoc.body.append(frameDoc.adoptNode(stage))
    await settle(frameDoc)
    trigger.click()
    await settle(frameDoc)

    const shell = positioner.parentElement!
    expect(shell.ownerDocument).toBe(frameDoc)
    expect(shell.parentElement).toBe(frameDoc.getElementById('xh-portal-root'))
    expect(originalShell.isConnected).toBe(false)
    expect(originalRoot.querySelector('[data-xh-portal-shell]')).toBeNull()
    frame.remove()
  })
})
