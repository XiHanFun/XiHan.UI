import type { App } from 'vue'
import { getLayerRegistry } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'

let app: App | null = null
let host: HTMLElement | null = null

async function settle(): Promise<void> {
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
  await nextTick()
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    render: () => h(XhFloatButtonRoot, null, () => [
      h(XhFloatButtonTrigger, null, () => '操作'),
      h(XhFloatButtonList, null, () => h('button', { type: 'button' }, '编辑')),
    ]),
  })
  app.mount(host)
  await settle()
}

function trigger(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('[data-scope=\'float-button\'][data-part=\'trigger\']')!
}

function list(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope=\'float-button\'][data-part=\'list\']')!
}

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('vue FloatButton 全局消解', () => {
  it('真实 pointerdown 与全局 Escape 均收起，并在关闭/卸载后零 Layer 残留', async () => {
    await mount()
    const outside = document.createElement('button')
    document.body.append(outside)

    trigger().click()
    await settle()
    expect(list().hidden).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
    await settle()
    expect(list().hidden).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(0)

    trigger().click()
    await settle()
    outside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    await settle()
    expect(list().hidden).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(0)

    trigger().click()
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    app!.unmount()
    app = null
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
