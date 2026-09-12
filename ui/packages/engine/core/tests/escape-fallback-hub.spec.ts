// @vitest-environment jsdom
import type { Disposable, Layer, LayerRegistry, RuntimeConfig } from '../src/kernel'
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

function fallback(
  registry: LayerRegistry,
  onEscape: (event: KeyboardEvent) => void = () => {},
  isEnabled: () => boolean = () => true,
): Disposable {
  const handle = createEscapeFallback({ config: configFor(registry), isEnabled, onEscape })
  cleanups.push(handle.dispose)
  return handle
}

function layer(registry: LayerRegistry): { layer: Layer, dispose: () => void } {
  const node = registry.ownerDocument.createElement('div')
  registry.ownerDocument.body.append(node)
  const registration = registry.register({
    kind: 'popover',
    node: () => node,
    branches: () => [],
    isModal: () => false,
    surfaces: () => [],
  })
  cleanups.push(() => node.remove(), registration.dispose)
  return registration
}

function target(doc: Document = document): HTMLButtonElement {
  const button = doc.createElement('button')
  doc.body.append(button)
  cleanups.push(() => button.remove())
  return button
}

function escape(target: Document | Element = document): KeyboardEvent {
  const doc = target.nodeType === 9 ? target as Document : (target as Element).ownerDocument
  const event = new doc.defaultView!.KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  })
  target.dispatchEvent(event)
  return event
}

function listenerShape(calls: ArrayLike<readonly unknown[]>): string[] {
  return Array.from(calls, ([type, , options]) => `${String(type)}:${options === true ? 'capture' : 'bubble'}`)
}

function captureRuntimeErrors(action: () => void, win: Window = window): unknown[] {
  const errors: unknown[] = []
  const onError = (event: ErrorEvent): void => {
    errors.push(event.error)
    event.preventDefault()
  }
  win.addEventListener('error', onError)
  try {
    action()
  }
  finally {
    win.removeEventListener('error', onError)
  }
  return errors
}

async function armDismissLayer(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('escape fallback Hub 路由', () => {
  it('fallback 与 Dismiss participant 共用一套四监听和统一租约', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const fallbackHandle = fallback(createLayerRegistry(document))
    const registry = createLayerRegistry(document)
    const registration = layer(registry)
    const dismiss = createDismissLayer({
      config: configFor(registry),
      layer: registration.layer,
      onDismiss: () => {},
    })
    cleanups.push(dismiss.dispose)

    expect(listenerShape(add.mock.calls)).toEqual([
      'keydown:capture',
      'pointerdown:capture',
      'focusin:capture',
      'keydown:bubble',
    ])
    fallbackHandle.dispose()
    expect(remove).not.toHaveBeenCalled()
    dismiss.dispose()
    expect(listenerShape(remove.mock.calls)).toEqual([
      'keydown:bubble',
      'focusin:capture',
      'pointerdown:capture',
      'keydown:capture',
    ])
  })

  it('从最新 token 反向短路，最新已启用时不读取旧 getter', () => {
    const registry = createLayerRegistry(document)
    const oldEnabled = vi.fn((): boolean => {
      throw new Error('不应读取旧 fallback')
    })
    const oldEscape = vi.fn()
    const newEnabled = vi.fn(() => true)
    const newEscape = vi.fn()
    fallback(registry, oldEscape, oldEnabled)
    fallback(registry, newEscape, newEnabled)

    const event = escape()

    expect(oldEnabled).not.toHaveBeenCalled()
    expect(oldEscape).not.toHaveBeenCalled()
    expect(newEnabled).toHaveBeenCalledTimes(2)
    expect(newEscape).toHaveBeenCalledOnce()
    expect(newEscape).toHaveBeenCalledWith(event)
  })

  it('最新 token 未启用时才继续寻找较早的启用出口', () => {
    const registry = createLayerRegistry(document)
    const oldEscape = vi.fn()
    const newEscape = vi.fn()
    const oldEnabled = vi.fn(() => true)
    const newEnabled = vi.fn(() => false)
    fallback(registry, oldEscape, oldEnabled)
    fallback(registry, newEscape, newEnabled)

    escape()

    expect(newEnabled).toHaveBeenCalledTimes(2)
    expect(oldEnabled).toHaveBeenCalledTimes(2)
    expect(newEscape).not.toHaveBeenCalled()
    expect(oldEscape).toHaveBeenCalledOnce()
  })

  it('fallback 的 isEnabled 与 onEscape 均以裸函数调用并接收同一原生事件', () => {
    const registry = createLayerRegistry(document)
    let receivedEvent: KeyboardEvent | null = null
    function handleEscape(this: unknown, event: KeyboardEvent): void {
      receivedEvent = event
    }
    function readEnabled(this: unknown): boolean {
      return true
    }
    const onEscape = vi.fn(handleEscape)
    const isEnabled = vi.fn(readEnabled)
    fallback(registry, onEscape, isEnabled)

    const event = escape()

    expect(isEnabled.mock.contexts).toEqual([undefined, undefined])
    expect(onEscape.mock.contexts).toEqual([undefined])
    expect(receivedEvent).toBe(event)
  })

  it('dismissableLayer 的 onDismiss 以裸函数调用，不暴露内部 options', async () => {
    const registry = createLayerRegistry(document)
    const registration = layer(registry)
    const dismissRef: { value: Disposable | null } = { value: null }
    function handleDismiss(this: unknown): void {
      dismissRef.value!.dispose()
      registration.dispose()
    }
    const onDismiss = vi.fn(handleDismiss)
    const dismiss = createDismissLayer({
      config: configFor(registry),
      layer: registration.layer,
      onDismiss,
    })
    dismissRef.value = dismiss
    cleanups.push(dismiss.dispose)
    await armDismissLayer()

    escape()

    expect(onDismiss.mock.contexts).toEqual([undefined])
  })

  it('同 lane 最新启用出口不释放时持续占位，释放发生在 target 后本键也不降级', () => {
    const registry = createLayerRegistry(document)
    const lowerEscape = vi.fn()
    const topEscape = vi.fn()
    fallback(registry, lowerEscape)
    const top = fallback(registry, topEscape)

    escape()
    escape()
    expect(topEscape).toHaveBeenCalledTimes(2)
    expect(lowerEscape).not.toHaveBeenCalled()

    const button = target()
    button.addEventListener('keydown', top.dispose, { once: true })
    escape(button)
    expect(lowerEscape).not.toHaveBeenCalled()

    escape(button)
    expect(lowerEscape).toHaveBeenCalledOnce()
  })

  it.each(['preventDefault', 'stopPropagation'] as const)(
    'target %s 时事件不会到达可执行的 Document bubble 出口，下一事件仍可处理',
    (method) => {
      const onEscape = vi.fn()
      fallback(createLayerRegistry(document), onEscape)
      const button = target()
      button.addEventListener('keydown', event => event[method](), { once: true })

      escape(button)
      expect(onEscape).not.toHaveBeenCalled()

      escape(button)
      expect(onEscape).toHaveBeenCalledOnce()
    },
  )

  it('一条 lane 的 fallback preventDefault 不阻断其他 registry lane', () => {
    const first = vi.fn((event: KeyboardEvent) => event.preventDefault())
    const second = vi.fn()
    fallback(createLayerRegistry(document), first)
    fallback(createLayerRegistry(document), second)

    const event = escape()

    expect(event.defaultPrevented).toBe(true)
    expect(first).toHaveBeenCalledOnce()
    expect(second).toHaveBeenCalledOnce()
  })

  it('capture 后启用较新的 token 会让旧计划失效，下一事件才选新出口', () => {
    const registry = createLayerRegistry(document)
    let newerEnabled = false
    const older = vi.fn()
    const newer = vi.fn()
    fallback(registry, older)
    fallback(registry, newer, () => newerEnabled)
    const button = target()
    button.addEventListener('keydown', () => {
      newerEnabled = true
    }, { once: true })

    escape(button)
    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()

    escape(button)
    expect(older).not.toHaveBeenCalled()
    expect(newer).toHaveBeenCalledOnce()
  })

  it('capture 后注册新 token 会使 fallback 快照失效', () => {
    const registry = createLayerRegistry(document)
    const older = vi.fn()
    const newer = vi.fn()
    fallback(registry, older)
    const button = target()
    button.addEventListener('keydown', () => {
      fallback(registry, newer)
    }, { once: true })

    escape(button)
    expect(older).not.toHaveBeenCalled()
    expect(newer).not.toHaveBeenCalled()

    escape(button)
    expect(older).not.toHaveBeenCalled()
    expect(newer).toHaveBeenCalledOnce()
  })

  it('selected fallback dispose 后重建同配置也不能冒充旧 token', () => {
    const keeper = fallback(createLayerRegistry(document), () => {}, () => false)
    const registry = createLayerRegistry(document)
    const oldEscape = vi.fn()
    const replacementEscape = vi.fn()
    const old = fallback(registry, oldEscape)
    let replacement: Disposable | null = null
    const button = target()
    button.addEventListener('keydown', () => {
      old.dispose()
      replacement = fallback(registry, replacementEscape)
    }, { once: true })

    escape(button)
    expect(oldEscape).not.toHaveBeenCalled()
    expect(replacementEscape).not.toHaveBeenCalled()

    escape(button)
    expect(replacement).not.toBeNull()
    expect(replacementEscape).toHaveBeenCalledOnce()
    keeper.dispose()
  })

  it('capture 后 Layer 空栈成功 ABA 会使原 registry snapshot 失效', () => {
    const registry = createLayerRegistry(document)
    const onEscape = vi.fn()
    fallback(registry, onEscape)
    const before = registry.list()
    const button = target()
    button.addEventListener('keydown', () => {
      const registration = layer(registry)
      registration.dispose()
    }, { once: true })

    escape(button)
    expect(registry.list()).not.toBe(before)
    expect(registry.list()).toEqual([])
    expect(onEscape).not.toHaveBeenCalled()

    escape(button)
    expect(onEscape).toHaveBeenCalledOnce()
  })

  it('失败 Layer 登记补偿回同一空 snapshot 时原 fallback 计划仍有效', () => {
    const registry = createLayerRegistry(document)
    const onEscape = vi.fn()
    fallback(registry, onEscape)
    const before = registry.list()
    const notificationError = new Error('登记通知失败')
    const unsubscribe = registry.subscribe(() => {
      throw notificationError
    })
    cleanups.push(unsubscribe)
    const button = target()
    let registrationError: unknown
    button.addEventListener('keydown', () => {
      const node = document.createElement('div')
      document.body.append(node)
      cleanups.push(() => node.remove())
      try {
        registry.register({
          kind: 'popover',
          node: () => node,
          branches: () => [],
          isModal: () => false,
          surfaces: () => [],
        })
      }
      catch (error) {
        registrationError = error
      }
    }, { once: true })

    escape(button)

    expect(registrationError).toBeInstanceOf(AggregateError)
    expect(registry.list()).toBe(before)
    expect(onEscape).toHaveBeenCalledOnce()
  })

  it('capture 时 lane 有无 participant 的 Layer 都消费本次 Escape', () => {
    const registry = createLayerRegistry(document)
    const onEscape = vi.fn()
    fallback(registry, onEscape)
    const registration = layer(registry)
    const button = target()
    button.addEventListener('keydown', registration.dispose, { once: true })

    escape(button)
    expect(onEscape).not.toHaveBeenCalled()

    escape(button)
    expect(onEscape).toHaveBeenCalledOnce()
  })

  it('layer 在 capture 阶段同步退栈后，同一事件 bubble 仍不触发 fallback', async () => {
    const registry = createLayerRegistry(document)
    const fallbackEscape = vi.fn()
    fallback(registry, fallbackEscape)
    const registration = layer(registry)
    let dismiss!: Disposable
    const layerDismiss = vi.fn(() => {
      dismiss.dispose()
      registration.dispose()
    })
    dismiss = createDismissLayer({
      config: configFor(registry),
      layer: registration.layer,
      onDismiss: layerDismiss,
    })
    cleanups.push(dismiss.dispose)
    await armDismissLayer()

    escape()
    expect(layerDismiss).toHaveBeenCalledOnce()
    expect(fallbackEscape).not.toHaveBeenCalled()

    escape()
    expect(fallbackEscape).toHaveBeenCalledOnce()
  })

  it('尚未 armed 的 Layer participant 也凭 Layer 快照消费本次 Escape', () => {
    const registry = createLayerRegistry(document)
    const fallbackEscape = vi.fn()
    fallback(registry, fallbackEscape)
    const registration = layer(registry)
    const layerDismiss = vi.fn()
    const dismiss = createDismissLayer({
      config: configFor(registry),
      layer: registration.layer,
      onDismiss: layerDismiss,
    })
    cleanups.push(dismiss.dispose)

    escape()

    expect(layerDismiss).not.toHaveBeenCalled()
    expect(fallbackEscape).not.toHaveBeenCalled()
  })

  it('fallback callback 抛错不阻断其他 registry lane，末尾原样报告单错', () => {
    const callbackError = new Error('fallback failed')
    const second = vi.fn()
    fallback(createLayerRegistry(document), () => {
      throw callbackError
    })
    fallback(createLayerRegistry(document), second)

    const errors = captureRuntimeErrors(() => escape())

    expect(errors).toEqual([callbackError])
    expect(second).toHaveBeenCalledOnce()
  })

  it('capture 的 isEnabled 抛错时只放弃本 lane，其他 lane 仍执行', () => {
    const enabledError = new Error('capture enabled failed')
    const failedEscape = vi.fn()
    const second = vi.fn()
    fallback(createLayerRegistry(document), failedEscape, () => {
      throw enabledError
    })
    fallback(createLayerRegistry(document), second)

    const errors = captureRuntimeErrors(() => escape())

    expect(errors).toEqual([enabledError])
    expect(failedEscape).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('bubble 的 isEnabled 抛错时只放弃本 lane，其他 lane 仍执行', () => {
    const enabledError = new Error('bubble enabled failed')
    let fail = false
    const failedEscape = vi.fn()
    const second = vi.fn()
    fallback(createLayerRegistry(document), failedEscape, () => {
      if (fail)
        throw enabledError
      return true
    })
    fallback(createLayerRegistry(document), second)
    const button = target()
    button.addEventListener('keydown', () => {
      fail = true
    }, { once: true })

    const errors = captureRuntimeErrors(() => escape(button))

    expect(errors).toEqual([enabledError])
    expect(failedEscape).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('多条 fallback lane 失败时按 lane 顺序聚合并以首错为 cause', () => {
    const firstError = new Error('first fallback failed')
    const secondError = new Error('second fallback failed')
    fallback(createLayerRegistry(document), () => {
      throw firstError
    })
    fallback(createLayerRegistry(document), () => {
      throw secondError
    })

    const errors = captureRuntimeErrors(() => escape())
    const aggregate = errors[0] as AggregateError

    expect(errors).toHaveLength(1)
    expect(aggregate).toBeInstanceOf(AggregateError)
    expect(aggregate.errors).toEqual([firstError, secondError])
    expect(aggregate.cause).toBe(firstError)
  })

  it('bubble 中最后 fallback 自释放并同步重建会复用原 Hub', () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const registry = createLayerRegistry(document)
    const replacementEscape = vi.fn()
    const currentRef: { value: Disposable | null } = { value: null }
    let replacement: Disposable | null = null
    const current = fallback(registry, () => {
      currentRef.value!.dispose()
      replacement = fallback(registry, replacementEscape)
    })
    currentRef.value = current

    escape()

    expect(replacement).not.toBeNull()
    expect(listenerShape(add.mock.calls)).toHaveLength(4)
    expect(remove).not.toHaveBeenCalled()

    escape()
    expect(replacementEscape).toHaveBeenCalledOnce()
  })
})
