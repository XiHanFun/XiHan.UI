// @vitest-environment jsdom
// React 包装在 layout 提交期绑定，并只在 trigger/计时参数真正变化时重建。
import type { ReactElement } from 'react'
import type { UseHoverIntentOptions } from '../src/behavior'
import { act, StrictMode, useLayoutEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHoverIntent } from '../src/behavior'

interface HarnessProps extends Pick<UseHoverIntentOptions, 'openDelay' | 'closeDelay' | 'buffer'> {
  visible?: boolean
  nodeKey?: number
  content?: HTMLElement | null
  externalTrigger?: HTMLElement
  onOpenIntent: () => void
  onCloseIntent?: () => void
  fireOnLayout?: boolean
}

function pointer(
  type: string,
  target: EventTarget,
  relatedTarget: EventTarget | null = null,
  win: Window & typeof globalThis = window,
): void {
  const event = new win.Event(type) as PointerEvent
  Object.defineProperty(event, 'relatedTarget', { value: relatedTarget })
  target.dispatchEvent(event)
}

function Harness(props: HarnessProps): ReactElement | null {
  const trigger = useRef<HTMLButtonElement>(null)
  useHoverIntent({
    getTriggerEl: () => props.externalTrigger ?? trigger.current,
    getContentEl: () => props.content ?? null,
    openDelay: props.openDelay,
    closeDelay: props.closeDelay,
    buffer: props.buffer,
    onOpenIntent: props.onOpenIntent,
    onCloseIntent: props.onCloseIntent ?? (() => {}),
  })
  useLayoutEffect(() => {
    if (props.fireOnLayout && trigger.current)
      pointer('pointerenter', trigger.current)
  }, [props.fireOnLayout])
  return props.visible === false ? null : <button key={props.nodeKey} ref={trigger} data-trigger="" />
}

let host: HTMLElement | null = null
let root: ReturnType<typeof createRoot> | null = null

async function render(node: ReactElement): Promise<void> {
  if (!root) {
    host = document.createElement('div')
    document.body.appendChild(host)
    root = createRoot(host)
  }
  await act(async () => {
    root!.render(node)
  })
}

function trigger(): HTMLButtonElement {
  const node = host?.querySelector<HTMLButtonElement>('[data-trigger]')
  if (!node)
    throw new Error('找不到测试 trigger')
  return node
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  vi.useFakeTimers()
})

afterEach(async () => {
  await act(async () => {
    root?.unmount()
  })
  root = null
  host?.remove()
  host = null
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('useHoverIntent 的 React 提交生命周期', () => {
  it('在后续 layout effect 派发事件前已完成绑定', async () => {
    const open = vi.fn()
    await render(<Harness openDelay={0} onOpenIntent={open} fireOnLayout />)
    await act(async () => vi.runOnlyPendingTimers())
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('首次提交没有 trigger，后续出现时才建立绑定', async () => {
    const open = vi.fn()
    await render(<Harness visible={false} openDelay={100} onOpenIntent={open} />)
    expect(host?.querySelector('[data-trigger]')).toBeNull()

    await render(<Harness openDelay={100} onOpenIntent={open} />)
    pointer('pointerenter', trigger())
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('只换回调或 content 时保留挂起会话并读取最新值', async () => {
    const firstOpen = vi.fn()
    const secondOpen = vi.fn()
    const close = vi.fn()
    await render(<Harness openDelay={100} onOpenIntent={firstOpen} onCloseIntent={close} />)
    pointer('pointerenter', trigger())
    const content = document.createElement('div')
    document.body.appendChild(content)
    await render(<Harness openDelay={100} content={content} onOpenIntent={secondOpen} onCloseIntent={close} />)

    await act(async () => vi.advanceTimersByTime(100))
    expect(firstOpen).not.toHaveBeenCalled()
    expect(secondOpen).toHaveBeenCalledTimes(1)
    pointer('pointerleave', trigger(), content)
    await act(async () => vi.advanceTimersByTime(300))
    expect(close).not.toHaveBeenCalled()
  })

  it.each([
    ['openDelay', 100, 10],
    ['closeDelay', 300, 10],
    ['buffer', 6, 12],
  ] as const)('%s 变化会取消旧会话并按新参数重建', async (name, before, after) => {
    const open = vi.fn()
    const initial = { openDelay: 100, closeDelay: 300, buffer: 6, [name]: before }
    await render(<Harness {...initial} onOpenIntent={open} />)
    pointer('pointerenter', trigger())
    await render(<Harness {...initial} {...{ [name]: after }} onOpenIntent={open} />)
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).not.toHaveBeenCalled()

    pointer('pointerenter', trigger())
    const nextOpenDelay = name === 'openDelay' ? after : 100
    await act(async () => vi.advanceTimersByTime(nextOpenDelay - 1))
    expect(open).not.toHaveBeenCalled()
    await act(async () => vi.advanceTimersByTime(1))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('同一 trigger 被 adopt 后按新的 ownerDocument 重建', async () => {
    const external = document.createElement('button')
    document.body.appendChild(external)
    const open = vi.fn()
    await render(<Harness externalTrigger={external} openDelay={100} onOpenIntent={open} />)
    const frame = document.createElement('iframe')
    document.body.appendChild(frame)
    const doc = frame.contentDocument!
    const win = frame.contentWindow! as Window & typeof globalThis
    const schedule = window.setTimeout.bind(window)
    const cancel = window.clearTimeout.bind(window)
    const set = vi.spyOn(win, 'setTimeout').mockImplementation((handler, timeout, ...args) =>
      schedule(handler, timeout, ...args) as unknown as ReturnType<typeof setTimeout>)
    vi.spyOn(win, 'clearTimeout').mockImplementation(handle => cancel(handle))
    doc.adoptNode(external)
    doc.body.appendChild(external)

    await render(<Harness externalTrigger={external} openDelay={100} onOpenIntent={open} />)
    pointer('pointerenter', external, null, win)
    expect(set).toHaveBeenCalledTimes(1)
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('trigger 换代或离场时旧节点静默，重新出现后恢复', async () => {
    const open = vi.fn()
    await render(<Harness nodeKey={1} openDelay={100} onOpenIntent={open} />)
    const first = trigger()
    pointer('pointerenter', first)
    await render(<Harness nodeKey={2} openDelay={100} onOpenIntent={open} />)
    const second = trigger()
    expect(second).not.toBe(first)
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).not.toHaveBeenCalled()
    pointer('pointerenter', first)
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).not.toHaveBeenCalled()

    await render(<Harness visible={false} nodeKey={2} openDelay={100} onOpenIntent={open} />)
    pointer('pointerenter', second)
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).not.toHaveBeenCalled()

    await render(<Harness nodeKey={3} openDelay={100} onOpenIntent={open} />)
    pointer('pointerenter', trigger())
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).toHaveBeenCalledTimes(1)
  })

  it('strictMode 重建后只有一份监听，卸载会取消未完成计时器', async () => {
    const open = vi.fn()
    await render(<StrictMode><Harness openDelay={100} onOpenIntent={open} /></StrictMode>)
    pointer('pointerenter', trigger())
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).toHaveBeenCalledTimes(1)
    pointer('pointerenter', trigger())
    await act(async () => root!.unmount())
    root = null
    await act(async () => vi.advanceTimersByTime(100))
    expect(open).toHaveBeenCalledTimes(1)
  })
})
