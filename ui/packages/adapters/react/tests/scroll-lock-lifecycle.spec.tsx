// @vitest-environment jsdom
import type { RuntimeConfig } from '@xihan-ui/core'
import type { ReactElement } from 'react'
import { act, StrictMode, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useScrollLock } from '../src/behavior'

const acquireScrollLock = vi.hoisted(() => vi.fn())

vi.mock('@xihan-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@xihan-ui/core')>()
  return { ...original, acquireScrollLock }
})

interface HarnessProps {
  active: boolean
  config: RuntimeConfig
  onLayout?: () => void
}

function Harness({ active, config, onLayout }: HarnessProps): ReactElement | null {
  useScrollLock(active, config)
  useLayoutEffect(() => {
    onLayout?.()
  }, [onLayout])
  return null
}

function fakeConfig(name: string): RuntimeConfig {
  return { name, scrollRoot: () => null } as unknown as RuntimeConfig
}

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

async function render(node: ReactElement): Promise<void> {
  if (!root) {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
  }
  await act(async () => {
    root!.render(node)
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  acquireScrollLock.mockReset()
  acquireScrollLock.mockImplementation(() => ({ dispose: vi.fn() }))
})

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
})

describe('useScrollLock 的 React 提交生命周期', () => {
  it('首个后续 layout effect 执行前已经加锁，没有 passive effect 延迟', async () => {
    const observed: number[] = []
    const config = fakeConfig('first')

    await render(
      <Harness
        active
        config={config}
        onLayout={() => observed.push(acquireScrollLock.mock.calls.length)}
      />,
    )

    expect(acquireScrollLock).toHaveBeenCalledOnce()
    expect(observed).toEqual([1])
  })

  it('active 阶段固定创建时配置，false→true 使用最近一次已提交配置', async () => {
    const first = fakeConfig('first')
    const second = fakeConfig('second')
    const disposers: Array<ReturnType<typeof vi.fn>> = []
    acquireScrollLock.mockImplementation(() => {
      const dispose = vi.fn()
      disposers.push(dispose)
      return { dispose }
    })

    await render(<Harness active config={first} />)
    await render(<Harness active config={second} />)
    expect(acquireScrollLock).toHaveBeenCalledOnce()
    expect(acquireScrollLock).toHaveBeenLastCalledWith({ config: first })

    await render(<Harness active={false} config={second} />)
    expect(disposers[0]).toHaveBeenCalledOnce()
    await render(<Harness active config={second} />)
    expect(acquireScrollLock).toHaveBeenCalledTimes(2)
    expect(acquireScrollLock).toHaveBeenLastCalledWith({ config: second })
  })

  it('strictMode 探测清理后只保留第二个锁，卸载完整释放', async () => {
    const disposers: Array<ReturnType<typeof vi.fn>> = []
    acquireScrollLock.mockImplementation(() => {
      const dispose = vi.fn()
      disposers.push(dispose)
      return { dispose }
    })

    await render(<StrictMode><Harness active config={fakeConfig('strict')} /></StrictMode>)

    expect(acquireScrollLock).toHaveBeenCalledTimes(2)
    expect(disposers).toHaveLength(2)
    expect(disposers[0]).toHaveBeenCalledOnce()
    expect(disposers[1]).not.toHaveBeenCalled()

    await act(async () => root!.unmount())
    root = null
    expect(disposers[1]).toHaveBeenCalledOnce()
  })
})
