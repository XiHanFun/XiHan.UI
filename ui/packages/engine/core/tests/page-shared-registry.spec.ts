// @vitest-environment jsdom
// 页面级的按 Document 单例：页面上装了几份 core（这里用 resetModules 重新载入模块来模拟第二份），
// 浮层层级栈、Esc 派发枢纽、焦点域、滚动锁与 aria-hidden 计数仍只有一份；另一个 Document 各有各的。

import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPageSharedRegistry, createPageSharedSlot } from '../src/kernel/structure/page-shared-registry'

afterEach(() => {
  vi.resetModules()
})

/** 重新载入一份 core 的浮层登记表模块，与页面上已有的那份互不共享模块变量。 */
async function freshLayerModule(): Promise<typeof import('../src/kernel/structure/layer-registry')> {
  vi.resetModules()
  return import('../src/kernel/structure/layer-registry')
}

interface CoreCopy {
  readonly kernel: typeof import('../src/kernel')
  readonly scroll: typeof import('../src/behavior/scroll-lock')
  readonly dismiss: typeof import('../src/behavior/dismissable-layer')
}

/** 重新载入一整份 core 的相关模块，模拟页面上的另一份 core。 */
async function freshCore(): Promise<CoreCopy> {
  vi.resetModules()
  const [kernel, scroll, dismiss] = await Promise.all([
    import('../src/kernel'),
    import('../src/behavior/scroll-lock'),
    import('../src/behavior/dismissable-layer'),
  ])
  return { kernel, scroll, dismiss }
}

function configOf(kernel: CoreCopy['kernel']): ReturnType<CoreCopy['kernel']['createRuntimeConfig']> {
  const idGenerator = kernel.createCounterIdGenerator()
  return kernel.createRuntimeConfig({ scope: kernel.createScope(document.body, idGenerator), idGenerator })
}

/** 在这份 core 的浮层栈上登记一层模态，并挂上 Esc 与外部点击的消解。 */
function dismissParticipant(copy: CoreCopy, label: string): { reasons: string[], dispose: () => void } {
  const config = configOf(copy.kernel)
  const node = document.createElement('div')
  node.dataset.layer = label
  document.body.append(node)
  const registration = config.layerRegistry.register({ kind: 'modal', node: () => node, branches: () => [], isModal: () => true, surfaces: () => [] })
  const reasons: string[] = []
  const dismiss = copy.dismiss.createDismissLayer({ config, layer: registration.layer, onDismiss: reason => reasons.push(reason) })
  return {
    reasons,
    dispose: () => {
      dismiss.dispose()
      registration.dispose()
      node.remove()
    },
  }
}

describe('页面级的按 Document 注册表', () => {
  it('同一个键在同一个 Document 上只建一次，几次创建注册表取到的是同一个实例', () => {
    const factory = vi.fn(() => ({ count: 0 }))
    const first = createPageSharedRegistry('test-shared@1', factory)
    const second = createPageSharedRegistry('test-shared@1', factory)
    expect(second.get(document)).toBe(first.get(document))
    expect(factory).toHaveBeenCalledTimes(1)
  })

  it('换了协议版本号的键各用各的', () => {
    const v1 = createPageSharedRegistry('test-versioned@1', () => ({ version: 1 }))
    const v2 = createPageSharedRegistry('test-versioned@2', () => ({ version: 2 }))
    expect(v1.get(document)).not.toBe(v2.get(document))
  })

  it('另一个 Document 有自己的实例，存放位不出现在 Document 的可枚举属性里', () => {
    const registry = createPageSharedRegistry('test-isolated@1', () => ({}))
    const other = document.implementation.createHTMLDocument('other')
    expect(registry.get(other)).not.toBe(registry.get(document))
    expect(Object.keys(document)).not.toContain('@xihan-ui/core/test-isolated@1')
  })

  it('存放位删掉后再取会重建', () => {
    const slot = createPageSharedSlot<{ n: number }>('test-slot@1')
    slot.set(document, { n: 1 })
    expect(slot.peek(document)).toEqual({ n: 1 })
    slot.delete(document)
    expect(slot.peek(document)).toBeUndefined()
  })
})

describe('两份 core 共用同一个浮层栈', () => {
  it('两份模块取到的 LayerRegistry 是同一个，后登记的层在上', async () => {
    const copyA = await freshLayerModule()
    const copyB = await freshLayerModule()
    const a = copyA.getLayerRegistry(document)
    expect(copyB.getLayerRegistry(document)).toBe(a)

    const outer = document.createElement('div')
    const inner = document.createElement('div')
    document.body.append(outer, inner)
    const base = { branches: () => [], isModal: () => true, surfaces: () => [] }
    const first = a.register({ ...base, kind: 'modal', node: () => outer })
    const second = copyB.getLayerRegistry(document).register({ ...base, kind: 'modal', node: () => inner })
    expect(a.top()).toBe(second.layer)
    expect(a.visualOf(second.layer).visualIndex).toBe(a.visualOf(first.layer).visualIndex + 1)
    second.dispose()
    first.dispose()
    outer.remove()
    inner.remove()
  })

  it('滚动锁的计数是一份：一份 core 先放手，另一份还拿着时页面仍锁着', async () => {
    const a = await freshCore()
    const b = await freshCore()
    const lockA = a.scroll.acquireScrollLock({ config: configOf(a.kernel) })
    const lockB = b.scroll.acquireScrollLock({ config: configOf(b.kernel) })
    expect(document.body.style.overflow).toBe('hidden')
    lockA.dispose()
    expect(document.body.style.overflow, '另一份还拿着锁').toBe('hidden')
    lockB.dispose()
    expect(document.body.style.overflow).toBe('')
  })

  it('esc 只落在最上层：外层由一份 core 登记、内层由另一份登记', async () => {
    const a = await freshCore()
    const b = await freshCore()
    const outer = dismissParticipant(a, 'outer')
    const inner = dismissParticipant(b, 'inner')
    // 消解层的监听在下一拍微任务里接上
    await Promise.resolve()
    await Promise.resolve()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(inner.reasons).toEqual(['escape-key'])
    expect(outer.reasons).toEqual([])
    inner.dispose()
    outer.dispose()
  })

  it('aria-hidden 计数也是一份', async () => {
    vi.resetModules()
    const aria1 = await import('../src/kernel/capability/a11y/aria-hidden-registry')
    vi.resetModules()
    const aria2 = await import('../src/kernel/capability/a11y/aria-hidden-registry')
    expect(aria2.getAriaHiddenRegistry(document)).toBe(aria1.getAriaHiddenRegistry(document))
  })
})
