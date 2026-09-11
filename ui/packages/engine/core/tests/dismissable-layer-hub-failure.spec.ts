// @vitest-environment jsdom
import type { DismissReason } from '../src/behavior/dismissable-layer'
import type { Disposable, LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDismissLayer } from '../src/behavior/dismissable-layer'
import {
  createCounterIdGenerator,
  createLayerRegistry,
  createRuntimeConfig,
  createScope,
} from '../src/kernel'

interface Entry {
  readonly dismiss: Disposable
  readonly reasons: DismissReason[]
  readonly disposeLayer: () => void
}

const cleanups: Array<() => void> = []

function configFor(registry: LayerRegistry): RuntimeConfig {
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(registry.ownerDocument.body, idGenerator)
  return createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
}

function entry(
  registry: LayerRegistry,
  options: {
    autoPop?: boolean
    onPointerDownOutside?: () => void
  } = {},
): Entry {
  const node = registry.ownerDocument.createElement('div')
  registry.ownerDocument.body.append(node)
  const registration = registry.register({
    kind: 'popover',
    node: () => node,
    branches: () => [],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  })
  const reasons: DismissReason[] = []
  let dismiss: Disposable | null = null
  dismiss = createDismissLayer({
    config: configFor(registry),
    layer: registration.layer,
    onPointerDownOutside: options.onPointerDownOutside,
    onDismiss: (reason) => {
      reasons.push(reason)
      if (options.autoPop ?? true) {
        dismiss!.dispose()
        registration.dispose()
      }
    },
  })
  cleanups.push(() => node.remove(), registration.dispose, () => dismiss?.dispose())
  return { dismiss, reasons, disposeLayer: registration.dispose }
}

async function arm(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function pointerDown(): void {
  const target = document.createElement('button')
  document.body.append(target)
  cleanups.push(() => target.remove())
  target.dispatchEvent(new window.Event('pointerdown', { bubbles: true, composed: true }) as PointerEvent)
}

function captureRuntimeError(action: () => void): unknown {
  let failure: unknown = null
  const onError = (event: ErrorEvent): void => {
    failure = event.error
    event.preventDefault()
  }
  window.addEventListener('error', onError)
  try {
    action()
  }
  finally {
    window.removeEventListener('error', onError)
  }
  return failure
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('dismissableLayer Hub 故障隔离', () => {
  it('一条 lane 的表决异常不阻断其他 registry lane', async () => {
    const voteError = new Error('first lane failed')
    const first = entry(createLayerRegistry(document), {
      autoPop: false,
      onPointerDownOutside: () => {
        throw voteError
      },
    })
    const secondRegistry = createLayerRegistry(document)
    const second = entry(secondRegistry)
    await arm()

    const runtimeError = captureRuntimeError(pointerDown)

    expect(runtimeError).toBe(voteError)
    expect(first.reasons).toEqual([])
    expect(second.reasons).toEqual(['pointer-down-outside'])
    expect(secondRegistry.list()).toEqual([])
  })

  it('一条 lane 的动态 node 规划异常不阻断其他 registry lane', async () => {
    const nodeError = new Error('node failed')
    const firstRegistry = createLayerRegistry(document)
    const firstNode = document.createElement('div')
    document.body.append(firstNode)
    let failNode = false
    const firstRegistration = firstRegistry.register({
      kind: 'popover',
      node: () => {
        if (failNode)
          throw nodeError
        return firstNode
      },
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    const firstDismiss = createDismissLayer({
      config: configFor(firstRegistry),
      layer: firstRegistration.layer,
      onDismiss: () => {},
    })
    cleanups.push(() => firstNode.remove(), firstRegistration.dispose, () => firstDismiss.dispose())
    const secondRegistry = createLayerRegistry(document)
    const second = entry(secondRegistry)
    await arm()
    failNode = true

    const runtimeError = captureRuntimeError(pointerDown)

    expect(runtimeError).toBe(nodeError)
    expect(second.reasons).toEqual(['pointer-down-outside'])
    expect(secondRegistry.list()).toEqual([])
  })

  it('多条 lane 同时失败时按 lane 顺序聚合并以首错为 cause', async () => {
    const firstError = new Error('first lane failed')
    const secondError = new Error('second lane failed')
    entry(createLayerRegistry(document), {
      autoPop: false,
      onPointerDownOutside: () => {
        throw firstError
      },
    })
    entry(createLayerRegistry(document), {
      autoPop: false,
      onPointerDownOutside: () => {
        throw secondError
      },
    })
    await arm()

    const runtimeError = captureRuntimeError(pointerDown) as AggregateError

    expect(runtimeError).toBeInstanceOf(AggregateError)
    expect(runtimeError.errors).toEqual([firstError, secondError])
    expect(runtimeError.cause).toBe(firstError)
  })

  it('派发中最后参与者释放延迟到 finally，表决与卸载异常完整聚合', async () => {
    const callbackError = new Error('vote failed')
    const focusError = new Error('focus remove failed')
    const keyError = new Error('key remove failed')
    let current: Entry | null = null
    current = entry(createLayerRegistry(document), {
      autoPop: false,
      onPointerDownOutside: () => {
        current!.dismiss.dispose()
        throw callbackError
      },
    })
    await arm()
    const order: string[] = []
    const nativeRemove = document.removeEventListener.bind(document)
    vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(String(type))
      nativeRemove(type, listener, options)
      if (type === 'focusin')
        throw focusError
      if (type === 'keydown')
        throw keyError
    })

    const runtimeError = captureRuntimeError(pointerDown) as AggregateError

    expect(runtimeError).toBeInstanceOf(AggregateError)
    expect(runtimeError.errors).toEqual([callbackError, focusError, keyError])
    expect(runtimeError.cause).toBe(callbackError)
    expect(order).toEqual(['focusin', 'pointerdown', 'keydown'])
  })

  it('已有参与者时新 lane 的 queue 失败只回滚自己，不拆共享 Hub', async () => {
    const first = entry(createLayerRegistry(document), { autoPop: false })
    await arm()
    const remove = vi.spyOn(document, 'removeEventListener')
    const queueError = new Error('queue failed')
    vi.spyOn(window, 'queueMicrotask').mockImplementation(() => {
      throw queueError
    })

    const secondRegistry = createLayerRegistry(document)
    const node = document.createElement('div')
    document.body.append(node)
    const registration = secondRegistry.register({
      kind: 'popover',
      node: () => node,
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    cleanups.push(() => node.remove(), registration.dispose)

    expect(() => createDismissLayer({
      config: configFor(secondRegistry),
      layer: registration.layer,
      onDismiss: () => {},
    })).toThrow(queueError)
    expect(remove).not.toHaveBeenCalled()

    pointerDown()
    expect(first.reasons).toEqual(['pointer-down-outside'])
  })
})
