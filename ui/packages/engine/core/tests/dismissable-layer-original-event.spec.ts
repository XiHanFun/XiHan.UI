// @vitest-environment jsdom
import type { DismissLayerOptions } from '../src/behavior/dismissable-layer'
import type { Layer, RuntimeConfig } from '../src/kernel'
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import { createDismissLayer } from '../src/behavior/dismissable-layer'
import {
  createCounterIdGenerator,
  createLayerRegistry,
  createRuntimeConfig,
  createScope,
  EV_FOCUS_OUTSIDE,
  EV_INTERACT_OUTSIDE,
  EV_POINTER_DOWN_OUTSIDE,
} from '../src/kernel'

interface Harness {
  readonly win: Window & typeof globalThis
  readonly content: HTMLElement
  readonly outside: HTMLElement
  readonly config: RuntimeConfig
  readonly layer: Layer
}

const cleanups: Array<() => void> = []

function createHarness(): Harness {
  const frame = document.createElement('iframe')
  document.body.append(frame)
  const doc = frame.contentDocument!
  const win = frame.contentWindow! as Window & typeof globalThis
  const content = doc.createElement('div')
  const outside = doc.createElement('button')
  doc.body.append(content, outside)
  const idGenerator = createCounterIdGenerator()
  const scope = createScope(content, idGenerator)
  const registry = createLayerRegistry(doc)
  const registration = registry.register({
    kind: 'popover',
    node: () => content,
    branches: () => [],
    isModal: () => false,
    surfaces: () => [],
  })
  const config = createRuntimeConfig({ scope, idGenerator, layerRegistry: registry })
  cleanups.push(() => frame.remove(), registration.dispose)
  return {
    win,
    content,
    outside,
    config,
    layer: registration.layer,
  }
}

async function arm(win: Window & typeof globalThis): Promise<void> {
  await new Promise<void>(resolve => win.queueMicrotask(resolve))
}

function pointerEvent(win: Window & typeof globalThis): PointerEvent {
  return new win.MouseEvent('pointerdown', {
    bubbles: true,
    cancelable: true,
    composed: true,
  }) as unknown as PointerEvent
}

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('dismissableLayer 层外票据的原事件合同', () => {
  it('pointer、focus 与 interact 的 DOM 票和 options 票共享同一所属 realm 事件，并保留原事件身份', async () => {
    const h = createHarness()
    const domVotes: Event[] = []
    const optionVotes: Event[] = []
    const reasons: string[] = []
    for (const type of [EV_POINTER_DOWN_OUTSIDE, EV_FOCUS_OUTSIDE, EV_INTERACT_OUTSIDE])
      h.content.addEventListener(type, event => domVotes.push(event))

    const options: DismissLayerOptions = {
      config: h.config,
      layer: h.layer,
      onDismiss: reason => reasons.push(reason),
      onPointerDownOutside: (event) => {
        expectTypeOf(event).toEqualTypeOf<CustomEvent<{ originalEvent: PointerEvent }>>()
        optionVotes.push(event)
      },
      onFocusOutside: (event) => {
        expectTypeOf(event).toEqualTypeOf<CustomEvent<{ originalEvent: FocusEvent }>>()
        optionVotes.push(event)
      },
      onInteractOutside: (event) => {
        expectTypeOf(event).toEqualTypeOf<CustomEvent<{ originalEvent: PointerEvent | FocusEvent }>>()
        optionVotes.push(event)
      },
    }
    const dismiss = createDismissLayer(options)
    cleanups.push(dismiss.dispose)
    await arm(h.win)

    const focus = new h.win.FocusEvent('focusin', { bubbles: true, cancelable: true, composed: true })
    const pointer = pointerEvent(h.win)
    h.outside.dispatchEvent(focus)
    h.outside.dispatchEvent(pointer)

    expect(reasons).toEqual(['focus-outside', 'pointer-down-outside'])
    expect(domVotes).toHaveLength(4)
    expect(optionVotes).toEqual(domVotes)
    for (const vote of domVotes)
      expect(vote).toBeInstanceOf(h.win.CustomEvent)
    expect((domVotes[0] as CustomEvent).detail.originalEvent).toBe(focus)
    expect((domVotes[1] as CustomEvent).detail.originalEvent).toBe(focus)
    expect((domVotes[2] as CustomEvent).detail.originalEvent).toBe(pointer)
    expect((domVotes[3] as CustomEvent).detail.originalEvent).toBe(pointer)
    expect(focus).toBeInstanceOf(h.win.FocusEvent)
    expect(pointer).toBeInstanceOf(h.win.MouseEvent)
  })

  it('dom 与 options 在同一可取消票上累积 preventDefault，并在两票送达后阻止关闭', async () => {
    const h = createHarness()
    const onDismiss = vi.fn()
    const specificOptions: CustomEvent[] = []
    const interactOptions: CustomEvent[] = []
    let preventInteract = false
    let preventSpecificFromInteract = false
    const dismiss = createDismissLayer({
      config: h.config,
      layer: h.layer,
      onDismiss,
      onPointerDownOutside: event => specificOptions.push(event),
      onInteractOutside: (event) => {
        interactOptions.push(event)
        if (preventInteract)
          event.preventDefault()
        if (preventSpecificFromInteract)
          specificOptions.at(-1)!.preventDefault()
      },
    })
    cleanups.push(dismiss.dispose)
    await arm(h.win)

    let specificDom: CustomEvent | null = null
    h.content.addEventListener(EV_POINTER_DOWN_OUTSIDE, (event) => {
      specificDom = event as CustomEvent
      event.preventDefault()
    }, { once: true })
    const first = pointerEvent(h.win)
    h.outside.dispatchEvent(first)

    expect(specificOptions).toEqual([specificDom])
    expect(specificOptions[0]!.defaultPrevented).toBe(true)
    expect(specificOptions[0]!.detail.originalEvent).toBe(first)
    expect(interactOptions).toHaveLength(1)
    expect(interactOptions[0]!.detail.originalEvent).toBe(first)
    expect(onDismiss).not.toHaveBeenCalled()

    let interactDom: CustomEvent | null = null
    h.content.addEventListener(EV_INTERACT_OUTSIDE, (event) => {
      interactDom = event as CustomEvent
    }, { once: true })
    preventInteract = true
    const second = pointerEvent(h.win)
    h.outside.dispatchEvent(second)

    expect(specificOptions).toHaveLength(2)
    expect(specificOptions[1]!.detail.originalEvent).toBe(second)
    expect(interactOptions).toHaveLength(2)
    expect(interactOptions[1]).toBe(interactDom)
    expect(interactOptions[1]!.defaultPrevented).toBe(true)
    expect(interactOptions[1]!.detail.originalEvent).toBe(second)
    expect(onDismiss).not.toHaveBeenCalled()

    preventInteract = false
    preventSpecificFromInteract = true
    const third = pointerEvent(h.win)
    h.outside.dispatchEvent(third)

    expect(specificOptions).toHaveLength(3)
    expect(specificOptions[2]!.defaultPrevented).toBe(true)
    expect(specificOptions[2]!.detail.originalEvent).toBe(third)
    expect(interactOptions).toHaveLength(3)
    expect(interactOptions[2]!.detail.originalEvent).toBe(third)
    expect(onDismiss).not.toHaveBeenCalled()
  })
})
