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
} from '../src/kernel'

interface Harness {
  readonly doc: Document
  readonly win: Window & typeof globalThis
  readonly registry: LayerRegistry
  readonly config: RuntimeConfig
  readonly layer: Layer
  readonly content: HTMLElement
  readonly outside: HTMLButtonElement
  readonly other: HTMLButtonElement
  readonly reasons: DismissReason[]
  readonly dismiss: Disposable
  setNode: (node: HTMLElement | null) => void
  setNodeGetter: (getter: () => HTMLElement | null) => void
}

type HarnessOptions = Omit<DismissLayerOptions, 'config' | 'layer' | 'onDismiss'> & {
  onDismiss?: (reason: DismissReason) => void
}

const cleanups: Array<() => void> = []

function harness(options: HarnessOptions = {}): Harness {
  const doc = document
  const win = window
  const content = doc.createElement('div')
  const outside = doc.createElement('button')
  const other = doc.createElement('button')
  doc.body.append(content, outside, other)
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(content, idGenerator)
  const registry = createLayerRegistry(doc)
  let currentNode: HTMLElement | null = content
  let resolveNode = (): HTMLElement | null => currentNode
  const registration = registry.register({
    kind: 'popover',
    node: () => resolveNode(),
    branches: () => [],
    isModal: () => false,
    setModal: () => {},
    surfaces: () => [],
  })
  const config = createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
  const reasons: DismissReason[] = []
  const dismiss = createDismissLayer({
    ...options,
    config,
    layer: registration.layer,
    onDismiss: (reason) => {
      reasons.push(reason)
      options.onDismiss?.(reason)
    },
  })
  cleanups.push(() => content.remove(), () => outside.remove(), () => other.remove(), registration.dispose, dismiss.dispose)
  return {
    doc,
    win,
    registry,
    config,
    layer: registration.layer,
    content,
    outside,
    other,
    reasons,
    dismiss,
    setNode: node => currentNode = node,
    setNodeGetter: getter => resolveNode = getter,
  }
}

async function arm(): Promise<void> {
  await Promise.resolve()
  await Promise.resolve()
}

function pointer(
  target: Element,
  type: 'pointerdown' | 'pointerup' | 'pointercancel',
  pointerType: 'touch' | 'mouse' | 'pen',
  pointerId = 1,
  isPrimary = true,
): PointerEvent {
  const win = target.ownerDocument.defaultView!
  const event = new win.MouseEvent(type, { bubbles: true, cancelable: true, composed: true })
  Object.defineProperties(event, {
    pointerType: { value: pointerType },
    pointerId: { value: pointerId },
    isPrimary: { value: isPrimary },
  })
  target.dispatchEvent(event)
  return event as unknown as PointerEvent
}

function click(target: Element, pointerId?: number, pointerType?: string): MouseEvent {
  const win = target.ownerDocument.defaultView!
  const event = new win.MouseEvent('click', { bubbles: true, cancelable: true, composed: true })
  if (pointerId !== undefined)
    Object.defineProperty(event, 'pointerId', { value: pointerId })
  if (pointerType !== undefined)
    Object.defineProperty(event, 'pointerType', { value: pointerType })
  target.dispatchEvent(event)
  return event
}

function focusOutside(target: Element): void {
  const win = target.ownerDocument.defaultView!
  target.dispatchEvent(new win.FocusEvent('focusin', { bubbles: true, cancelable: true, composed: true }))
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
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('dismissableLayer 触摸 click 提交', () => {
  it('touch pointerdown 只建票，focusin 与 pointerup 均不关闭，匹配 click 才用原 PointerEvent 提交', async () => {
    const specific: CustomEvent[] = []
    const interact: CustomEvent[] = []
    const h = harness({
      onPointerDownOutside: event => specific.push(event),
      onInteractOutside: event => interact.push(event),
    })
    await arm()

    const down = pointer(h.outside, 'pointerdown', 'touch', 7)
    focusOutside(h.outside)
    expect(h.reasons).toEqual([])
    expect(specific).toEqual([])

    pointer(h.outside, 'pointerup', 'touch', 7)
    expect(h.reasons).toEqual([])
    const committedBy = click(h.outside, 7, 'touch')

    expect(committedBy.type).toBe('click')
    expect(h.reasons).toEqual(['pointer-down-outside'])
    expect(specific).toHaveLength(1)
    expect(interact).toHaveLength(1)
    expect(specific[0]!.detail.originalEvent).toBe(down)
    expect(interact[0]!.detail.originalEvent).toBe(down)
  })

  it.each(['mouse', 'pen'] as const)('%s 仍在 pointerdown 当场处理且不等待 click', async (pointerType) => {
    const originals: PointerEvent[] = []
    const h = harness({
      onPointerDownOutside: event => originals.push(event.detail.originalEvent),
    })
    await arm()

    const down = pointer(h.outside, 'pointerdown', pointerType, 3)

    expect(h.reasons).toEqual(['pointer-down-outside'])
    expect(originals).toEqual([down])
  })

  it('滚动取消待提交触摸，后续 click 不误关且 focus 恢复正常仲裁', async () => {
    const h = harness()
    await arm()

    pointer(h.outside, 'pointerdown', 'touch', 1)
    h.outside.dispatchEvent(new h.win.Event('scroll'))
    pointer(h.outside, 'pointerup', 'touch', 1)
    click(h.outside, 1, 'touch')
    expect(h.reasons).toEqual([])

    focusOutside(h.outside)
    expect(h.reasons).toEqual(['focus-outside'])
  })

  it.each(['pointercancel', 'contextmenu', 'blur', 'visibilitychange', 'keydown'] as const)(
    '%s 会取消待提交触摸，后续 pointerup/click 不关闭',
    async (interruption) => {
      const h = harness()
      await arm()
      pointer(h.outside, 'pointerdown', 'touch', 2)

      if (interruption === 'pointercancel')
        pointer(h.outside, 'pointercancel', 'touch', 2)
      else if (interruption === 'contextmenu')
        h.outside.dispatchEvent(new h.win.MouseEvent('contextmenu', { bubbles: true }))
      else if (interruption === 'blur')
        h.win.dispatchEvent(new h.win.Event('blur'))
      else if (interruption === 'visibilitychange')
        h.doc.dispatchEvent(new h.win.Event('visibilitychange'))
      else
        h.doc.dispatchEvent(new h.win.KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))

      pointer(h.outside, 'pointerup', 'touch', 2)
      click(h.outside, 2, 'touch')
      expect(h.reasons).toEqual([])
    },
  )

  it('新 pointerdown 取消旧触摸；新 mouse 仍按自己的 pointerdown 当场关闭', async () => {
    const originals: PointerEvent[] = []
    const h = harness({ onPointerDownOutside: event => originals.push(event.detail.originalEvent) })
    await arm()

    pointer(h.outside, 'pointerdown', 'touch', 1)
    const mouse = pointer(h.other, 'pointerdown', 'mouse', 2)
    pointer(h.outside, 'pointerup', 'touch', 1)
    click(h.outside, 1, 'touch')

    expect(h.reasons).toEqual(['pointer-down-outside'])
    expect(originals).toEqual([mouse])
  })

  it('非 primary 的新触摸只取消旧计划，不会建立第二指关闭计划', async () => {
    const h = harness()
    await arm()

    pointer(h.outside, 'pointerdown', 'touch', 1)
    pointer(h.other, 'pointerdown', 'touch', 2, false)
    pointer(h.other, 'pointerup', 'touch', 2, false)
    click(h.other, 2, 'touch')

    expect(h.reasons).toEqual([])
  })

  it.each([
    ['缺少 pointerup', 'no-up'],
    ['pointerup id 不同', 'wrong-up-id'],
    ['click 目标不同', 'wrong-target'],
    ['click id 不同', 'wrong-click-id'],
    ['click pointerType 非 touch', 'wrong-click-type'],
  ] as const)('%s 时拒绝提交且不等待更晚的 click', async (_label, scenario) => {
    const h = harness()
    await arm()
    pointer(h.outside, 'pointerdown', 'touch', 8)

    if (scenario !== 'no-up')
      pointer(h.outside, 'pointerup', 'touch', scenario === 'wrong-up-id' ? 9 : 8)
    if (scenario === 'wrong-target')
      click(h.other, 8, 'touch')
    else if (scenario === 'wrong-click-id')
      click(h.outside, 9, 'touch')
    else if (scenario === 'wrong-click-type')
      click(h.outside, 8, 'mouse')
    else
      click(h.outside, 8, 'touch')

    pointer(h.outside, 'pointerup', 'touch', 8)
    click(h.outside, 8, 'touch')
    expect(h.reasons).toEqual([])
  })

  it('layer snapshot ABA 后旧触摸计划失效', async () => {
    const h = harness()
    await arm()
    pointer(h.outside, 'pointerdown', 'touch', 4)
    const transient = h.registry.register({
      kind: 'popover',
      node: () => h.other,
      branches: () => [],
      isModal: () => false,
      setModal: () => {},
      surfaces: () => [],
    })
    transient.dispose()

    pointer(h.outside, 'pointerup', 'touch', 4)
    click(h.outside, 4, 'touch')
    expect(h.reasons).toEqual([])
  })

  it('候选节点换代或参与者失活都会取消旧触摸计划', async () => {
    const h = harness()
    await arm()
    pointer(h.outside, 'pointerdown', 'touch', 5)
    h.setNode(h.other)
    pointer(h.outside, 'pointerup', 'touch', 5)
    click(h.outside, 5, 'touch')
    expect(h.reasons).toEqual([])

    h.setNode(h.content)
    pointer(h.outside, 'pointerdown', 'touch', 6)
    h.dismiss.dispose()
    pointer(h.outside, 'pointerup', 'touch', 6)
    click(h.outside, 6, 'touch')
    expect(h.reasons).toEqual([])
  })

  it('不使用固定 timeout：任意时长后匹配 pointerup/click 仍可提交', async () => {
    const h = harness()
    await arm()
    vi.useFakeTimers()

    pointer(h.outside, 'pointerdown', 'touch', 10)
    vi.advanceTimersByTime(24 * 60 * 60 * 1000)
    pointer(h.outside, 'pointerup', 'touch', 10)
    click(h.outside, 10, 'touch')

    expect(h.reasons).toEqual(['pointer-down-outside'])
  })

  it('触摸提交监听 add 完成后抛错时逆序回滚，旧 pointer 不会留下待提交计划', async () => {
    const h = harness()
    await arm()
    const setupError = new Error('click add failed')
    const nativeAdd = h.doc.addEventListener.bind(h.doc)
    const nativeRemove = h.doc.removeEventListener.bind(h.doc)
    const add = vi.spyOn(h.doc, 'addEventListener').mockImplementation((type, listener, options) => {
      nativeAdd(type, listener, options)
      if (type === 'click')
        throw setupError
    })
    const removed: string[] = []
    const remove = vi.spyOn(h.doc, 'removeEventListener').mockImplementation((type, listener, options) => {
      removed.push(String(type))
      nativeRemove(type, listener, options)
    })

    const errors = captureRuntimeErrors(() => pointer(h.outside, 'pointerdown', 'touch', 11))

    expect(errors).toEqual([setupError])
    expect(removed).toEqual(['click', 'visibilitychange', 'contextmenu', 'scroll', 'pointercancel', 'pointerup'])
    add.mockRestore()
    remove.mockRestore()
    pointer(h.outside, 'pointerup', 'touch', 11)
    click(h.outside, 11, 'touch')
    expect(h.reasons).toEqual([])
  })

  it('参与者在等待 click 时释放，会先清掉全部触摸监听再卸载共享 Hub', async () => {
    const h = harness()
    await arm()
    const docRemove = vi.spyOn(h.doc, 'removeEventListener')
    const winRemove = vi.spyOn(h.win, 'removeEventListener')
    pointer(h.outside, 'pointerdown', 'touch', 12)

    h.dismiss.dispose()

    expect(winRemove.mock.calls.map(([type]) => type)).toEqual(['blur'])
    expect(docRemove.mock.calls.map(([type]) => type)).toEqual([
      'click',
      'visibilitychange',
      'contextmenu',
      'scroll',
      'pointercancel',
      'pointerup',
      'keydown',
      'focusin',
      'pointerdown',
      'keydown',
    ])
    pointer(h.outside, 'pointerup', 'touch', 12)
    click(h.outside, 12, 'touch')
    expect(h.reasons).toEqual([])
  })

  it('第一 registry 的 node getter 抛错时隔离该 lane，第二 registry 仍在 click 提交', async () => {
    const first = harness()
    const second = harness()
    await arm()
    pointer(first.outside, 'pointerdown', 'touch', 13)
    const nodeError = new Error('first lane node failed')
    first.setNodeGetter(() => {
      throw nodeError
    })

    const errors = captureRuntimeErrors(() => pointer(first.outside, 'pointerup', 'touch', 13))
    click(first.outside, 13, 'touch')

    expect(errors).toEqual([nodeError])
    expect(first.reasons).toEqual([])
    expect(second.reasons).toEqual(['pointer-down-outside'])
  })
})
