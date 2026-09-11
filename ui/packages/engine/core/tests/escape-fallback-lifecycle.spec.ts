// @vitest-environment jsdom
import type { EscapeFallbackOptions } from '../src/behavior/dismissable-layer'
import type { LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createEscapeFallback } from '../src/behavior/dismissable-layer'
import {
  createCounterIdGenerator,
  createLayerRegistry,
  createRuntimeConfig,
  createScope,
} from '../src/kernel'

interface Thrown {
  readonly threw: boolean
  readonly error: unknown
}

const cleanups: Array<() => void> = []

function configFor(registry: LayerRegistry): RuntimeConfig {
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(registry.ownerDocument.body, idGenerator)
  return createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
}

function captureThrown(action: () => void): Thrown {
  try {
    action()
    return { threw: false, error: null }
  }
  catch (error) {
    return { threw: true, error }
  }
}

function listenerShape(calls: ArrayLike<readonly unknown[]>): string[] {
  return Array.from(calls, ([type, , options]) => `${String(type)}:${options === true ? 'capture' : 'bubble'}`)
}

function escape(doc: Document): KeyboardEvent {
  const event = new doc.defaultView!.KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  })
  doc.dispatchEvent(event)
  return event
}

function captureRuntimeErrors(action: () => void): unknown[] {
  const errors: unknown[] = []
  const onError = (event: ErrorEvent): void => {
    errors.push(event.error)
    event.preventDefault()
  }
  window.addEventListener('error', onError)
  try {
    action()
  }
  finally {
    window.removeEventListener('error', onError)
  }
  return errors
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('escape fallback realm 与生命周期', () => {
  it('fallback-only iframe 只安装所属 Document 的监听并收到同 realm 原生事件', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const doc = frame.contentDocument!
    const win = frame.contentWindow!
    const mainAdd = vi.spyOn(document, 'addEventListener')
    const frameAdd = vi.spyOn(doc, 'addEventListener')
    const onEscape = vi.fn()
    const fallback = createEscapeFallback({
      config: configFor(createLayerRegistry(doc)),
      isEnabled: () => true,
      onEscape,
    })
    cleanups.push(fallback.dispose)

    expect(mainAdd).not.toHaveBeenCalled()
    expect(listenerShape(frameAdd.mock.calls)).toEqual([
      'keydown:capture',
      'pointerdown:capture',
      'focusin:capture',
      'keydown:bubble',
    ])
    escape(document)
    expect(onEscape).not.toHaveBeenCalled()

    const event = escape(doc)
    expect(onEscape).toHaveBeenCalledWith(event)
    expect(event).toBeInstanceOf((win as Window & typeof globalThis).KeyboardEvent)
  })

  it('scope 与 LayerRegistry 跨 Document 时在安装监听前明确失败', () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const add = vi.spyOn(document, 'addEventListener')
    const mainConfig = configFor(createLayerRegistry(document))
    const foreignRegistry = createLayerRegistry(frame.contentDocument!)
    const mixed = { ...mainConfig, layerRegistry: foreignRegistry }

    expect(() => createEscapeFallback({
      config: mixed,
      isEnabled: () => true,
      onEscape: () => {},
    })).toThrow(/LayerRegistry.*Scope.*同一 Document/)
    expect(add).not.toHaveBeenCalled()
  })

  it('非冻结 registry snapshot 在创建期失败且不安装监听', () => {
    const registry = createLayerRegistry(document)
    const invalid = {
      ...registry,
      list: () => [],
    } satisfies LayerRegistry
    const add = vi.spyOn(document, 'addEventListener')

    expect(() => createEscapeFallback({
      config: configFor(invalid),
      isEnabled: () => true,
      onEscape: () => {},
    })).toThrow(/LayerRegistry\.list\(\).*冻结快照/)
    expect(add).not.toHaveBeenCalled()
  })

  it.each(['isEnabled', 'onEscape'] as const)(
    '%s 属性 getter 抛错时首注册零监听，随后可重新正常注册',
    (name) => {
      const registry = createLayerRegistry(document)
      const config = configFor(registry)
      const accessorError = new Error(`${name} getter failed`)
      const options: Record<string, unknown> = {
        config,
        isEnabled: () => true,
        onEscape: () => {},
      }
      Object.defineProperty(options, name, {
        configurable: true,
        get: () => {
          throw accessorError
        },
      })
      const add = vi.spyOn(document, 'addEventListener')

      expect(() => createEscapeFallback(options as unknown as EscapeFallbackOptions)).toThrow(accessorError)
      expect(add).not.toHaveBeenCalled()

      Object.defineProperty(options, name, {
        configurable: true,
        value: name === 'isEnabled' ? () => true : () => {},
      })
      const valid = createEscapeFallback(options as unknown as EscapeFallbackOptions)
      expect(listenerShape(add.mock.calls)).toHaveLength(4)
      valid.dispose()
    },
  )

  it.each(['isEnabled', 'onEscape'] as const)('%s 非函数时创建期零监听', (name) => {
    const registry = createLayerRegistry(document)
    const options = {
      config: configFor(registry),
      isEnabled: () => true,
      onEscape: () => {},
      [name]: null,
    }
    const add = vi.spyOn(document, 'addEventListener')

    expect(() => createEscapeFallback(options as unknown as EscapeFallbackOptions)).toThrow(TypeError)
    expect(add).not.toHaveBeenCalled()
  })

  it('bubble keydown add 完成后抛错时按严格逆序回滚全部四个监听', () => {
    const setupError = new Error('bubble add failed')
    const order: string[] = []
    const nativeAdd = document.addEventListener.bind(document)
    const nativeRemove = document.removeEventListener.bind(document)
    const add = vi.spyOn(document, 'addEventListener').mockImplementation((type, listener, options) => {
      nativeAdd(type, listener, options)
      if (type === 'keydown' && options !== true)
        throw setupError
    })
    const remove = vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(`${String(type)}:${options === true ? 'capture' : 'bubble'}`)
      nativeRemove(type, listener, options)
    })

    expect(() => createEscapeFallback({
      config: configFor(createLayerRegistry(document)),
      isEnabled: () => true,
      onEscape: () => {},
    })).toThrow(setupError)
    expect(order).toEqual([
      'keydown:bubble',
      'focusin:capture',
      'pointerdown:capture',
      'keydown:capture',
    ])

    add.mockRestore()
    remove.mockRestore()
    const valid = createEscapeFallback({
      config: configFor(createLayerRegistry(document)),
      isEnabled: () => true,
      onEscape: () => {},
    })
    expect(() => valid.dispose()).not.toThrow()
  })

  it('最后 fallback 释放时四项 remove 异常按 LIFO 聚合且 cause 为首错', () => {
    const errors = {
      bubble: new Error('bubble key remove failed'),
      focus: new Error('focus remove failed'),
      pointer: new Error('pointer remove failed'),
      capture: new Error('capture key remove failed'),
    }
    const fallback = createEscapeFallback({
      config: configFor(createLayerRegistry(document)),
      isEnabled: () => true,
      onEscape: () => {},
    })
    const order: string[] = []
    const nativeRemove = document.removeEventListener.bind(document)
    vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
      const phase = options === true ? 'capture' : 'bubble'
      order.push(`${String(type)}:${phase}`)
      nativeRemove(type, listener, options)
      if (type === 'focusin')
        throw errors.focus
      if (type === 'pointerdown')
        throw errors.pointer
      if (type === 'keydown')
        throw phase === 'capture' ? errors.capture : errors.bubble
    })

    const caught = captureThrown(fallback.dispose)

    expect(caught.threw).toBe(true)
    expect(caught.error).toBeInstanceOf(AggregateError)
    expect((caught.error as AggregateError).errors).toEqual([
      errors.bubble,
      errors.focus,
      errors.pointer,
      errors.capture,
    ])
    expect((caught.error as AggregateError).cause).toBe(errors.bubble)
    expect(order).toEqual([
      'keydown:bubble',
      'focusin:capture',
      'pointerdown:capture',
      'keydown:capture',
    ])
    expect(() => fallback.dispose()).not.toThrow()
  })

  it('bubble callback 与延迟卸载同时失败时，callback 保持首错并接上 LIFO 清理异常', () => {
    const callbackError = new Error('fallback callback failed')
    const focusError = new Error('focus remove failed')
    const captureKeyError = new Error('capture key remove failed')
    const fallbackRef: { value: ReturnType<typeof createEscapeFallback> | null } = { value: null }
    const fallback = createEscapeFallback({
      config: configFor(createLayerRegistry(document)),
      isEnabled: () => true,
      onEscape: () => {
        fallbackRef.value!.dispose()
        throw callbackError
      },
    })
    fallbackRef.value = fallback
    const order: string[] = []
    const nativeRemove = document.removeEventListener.bind(document)
    vi.spyOn(document, 'removeEventListener').mockImplementation((type, listener, options) => {
      const phase = options === true ? 'capture' : 'bubble'
      order.push(`${String(type)}:${phase}`)
      nativeRemove(type, listener, options)
      if (type === 'focusin')
        throw focusError
      if (type === 'keydown' && phase === 'capture')
        throw captureKeyError
    })

    const runtimeErrors = captureRuntimeErrors(() => escape(document))
    const aggregate = runtimeErrors[0] as AggregateError

    expect(runtimeErrors).toHaveLength(1)
    expect(aggregate).toBeInstanceOf(AggregateError)
    expect(aggregate.errors).toEqual([callbackError, focusError, captureKeyError])
    expect(aggregate.cause).toBe(callbackError)
    expect(order).toEqual([
      'keydown:bubble',
      'focusin:capture',
      'pointerdown:capture',
      'keydown:capture',
    ])
  })
})
