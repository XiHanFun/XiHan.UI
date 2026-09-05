// @vitest-environment jsdom

import type { Layer, LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it } from 'vitest'
import { createDismissLayer } from '../src/behavior/dismissable-layer'
import { createCounterIdGenerator, createLayerRegistry, createRuntimeConfig, createScope, DATA_INERT_EXEMPT } from '../src/kernel'

interface Harness {
  config: RuntimeConfig
  registry: LayerRegistry
  layer: Layer
  content: HTMLElement
  exempt: HTMLElement
  inExempt: HTMLButtonElement
  outside: HTMLButtonElement
  reasons: string[]
}

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const fn of cleanups.splice(0)) fn()
  document.body.innerHTML = ''
})

/** 消解层的监听器排在微任务与 0ms 定时器上，装好之前发事件没人接。 */
async function settle(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 1))
}

function setup(): Harness {
  const content = document.createElement('div')
  document.body.appendChild(content)

  const outside = document.createElement('button')
  document.body.appendChild(outside)

  // 通知队列：原地渲染，带豁免标记
  const exempt = document.createElement('div')
  exempt.setAttribute(DATA_INERT_EXEMPT, '')
  const inExempt = document.createElement('button')
  exempt.appendChild(inExempt)
  document.body.appendChild(exempt)

  const registry = createLayerRegistry(document)
  const { layer, dispose } = registry.register({
    kind: 'modal',
    node: () => content,
    branches: () => [],
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  })
  cleanups.push(dispose)

  const config = createRuntimeConfig({
    scope: createScope(null, createCounterIdGenerator()),
    layerRegistry: registry,
  })

  const reasons: string[] = []
  const dismiss = createDismissLayer({
    config,
    layer,
    onDismiss: reason => reasons.push(reason),
  })
  cleanups.push(() => dismiss.dispose())

  return { config, registry, layer, content, exempt, inExempt, outside, reasons }
}

function pointerDown(el: Element): void {
  el.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }))
}

describe('消解层对 inert 豁免子树的处理', () => {
  it('点豁免子树内的元素不消解', async () => {
    const h = setup()
    await settle()
    pointerDown(h.inExempt)
    expect(h.reasons).toEqual([])
  })

  it('焦点落进豁免子树不消解', async () => {
    const h = setup()
    await settle()
    h.inExempt.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
    expect(h.reasons).toEqual([])
  })

  it('点真正的层外元素照旧消解', async () => {
    const h = setup()
    await settle()
    pointerDown(h.outside)
    expect(h.reasons).toEqual(['pointer-down-outside'])
  })
})
