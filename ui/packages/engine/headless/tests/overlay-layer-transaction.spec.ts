// @vitest-environment jsdom
// 浮层 effect 先登记 layer；后续任何同步初始化失败都必须把已取得资源逆序回滚。
import type { RuntimeConfig } from '@xihan-ui/core'
import { createCounterIdGenerator, createLayerRegistry, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { setupLayerTransaction, trackOverlayLayer } from '../src/shared/overlay-shell'

describe('浮层资源初始化事务', () => {
  it('成功初始化后按依赖逆序清理且重复调用幂等', () => {
    const order: string[] = []
    const cleanup = setupLayerTransaction(
      () => ({
        layer: {} as never,
        dispose: () => order.push('layer'),
      }),
      (_layer, defer) => {
        defer(() => order.push('dismiss'))
        defer(() => order.push('focus'))
      },
    )

    cleanup()
    cleanup()
    expect(order).toEqual(['focus', 'dismiss', 'layer'])
  })

  it('初始化失败时仍执行全部回滚并保留原异常', () => {
    const order: string[] = []
    const cause = new Error('setup failed')
    expect(() => setupLayerTransaction(
      () => ({
        layer: {} as never,
        dispose: () => order.push('layer'),
      }),
      (_layer, defer) => {
        defer(() => order.push('dismiss'))
        defer(() => order.push('focus'))
        throw cause
      },
    )).toThrow(cause)
    expect(order).toEqual(['focus', 'dismiss', 'layer'])
  })

  it('多项 cleanup 抛错时仍清到 layer 并聚合异常', () => {
    const order: string[] = []
    const cleanup = setupLayerTransaction(
      () => ({
        layer: {} as never,
        dispose: () => order.push('layer'),
      }),
      (_layer, defer) => {
        defer(() => {
          order.push('dismiss')
          throw new Error('dismiss failed')
        })
        defer(() => {
          order.push('focus')
          throw new Error('focus failed')
        })
      },
    )

    expect(() => cleanup()).toThrow(AggregateError)
    expect(order).toEqual(['focus', 'dismiss', 'layer'])
  })

  it('延后初始化通过 run 失败时复用同一事务回滚', () => {
    const order: string[] = []
    let run!: <T>(setup: () => T) => T
    const cleanup = setupLayerTransaction(
      () => ({
        layer: {} as never,
        dispose: () => order.push('layer'),
      }),
      (_layer, defer, execute) => {
        run = execute
        defer(() => order.push('dismiss'))
        defer(() => order.push('focus'))
      },
    )
    const cause = new Error('late setup failed')

    expect(() => run(() => {
      throw cause
    })).toThrow(cause)
    expect(order).toEqual(['focus', 'dismiss', 'layer'])
    cleanup()
    expect(order).toEqual(['focus', 'dismiss', 'layer'])
  })

  it('宿主 flush 的延后初始化失败后完整回滚且迟到回调无动作', () => {
    const order: string[] = []
    const cause = new Error('flush setup failed')
    let queued!: () => void
    const flush = (task: () => void): void => {
      queued = task
    }
    const cleanup = setupLayerTransaction(
      () => ({
        layer: {} as never,
        dispose: () => order.push('layer'),
      }),
      (_layer, defer, run) => {
        defer(() => order.push('dismiss'))
        defer(() => order.push('focus'))
        defer(() => order.push('lock'))

        let alive = true
        defer(() => {
          alive = false
          order.push('hide')
        })
        flush(() => {
          if (!alive)
            return
          run(() => {
            order.push('flush')
            throw cause
          })
        })
      },
    )

    expect(order).toEqual([])
    expect(() => queued()).toThrow(cause)
    expect(order).toEqual(['flush', 'hide', 'lock', 'focus', 'dismiss', 'layer'])

    expect(() => queued()).not.toThrow()
    cleanup()
    cleanup()
    expect(order).toEqual(['flush', 'hide', 'lock', 'focus', 'dismiss', 'layer'])
  })

  it('宿主 flush 排队后同步抛错时当场回滚并拦住迟到回调', () => {
    const order: string[] = []
    const cause = new Error('flush failed after queue')
    let queued!: () => void
    const flush = (task: () => void): void => {
      queued = task
      throw cause
    }

    expect(() => setupLayerTransaction(
      () => ({
        layer: {} as never,
        dispose: () => order.push('layer'),
      }),
      (_layer, defer, run) => {
        defer(() => order.push('dismiss'))
        defer(() => order.push('focus'))
        defer(() => order.push('lock'))

        let alive = true
        defer(() => {
          alive = false
          order.push('hide')
        })
        flush(() => {
          if (!alive)
            return
          run(() => order.push('late setup'))
        })
      },
    )).toThrow(cause)
    expect(order).toEqual(['hide', 'lock', 'focus', 'dismiss', 'layer'])

    expect(() => queued()).not.toThrow()
    expect(order).toEqual(['hide', 'lock', 'focus', 'dismiss', 'layer'])
  })

  it('共享外壳在 DismissableLayer 初始化失败时撤销已登记 layer', () => {
    const registry = createLayerRegistry(document)
    const disposeLayer = vi.fn()
    const registerLayer = () => {
      const registration = registry.register({
        kind: 'popover',
        node: () => document.createElement('div'),
        branches: () => [],
        isModal: () => false,
        setModal: () => {},
        surfaces: () => [],
      })
      return {
        layer: registration.layer,
        dispose: () => {
          disposeLayer()
          registration.dispose()
        },
      }
    }
    const config = {
      scope: {
        getDoc: () => {
          throw new Error('scope failed')
        },
      },
      layerRegistry: registry,
    } as unknown as RuntimeConfig

    expect(() => trackOverlayLayer({
      config,
      registerLayer,
      onDismiss: () => {},
    })).toThrow('scope failed')
    expect(disposeLayer).toHaveBeenCalledTimes(1)
    expect(registry.list()).toEqual([])
  })

  it.each(['add-then-throw', 'queue-then-throw'] as const)(
    '消解层的 %s 同步失败会回流外壳并撤销 layer',
    (failureAt) => {
      const frame = document.createElement('iframe')
      document.body.append(frame)
      const doc = frame.contentDocument!
      const win = frame.contentWindow! as Window & typeof globalThis
      const node = doc.createElement('div')
      doc.body.append(node)
      const idGenerator = createCounterIdGenerator()
      const scope = createScope(node, idGenerator)
      const registry = createLayerRegistry(doc)
      const config = createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
      const failure = new Error(failureAt)
      let queued: (() => void) | undefined

      if (failureAt === 'add-then-throw') {
        const nativeAdd = doc.addEventListener.bind(doc)
        vi.spyOn(doc, 'addEventListener').mockImplementation((type, listener, options) => {
          nativeAdd(type, listener, options)
          if (type === 'pointerdown')
            throw failure
        })
      }
      else {
        vi.spyOn(win, 'queueMicrotask').mockImplementation((callback) => {
          queued = callback
          throw failure
        })
      }

      try {
        expect(() => trackOverlayLayer({
          config,
          registerLayer: () => registry.register({
            kind: 'popover',
            node: () => node,
            branches: () => [],
            isModal: () => false,
            setModal: () => {},
            surfaces: () => [],
          }),
          onDismiss: () => {},
        })).toThrow(failure)
        expect(registry.list()).toEqual([])
        queued?.()
        expect(registry.list()).toEqual([])
      }
      finally {
        vi.restoreAllMocks()
        frame.remove()
      }
    },
  )
})
