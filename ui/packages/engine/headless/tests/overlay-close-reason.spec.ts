// @vitest-environment jsdom
// 关闭原因在机器里早就算出来了（消解层回报 escape-key 还是 interact-outside、
// 关闭按钮与 Tab 各自带 src），此前只用来决定要不要归还焦点，没有交到使用者手上。
// 拿它可以区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
import type { PopoverOpenChangeDetails } from '../src/popover'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { dialogMachine } from '../src/dialog'
import { connectPopover, popoverMachine } from '../src/popover'

function popover() {
  const runtime = createVanillaRuntime()
  const onOpenChange = vi.fn<(d: PopoverOpenChangeDetails) => void>()
  const service = createService(popoverMachine, {
    props: () => ({ defaultOpen: true, onOpenChange }),
    runtime,
  })
  runtime.start()
  return { service, onOpenChange, api: () => connectPopover(service, normalizeProps) }
}

function lastReason(fn: ReturnType<typeof vi.fn>): unknown {
  const calls = fn.mock.calls.filter(c => (c[0] as PopoverOpenChangeDetails).open === false)
  return (calls.at(-1)?.[0] as PopoverOpenChangeDetails | undefined)?.reason
}

describe('关闭原因交到使用者手上', () => {
  it('escape 关的报 esc——消解层回报 escape-key，机器翻成 src 再翻成原因', () => {
    const { service, onOpenChange } = popover()
    service.send({ type: 'CLOSE', src: 'esc' })
    expect(lastReason(onOpenChange)).toBe('esc')
  })

  it('点在浮层之外报 interact-outside', () => {
    const { service, onOpenChange } = popover()
    service.send({ type: 'CLOSE', src: 'interact-outside' })
    expect(lastReason(onOpenChange)).toBe('interact-outside')
  })

  it('关闭按钮报 close-trigger', () => {
    const { service, onOpenChange } = popover()
    service.send({ type: 'CLOSE', src: 'close-trigger' })
    expect(lastReason(onOpenChange)).toBe('close-trigger')
  })

  it('代码调用没有 src，报 programmatic', () => {
    const { onOpenChange, api } = popover()
    api().setOpen(false)
    expect(lastReason(onOpenChange)).toBe('programmatic')
  })

  it('展开时不带原因', () => {
    const { service, onOpenChange } = popover()
    service.send({ type: 'CLOSE', src: 'esc' })
    service.send({ type: 'OPEN' })
    const opened = onOpenChange.mock.calls.map(c => c[0] as PopoverOpenChangeDetails).filter(d => d.open)
    expect(opened.at(-1)?.reason).toBeUndefined()
  })
})

// 对话框走同一套助手：它是遮罩式浮层，关法比锚定浮层少一种（没有 hover），
// 但多一条——点触发器把它关掉也算 close-trigger。
describe('对话框的关闭原因', () => {
  function dialog() {
    const runtime = createVanillaRuntime()
    const onOpenChange = vi.fn<(d: { open: boolean, reason?: string }) => void>()
    const service = createService(dialogMachine, {
      props: () => ({ defaultOpen: true, onOpenChange }),
      runtime,
    })
    runtime.start()
    return { service, onOpenChange }
  }

  function lastCloseReason(fn: ReturnType<typeof vi.fn>): unknown {
    const calls = fn.mock.calls.filter(c => (c[0] as { open: boolean }).open === false)
    return (calls.at(-1)?.[0] as { reason?: string } | undefined)?.reason
  }

  it('escape 关的报 esc', () => {
    const { service, onOpenChange } = dialog()
    service.send({ type: 'CLOSE', src: 'esc' })
    expect(lastCloseReason(onOpenChange)).toBe('esc')
  })

  it('点遮罩外关的报 interact-outside', () => {
    const { service, onOpenChange } = dialog()
    service.send({ type: 'CLOSE', src: 'interact-outside' })
    expect(lastCloseReason(onOpenChange)).toBe('interact-outside')
  })

  it('关闭按钮报 close-trigger', () => {
    const { service, onOpenChange } = dialog()
    service.send({ type: 'CLOSE', src: 'close-trigger' })
    expect(lastCloseReason(onOpenChange)).toBe('close-trigger')
  })

  it('点触发器收起也算 close-trigger，不是代码调的', () => {
    const { service, onOpenChange } = dialog()
    service.send({ type: 'TOGGLE' })
    expect(lastCloseReason(onOpenChange)).toBe('close-trigger')
  })

  it('代码调用没有来源，报 programmatic', () => {
    const { service, onOpenChange } = dialog()
    service.send({ type: 'CLOSE' })
    expect(lastCloseReason(onOpenChange)).toBe('programmatic')
  })
})
