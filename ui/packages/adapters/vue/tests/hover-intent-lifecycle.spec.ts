// @vitest-environment jsdom
// Vue 包装必须等模板 ref 提交后绑定，并在节点或计时参数变化时原子重建。
import type { App } from 'vue'
import type { UseHoverIntentOptions } from '../src/behavior'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, shallowRef } from 'vue'
import { useHoverIntent } from '../src/behavior'

let app: App | null = null
let host: HTMLElement | null = null

function pointer(type: string, target: EventTarget, relatedTarget: EventTarget | null = null): void {
  const event = new Event(type) as PointerEvent
  Object.defineProperty(event, 'relatedTarget', { value: relatedTarget })
  target.dispatchEvent(event)
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

function createHarness(initialVisible = true) {
  const visible = ref(initialVisible)
  const nodeKey = ref(0)
  const trigger = shallowRef<HTMLElement | null>(null)
  const content = shallowRef<HTMLElement | null>(null)
  const open = vi.fn()
  const close = vi.fn()
  const options = shallowRef<UseHoverIntentOptions>({
    getTriggerEl: () => trigger.value,
    getContentEl: () => content.value,
    openDelay: 100,
    closeDelay: 300,
    onOpenIntent: open,
    onCloseIntent: close,
  })

  host = document.createElement('div')
  document.body.appendChild(host)
  app = createApp({
    setup() {
      useHoverIntent(options)
      return () => visible.value
        ? h('button', { key: nodeKey.value, ref: trigger })
        : null
    },
  })
  app.mount(host)
  return { visible, nodeKey, trigger, content, open, close, options }
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  vi.useRealTimers()
})

describe('useHoverIntent 的 Vue 生命周期', () => {
  it('setup 空 ref 在 mounted 提交后正常绑定', async () => {
    const harness = createHarness()
    await settle()

    pointer('pointerenter', harness.trigger.value!)
    vi.advanceTimersByTime(99)
    expect(harness.open).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(harness.open).toHaveBeenCalledTimes(1)
  })

  it('mounted 时 trigger 仍为空，第一次出现后才建立绑定', async () => {
    const harness = createHarness(false)
    await settle()
    expect(harness.trigger.value).toBeNull()

    harness.visible.value = true
    await settle()
    pointer('pointerenter', harness.trigger.value!)
    vi.advanceTimersByTime(100)
    expect(harness.open).toHaveBeenCalledTimes(1)
  })

  it('trigger 换代与暂时离场时释放旧绑定，重新出现后恢复', async () => {
    const harness = createHarness()
    await settle()
    const first = harness.trigger.value!
    pointer('pointerenter', first)

    harness.nodeKey.value += 1
    await settle()
    const second = harness.trigger.value!
    expect(second).not.toBe(first)
    vi.advanceTimersByTime(100)
    expect(harness.open).not.toHaveBeenCalled()
    pointer('pointerenter', first)
    vi.advanceTimersByTime(100)
    expect(harness.open).not.toHaveBeenCalled()

    harness.visible.value = false
    await settle()
    pointer('pointerenter', second)
    vi.advanceTimersByTime(100)
    expect(harness.open).not.toHaveBeenCalled()

    harness.visible.value = true
    await settle()
    pointer('pointerenter', harness.trigger.value!)
    vi.advanceTimersByTime(100)
    expect(harness.open).toHaveBeenCalledTimes(1)
  })

  it('只换回调或 content 时保留会话并读取最新选项', async () => {
    const harness = createHarness()
    await settle()
    const nextOpen = vi.fn()
    pointer('pointerenter', harness.trigger.value!)
    const nextContent = document.createElement('div')
    document.body.appendChild(nextContent)
    harness.options.value = {
      ...harness.options.value,
      getContentEl: () => nextContent,
      onOpenIntent: nextOpen,
    }

    vi.advanceTimersByTime(100)
    expect(harness.open).not.toHaveBeenCalled()
    expect(nextOpen).toHaveBeenCalledTimes(1)
    pointer('pointerleave', harness.trigger.value!, nextContent)
    vi.advanceTimersByTime(300)
    expect(harness.close).not.toHaveBeenCalled()
  })

  it.each([
    ['openDelay', 100, 10],
    ['closeDelay', 300, 10],
    ['buffer', 6, 12],
  ] as const)('%s 变化会重建并取消旧计时', async (name, before, after) => {
    const harness = createHarness()
    harness.options.value = { ...harness.options.value, [name]: before }
    await settle()
    pointer('pointerenter', harness.trigger.value!)
    harness.options.value = { ...harness.options.value, [name]: after }
    await settle()
    vi.advanceTimersByTime(100)
    expect(harness.open).not.toHaveBeenCalled()

    pointer('pointerenter', harness.trigger.value!)
    const nextOpenDelay = name === 'openDelay' ? after : 100
    vi.advanceTimersByTime(nextOpenDelay - 1)
    expect(harness.open).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(harness.open).toHaveBeenCalledTimes(1)
  })

  it('卸载会取消未完成计时', async () => {
    const harness = createHarness()
    await settle()
    pointer('pointerenter', harness.trigger.value!)
    app!.unmount()
    app = null
    vi.advanceTimersByTime(100)
    expect(harness.open).not.toHaveBeenCalled()
  })
})
