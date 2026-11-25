// @vitest-environment jsdom
import type { Breakpoint } from '@xihan-ui/core'
import type { App, Ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { useBreakpoint } from '../src/behavior'

const observeBreakpoint = vi.hoisted(() => vi.fn())

vi.mock('@xihan-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@xihan-ui/core')>()
  return { ...original, observeBreakpoint }
})

let app: App | null = null
let host: HTMLElement | null = null
let notify: ((next: Breakpoint) => void) | null = null
const dispose = vi.fn()

beforeEach(() => {
  dispose.mockReset()
  observeBreakpoint.mockReset()
  observeBreakpoint.mockImplementation((options: { onChange: (next: Breakpoint) => void }) => {
    notify = options.onChange
    return { current: 'md', dispose }
  })
})

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  notify = null
})

function mountHarness(seen: Breakpoint[]): { current: Ref<Breakpoint> } {
  const out = {} as { current: Ref<Breakpoint> }
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup() {
      const current = useBreakpoint()
      out.current = current
      seen.push(current.value)
      return () => h('span', current.value)
    },
  })
  app.mount(host)
  return out
}

describe('useBreakpoint 的 Vue 生命周期', () => {
  it('setup 时是 base，挂载后读到实际档并随跨档更新', async () => {
    const seen: Breakpoint[] = []
    const { current } = mountHarness(seen)
    expect(seen).toEqual(['base'])
    expect(observeBreakpoint).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(current.value).toBe('md')
    expect(host!.textContent).toBe('md')
    notify!('xl')
    await nextTick()
    expect(host!.textContent).toBe('xl')
  })

  it('卸载时释放观察', () => {
    mountHarness([])
    app!.unmount()
    app = null
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})
