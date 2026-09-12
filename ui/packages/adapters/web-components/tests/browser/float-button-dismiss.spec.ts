import { getLayerRegistry, setDiagnosticsLevel } from '@xihan-ui/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineXhElements } from '../../src/define'

interface FloatButtonElement extends HTMLElement {
  updateComplete: Promise<unknown>
}

defineXhElements()

async function settle(element: FloatButtonElement): Promise<void> {
  for (let round = 0; round < 3; round++) {
    await Promise.resolve()
    await element.updateComplete
  }
}

function mount(): FloatButtonElement {
  const host = document.createElement('div')
  host.innerHTML = `<xh-float-button>
    <div data-xh-part="root">
      <button data-xh-part="trigger">操作</button>
      <div data-xh-part="list"><button type="button">编辑</button></div>
    </div>
  </xh-float-button>`
  document.body.append(host)
  return host.firstElementChild as FloatButtonElement
}

beforeEach(() => setDiagnosticsLevel('silent'))
afterEach(() => {
  document.body.innerHTML = ''
  setDiagnosticsLevel('warn')
})

describe('web components FloatButton 全局消解', () => {
  it('真实 pointerdown 与全局 Escape 均收起，并在关闭/卸载后零 Layer 残留', async () => {
    const element = mount()
    const outside = document.createElement('button')
    document.body.append(outside)
    await settle(element)
    const trigger = element.querySelector<HTMLButtonElement>('[data-xh-part="trigger"]')!
    const list = element.querySelector<HTMLElement>('[data-xh-part="list"]')!

    trigger.click()
    await settle(element)
    expect(list.hidden).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
    await settle(element)
    expect(list.hidden).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(0)

    trigger.click()
    await settle(element)
    outside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle(element)
    expect(list.hidden).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(0)

    trigger.click()
    await settle(element)
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    element.remove()
    await Promise.resolve()
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
