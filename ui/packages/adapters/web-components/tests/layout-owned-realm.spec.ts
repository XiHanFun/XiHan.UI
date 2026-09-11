// @vitest-environment jsdom

import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../src/define'

defineXhElements()

interface UpdatableLayout extends HTMLElement {
  updateComplete: Promise<unknown>
}

async function settle(el: UpdatableLayout): Promise<void> {
  await el.updateComplete
  await Promise.resolve()
  await el.updateComplete
}

function makeLayout(): UpdatableLayout {
  const el = document.createElement('xh-layout') as UpdatableLayout
  el.setAttribute('sider-presentation', 'sheet')
  el.innerHTML = [
    '<div data-xh-part="root">',
    '<button data-xh-part="sider-trigger">侧栏</button>',
    '<div data-xh-part="sider">导航</div>',
    '<main data-xh-part="content">正文</main>',
    '</div>',
  ].join('')
  return el
}

function rootOf(el: UpdatableLayout): HTMLElement {
  return el.querySelector<HTMLElement>('[data-xh-part="root"]')!
}

function escape(doc: Document): void {
  const win = doc.defaultView!
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
}

afterEach(async () => {
  document.body.innerHTML = ''
  await Promise.resolve()
})

describe('xh-layout 的运行时层栈与所属 Document', () => {
  it('默认运行时层栈有上层浮层时先让位，退栈后下一次 Escape 才收侧栏', async () => {
    const layout = makeLayout()
    document.body.append(layout)
    await settle(layout)

    const layerNode = document.createElement('div')
    document.body.append(layerNode)
    const { dispose } = getLayerRegistry(document).register({
      kind: 'modal',
      node: () => layerNode,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      surfaces: () => [],
    })

    try {
      escape(document)
      await settle(layout)
      expect(rootOf(layout).hasAttribute('data-collapsed')).toBe(false)

      dispose()
      escape(document)
      await settle(layout)
      expect(rootOf(layout).hasAttribute('data-collapsed')).toBe(true)
    }
    finally {
      dispose()
      layout.remove()
      layerNode.remove()
    }
  })

  it('adopt 到 iframe 后只监听新 Document，并改读新 Document 的默认层栈', async () => {
    const layout = makeLayout()
    document.body.append(layout)
    await settle(layout)

    const frame = document.createElement('iframe')
    document.body.append(frame)
    const frameDoc = frame.contentDocument!
    frameDoc.body.append(frameDoc.adoptNode(layout))
    await settle(layout)

    const layerNode = frameDoc.createElement('div')
    frameDoc.body.append(layerNode)
    const { dispose } = getLayerRegistry(frameDoc).register({
      kind: 'modal',
      node: () => layerNode,
      branches: () => [],
      isModal: () => true,
      setModal: () => {},
      surfaces: () => [],
    })

    try {
      escape(document)
      await settle(layout)
      expect(rootOf(layout).hasAttribute('data-collapsed')).toBe(false)

      escape(frameDoc)
      await settle(layout)
      expect(rootOf(layout).hasAttribute('data-collapsed')).toBe(false)

      dispose()
      escape(frameDoc)
      await settle(layout)
      expect(rootOf(layout).hasAttribute('data-collapsed')).toBe(true)
    }
    finally {
      dispose()
      layout.remove()
      layerNode.remove()
      frame.remove()
    }
  })
})
