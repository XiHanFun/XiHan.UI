// @vitest-environment jsdom
import type { DismissLayerOptions, DismissReason } from '../src/behavior/dismissable-layer'
import type { Disposable, Layer, LayerRegistry, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDismissLayer } from '../src/behavior/dismissable-layer'
import {
  createCounterIdGenerator,
  createLayerRegistry,
  createRuntimeConfig,
  createScope,
  DATA_INERT_EXEMPT,
  DIAGNOSTIC_CODES,
  EV_POINTER_DOWN_OUTSIDE,
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '../src/kernel'

interface ParticipantHarness {
  readonly layer: Layer
  readonly registry: LayerRegistry
  readonly config: RuntimeConfig
  readonly node: HTMLElement
  readonly reasons: DismissReason[]
  readonly dismiss: Disposable
  readonly disposeLayer: () => void
}

interface ParticipantOptions extends Omit<DismissLayerOptions, 'config' | 'layer' | 'onDismiss'> {
  autoPop?: boolean
  branches?: () => Element[]
  nodeGetter?: (node: HTMLElement) => HTMLElement | null
  surfaces?: () => Element[]
  onDismiss?: (reason: DismissReason, controls: { disposeDismiss: () => void, disposeLayer: () => void }) => void
}

const cleanups: Array<() => void> = []

function configFor(registry: LayerRegistry): RuntimeConfig {
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(registry.ownerDocument.body, idGenerator)
  return createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
}

function participant(
  registry: LayerRegistry,
  label: string,
  options: ParticipantOptions = {},
): ParticipantHarness {
  const { autoPop = true, branches, nodeGetter, onDismiss, surfaces, ...dismissOptions } = options
  const doc = registry.ownerDocument
  const node = doc.createElement('div')
  node.dataset.layer = label
  doc.body.append(node)
  const registration = registry.register({
    kind: 'popover',
    node: () => nodeGetter ? nodeGetter(node) : node,
    branches: branches ?? (() => []),
    isModal: () => false,
    setModal: () => {},
    surfaces: surfaces ?? (() => []),
  })
  let dismissDispose = (): void => {}
  const reasons: DismissReason[] = []
  const controls = {
    disposeDismiss: () => dismissDispose(),
    disposeLayer: registration.dispose,
  }
  const config = configFor(registry)
  const dismiss = createDismissLayer({
    ...dismissOptions,
    config,
    layer: registration.layer,
    onDismiss: (reason) => {
      reasons.push(reason)
      onDismiss?.(reason, controls)
      if (autoPop) {
        controls.disposeDismiss()
        controls.disposeLayer()
      }
    },
  })
  dismissDispose = () => dismiss.dispose()
  cleanups.push(() => node.remove(), registration.dispose, () => dismiss.dispose())
  return {
    layer: registration.layer,
    registry,
    config,
    node,
    reasons,
    dismiss,
    disposeLayer: registration.dispose,
  }
}

async function arm(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function outside(doc: Document = document): HTMLButtonElement {
  const node = doc.createElement('button')
  doc.body.append(node)
  cleanups.push(() => node.remove())
  return node
}

function pointerDown(node: Element): void {
  const win = node.ownerDocument.defaultView!
  node.dispatchEvent(new win.Event('pointerdown', { bubbles: true, composed: true }) as PointerEvent)
}

function focusIn(node: Element): void {
  const win = node.ownerDocument.defaultView!
  node.dispatchEvent(new win.FocusEvent('focusin', { bubbles: true, composed: true }))
}

function escape(doc: Document = document): void {
  const win = doc.defaultView!
  doc.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

function escapeFrom(node: Element): void {
  const win = node.ownerDocument.defaultView!
  node.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  resetDiagnostics()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('dismissableLayer Document Hub', () => {
  it('同一 Document 的多个 registry 与参与者只安装一套三类监听，最后释放才逆序卸载', async () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const firstRegistry = createLayerRegistry(document)
    const secondRegistry = createLayerRegistry(document)
    const first = participant(firstRegistry, 'first', { autoPop: false })
    const second = participant(secondRegistry, 'second', { autoPop: false })
    await arm()

    expect(add.mock.calls.map(([type]) => type)).toEqual(['keydown', 'pointerdown', 'focusin'])
    first.dismiss.dispose()
    expect(remove).not.toHaveBeenCalled()
    second.dismiss.dispose()
    expect(remove.mock.calls.map(([type]) => type)).toEqual(['focusin', 'pointerdown', 'keydown'])
  })

  it('同一 registry 的层外 pointer 严格按栈顶到栈底连续退栈', async () => {
    const registry = createLayerRegistry(document)
    const order: string[] = []
    const diagnosticCodes: string[] = []
    setDiagnosticsLevel('warn')
    setDiagnosticsDedupe(false)
    setDiagnosticsConsoleOutput(false)
    cleanups.push(onDiagnostic(record => diagnosticCodes.push(record.code)))
    const bottom = participant(registry, 'bottom', { onDismiss: () => order.push('bottom') })
    const middle = participant(registry, 'middle', { onDismiss: () => order.push('middle') })
    const top = participant(registry, 'top', { onDismiss: () => order.push('top') })
    await arm()

    pointerDown(outside())

    expect(order).toEqual(['top', 'middle', 'bottom'])
    expect(registry.list()).toEqual([])
    expect(top.reasons).toEqual(['pointer-down-outside'])
    expect(middle.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual(['pointer-down-outside'])
    expect(diagnosticCodes).not.toContain(DIAGNOSTIC_CODES.layerDisposeNotTop)
  })

  it('主 Document 与 iframe 分别持有独立 Hub、监听与事件路由', async () => {
    const frame = document.createElement('iframe')
    document.body.append(frame)
    cleanups.push(() => frame.remove())
    const frameDocument = frame.contentDocument!
    const mainAdd = vi.spyOn(document, 'addEventListener')
    const mainRemove = vi.spyOn(document, 'removeEventListener')
    const frameAdd = vi.spyOn(frameDocument, 'addEventListener')
    const frameRemove = vi.spyOn(frameDocument, 'removeEventListener')
    const main = participant(createLayerRegistry(document), 'main')
    const foreign = participant(createLayerRegistry(frameDocument), 'frame')
    await arm()

    expect(mainAdd.mock.calls.map(([type]) => type)).toEqual(['keydown', 'pointerdown', 'focusin'])
    expect(frameAdd.mock.calls.map(([type]) => type)).toEqual(['keydown', 'pointerdown', 'focusin'])

    pointerDown(outside())
    expect(main.reasons).toEqual(['pointer-down-outside'])
    expect(foreign.reasons).toEqual([])
    expect(mainRemove.mock.calls.map(([type]) => type)).toEqual(['focusin', 'pointerdown', 'keydown'])
    expect(frameRemove).not.toHaveBeenCalled()

    pointerDown(outside(frameDocument))
    expect(foreign.reasons).toEqual(['pointer-down-outside'])
    expect(frameRemove.mock.calls.map(([type]) => type)).toEqual(['focusin', 'pointerdown', 'keydown'])
  })

  it('层外 focus 同样按栈顶到栈底连续退栈', async () => {
    const registry = createLayerRegistry(document)
    const order: string[] = []
    participant(registry, 'bottom', { onDismiss: () => order.push('bottom') })
    participant(registry, 'top', { onDismiss: () => order.push('top') })
    await arm()

    focusIn(outside())

    expect(order).toEqual(['top', 'bottom'])
    expect(registry.list()).toEqual([])
  })

  it('不同 registry 各走自己的 lane，彼此的栈顶身份互不阻断', async () => {
    const firstRegistry = createLayerRegistry(document)
    const secondRegistry = createLayerRegistry(document)
    const first = participant(firstRegistry, 'first')
    const second = participant(secondRegistry, 'second')
    await arm()

    pointerDown(outside())

    expect(first.reasons).toEqual(['pointer-down-outside'])
    expect(second.reasons).toEqual(['pointer-down-outside'])
    expect(firstRegistry.list()).toEqual([])
    expect(secondRegistry.list()).toEqual([])
  })

  it('命中层节点时短路 branch 与 surface getter，且不生成层外票', async () => {
    const registry = createLayerRegistry(document)
    const branches = vi.fn((): Element[] => {
      throw new Error('不应读取 branch')
    })
    const surfaces = vi.fn((): Element[] => {
      throw new Error('不应读取 surface')
    })
    const target = participant(registry, 'target', { branches, surfaces })
    await arm()

    pointerDown(target.node)

    expect(branches).not.toHaveBeenCalled()
    expect(surfaces).not.toHaveBeenCalled()
    expect(target.reasons).toEqual([])
  })

  it('命中 branch 时短路 surface getter，且不生成层外票', async () => {
    const registry = createLayerRegistry(document)
    const branch = outside()
    const surfaces = vi.fn((): Element[] => {
      throw new Error('不应读取 surface')
    })
    const target = participant(registry, 'target', { branches: () => [branch], surfaces })
    await arm()

    pointerDown(branch)

    expect(surfaces).not.toHaveBeenCalled()
    expect(target.reasons).toEqual([])
  })

  it('无参与者的真实栈顶成为屏障，不越过它关闭更低层', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    const topNode = document.createElement('div')
    document.body.append(topNode)
    const top = registry.register({
      kind: 'popover',
      node: () => topNode,
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    cleanups.push(() => topNode.remove(), top.dispose)
    await arm()

    pointerDown(outside())

    expect(bottom.reasons).toEqual([])
  })

  it('新参与者尚未 armed 时成为屏障', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    await arm()
    const top = participant(registry, 'top')

    pointerDown(outside())

    expect(top.reasons).toEqual([])
    expect(bottom.reasons).toEqual([])
  })

  it('真实栈顶缺少节点时成为屏障，不读取或关闭更低层', async () => {
    const registry = createLayerRegistry(document)
    const lowerNode = vi.fn((node: HTMLElement) => node)
    const bottom = participant(registry, 'bottom', { nodeGetter: lowerNode })
    const top = participant(registry, 'top', { nodeGetter: () => null })
    await arm()
    lowerNode.mockClear()

    pointerDown(outside())

    expect(lowerNode).not.toHaveBeenCalled()
    expect(top.reasons).toEqual([])
    expect(bottom.reasons).toEqual([])
  })

  it('受控顶层 onDismiss 后未真实退栈时阻断更低层', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    const top = participant(registry, 'top', { autoPop: false })
    await arm()

    pointerDown(outside())

    expect(top.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual([])
    expect(registry.top()).toBe(top.layer)
  })

  it('顶层票否决后成为屏障', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    const top = participant(registry, 'top', {
      onPointerDownOutside: event => event.preventDefault(),
    })
    await arm()

    pointerDown(outside())

    expect(top.reasons).toEqual([])
    expect(bottom.reasons).toEqual([])
  })

  it('顶层退栈之外又移除其他层时前缀不再匹配，停止原计划', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    const middle = participant(registry, 'middle')
    const top = participant(registry, 'top', {
      autoPop: false,
      onDismiss: (_reason, controls) => {
        controls.disposeDismiss()
        controls.disposeLayer()
        middle.dismiss.dispose()
        middle.disposeLayer()
      },
    })
    await arm()

    pointerDown(outside())

    expect(top.reasons).toEqual(['pointer-down-outside'])
    expect(middle.reasons).toEqual([])
    expect(bottom.reasons).toEqual([])
  })

  it('顶层退栈后又登记新层时停止原计划，不穿过新的真实栈顶', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    let disposeNew: (() => void) | null = null
    participant(registry, 'top', {
      autoPop: false,
      onDismiss: (_reason, controls) => {
        controls.disposeDismiss()
        controls.disposeLayer()
        const node = document.createElement('div')
        document.body.append(node)
        const registration = registry.register({
          kind: 'popover',
          node: () => node,
          branches: () => [],
          isModal: () => false,
          setModal: () => {},
          surfaces: () => [],
        })
        disposeNew = () => {
          registration.dispose()
          node.remove()
        }
      },
    })
    cleanups.push(() => disposeNew?.())
    await arm()

    pointerDown(outside())

    expect(bottom.reasons).toEqual([])
    expect(registry.list()).toHaveLength(2)
  })

  it('顶层关闭时把原目标纳入 lower branch，lower 在任何 outside 票前成为屏障', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    const lowerVote = vi.fn()
    let lowerBranches: Element[] = []
    const lower = participant(registry, 'lower', {
      branches: () => lowerBranches,
      onPointerDownOutside: lowerVote,
    })
    participant(registry, 'top', {
      onDismiss: () => {
        lowerBranches = [target]
      },
    })
    await arm()

    pointerDown(target)

    expect(lowerVote).not.toHaveBeenCalled()
    expect(lower.reasons).toEqual([])
  })

  it('顶层关闭时把 middle 改成原目标的 surface，关闭 middle 后停止在 bottom 之前', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    const bottom = participant(registry, 'bottom')
    let middleSurfaces: Element[] = []
    const middle = participant(registry, 'middle', { surfaces: () => middleSurfaces })
    participant(registry, 'top', {
      onDismiss: () => {
        middleSurfaces = [target]
      },
    })
    await arm()

    pointerDown(target)

    expect(middle.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual([])
    expect(registry.top()).toBe(bottom.layer)
  })

  it('静态命中 middle surface 时关闭 top 与 middle，并保留 bottom', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    const bottom = participant(registry, 'bottom')
    const middle = participant(registry, 'middle', { surfaces: () => [target] })
    const top = participant(registry, 'top')
    await arm()

    pointerDown(target)

    expect(top.reasons).toEqual(['pointer-down-outside'])
    expect(middle.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual([])
    expect(registry.top()).toBe(bottom.layer)
  })

  it('outside 候选在执行前变为 surface、表决后再变回 outside 时仍停止在 lower 之前', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    const bottom = participant(registry, 'bottom')
    let middleSurfaces: Element[] = []
    const middle = participant(registry, 'middle', {
      surfaces: () => middleSurfaces,
      onPointerDownOutside: () => {
        middleSurfaces = []
      },
    })
    participant(registry, 'top', {
      onDismiss: () => {
        middleSurfaces = [target]
      },
    })
    await arm()

    pointerDown(target)

    expect(middle.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual([])
    expect(registry.top()).toBe(bottom.layer)
  })

  it('每次 Escape 只处理事件开始时的原始栈顶', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    const top = participant(registry, 'top')
    await arm()

    escape()
    expect(top.reasons).toEqual(['escape-key'])
    expect(bottom.reasons).toEqual([])

    escape()
    expect(bottom.reasons).toEqual(['escape-key'])
  })

  it('escape 不读取 inert 豁免路径，仍只关闭原始栈顶', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    target.setAttribute(DATA_INERT_EXEMPT, '')
    const top = participant(registry, 'top')
    await arm()

    escapeFrom(target)

    expect(top.reasons).toEqual(['escape-key'])
  })

  it('escape 不读取事件路径目标的 hasAttribute', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    const hasAttribute = vi.spyOn(target, 'hasAttribute').mockImplementation(() => {
      throw new Error('Escape 不应读取 hasAttribute')
    })
    const top = participant(registry, 'top')
    await arm()

    escapeFrom(target)

    expect(hasAttribute).not.toHaveBeenCalled()
    expect(top.reasons).toEqual(['escape-key'])
  })

  it('非 Escape 键不会进入协调器路由', async () => {
    const registry = createLayerRegistry(document)
    const target = participant(registry, 'only')
    await arm()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))

    expect(target.reasons).toEqual([])
  })

  it('同一 registry 的同一 Layer 重复创建参与者时明确失败', () => {
    const registry = createLayerRegistry(document)
    const first = participant(registry, 'first', { autoPop: false })

    expect(() => createDismissLayer({
      config: first.config,
      layer: first.layer,
      onDismiss: () => {},
    })).toThrow(/同一 Layer.*只能创建一个 DismissableLayer/)
  })

  it.each(['pointer', 'escape'] as const)(
    'plan %s 的 node getter 替换同 Layer 参与者后放弃旧计划且不读后续 getter',
    async (kind) => {
      const registry = createLayerRegistry(document)
      const node = document.createElement('div')
      document.body.append(node)
      const readBranches = vi.fn((): Element[] => [])
      let replaceOnRead = false
      let replacing = false
      let current: Disposable | null = null
      let replacement: Disposable | null = null
      const oldOption = vi.fn()
      const oldDismiss = vi.fn()
      const replacementDismiss = vi.fn()
      const registration = registry.register({
        kind: 'popover',
        node: () => {
          if (replaceOnRead && !replacing && !replacement) {
            replacing = true
            current!.dispose()
            replacement = createDismissLayer({
              config: configFor(registry),
              layer: registration.layer,
              onDismiss: replacementDismiss,
            })
            replacing = false
          }
          return node
        },
        branches: readBranches,
        isModal: () => false,
        setModal: () => {},
        surfaces: () => [],
      })
      current = createDismissLayer({
        config: configFor(registry),
        layer: registration.layer,
        onDismiss: oldDismiss,
        onPointerDownOutside: oldOption,
        onEscapeKeyDown: oldOption,
      })
      cleanups.push(
        () => node.remove(),
        registration.dispose,
        () => current?.dispose(),
        () => replacement?.dispose(),
      )
      await arm()
      readBranches.mockClear()
      replaceOnRead = true

      if (kind === 'pointer')
        pointerDown(outside())
      else
        escape()

      expect(replacement).not.toBeNull()
      expect(oldOption).not.toHaveBeenCalled()
      expect(oldDismiss).not.toHaveBeenCalled()
      expect(replacementDismiss).not.toHaveBeenCalled()
      if (kind === 'pointer')
        expect(readBranches).not.toHaveBeenCalled()
    },
  )

  it('specific DOM 后的 node getter 替换参与者时不再调用旧 option 或 onDismiss', async () => {
    const registry = createLayerRegistry(document)
    const node = document.createElement('div')
    document.body.append(node)
    let replaceOnRead = false
    let replacing = false
    let current: Disposable | null = null
    let replacement: Disposable | null = null
    const oldOption = vi.fn()
    const oldDismiss = vi.fn()
    const replacementDismiss = vi.fn()
    const registration = registry.register({
      kind: 'popover',
      node: () => {
        if (replaceOnRead && !replacing && !replacement) {
          replacing = true
          current!.dispose()
          replacement = createDismissLayer({
            config: configFor(registry),
            layer: registration.layer,
            onDismiss: replacementDismiss,
          })
          replacing = false
        }
        return node
      },
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    node.addEventListener(EV_POINTER_DOWN_OUTSIDE, () => {
      replaceOnRead = true
    })
    current = createDismissLayer({
      config: configFor(registry),
      layer: registration.layer,
      onPointerDownOutside: oldOption,
      onDismiss: oldDismiss,
    })
    cleanups.push(
      () => node.remove(),
      registration.dispose,
      () => current?.dispose(),
      () => replacement?.dispose(),
    )
    await arm()

    pointerDown(outside())

    expect(replacement).not.toBeNull()
    expect(oldOption).not.toHaveBeenCalled()
    expect(oldDismiss).not.toHaveBeenCalled()
    expect(replacementDismiss).not.toHaveBeenCalled()
  })

  it('stage 初检的 branch getter 替换参与者后短路 surface 与旧表决', async () => {
    const registry = createLayerRegistry(document)
    const targetRef: { current: ParticipantHarness | null } = { current: null }
    let branchReads = 0
    let replaceOnSecondRead = false
    let replacement: Disposable | null = null
    const surfacesAfterReplacement = vi.fn()
    const oldVote = vi.fn()
    const oldDismiss = vi.fn()
    const replacementDismiss = vi.fn()
    const target = participant(registry, 'target', {
      autoPop: false,
      branches: () => {
        branchReads += 1
        if (replaceOnSecondRead && branchReads === 2) {
          const current = targetRef.current!
          current.dismiss.dispose()
          replacement = createDismissLayer({
            config: current.config,
            layer: current.layer,
            onDismiss: replacementDismiss,
          })
        }
        return []
      },
      surfaces: () => {
        if (replacement)
          surfacesAfterReplacement()
        return []
      },
      onPointerDownOutside: oldVote,
      onDismiss: oldDismiss,
    })
    targetRef.current = target
    cleanups.push(() => replacement?.dispose())
    await arm()
    replaceOnSecondRead = true

    pointerDown(outside())

    expect(replacement).not.toBeNull()
    expect(branchReads).toBe(2)
    expect(surfacesAfterReplacement).not.toHaveBeenCalled()
    expect(oldVote).not.toHaveBeenCalled()
    expect(oldDismiss).not.toHaveBeenCalled()
    expect(replacementDismiss).not.toHaveBeenCalled()
  })

  it('interact 后复检的 branch getter 替换参与者后短路 surface 与旧提交', async () => {
    const registry = createLayerRegistry(document)
    const targetRef: { current: ParticipantHarness | null } = { current: null }
    let replaceOnBranchRead = false
    let replacement: Disposable | null = null
    const surfacesAfterReplacement = vi.fn()
    const specificVote = vi.fn()
    const interactVote = vi.fn(() => {
      replaceOnBranchRead = true
    })
    const oldDismiss = vi.fn()
    const replacementDismiss = vi.fn()
    const target = participant(registry, 'target', {
      autoPop: false,
      branches: () => {
        if (replaceOnBranchRead && !replacement) {
          const current = targetRef.current!
          current.dismiss.dispose()
          replacement = createDismissLayer({
            config: current.config,
            layer: current.layer,
            onDismiss: replacementDismiss,
          })
        }
        return []
      },
      surfaces: () => {
        if (replacement)
          surfacesAfterReplacement()
        return []
      },
      onPointerDownOutside: specificVote,
      onInteractOutside: interactVote,
      onDismiss: oldDismiss,
    })
    targetRef.current = target
    cleanups.push(() => replacement?.dispose())
    await arm()

    pointerDown(outside())

    expect(specificVote).toHaveBeenCalledOnce()
    expect(interactVote).toHaveBeenCalledOnce()
    expect(replacement).not.toBeNull()
    expect(surfacesAfterReplacement).not.toHaveBeenCalled()
    expect(oldDismiss).not.toHaveBeenCalled()
    expect(replacementDismiss).not.toHaveBeenCalled()
  })

  it('协调器重入锁忽略回调同步派发的第二次 pointer', async () => {
    const registry = createLayerRegistry(document)
    const target = outside()
    const bottom = participant(registry, 'bottom')
    const top = participant(registry, 'top', {
      onPointerDownOutside: () => pointerDown(target),
    })
    await arm()

    pointerDown(target)

    expect(top.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual(['pointer-down-outside'])
  })

  it('派发中最后参与者释放后同步新建会复用原 Hub，不重复安装监听', async () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const registry = createLayerRegistry(document)
    const node = document.createElement('div')
    document.body.append(node)
    const registration = registry.register({
      kind: 'popover',
      node: () => node,
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    let current: Disposable | null = null
    let replacement: Disposable | null = null
    const replacementDismiss = vi.fn()
    current = createDismissLayer({
      config: configFor(registry),
      layer: registration.layer,
      onDismiss: () => {},
      onPointerDownOutside: () => {
        current!.dispose()
        replacement = createDismissLayer({
          config: configFor(registry),
          layer: registration.layer,
          onDismiss: replacementDismiss,
        })
      },
    })
    cleanups.push(() => node.remove(), registration.dispose, () => current?.dispose(), () => replacement?.dispose())
    await arm()

    pointerDown(outside())

    expect(add.mock.calls.map(([type]) => type)).toEqual(['keydown', 'pointerdown', 'focusin'])
    expect(remove).not.toHaveBeenCalled()
    await arm()
    pointerDown(outside())
    expect(replacementDismiss).toHaveBeenCalledWith('pointer-down-outside')
  })

  it('事件开始先冻结所有 lane，前一 lane 改变后一 lane 时后一计划失效', async () => {
    const firstRegistry = createLayerRegistry(document)
    const secondRegistry = createLayerRegistry(document)
    participant(firstRegistry, 'first', {
      onDismiss: () => {
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
      },
    })
    const second = participant(secondRegistry, 'second')
    await arm()

    pointerDown(outside())

    expect(second.reasons).toEqual([])
  })

  it('第一 lane 的计划 getter 改变第二 lane 后，第二 lane 不再读取过期节点 getter', async () => {
    const firstRegistry = createLayerRegistry(document)
    const secondRegistry = createLayerRegistry(document)
    let planning = false
    let disposeExtra: (() => void) | null = null
    participant(firstRegistry, 'first', {
      nodeGetter: (node) => {
        if (planning && !disposeExtra) {
          const extra = document.createElement('div')
          document.body.append(extra)
          const registration = secondRegistry.register({
            kind: 'popover',
            node: () => extra,
            branches: () => [],
            isModal: () => false,
            setModal: () => {},
            surfaces: () => [],
          })
          disposeExtra = () => {
            registration.dispose()
            extra.remove()
          }
        }
        return node
      },
    })
    const readSecondNode = vi.fn((node: HTMLElement) => node)
    const second = participant(secondRegistry, 'second', { nodeGetter: readSecondNode })
    cleanups.push(() => disposeExtra?.())
    await arm()
    readSecondNode.mockClear()
    planning = true

    pointerDown(outside())

    expect(readSecondNode).not.toHaveBeenCalled()
    expect(second.reasons).toEqual([])
  })

  it('top 计划 getter 改变本 lane 后立即放弃，lower getter 不再被读取', async () => {
    const registry = createLayerRegistry(document)
    const readLowerNode = vi.fn((node: HTMLElement) => node)
    const lower = participant(registry, 'lower', { nodeGetter: readLowerNode })
    let planning = false
    let disposeExtra: (() => void) | null = null
    const top = participant(registry, 'top', {
      nodeGetter: (node) => {
        if (planning && !disposeExtra) {
          const extra = document.createElement('div')
          document.body.append(extra)
          const registration = registry.register({
            kind: 'popover',
            node: () => extra,
            branches: () => [],
            isModal: () => false,
            setModal: () => {},
            surfaces: () => [],
          })
          disposeExtra = () => {
            registration.dispose()
            extra.remove()
          }
        }
        return node
      },
    })
    cleanups.push(() => disposeExtra?.())
    await arm()
    readLowerNode.mockClear()
    planning = true

    pointerDown(outside())

    expect(readLowerNode).not.toHaveBeenCalled()
    expect(top.reasons).toEqual([])
    expect(lower.reasons).toEqual([])
  })

  it('多个 lane 共用本次事件的一份冻结 composedPath', async () => {
    participant(createLayerRegistry(document), 'first')
    participant(createLayerRegistry(document), 'second')
    const target = outside()
    await arm()
    const event = new PointerEvent('pointerdown', { bubbles: true, composed: true })
    const path = vi.spyOn(event, 'composedPath')

    target.dispatchEvent(event)

    expect(path).toHaveBeenCalledTimes(1)
  })

  it('pointer 后的 focus 在受控顶层抑制期形成屏障', async () => {
    const registry = createLayerRegistry(document)
    const bottom = participant(registry, 'bottom')
    const top = participant(registry, 'top', { autoPop: false })
    const target = outside()
    await arm()

    pointerDown(target)
    focusIn(target)

    expect(top.reasons).toEqual(['pointer-down-outside'])
    expect(bottom.reasons).toEqual([])
  })
})
