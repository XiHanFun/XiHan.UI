// @vitest-environment jsdom
// 浮层 effect 先登记 layer；后续任何同步初始化失败都必须把已取得资源逆序回滚。
import type { RuntimeConfig } from '@xihan-ui/core'
import { createCounterIdGenerator, createLayerRegistry, createRuntimeConfig, createScope } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { createModalLayerResources, setupLayerTransaction, trackOverlayLayer, trackPresenceResources } from '../src/shared/overlay-shell'

/** 等下一帧画出来之后：两层 requestAnimationFrame，与 afterNextPaint 同一口径 */
const afterPaint = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))

describe('浮层资源初始化事务', () => {
  it('父机先停时等待子 Layer 退栈，再按严格 LIFO 清理', async () => {
    const config = createRuntimeConfig()
    const parentNode = document.createElement('div')
    const childNode = document.createElement('div')
    document.body.append(parentNode, childNode)
    const order: string[] = []

    const mount = (name: string, node: HTMLElement): (() => void) => {
      let behaviorLayer: ReturnType<RuntimeConfig['layerRegistry']['register']>['layer'] | null = null
      return trackPresenceResources({
        presence: null,
        open: () => true,
        track: () => {},
        acquire: () => trackOverlayLayer({
          config,
          registerLayer: () => {
            const registration = config.layerRegistry.register({
              kind: 'popover',
              node: () => node,
              branches: () => [],
              isModal: () => false,
              surfaces: () => [],
            })
            return {
              layer: registration.layer,
              dispose: () => {
                order.push(name)
                registration.dispose()
              },
            }
          },
          onDismiss: () => {},
          onLayer: layer => behaviorLayer = layer,
        }),
        canRelease: () => behaviorLayer == null || config.layerRegistry.top() === behaviorLayer,
        onReleaseReady: retry => config.layerRegistry.subscribe(() => queueMicrotask(retry)),
      })
    }

    const stopParent = mount('parent', parentNode)
    const stopChild = mount('child', childNode)
    expect(config.layerRegistry.list()).toHaveLength(2)

    stopParent()
    expect(config.layerRegistry.list()).toHaveLength(2)
    expect(order).toEqual([])
    stopChild()
    await Promise.resolve()
    expect(config.layerRegistry.list()).toHaveLength(0)
    expect(order).toEqual(['child', 'parent'])
  })

  it('展开生命周期内切换模态策略：锁页同步取得和释放，背景失活等首帧上屏后才施加', async () => {
    const outside = document.createElement('button')
    const content = document.createElement('div')
    document.body.append(outside, content)
    const config = createRuntimeConfig()
    let enabled = false
    let modal!: ReturnType<typeof createModalLayerResources>
    const cleanup = setupLayerTransaction(
      () => config.layerRegistry.register({
        kind: 'modal',
        node: () => content,
        branches: () => [],
        isModal: () => enabled,
        surfaces: () => [],
      }),
      (layer, defer, run) => {
        modal = createModalLayerResources({
          config,
          layer,
          enabled: () => enabled,
          targets: () => [content],
          flush: task => task(),
          run,
        })
        defer(modal.dispose)
        modal.sync()
      },
    )

    expect(document.body.style.overflow).not.toBe('hidden')
    expect(outside.inert).not.toBe(true)
    enabled = true
    modal.sync()
    expect(document.body.style.overflow).toBe('hidden')
    // 给整棵背景打 inert 要整棵重算样式，不放在切换这一拍里：先让浮层的第一帧上屏
    expect(outside.inert).not.toBe(true)
    await afterPaint()
    expect(outside.inert).toBe(true)
    enabled = false
    modal.sync()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(outside.inert).not.toBe(true)

    cleanup()
    outside.remove()
    content.remove()
  })

  describe('关闭时的背景交接（reveal）', () => {
    function modalFixture(): { outside: HTMLElement, modal: ReturnType<typeof createModalLayerResources>, cleanup: () => void } {
      const outside = document.createElement('button')
      const content = document.createElement('div')
      document.body.append(outside, content)
      const config = createRuntimeConfig()
      let modal!: ReturnType<typeof createModalLayerResources>
      const cleanup = setupLayerTransaction(
        () => config.layerRegistry.register({ kind: 'modal', node: () => content, branches: () => [], isModal: () => true, surfaces: () => [] }),
        (layer, defer, run) => {
          modal = createModalLayerResources({ config, layer, enabled: () => true, targets: () => [content], flush: task => task(), run })
          defer(modal.dispose)
          modal.sync()
        },
      )
      return {
        outside,
        modal,
        cleanup: () => {
          cleanup()
          outside.remove()
          content.remove()
        },
      }
    }

    it('背景还没失活（推迟的失活尚未施加）时当场交接，也不再补挂失活', async () => {
      const f = modalFixture()
      const handoff = vi.fn()
      f.modal.reveal(handoff)
      expect(handoff).toHaveBeenCalledTimes(1)
      await afterPaint()
      expect(f.outside.inert).not.toBe(true)
      f.cleanup()
    })

    it('背景已失活时推迟到下一帧上屏之后再撤下并交接', async () => {
      const f = modalFixture()
      await afterPaint()
      expect(f.outside.inert).toBe(true)
      const handoff = vi.fn(() => expect(f.outside.inert).not.toBe(true))
      f.modal.reveal(handoff)
      expect(f.outside.inert).toBe(true)
      expect(handoff).not.toHaveBeenCalled()
      await afterPaint()
      // 交接时背景已撤下：焦点能落回背景里的触发器
      expect(handoff).toHaveBeenCalledTimes(1)
      expect(f.outside.inert).not.toBe(true)
      f.cleanup()
    })

    it('交接之前重开：背景失活原样留着，交接作废', async () => {
      const f = modalFixture()
      await afterPaint()
      const handoff = vi.fn()
      f.modal.reveal(handoff)
      f.modal.sync()
      await afterPaint()
      expect(f.outside.inert).toBe(true)
      expect(handoff).not.toHaveBeenCalled()
      f.cleanup()
    })

    it('交接之前释放资源：背景失活随资源当场撤下，交接不再执行', async () => {
      const f = modalFixture()
      await afterPaint()
      const handoff = vi.fn()
      f.modal.reveal(handoff)
      f.modal.dispose()
      expect(f.outside.inert).not.toBe(true)
      await afterPaint()
      expect(handoff).not.toHaveBeenCalled()
      f.cleanup()
    })
  })

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
