// popover 的 disabled：关掉的是浮层这件事——触发器转原生 disabled，点按与命令式展开都不生效，展开途中转为禁用即收起。
import type { PopoverSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectPopover, popoverMachine } from '../src'

type Dict = Record<string, unknown>
type Props = PopoverSchema['props']

function make(initial: Props) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(popoverMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectPopover(service, normalizeProps),
    setProps: (next: Partial<Props>) => props.set(prev => ({ ...prev, ...next })),
  }
}

describe('popover · disabled', () => {
  it('触发器转原生 disabled 并投影 data-disabled；缺省不写', () => {
    const on = make({ disabled: true }).api().getTriggerProps() as Dict
    expect(on.disabled).toBe(true)
    expect(on['data-disabled']).toBe('')
    const off = make({}).api().getTriggerProps() as Dict
    expect(off.disabled).toBeUndefined()
    expect(off['data-disabled']).toBeUndefined()
  })

  it('点按与 setOpen(true) 都不展开，也不发 onOpenChange', () => {
    const onOpenChange = vi.fn()
    const t = make({ disabled: true, onOpenChange })
    ;((t.api().getTriggerProps() as Dict).onClick as () => void)()
    t.api().setOpen(true)
    expect(t.api().open).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('展开途中转为禁用：收起，并以 open: false 通知', () => {
    const onOpenChange = vi.fn()
    const t = make({ defaultOpen: true, onOpenChange })
    expect(t.api().open).toBe(true)
    t.setProps({ disabled: true })
    expect(t.api().open).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }))
  })

  it('受控展开途中转为禁用：只发收起意图，宿主写回后才收起', () => {
    const onOpenChange = vi.fn()
    const t = make({ open: true, onOpenChange })
    t.setProps({ disabled: true })
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }))
    expect(t.api().open).toBe(true)
    t.setProps({ open: false })
    expect(t.api().open).toBe(false)
  })

  it('解除禁用后照常展开', () => {
    const t = make({ disabled: true })
    t.setProps({ disabled: false })
    t.api().setOpen(true)
    expect(t.api().open).toBe(true)
  })
})
