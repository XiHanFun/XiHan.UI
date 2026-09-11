// @vitest-environment jsdom
// DismissableLayer 的监听、表决事件与帧调度必须全部属于 Scope Window。
import type { Disposable, Layer, LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDismissLayer } from '../src/behavior/dismissable-layer'
import {
  createCounterIdGenerator,
  createLayerRegistry,
  createRuntimeConfig,
  createScope,
  EV_ESCAPE_KEY_DOWN,
  EV_FOCUS_OUTSIDE,
  EV_INTERACT_OUTSIDE,
  EV_POINTER_DOWN_OUTSIDE,
} from '../src/kernel'

interface RealmHarness {
  frame: HTMLIFrameElement
  doc: Document
  win: Window & typeof globalThis
  registry: LayerRegistry
  layer: Layer
  config: RuntimeConfig
  content: HTMLElement
  outside: HTMLElement
  disposeLayer: () => void
  setNode: (node: unknown) => void
  setNodeGetter: (getter: () => HTMLElement | null) => void
  setBranches: (branches: Element[]) => void
}

const cleanups: Array<() => void> = []

function realmHarness(): RealmHarness {
  const frame = document.createElement('iframe')
  document.body.appendChild(frame)
  const doc = frame.contentDocument!
  const win = frame.contentWindow! as Window & typeof globalThis
  const content = doc.createElement('div')
  const outside = doc.createElement('button')
  doc.body.append(content, outside)
  const registry = createLayerRegistry(doc)
  let currentNode: HTMLElement | null = content
  let nodeGetter = (): HTMLElement | null => currentNode
  let currentBranches: Element[] = []
  const registration = registry.register({
    kind: 'modal',
    node: () => nodeGetter(),
    branches: () => currentBranches,
    isModal: () => true,
    setModal: () => {},
    surfaces: () => [],
  })
  const config = createRuntimeConfig({
    scope: createScope(content, createCounterIdGenerator()),
    layerRegistry: registry,
  })
  return {
    frame,
    doc,
    win,
    registry,
    layer: registration.layer,
    config,
    content,
    outside,
    disposeLayer: registration.dispose,
    setNode: node => (currentNode = node as HTMLElement | null),
    setNodeGetter: getter => (nodeGetter = getter),
    setBranches: branches => (currentBranches = branches),
  }
}

function eventIn(
  win: Window & typeof globalThis,
  type: string,
  init: EventInit = { bubbles: true, composed: true },
): Event {
  return new win.Event(type, init)
}

async function settle(win: Window): Promise<void> {
  await Promise.resolve()
  await new Promise(resolve => win.setTimeout(resolve, 0))
}

function captureThrown(task: () => void): { threw: boolean, error: unknown } {
  try {
    task()
    return { threw: false, error: undefined }
  }
  catch (error) {
    return { threw: true, error }
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('dismissableLayer 的所属 realm', () => {
  it('iframe 中四类表决事件都由所属 Window 构造并保持同一事件对象', async () => {
    const h = realmHarness()
    const reasons: string[] = []
    const domVotes: Event[] = []
    const optionVotes: Event[] = []
    for (const type of [EV_ESCAPE_KEY_DOWN, EV_FOCUS_OUTSIDE, EV_POINTER_DOWN_OUTSIDE, EV_INTERACT_OUTSIDE])
      h.content.addEventListener(type, event => domVotes.push(event))
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: reason => reasons.push(reason),
      onEscapeKeyDown: event => optionVotes.push(event),
      onFocusOutside: event => optionVotes.push(event),
      onPointerDownOutside: event => optionVotes.push(event),
      onInteractOutside: event => optionVotes.push(event),
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)
    const runtimeErrors: unknown[] = []
    const onError = (event: ErrorEvent): void => {
      runtimeErrors.push(event.error)
      event.preventDefault()
    }
    h.win.addEventListener('error', onError)
    vi.stubGlobal('CustomEvent', undefined)
    vi.stubGlobal('queueMicrotask', undefined)
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)

    h.outside.dispatchEvent(eventIn(h.win, 'focusin'))
    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(runtimeErrors).toEqual([])
    expect(reasons).toEqual(['focus-outside', 'pointer-down-outside', 'escape-key'])
    expect(domVotes).toHaveLength(5)
    expect(optionVotes).toHaveLength(5)
    for (const vote of domVotes)
      expect(vote).toBeInstanceOf(h.win.CustomEvent)
    expect(optionVotes).toEqual(domVotes)
    h.win.removeEventListener('error', onError)
  })

  it('监听同步注册，所属 Window 的 microtask 只负责武装且 dispose 后不能复活', () => {
    const h = realmHarness()
    const queued: Array<() => void> = []
    const queue = vi.spyOn(h.win, 'queueMicrotask').mockImplementation(callback => queued.push(callback))
    const timer = vi.spyOn(h.win, 'setTimeout')
    const add = vi.spyOn(h.doc, 'addEventListener')
    const onDismiss = vi.fn()
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer)

    expect(add.mock.calls.map(([type]) => type)).toEqual(['keydown', 'pointerdown', 'focusin', 'keydown'])
    expect(queue).toHaveBeenCalledTimes(1)
    expect(timer).not.toHaveBeenCalled()
    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()

    dismiss.dispose()
    queued[0]!()
    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('武装前 layer 已退栈时微任务不会激活旧监听', () => {
    const h = realmHarness()
    const queued: Array<() => void> = []
    vi.spyOn(h.win, 'queueMicrotask').mockImplementation(callback => queued.push(callback))
    const onDismiss = vi.fn()
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
    })
    cleanups.push(() => h.frame.remove(), () => dismiss.dispose())

    h.disposeLayer()
    queued[0]!()
    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('初始 layer node 来自其他 Document 或不是 HTMLElement 时同步失败', () => {
    const h = realmHarness()
    const foreign = document.createElement('div')
    const svg = h.doc.createElementNS('http://www.w3.org/2000/svg', 'svg')
    h.setNode(foreign)
    let handle: Disposable | null = null
    let foreignError: unknown = null
    try {
      handle = createDismissLayer({
        config: h.config,
        layer: h.layer,
        onDismiss: () => {},
      })
    }
    catch (error) {
      foreignError = error
    }
    handle?.dispose()
    expect(foreignError).toBeInstanceOf(Error)
    expect((foreignError as Error).message).toMatch(/layer\.node.*Document/)
    h.setNode(svg)
    expect(() => createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })).toThrow(/layer\.node.*HTMLElement/)
    h.setNode(h.content)
    expect(() => createDismissLayer({
      config: h.config,
      layer: { ...h.layer },
      onDismiss: () => {},
    })).toThrow(/必须已注册/)
    h.disposeLayer()
    h.frame.remove()
  })

  it('初始 node getter 让 layer 退栈时同步失败且不注册监听', () => {
    const h = realmHarness()
    const add = vi.spyOn(h.doc, 'addEventListener')
    h.setNodeGetter(() => {
      h.disposeLayer()
      return h.content
    })

    expect(() => createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })).toThrow(/初始化期间改变了 LayerRegistry 快照/)
    expect(add).not.toHaveBeenCalled()

    h.frame.remove()
  })

  it('初始 node getter 成功改变并恢复栈内容时仍按新 snapshot 拒绝初始化', () => {
    const h = realmHarness()
    const before = h.registry.list()
    const add = vi.spyOn(h.doc, 'addEventListener')
    let changed = false
    h.setNodeGetter(() => {
      if (!changed) {
        changed = true
        const registration = h.registry.register({
          kind: 'modal',
          node: () => null,
          branches: () => [],
          isModal: () => true,
          setModal: () => {},
          surfaces: () => [],
        })
        registration.dispose()
      }
      return h.content
    })

    expect(() => createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })).toThrow(/初始化期间改变了 LayerRegistry 快照/)
    expect(h.registry.list()).toEqual(before)
    expect(h.registry.list()).not.toBe(before)
    expect(add).not.toHaveBeenCalled()

    h.disposeLayer()
    h.frame.remove()
  })

  it('初始 node getter 的失败登记补偿回原 snapshot 时可继续初始化', () => {
    const h = realmHarness()
    const before = h.registry.list()
    const notificationError = new Error('subscriber failed')
    let registrationError: unknown = null
    let attempted = false
    h.setNodeGetter(() => {
      if (!attempted) {
        attempted = true
        const unsubscribe = h.registry.subscribe(() => {
          throw notificationError
        })
        try {
          h.registry.register({
            kind: 'modal',
            node: () => null,
            branches: () => [],
            isModal: () => true,
            setModal: () => {},
            surfaces: () => [],
          })
        }
        catch (error) {
          registrationError = error
        }
        finally {
          unsubscribe()
        }
      }
      return h.content
    })
    const add = vi.spyOn(h.doc, 'addEventListener')

    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())

    expect(registrationError).toBeInstanceOf(AggregateError)
    expect(h.registry.list()).toBe(before)
    expect(add.mock.calls.map(([type]) => type)).toEqual(['keydown', 'pointerdown', 'focusin', 'keydown'])
  })

  it('动态 layer node 跨 Document 时在首次交互明确失败', async () => {
    const h = realmHarness()
    const reasons: string[] = []
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: reason => reasons.push(reason),
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)
    h.setNode(document.createElement('div'))
    let runtimeError: unknown = null
    const onError = (event: ErrorEvent): void => {
      runtimeError = event.error
      event.preventDefault()
    }
    h.win.addEventListener('error', onError)

    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(runtimeError).toBeInstanceOf(Error)
    expect((runtimeError as Error).message).toMatch(/layer\.node.*Document/)
    expect(reasons).toEqual([])
    h.win.removeEventListener('error', onError)
  })

  it('重复 pointer 消解只保留一帧复位任务并在 dispose 时取消', async () => {
    const h = realmHarness()
    let frameId = 0
    const request = vi.spyOn(h.win, 'requestAnimationFrame').mockImplementation(() => ++frameId)
    const cancel = vi.spyOn(h.win, 'cancelAnimationFrame').mockImplementation(() => {})
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer)
    await settle(h.win)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
    expect(request).toHaveBeenCalledTimes(2)
    expect(cancel).toHaveBeenCalledWith(1)
    dismiss.dispose()
    expect(cancel).toHaveBeenLastCalledWith(2)
  })

  it('所属 Window 缺少必要事件或调度能力时同步失败', () => {
    const first = realmHarness()
    Object.defineProperty(first.win, 'CustomEvent', { configurable: true, value: undefined })
    expect(() => createDismissLayer({
      config: first.config,
      layer: first.layer,
      onDismiss: () => {},
    })).toThrow(/CustomEvent/)
    first.disposeLayer()
    first.frame.remove()

    const second = realmHarness()
    Object.defineProperty(second.win, 'queueMicrotask', { configurable: true, value: undefined })
    expect(() => createDismissLayer({
      config: second.config,
      layer: second.layer,
      onDismiss: () => {},
    })).toThrow(/queueMicrotask/)
    second.disposeLayer()
    second.frame.remove()

    const third = realmHarness()
    Object.defineProperty(third.win, 'requestAnimationFrame', { configurable: true, value: undefined })
    expect(() => createDismissLayer({
      config: third.config,
      layer: third.layer,
      onDismiss: () => {},
    })).toThrow(/动画帧/)
    third.disposeLayer()
    third.frame.remove()
  })

  it('层栈与 Scope 来自不同 Document 时在读取 layer 前失败', () => {
    const h = realmHarness()
    const foreignRegistry = createLayerRegistry(document)
    const readNode = vi.fn(h.layer.node)
    const config = { ...h.config, layerRegistry: foreignRegistry }

    expect(() => createDismissLayer({
      config,
      layer: { ...h.layer, node: readNode },
      onDismiss: () => {},
    })).toThrow(/LayerRegistry.*Scope.*Document/)
    expect(readNode).not.toHaveBeenCalled()

    h.disposeLayer()
    h.frame.remove()
  })

  it('自定义 LayerRegistry 未返回冻结 snapshot 时同步拒绝', () => {
    const h = realmHarness()
    const config: RuntimeConfig = {
      ...h.config,
      layerRegistry: {
        ...h.registry,
        list: () => [h.layer],
      },
    }

    expect(() => createDismissLayer({
      config,
      layer: h.layer,
      onDismiss: () => {},
    })).toThrow(/必须返回冻结快照/)

    h.disposeLayer()
    h.frame.remove()
  })

  it('specific 回调同步 dispose 后不再派 interact、建帧或提交关闭', async () => {
    const h = realmHarness()
    const interact = vi.fn()
    const onDismiss = vi.fn()
    const request = vi.spyOn(h.win, 'requestAnimationFrame')
    let dispose = (): void => {}
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onPointerDownOutside: () => dispose(),
      onInteractOutside: interact,
    })
    dispose = () => dismiss.dispose()
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
    expect(interact).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('escape 表决同步打开新顶层后不提交旧层关闭', async () => {
    const h = realmHarness()
    const onDismiss = vi.fn()
    let disposeNext: (() => void) | null = null
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onEscapeKeyDown: () => {
        const next = h.doc.createElement('div')
        h.doc.body.appendChild(next)
        disposeNext = h.registry.register({
          kind: 'modal',
          node: () => next,
          branches: () => [],
          isModal: () => true,
          setModal: () => {},
          surfaces: () => [],
        }).dispose
      },
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose(), () => disposeNext?.())
    await settle(h.win)

    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('escape 表决期间层栈变更后即使恢复相同内容也不提交旧决定', async () => {
    const h = realmHarness()
    const onDismiss = vi.fn()
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onEscapeKeyDown: () => {
        const next = h.doc.createElement('div')
        h.doc.body.appendChild(next)
        const { dispose } = h.registry.register({
          kind: 'modal',
          node: () => next,
          branches: () => [],
          isModal: () => true,
          setModal: () => {},
          surfaces: () => [],
        })
        dispose()
        next.remove()
      },
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)
    const before = h.registry.list()

    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(h.registry.list()).toEqual(before)
    expect(h.registry.list()).not.toBe(before)
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('登记通知失败并补偿回原 snapshot 后，原表决仍可提交关闭', async () => {
    const h = realmHarness()
    const onDismiss = vi.fn()
    const notificationError = new Error('subscriber failed')
    let registrationError: unknown = null
    const before = h.registry.list()
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onEscapeKeyDown: () => {
        const next = h.doc.createElement('div')
        const unsubscribe = h.registry.subscribe(() => {
          throw notificationError
        })
        try {
          h.registry.register({
            kind: 'modal',
            node: () => next,
            branches: () => [],
            isModal: () => true,
            setModal: () => {},
            surfaces: () => [],
          })
        }
        catch (error) {
          registrationError = error
        }
        finally {
          unsubscribe()
        }
      },
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)

    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(registrationError).toBeInstanceOf(AggregateError)
    expect(h.registry.list()).toBe(before)
    expect(onDismiss).toHaveBeenCalledWith('escape-key')
  })

  it('escape 表决期间动态节点换代后不提交旧节点的决定', async () => {
    const h = realmHarness()
    const onDismiss = vi.fn()
    const replacement = h.doc.createElement('div')
    h.doc.body.appendChild(replacement)
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onEscapeKeyDown: () => h.setNode(replacement),
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)

    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it.each([
    'specific DOM dispatch',
    'specific option callback',
    'interact DOM dispatch',
    'interact option callback',
  ] as const)('%s 改变层栈后不再推进旧 pointer 决定', async (stage) => {
    const h = realmHarness()
    const onDismiss = vi.fn()
    const request = vi.spyOn(h.win, 'requestAnimationFrame')
    let disposeNext: (() => void) | null = null
    const mutateStack = (): void => {
      if (disposeNext)
        return
      const next = h.doc.createElement('div')
      h.doc.body.appendChild(next)
      const registration = h.registry.register({
        kind: 'modal',
        node: () => next,
        branches: () => [],
        isModal: () => true,
        setModal: () => {},
        surfaces: () => [],
      })
      disposeNext = () => {
        registration.dispose()
        next.remove()
      }
    }
    if (stage === 'specific DOM dispatch')
      h.content.addEventListener(EV_POINTER_DOWN_OUTSIDE, mutateStack, { once: true })
    if (stage === 'interact DOM dispatch')
      h.content.addEventListener(EV_INTERACT_OUTSIDE, mutateStack, { once: true })

    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onPointerDownOutside: stage === 'specific option callback' ? mutateStack : undefined,
      onInteractOutside: stage === 'interact option callback' ? mutateStack : undefined,
    })
    cleanups.push(
      () => h.frame.remove(),
      h.disposeLayer,
      () => dismiss.dispose(),
      () => disposeNext?.(),
    )
    await settle(h.win)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))

    expect(onDismiss).not.toHaveBeenCalled()
    expect(request).not.toHaveBeenCalled()
  })

  it('表决回调把事件目标纳入动态 branch 后重新仲裁并保留本层', async () => {
    const h = realmHarness()
    const onDismiss = vi.fn()
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onInteractOutside: () => h.setBranches([h.outside]),
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))

    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('onDismiss 同步重派交互时单实例只提交一次', async () => {
    const h = realmHarness()
    const reasons: string[] = []
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: (reason) => {
        reasons.push(reason)
        h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
      },
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
    expect(reasons).toEqual(['pointer-down-outside'])
  })

  it('pointer 的 onDismiss 与撤帧同时失败时保留原异常为首错，后续 focus 仍可消解', async () => {
    const h = realmHarness()
    const dismissError = new Error('dismiss failed')
    const cleanupError = new Error('cancel failed')
    vi.spyOn(h.win, 'requestAnimationFrame').mockImplementation(() => 41)
    const cancel = vi.spyOn(h.win, 'cancelAnimationFrame')
      .mockImplementationOnce(() => {
        throw cleanupError
      })
      .mockImplementation(() => {})
    const reasons: string[] = []
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: (reason) => {
        if (reason === 'pointer-down-outside')
          throw dismissError
        reasons.push(reason)
      },
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)
    let runtimeError: unknown = null
    const onError = (event: ErrorEvent): void => {
      runtimeError = event.error
      event.preventDefault()
    }
    h.win.addEventListener('error', onError)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))
    expect(runtimeError).toBeInstanceOf(AggregateError)
    expect((runtimeError as AggregateError).errors).toEqual([dismissError, cleanupError])
    expect((runtimeError as AggregateError).cause).toBe(dismissError)
    expect(cancel).toHaveBeenCalled()
    h.outside.dispatchEvent(eventIn(h.win, 'focusin'))
    expect(reasons).toEqual(['focus-outside'])
    h.win.removeEventListener('error', onError)
  })

  it('pointer 建帧后动态 node 跨 Document 时撤帧并原样报告 getter 异常', async () => {
    const h = realmHarness()
    const foreign = document.createElement('div')
    vi.spyOn(h.win, 'requestAnimationFrame').mockImplementation(() => {
      h.setNode(foreign)
      return 51
    })
    const cancel = vi.spyOn(h.win, 'cancelAnimationFrame').mockImplementation(() => {})
    const reasons: string[] = []
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: reason => reasons.push(reason),
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)
    let runtimeError: unknown = null
    const onError = (event: ErrorEvent): void => {
      runtimeError = event.error
      event.preventDefault()
    }
    h.win.addEventListener('error', onError)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))

    expect(runtimeError).toBeInstanceOf(Error)
    expect(runtimeError).not.toBeInstanceOf(AggregateError)
    expect((runtimeError as Error).message).toMatch(/layer\.node.*Document/)
    expect(cancel).toHaveBeenCalledWith(51)
    expect(reasons).toEqual([])

    // clearJustDismissed 已先清状态；节点恢复后 focus 不必等到下一帧就能继续处理。
    h.setNode(h.content)
    h.outside.dispatchEvent(eventIn(h.win, 'focusin'))
    expect(reasons).toEqual(['focus-outside'])
    h.win.removeEventListener('error', onError)
  })

  it('pointer 票据 getter 与撤帧同时失败时 getter 异常保持首位与 cause', async () => {
    const h = realmHarness()
    const foreign = document.createElement('div')
    const cleanupError = new Error('cancel failed')
    vi.spyOn(h.win, 'requestAnimationFrame').mockImplementation(() => {
      h.setNode(foreign)
      return 52
    })
    vi.spyOn(h.win, 'cancelAnimationFrame').mockImplementation(() => {
      throw cleanupError
    })
    const onDismiss = vi.fn()
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer, () => dismiss.dispose())
    await settle(h.win)
    let runtimeError: unknown = null
    const onError = (event: ErrorEvent): void => {
      runtimeError = event.error
      event.preventDefault()
    }
    h.win.addEventListener('error', onError)

    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))

    expect(runtimeError).toBeInstanceOf(AggregateError)
    const failures = (runtimeError as AggregateError).errors
    expect(failures).toHaveLength(2)
    expect(failures[0]).toBeInstanceOf(Error)
    expect((failures[0] as Error).message).toMatch(/layer\.node.*Document/)
    expect(failures[1]).toBe(cleanupError)
    expect((runtimeError as AggregateError).cause).toBe(failures[0])
    expect(onDismiss).not.toHaveBeenCalled()
    h.win.removeEventListener('error', onError)
  })

  it('监听包装器先完成 native add 再抛错时仍逆序撤销部分提交', () => {
    const h = realmHarness()
    const setupError = new Error('listener failed')
    const order: string[] = []
    const nativeAdd = h.doc.addEventListener.bind(h.doc)
    const nativeRemove = h.doc.removeEventListener.bind(h.doc)
    vi.spyOn(h.doc, 'addEventListener').mockImplementation((type, listener, options) => {
      nativeAdd(type, listener, options)
      if (type === 'pointerdown')
        throw setupError
    })
    vi.spyOn(h.doc, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(String(type))
      nativeRemove(type, listener, options)
    })
    const caught = captureThrown(() => createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    }))
    cleanups.push(() => h.frame.remove(), h.disposeLayer)

    expect(caught).toEqual({ threw: true, error: setupError })
    expect(order).toEqual(['pointerdown', 'keydown'])
  })

  it('queueMicrotask 排队后抛错时回滚全部监听，迟到回调不能重新武装', () => {
    const h = realmHarness()
    const setupError = new Error('queue failed')
    const order: string[] = []
    let queued!: () => void
    vi.spyOn(h.win, 'queueMicrotask').mockImplementation((callback) => {
      queued = callback
      throw setupError
    })
    const nativeRemove = h.doc.removeEventListener.bind(h.doc)
    vi.spyOn(h.doc, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(String(type))
      nativeRemove(type, listener, options)
    })
    const onDismiss = vi.fn()

    const caught = captureThrown(() => createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
    }))
    cleanups.push(() => h.frame.remove(), h.disposeLayer)

    expect(caught).toEqual({ threw: true, error: setupError })
    expect(order).toEqual(['keydown', 'focusin', 'pointerdown', 'keydown'])
    queued()
    h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(onDismiss).not.toHaveBeenCalled()
  })

  it('初始化与多项回滚同时失败时按 LIFO 聚合，并以初始化异常为 cause', () => {
    const h = realmHarness()
    const setupError = new Error('queue failed')
    const focusError = new Error('focus remove failed')
    const keyError = new Error('key remove failed')
    const order: string[] = []
    vi.spyOn(h.win, 'queueMicrotask').mockImplementation(() => {
      throw setupError
    })
    const nativeRemove = h.doc.removeEventListener.bind(h.doc)
    vi.spyOn(h.doc, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(String(type))
      nativeRemove(type, listener, options)
      if (type === 'focusin')
        throw focusError
      if (type === 'keydown')
        throw keyError
    })

    const caught = captureThrown(() => createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    }))
    cleanups.push(() => h.frame.remove(), h.disposeLayer)

    expect(caught.threw).toBe(true)
    expect(caught.error).toBeInstanceOf(AggregateError)
    expect((caught.error as AggregateError).errors).toEqual([setupError, keyError, focusError, keyError])
    expect((caught.error as AggregateError).cause).toBe(setupError)
    expect(order).toEqual(['keydown', 'focusin', 'pointerdown', 'keydown'])
  })

  it.each([undefined, null])('dispose 的唯一 cleanup 即使抛出 %s 也原样上抛并继续清理', async (failure) => {
    const h = realmHarness()
    const order: string[] = []
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer)
    await settle(h.win)
    const nativeRemove = h.doc.removeEventListener.bind(h.doc)
    vi.spyOn(h.doc, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(String(type))
      nativeRemove(type, listener, options)
      if (type === 'focusin')
        throw failure
    })

    const caught = captureThrown(() => dismiss.dispose())

    expect(caught.threw).toBe(true)
    expect(Object.is(caught.error, failure)).toBe(true)
    expect(order).toEqual(['keydown', 'focusin', 'pointerdown', 'keydown'])
    expect(() => dismiss.dispose()).not.toThrow()
  })

  it('dispose 从 RAF 到监听完整逆序清理，多项异常按顺序聚合且 cause 为首错', async () => {
    const h = realmHarness()
    const frameError = new Error('frame cancel failed')
    const focusError = new Error('focus remove failed')
    const pointerError = new Error('pointer remove failed')
    const keyError = new Error('key remove failed')
    const order: string[] = []
    vi.spyOn(h.win, 'requestAnimationFrame').mockImplementation(() => 73)
    vi.spyOn(h.win, 'cancelAnimationFrame').mockImplementation(() => {
      order.push('raf')
      throw frameError
    })
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss: () => {},
    })
    cleanups.push(() => h.frame.remove(), h.disposeLayer)
    await settle(h.win)
    h.outside.dispatchEvent(eventIn(h.win, 'pointerdown'))

    const nativeRemove = h.doc.removeEventListener.bind(h.doc)
    vi.spyOn(h.doc, 'removeEventListener').mockImplementation((type, listener, options) => {
      order.push(String(type))
      nativeRemove(type, listener, options)
      if (type === 'focusin')
        throw focusError
      if (type === 'pointerdown')
        throw pointerError
      if (type === 'keydown')
        throw keyError
    })

    const caught = captureThrown(() => dismiss.dispose())

    expect(caught.threw).toBe(true)
    expect(caught.error).toBeInstanceOf(AggregateError)
    expect((caught.error as AggregateError).errors).toEqual([frameError, keyError, focusError, pointerError, keyError])
    expect((caught.error as AggregateError).cause).toBe(frameError)
    expect(order).toEqual(['raf', 'keydown', 'focusin', 'pointerdown', 'keydown'])
    expect(() => dismiss.dispose()).not.toThrow()
  })
})
