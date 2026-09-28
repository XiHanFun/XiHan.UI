// context-menu 的 disabled：整张菜单失效——不展开、不拦浏览器自己的右键菜单，条目全部禁用，展开途中转为禁用即收起。
import type { ContextMenuSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectContextMenu, contextMenuMachine } from '../src'

type Dict = Record<string, unknown>
type Props = ContextMenuSchema['props']

function make(initial: Props) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(contextMenuMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    api: () => connectContextMenu(service, normalizeProps),
    state: () => service.state.get(),
    setProps: (next: Partial<Props>) => props.set(prev => ({ ...prev, ...next })),
  }
}

function contextMenuEvent() {
  return { clientX: 12, clientY: 34, preventDefault: vi.fn() }
}

function trigger(t: ReturnType<typeof make>): Dict {
  return t.api().getTriggerProps() as Dict
}

describe('context-menu · disabled', () => {
  it('触发区不报弹出、不占 Tab 位并投影 data-disabled；缺省照常', () => {
    const on = trigger(make({ disabled: true }))
    expect(on['aria-haspopup']).toBeUndefined()
    expect(on['aria-controls']).toBeUndefined()
    expect(on['aria-keyshortcuts']).toBeUndefined()
    expect(on.tabindex).toBeUndefined()
    expect(on['data-disabled']).toBe('')
    const off = trigger(make({}))
    expect(off['aria-haspopup']).toBe('menu')
    expect(off.tabindex).toBe(0)
    expect(off['data-disabled']).toBeUndefined()
  })

  it('右键不展开，也不拦浏览器自己的右键菜单', () => {
    const onOpenChange = vi.fn()
    const t = make({ disabled: true, onOpenChange })
    const event = contextMenuEvent()
    ;(trigger(t).onContextMenu as (e: unknown) => void)(event)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(t.api().open).toBe(false)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('菜单键与 Shift+F10 不展开，也不吞按键', () => {
    const t = make({ disabled: true })
    for (const init of [{ key: 'ContextMenu', shiftKey: false }, { key: 'F10', shiftKey: true }]) {
      const preventDefault = vi.fn()
      ;(trigger(t).onKeyDown as (e: unknown) => void)({ ...init, preventDefault })
      expect(preventDefault).not.toHaveBeenCalled()
    }
    expect(t.api().open).toBe(false)
  })

  it('触摸长按不开始计时，命令式 setOpen / openAt 也不展开', () => {
    const t = make({ disabled: true })
    ;(trigger(t).onPointerDown as (e: unknown) => void)({ button: 0, pointerType: 'touch', clientX: 1, clientY: 2, target: null })
    expect(t.state()).toBe('closed')
    expect(t.api().pressing).toBe(false)
    t.api().setOpen(true)
    t.api().openAt(5, 6)
    expect(t.api().open).toBe(false)
  })

  it('条目全部为 aria-disabled，作者自身的声明不受影响', () => {
    const t = make({ disabled: true })
    const item = t.api().getItemProps({ value: 'copy' }) as Dict
    expect(item['aria-disabled']).toBe('true')
    expect(item['data-disabled']).toBe('')
    t.setProps({ disabled: false })
    const enabled = t.api().getItemProps({ value: 'copy' }) as Dict
    expect(enabled['aria-disabled']).toBe('false')
    const own = t.api().getItemProps({ value: 'paste', disabled: true }) as Dict
    expect(own['aria-disabled']).toBe('true')
  })

  it('展开途中转为禁用：收起，并以 open: false 通知', () => {
    const onOpenChange = vi.fn()
    const t = make({ defaultOpen: true, onOpenChange })
    expect(t.api().open).toBe(true)
    t.setProps({ disabled: true })
    expect(t.api().open).toBe(false)
    expect(onOpenChange).toHaveBeenCalledWith(expect.objectContaining({ open: false }))
  })

  it('长按计时途中转为禁用：计时作废，回到收起', () => {
    const t = make({})
    ;(trigger(t).onPointerDown as (e: unknown) => void)({ button: 0, pointerType: 'touch', clientX: 1, clientY: 2, target: null })
    expect(t.state()).toBe('pressing')
    t.setProps({ disabled: true })
    expect(t.state()).toBe('closed')
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

  it('解除禁用后右键照常展开', () => {
    const t = make({ disabled: true })
    t.setProps({ disabled: false })
    const event = contextMenuEvent()
    ;(trigger(t).onContextMenu as (e: unknown) => void)(event)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(t.api().open).toBe(true)
  })
})
