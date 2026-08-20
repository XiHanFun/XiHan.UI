// @vitest-environment jsdom
// 关闭原因在机器里早就算出来了（消解层回报 escape-key 还是 interact-outside、
// 关闭按钮与 Tab 各自带 src），此前只用来决定要不要归还焦点，没有交到使用者手上。
// 拿它可以区分「用户主动取消」与「选完自动收起」，前者常要回滚草稿。
import type { PopoverOpenChangeDetails } from '../src/popover'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it, vi } from 'vitest'
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
  it('Escape 关的报 esc——消解层回报 escape-key，机器翻成 src 再翻成原因', () => {
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
