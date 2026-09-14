import type { Root } from 'react-dom/client'
import { getLayerRegistry } from '@xihan-ui/core'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { XhFloatButtonList, XhFloatButtonRoot, XhFloatButtonTrigger } from '../../src'

const globals = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
let root: Root | null = null
let host: HTMLElement | null = null

async function inAct(fn: () => void | Promise<void>): Promise<void> {
  const previous = globals.IS_REACT_ACT_ENVIRONMENT
  globals.IS_REACT_ACT_ENVIRONMENT = true
  try {
    await act(fn)
  }
  finally {
    globals.IS_REACT_ACT_ENVIRONMENT = previous
  }
}

async function settle(): Promise<void> {
  await inAct(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

async function mount(): Promise<void> {
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
  await inAct(() => root!.render(
    <XhFloatButtonRoot>
      <XhFloatButtonTrigger>操作</XhFloatButtonTrigger>
      <XhFloatButtonList><button type="button">编辑</button></XhFloatButtonList>
    </XhFloatButtonRoot>,
  ))
  await settle()
}

function trigger(): HTMLButtonElement {
  return document.querySelector<HTMLButtonElement>('[data-scope=\'float-button\'][data-part=\'trigger\']')!
}

function list(): HTMLElement {
  return document.querySelector<HTMLElement>('[data-scope=\'float-button\'][data-part=\'list\']')!
}

afterEach(async () => {
  if (root)
    await inAct(() => root!.unmount())
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('react FloatButton 全局消解', () => {
  it('真实 pointerdown 与全局 Escape 均收起，并在关闭/卸载后零 Layer 残留', async () => {
    await mount()
    const outside = document.createElement('button')
    document.body.append(outside)

    await inAct(() => trigger().click())
    await settle()
    expect(list().hidden).toBe(false)
    expect(getLayerRegistry(document).list()).toHaveLength(1)

    await inAct(() => {
      outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
    })
    await settle()
    expect(list().hidden).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(0)

    await inAct(() => trigger().click())
    await settle()
    await inAct(() => {
      outside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }))
    })
    await settle()
    expect(list().hidden).toBe(true)
    expect(getLayerRegistry(document).list()).toHaveLength(0)

    await inAct(() => trigger().click())
    await settle()
    expect(getLayerRegistry(document).list()).toHaveLength(1)
    await inAct(() => root!.unmount())
    root = null
    expect(getLayerRegistry(document).list()).toHaveLength(0)
  })
})
