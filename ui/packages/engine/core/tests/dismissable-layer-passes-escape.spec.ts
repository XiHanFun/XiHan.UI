// @vitest-environment jsdom
import type { LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDismissLayer, createEscapeFallback } from '../src/behavior/dismissable-layer'
import {
  createCounterIdGenerator,
  createLayerRegistry,
  createRuntimeConfig,
  createScope,
} from '../src/kernel'

const cleanups: Array<() => void> = []

function configFor(registry: LayerRegistry): RuntimeConfig {
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(registry.ownerDocument.body, idGenerator)
  return createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
}

function register(registry: LayerRegistry, passesEscape?: boolean) {
  const node = document.createElement('div')
  document.body.append(node)
  const registration = registry.register({
    kind: passesEscape ? 'inline' : 'popover',
    node: () => node,
    branches: () => [],
    isModal: () => false,
    surfaces: () => [],
    passesEscape,
  })
  cleanups.push(() => node.remove(), registration.dispose)
  return registration
}

function dismissable(registry: LayerRegistry) {
  const registration = register(registry)
  const onDismiss = vi.fn()
  const dismiss = createDismissLayer({ config: configFor(registry), layer: registration.layer, onDismiss })
  cleanups.push(dismiss.dispose)
  return onDismiss
}

function escape(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  document.dispatchEvent(event)
  return event
}

async function arm(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('passesEscape 的层', () => {
  it('压在可消解的层上时 Escape 越过它，交给下面的层', async () => {
    const registry = createLayerRegistry(document)
    const onDismiss = dismissable(registry)
    register(registry, true)
    await arm()
    escape()
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  it('没登记的层照旧挡住下面的层', async () => {
    const registry = createLayerRegistry(document)
    const onDismiss = dismissable(registry)
    register(registry)
    await arm()
    escape()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('栈里只剩这类层时 Escape 落到页面兜底', async () => {
    const registry = createLayerRegistry(document)
    const onEscape = vi.fn()
    const fallback = createEscapeFallback({ config: configFor(registry), isEnabled: () => true, onEscape })
    cleanups.push(fallback.dispose)
    register(registry, true)
    await arm()
    escape()
    expect(onEscape).toHaveBeenCalledOnce()
  })
})
