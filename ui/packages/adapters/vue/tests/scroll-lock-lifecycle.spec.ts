// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, shallowRef } from 'vue'
import { useScrollLock } from '../src/behavior'

const acquireScrollLock = vi.hoisted(() => vi.fn())

vi.mock('@xihan-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@xihan-ui/core')>()
  return { ...original, acquireScrollLock }
})

let app: App | null = null
let host: HTMLElement | null = null

function fakeConfig(scrollRoot: () => HTMLElement | null): RuntimeConfig {
  return { scrollRoot } as RuntimeConfig
}

async function settle(): Promise<void> {
  await nextTick()
  await nextTick()
}

function mountHarness(initialActive = true) {
  const active = ref(initialActive)
  const target = shallowRef<HTMLElement | null>(null)
  const config = shallowRef(fakeConfig(() => target.value))
  const errors: unknown[] = []
  host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup() {
      useScrollLock(active, config)
      return () => h('div', { 'ref': target, 'data-scroll-root': '' })
    },
  })
  app.config.errorHandler = error => errors.push(error)
  app.mount(host)
  return { active, target, config, errors }
}

beforeEach(() => {
  acquireScrollLock.mockReset()
  acquireScrollLock.mockImplementation(() => ({ dispose: vi.fn() }))
})

afterEach(() => {
  app?.unmount()
  app = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('useScrollLock 的 Vue 提交生命周期', () => {
  it('初始 active 只在 mounted 后读取已经提交的模板 ref', async () => {
    const roots: Array<HTMLElement | null> = []
    acquireScrollLock.mockImplementation(({ config }: { config: RuntimeConfig }) => {
      roots.push(config.scrollRoot!())
      return { dispose: vi.fn() }
    })

    const harness = mountHarness(true)
    await settle()

    expect(acquireScrollLock).toHaveBeenCalledOnce()
    expect(harness.target.value).not.toBeNull()
    expect(roots).toEqual([harness.target.value])
  })

  it('active 阶段固定创建时配置，false→true 才读取最新配置', async () => {
    const firstRoot = document.createElement('div')
    const secondRoot = document.createElement('div')
    document.body.append(firstRoot, secondRoot)
    const disposers: Array<ReturnType<typeof vi.fn>> = []
    acquireScrollLock.mockImplementation(() => {
      const dispose = vi.fn()
      disposers.push(dispose)
      return { dispose }
    })
    const harness = mountHarness(false)
    await settle()
    const firstConfig = fakeConfig(() => firstRoot)
    const secondConfig = fakeConfig(() => secondRoot)

    harness.config.value = firstConfig
    harness.active.value = true
    await settle()
    expect(acquireScrollLock).toHaveBeenLastCalledWith({ config: firstConfig })

    harness.config.value = secondConfig
    await settle()
    expect(acquireScrollLock).toHaveBeenCalledOnce()

    harness.active.value = false
    await settle()
    expect(disposers[0]).toHaveBeenCalledOnce()
    harness.active.value = true
    await settle()
    expect(acquireScrollLock).toHaveBeenCalledTimes(2)
    expect(acquireScrollLock).toHaveBeenLastCalledWith({ config: secondConfig })
  })

  it('dispose 抛错前先清本地 handle，后续快速重新激活仍可建立新锁', async () => {
    const disposeError = new Error('dispose failed')
    const firstDispose = vi.fn(() => {
      throw disposeError
    })
    const secondDispose = vi.fn()
    acquireScrollLock
      .mockReturnValueOnce({ dispose: firstDispose })
      .mockReturnValueOnce({ dispose: secondDispose })
    const harness = mountHarness(true)
    await settle()

    harness.active.value = false
    await settle()
    expect(firstDispose).toHaveBeenCalledOnce()
    expect(harness.errors).toContain(disposeError)

    harness.active.value = true
    await settle()
    expect(acquireScrollLock).toHaveBeenCalledTimes(2)
    app!.unmount()
    app = null
    expect(secondDispose).toHaveBeenCalledOnce()
  })
})
