// @vitest-environment jsdom
// 浮层 effect 先登记 layer；后续任何同步初始化失败都必须把已取得资源逆序回滚。
import type { DiagnosticRecord, Layer, LayerKind, LayerRegistry, RuntimeConfig } from '@xihan-ui/core'
import type { PresenceHandle } from '@xihan-ui/core/presence'
import { createCounterIdGenerator, createLayerRegistry, createRuntimeConfig, createScope, DIAGNOSTIC_CODES, onDiagnostic } from '@xihan-ui/core'
import { describe, expect, it, vi } from 'vitest'
import { createLayerReleaseGate, createModalLayerResources, setupLayerTransaction, trackOverlayLayer, trackPresenceResources } from '../src/shared/overlay-shell'

/** 背景是否被藏起：模态只给背景写 aria-hidden，不打 inert。 */
const hidden = (el: Element): boolean => el.getAttribute('aria-hidden') === 'true'

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

  describe('退场播完后等开在本层里的层先退栈', () => {
    /** 一张跟着 Presence 走的浮层：setOpen 改逻辑展开态，completeExit 即退场播完。 */
    function overlay(config: RuntimeConfig, kind: LayerKind, node: HTMLElement, branches: Element[] = []): {
      layer: () => Layer
      setOpen: (open: boolean) => void
      completeExit: () => void
      stop: () => void
    } {
      let open = true
      let rendered = true
      let sync = (): void => {}
      let layer!: Layer
      const exitFns = new Set<() => void>()
      const presence = {
        get rendered() {
          return rendered
        },
        onExitComplete: (fn: () => void) => {
          exitFns.add(fn)
          return () => void exitFns.delete(fn)
        },
        update: (next: boolean) => {
          if (next)
            rendered = true
        },
      } as unknown as PresenceHandle
      const stop = trackPresenceResources({
        presence,
        open: () => open,
        track: (_deps, fn) => {
          sync = fn
        },
        acquire: () => trackOverlayLayer({
          config,
          registerLayer: () => config.layerRegistry.register({
            kind,
            node: () => node,
            branches: () => branches,
            isModal: () => false,
            surfaces: () => [],
          }),
          onDismiss: () => {},
          onLayer: (current) => {
            if (current)
              layer = current
          },
        }),
      })
      return {
        layer: () => layer,
        setOpen: (next) => {
          open = next
          sync()
        },
        completeExit: () => {
          rendered = false
          for (const fn of [...exitFns]) fn()
        },
        stop,
      }
    }

    /** 弹出层的内容里放一颗带提示的按钮：提示开在弹出层里，排在它上面。 */
    function nested(registry: LayerRegistry = createLayerRegistry(document)) {
      const config = createRuntimeConfig({ layerRegistry: registry })
      const content = document.createElement('div')
      const trigger = document.createElement('button')
      const tip = document.createElement('div')
      content.append(trigger)
      document.body.append(content, tip)
      const records: DiagnosticRecord[] = []
      const stopDiagnostics = onDiagnostic((record) => {
        if (record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)
          records.push(record)
      })
      const parent = overlay(config, 'popover', content)
      const child = overlay(config, 'inline', tip, [trigger])
      return {
        config,
        parent,
        child,
        records,
        cleanup: () => {
          child.stop()
          parent.stop()
          stopDiagnostics()
          content.remove()
          tip.remove()
        },
      }
    }

    it('父层先播完退场：留在栈里等里面那层释放，随后在微任务里释放，不报乱序', async () => {
      const f = nested()
      const { layerRegistry } = f.config
      expect(layerRegistry.list()).toEqual([f.parent.layer(), f.child.layer()])

      // 一次层外按下把两层一并收起
      f.child.setOpen(false)
      f.parent.setOpen(false)
      f.parent.completeExit()
      expect(layerRegistry.list()).toEqual([f.parent.layer(), f.child.layer()])

      f.child.completeExit()
      expect(layerRegistry.list()).toEqual([f.parent.layer()])
      await Promise.resolve()
      expect(layerRegistry.list()).toEqual([])
      expect(f.records).toEqual([])
      f.cleanup()
    })

    it('里面那层先播完退场：父层播完即释放，不多等', () => {
      const f = nested()
      f.child.setOpen(false)
      f.parent.setOpen(false)

      f.child.completeExit()
      f.parent.completeExit()

      expect(f.config.layerRegistry.list()).toEqual([])
      expect(f.records).toEqual([])
      f.cleanup()
    })

    it('压在上面的层不开在本层里：照常从中间释放，不等它', () => {
      const config = createRuntimeConfig({ layerRegistry: createLayerRegistry(document) })
      const listbox = document.createElement('div')
      const drawer = document.createElement('div')
      document.body.append(listbox, drawer)
      const select = overlay(config, 'popover', listbox)
      const sheet = overlay(config, 'modal', drawer)

      select.setOpen(false)
      select.completeExit()

      expect(config.layerRegistry.list()).toEqual([sheet.layer()])
      sheet.stop()
      select.stop()
      listbox.remove()
      drawer.remove()
    })

    it('等的期间重开：沿用原层，里面那层释放后也不再释放它', async () => {
      const f = nested()
      const { layerRegistry } = f.config
      const parentLayer = f.parent.layer()
      f.child.setOpen(false)
      f.parent.setOpen(false)
      f.parent.completeExit()

      f.parent.setOpen(true)
      f.child.completeExit()
      await Promise.resolve()

      expect(layerRegistry.list()).toEqual([parentLayer])
      expect(f.parent.layer()).toBe(parentLayer)
      f.cleanup()
      expect(layerRegistry.list()).toEqual([])
    })

    it('等的期间卸载：资源立即释放，不留到里面那层走', () => {
      const f = nested()
      const { layerRegistry } = f.config
      f.child.setOpen(false)
      f.parent.setOpen(false)
      f.parent.completeExit()

      f.parent.stop()

      expect(layerRegistry.list()).toEqual([f.child.layer()])
      f.cleanup()
    })

    it('共享的层栈注册表来自更早的 core、没有 nestedAbove：不等，照旧立即释放', () => {
      const current = createLayerRegistry(document)
      const legacy: LayerRegistry = Object.freeze({ ...current, nestedAbove: undefined })
      const f = nested(legacy)
      f.child.setOpen(false)
      f.parent.setOpen(false)

      f.parent.completeExit()

      expect(legacy.list()).toEqual([f.child.layer()])
      f.cleanup()
    })

    it('释放闸门：没有 nested 的释放函数随时可以释放', () => {
      const gate = createLayerReleaseGate()
      const retry = vi.fn()

      expect(gate.ready(() => {}, retry)).toBe(true)
      gate.cancel()
      expect(retry).not.toHaveBeenCalled()
    })

    it('释放闸门：等待期间只订阅一次，放行或撤掉时退订', async () => {
      const config = createRuntimeConfig({ layerRegistry: createLayerRegistry(document) })
      const content = document.createElement('div')
      const trigger = document.createElement('button')
      content.append(trigger)
      document.body.append(content)
      const register = (node: HTMLElement | null, branches: Element[]) => () => config.layerRegistry.register({
        kind: 'popover',
        node: () => node,
        branches: () => branches,
        isModal: () => false,
        surfaces: () => [],
      })
      // 注册表是冻结的，订阅次数经一层转发记下
      let live = 0
      const counted: LayerRegistry = Object.freeze({
        ...config.layerRegistry,
        subscribe: (fn: Parameters<LayerRegistry['subscribe']>[0]) => {
          live += 1
          const stop = config.layerRegistry.subscribe(fn)
          return () => {
            live -= 1
            stop()
          }
        },
      })
      const visual = { registry: counted, flush: (task: () => void) => task() }
      const parent = setupLayerTransaction(register(content, []), () => {}, visual)
      const child = setupLayerTransaction(register(null, [trigger]), () => {}, visual)
      // 两层各自的视觉层级绑定已经各订阅了一次
      expect(live).toBe(2)
      const gate = createLayerReleaseGate()
      const retry = vi.fn()

      expect(gate.ready(parent, retry)).toBe(false)
      expect(gate.ready(parent, retry)).toBe(false)
      expect(live).toBe(3)
      expect(retry).not.toHaveBeenCalled()

      // 层栈变了：通知期间不能改栈，retry 排在通知之后的微任务里
      child()
      expect(retry).not.toHaveBeenCalled()
      await Promise.resolve()
      expect(retry).toHaveBeenCalledTimes(1)
      // 里面那层走了：放行并退订，只剩父层自己的视觉层级绑定
      expect(gate.ready(parent, retry)).toBe(true)
      expect(live).toBe(1)

      // 之后层栈再变不再调 retry
      parent()
      await Promise.resolve()
      expect(retry).toHaveBeenCalledTimes(1)
      expect(live).toBe(0)
      content.remove()
    })
  })

  it('展开生命周期内切换模态策略：锁页与背景失活同步取得和释放', () => {
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
    expect(hidden(outside)).toBe(false)
    enabled = true
    modal.sync()
    expect(document.body.style.overflow).toBe('hidden')
    // aria-hidden 不进样式计算，随宿主提交当场施加；背景不打 inert
    expect(hidden(outside)).toBe(true)
    expect(outside.inert).not.toBe(true)
    enabled = false
    modal.sync()
    expect(document.body.style.overflow).not.toBe('hidden')
    expect(hidden(outside)).toBe(false)

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

    it('关闭时当场撤下背景失活，再交接', () => {
      const f = modalFixture()
      expect(hidden(f.outside)).toBe(true)
      // 交接时背景已撤下：焦点落回背景里的触发器时，那里已不对读屏藏着
      const handoff = vi.fn(() => expect(hidden(f.outside)).toBe(false))
      f.modal.reveal(handoff)
      expect(handoff).toHaveBeenCalledTimes(1)
      expect(hidden(f.outside)).toBe(false)
      f.cleanup()
    })

    it('撤下之后、资源释放之前重开：补回背景失活', () => {
      const f = modalFixture()
      f.modal.reveal()
      expect(hidden(f.outside)).toBe(false)
      f.modal.sync()
      expect(hidden(f.outside)).toBe(true)
      f.cleanup()
    })

    it('撤下之后释放资源：交接只执行一次，背景保持撤下', () => {
      const f = modalFixture()
      const handoff = vi.fn()
      f.modal.reveal(handoff)
      f.modal.dispose()
      expect(handoff).toHaveBeenCalledTimes(1)
      expect(hidden(f.outside)).toBe(false)
      f.cleanup()
    })
  })

  describe('模态底板', () => {
    function underlayFixture(surfaces: () => Element[] = () => []): { outside: HTMLElement, positioner: HTMLElement, modal: ReturnType<typeof createModalLayerResources>, cleanup: () => void } {
      const outside = document.createElement('button')
      const positioner = document.createElement('div')
      positioner.dataset.scope = 'popover'
      positioner.dataset.part = 'positioner'
      const content = document.createElement('div')
      content.dataset.scope = 'popover'
      content.dataset.part = 'content'
      positioner.appendChild(content)
      document.body.append(outside, positioner)
      const config = createRuntimeConfig()
      let modal!: ReturnType<typeof createModalLayerResources>
      const cleanup = setupLayerTransaction(
        () => config.layerRegistry.register({ kind: 'popover', node: () => content, branches: () => [], isModal: () => true, surfaces }),
        (layer, defer, run) => {
          modal = createModalLayerResources({ config, layer, enabled: () => true, targets: () => [content], flush: task => task(), run })
          defer(modal.dispose)
          modal.sync()
        },
      )
      return {
        outside,
        positioner,
        modal,
        cleanup: () => {
          cleanup()
          outside.remove()
          positioner.remove()
        },
      }
    }

    const underlayOf = (positioner: HTMLElement): HTMLElement | null => positioner.querySelector<HTMLElement>('[data-xh-modal-underlay]')

    it('没有遮罩的模态层在定位层里垫一块铺满视口的透明底板，撤下背景失活即移除', () => {
      const f = underlayFixture()
      const underlay = underlayOf(f.positioner)
      expect(underlay).not.toBeNull()
      expect(underlay!.getAttribute('aria-hidden')).toBe('true')
      expect(underlay!.style.position).toBe('fixed')
      expect(underlay!.style.inset).toBe('0')
      expect(underlay!.style.zIndex).toBe('-1')
      // 定位层皮肤是 pointer-events:none，底板自己写回 auto 才拦得住指针
      expect(underlay!.style.pointerEvents).toBe('auto')
      f.modal.reveal()
      expect(underlayOf(f.positioner)).toBeNull()
      f.modal.sync()
      expect(underlayOf(f.positioner)).not.toBeNull()
      f.cleanup()
      expect(underlayOf(f.positioner)).toBeNull()
    })

    it('有遮罩（surfaces）的层不垫底板：遮罩本就铺满视口', () => {
      const backdrop = document.createElement('div')
      document.body.appendChild(backdrop)
      const f = underlayFixture(() => [backdrop])
      expect(hidden(f.outside)).toBe(true)
      expect(underlayOf(f.positioner)).toBeNull()
      f.cleanup()
      backdrop.remove()
    })

    it('内容节点没有同 scope 定位层时不垫', () => {
      const outside = document.createElement('button')
      const content = document.createElement('div')
      content.dataset.scope = 'popover'
      document.body.append(outside, content)
      const config = createRuntimeConfig()
      const cleanup = setupLayerTransaction(
        () => config.layerRegistry.register({ kind: 'popover', node: () => content, branches: () => [], isModal: () => true, surfaces: () => [] }),
        (layer, defer, run) => {
          const modal = createModalLayerResources({ config, layer, enabled: () => true, targets: () => [content], flush: task => task(), run })
          defer(modal.dispose)
          modal.sync()
        },
      )
      expect(hidden(outside)).toBe(true)
      expect(document.querySelector('[data-xh-modal-underlay]')).toBeNull()
      cleanup()
      outside.remove()
      content.remove()
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
