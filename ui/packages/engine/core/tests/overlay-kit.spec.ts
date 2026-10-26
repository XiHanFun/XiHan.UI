// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 单测公共准备（tests/setup.ts）已经把按需块取齐；这里每条用例都换一份新加载的模块，
// 量的是第一次打开时按需块还没到的那条路径。
type Loader = typeof import('../src/kernel/structure/overlay-kit')
type FirstInteraction = typeof import('../src/kernel/utils/first-interaction')
type Lease = typeof import('../src/kernel/structure/portal-lease')
type Source = typeof import('../src/kernel/structure/portal-source')

async function fresh(): Promise<{ loader: Loader, interaction: FirstInteraction, lease: Lease, source: Source }> {
  vi.resetModules()
  const loader = await import('../src/kernel/structure/overlay-kit')
  const interaction = await import('../src/kernel/utils/first-interaction')
  const lease = await import('../src/kernel/structure/portal-lease')
  const source = await import('../src/kernel/structure/portal-source')
  return { loader, interaction, lease, source }
}

beforeEach(() => {
  document.body.innerHTML = ''
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('浮层按需块的加载器', () => {
  it('没加载过时取不到；加载过之后同步取到，重复加载给同一份', async () => {
    const { loader } = await fresh()
    expect(loader.overlayKit()).toBeNull()
    expect(() => loader.requireOverlayKit()).toThrow(/浮层按需块还没加载/)

    const first = loader.loadOverlayKit()
    const second = loader.loadOverlayKit()
    const kit = await first
    expect(await second).toBe(kit)
    expect(loader.overlayKit()).toBe(kit)
    expect(loader.requireOverlayKit()).toBe(kit)
    expect(typeof kit.createDismissLayer).toBe('function')
    expect(typeof kit.createFocusScope).toBe('function')
    expect(typeof kit.createPortalVisualBridge).toBe('function')
  })

  it('whenOverlayKit：还没到就排队并开始加载，到了按登记顺序调；撤掉的那一次不调', async () => {
    const { loader } = await fresh()
    const calls: string[] = []
    loader.whenOverlayKit(() => calls.push('a'))
    const cancel = loader.whenOverlayKit(() => calls.push('cancelled'))
    loader.whenOverlayKit(() => calls.push('b'))
    cancel()
    expect(calls).toEqual([])

    await loader.loadOverlayKit()
    expect(calls).toEqual(['a', 'b'])
  })

  it('whenOverlayKit：已经到了就当场调，返回的撤销是空操作', async () => {
    const { loader } = await fresh()
    const kit = await loader.loadOverlayKit()
    const run = vi.fn()
    const cancel = loader.whenOverlayKit(run)
    expect(run).toHaveBeenCalledExactlyOnceWith(kit)
    expect(() => cancel()).not.toThrow()
  })

  it('prefetchOverlayKit：文档上第一次有交互才在后台取，交互之前不取', async () => {
    const { loader } = await fresh()
    loader.prefetchOverlayKit(document)
    await Promise.resolve()
    expect(loader.overlayKit()).toBeNull()

    document.body.dispatchEvent(new Event('pointerover', { bubbles: true }))
    await vi.waitFor(() => expect(loader.overlayKit()).not.toBeNull())
  })
})

describe('首次交互', () => {
  it('同一个任务在同一文档上只跑一次；交互过之后登记的当场跑', async () => {
    const { interaction } = await fresh()
    const run = vi.fn()
    const other = vi.fn()
    interaction.onFirstInteraction(document, run)
    interaction.onFirstInteraction(document, run)
    interaction.onFirstInteraction(document, other)
    expect(run).not.toHaveBeenCalled()

    document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }))
    document.body.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }))
    expect(run).toHaveBeenCalledOnce()
    expect(other).toHaveBeenCalledOnce()

    const late = vi.fn()
    interaction.onFirstInteraction(document, late)
    expect(late).toHaveBeenCalledOnce()
  })

  it('监听在捕获阶段被动挂：作者 stopPropagation 也挡不住，事件本身不受影响', async () => {
    const { interaction } = await fresh()
    const run = vi.fn()
    interaction.onFirstInteraction(document, run)
    const button = document.createElement('button')
    button.addEventListener('pointerdown', event => event.stopPropagation())
    document.body.append(button)

    const event = new Event('pointerdown', { bubbles: true, cancelable: true })
    button.dispatchEvent(event)
    expect(run).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(false)
  })
})

describe('portal 租约等按需块', () => {
  it('按需块没到时照常搬迁、逻辑来源当场登记，视觉桥等它到了再补建；释放后到达不再建', async () => {
    const { loader, lease, source: portalSource } = await fresh()
    const stage = document.createElement('section')
    stage.dataset.theme = 'dark'
    const source = document.createElement('button')
    const parent = document.createElement('div')
    const root = document.createElement('div')
    const target = document.createElement('aside')
    parent.append(root)
    stage.append(source, parent)
    document.body.append(stage, target)

    const held = lease.createPortalLease({ source, target, roots: [root] })
    expect(root.parentElement).toBe(held.shell)
    // 搬进壳的控件当场就能沿逻辑祖先链走回来源：找配置与语言包不等按需块
    expect(portalSource.logicalParentElement(held.shell)).toBe(source)
    expect(portalSource.logicallyContains(stage, root)).toBe(true)
    expect(held.shell.getAttribute('data-theme')).toBeNull()

    await loader.loadOverlayKit()
    expect(held.shell.getAttribute('data-theme')).toBe('dark')
    held.release()
    expect(root.parentElement).toBe(parent)
    expect(portalSource.logicalParentElement(held.shell)).toBeNull()

    // 另一份租约在按需块到达之前就释放：到了也不再建桥
    const { loader: again, lease: leaseAgain } = await fresh()
    const late = leaseAgain.createPortalLease({ source, target, roots: [root] })
    const shell = late.shell
    late.release()
    await again.loadOverlayKit()
    expect(shell.isConnected).toBe(false)
    expect(shell.getAttribute('data-theme')).toBeNull()
  })
})
