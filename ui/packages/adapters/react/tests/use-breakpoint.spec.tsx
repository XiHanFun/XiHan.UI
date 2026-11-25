// @vitest-environment jsdom
import type { Breakpoint } from '@xihan-ui/core'
import type { ReactElement } from 'react'
import { act, useLayoutEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBreakpoint } from '../src/behavior'

const observeBreakpoint = vi.hoisted(() => vi.fn())

vi.mock('@xihan-ui/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@xihan-ui/core')>()
  return { ...original, observeBreakpoint }
})

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null
let notify: ((next: Breakpoint) => void) | null = null
const dispose = vi.fn()

function Harness({ onPaint }: { onPaint?: (value: Breakpoint) => void }): ReactElement {
  const current = useBreakpoint()
  useLayoutEffect(() => {
    onPaint?.(current)
  })
  return <span>{current}</span>
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  dispose.mockReset()
  observeBreakpoint.mockReset()
  observeBreakpoint.mockImplementation((options: { onChange: (next: Breakpoint) => void }) => {
    notify = options.onChange
    return { current: 'lg', dispose }
  })
})

afterEach(() => {
  act(() => root?.unmount())
  root = null
  host?.remove()
  host = null
  notify = null
})

describe('useBreakpoint 的 React 生命周期', () => {
  it('服务端渲染是 base，不建立观察', () => {
    expect(renderToString(<Harness />)).toBe('<span>base</span>')
    expect(observeBreakpoint).not.toHaveBeenCalled()
  })

  it('提交后、绘制前读到实际档，跨档时重渲染', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => {
      root!.render(<Harness />)
    })
    expect(observeBreakpoint).toHaveBeenCalledTimes(1)
    expect(host.textContent).toBe('lg')
    await act(async () => {
      notify!('sm')
    })
    expect(host.textContent).toBe('sm')
  })

  it('卸载时释放观察', async () => {
    host = document.createElement('div')
    document.body.append(host)
    root = createRoot(host)
    await act(async () => {
      root!.render(<Harness />)
    })
    act(() => root!.unmount())
    root = null
    expect(dispose).toHaveBeenCalledTimes(1)
  })
})
