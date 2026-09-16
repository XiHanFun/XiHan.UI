import type { CollapsibleOpenChangeDetails, CollapsibleSchema } from '../src/collapsible'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { collapsibleMachine, connectCollapsible } from '../src/collapsible'

type Props = CollapsibleSchema['props']

function makeCollapsible(initial: Props = {}) {
  const changes: CollapsibleOpenChangeDetails[] = []
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>({ ...initial, onOpenChange: d => changes.push(d) })
  const service = createService(collapsibleMachine, { props: () => props.get(), runtime })
  runtime.start()
  return {
    changes,
    state: () => service.state.get(),
    api: () => connectCollapsible(service, normalizeProps),
    trigger: () => connectCollapsible(service, normalizeProps).getTriggerProps() as Record<string, unknown>,
    content: () => connectCollapsible(service, normalizeProps).getContentProps() as Record<string, unknown>,
    click: () => (connectCollapsible(service, normalizeProps).getTriggerProps() as { onClick: () => void }).onClick(),
    setProps: (next: Props) => props.set({ ...props.get(), ...next }),
    stop: () => runtime.stop(),
  }
}

describe('collapsibleMachine 起步', () => {
  it('缺省 closed；defaultOpen 起步 open；open 压过 defaultOpen', () => {
    expect(makeCollapsible().state()).toBe('closed')
    expect(makeCollapsible({ defaultOpen: true }).state()).toBe('open')
    expect(makeCollapsible({ open: false, defaultOpen: true }).state()).toBe('closed')
  })
})

describe('connectCollapsible 投影', () => {
  it('trigger 是 type=button 并与 content 互指；收起的 content 带 hidden 与 inert，展开后两者都撤掉', () => {
    const c = makeCollapsible()
    expect(c.trigger()).toMatchObject({ 'type': 'button', 'aria-expanded': 'false', 'data-state': 'closed' })
    // 触发器接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面，档位随 size 走
    expect(c.trigger()).toMatchObject({
      'data-xh-action-control': '',
      'data-xh-action-profile': 'disclosure-trigger',
      'data-xh-action-variant': 'ghost',
      'data-xh-action-display': 'always',
      'data-xh-action-size': 'md',
    })
    expect(c.trigger()['aria-controls']).toBe(c.content().id)
    expect(c.content()).toMatchObject({ 'hidden': true, 'inert': true, 'data-state': 'closed' })
    c.click()
    expect(c.trigger()['aria-expanded']).toBe('true')
    expect(c.content().hidden).toBeUndefined()
    expect(c.content().inert).toBeUndefined()
    expect(c.api().getIndicatorProps()).toMatchObject({ 'aria-hidden': true, 'data-state': 'open' })
    expect(c.api().getHeaderProps()).toMatchObject({ 'data-state': 'open' })
    c.stop()
  })

  it('根落两轴与方向：dir 只在作者显式给了时才写，别切断从祖先继承的方向', () => {
    const c = makeCollapsible({ tone: 'brand', size: 'sm' })
    const root = c.api().getRootProps() as Record<string, unknown>
    expect(root).toMatchObject({ 'data-tone': 'brand', 'data-size': 'sm', 'data-state': 'closed' })
    expect(c.trigger()['data-xh-action-size']).toBe('sm')
    expect(root.dir).toBeUndefined()
    c.setProps({ dir: 'rtl' })
    expect((c.api().getRootProps() as Record<string, unknown>).dir).toBe('rtl')
    c.stop()
  })

  it('禁用走原生 disabled，点不动', () => {
    const c = makeCollapsible({ disabled: true })
    expect(c.trigger()).toMatchObject({ 'disabled': true, 'data-disabled': '' })
    expect(c.api().getRootProps()).toMatchObject({ 'data-disabled': '' })
    c.click()
    expect(c.state()).toBe('closed')
    expect(c.changes).toEqual([])
    c.stop()
  })
})

describe('collapsibleMachine 开合', () => {
  it('点一下来回切并逐次通知；setOpen 同值不通知', () => {
    const c = makeCollapsible()
    c.click()
    c.click()
    expect(c.changes).toEqual([{ open: true }, { open: false }])
    c.api().setOpen(false)
    expect(c.changes).toHaveLength(2)
    c.api().setOpen(true)
    expect(c.state()).toBe('open')
    expect(c.changes).toHaveLength(3)
    c.stop()
  })

  it('受控 open：点击只发意图不自改，宿主写回后才切，回写不再通知；open 变回 undefined 即转非受控', () => {
    const c = makeCollapsible({ open: false })
    c.click()
    expect(c.state()).toBe('closed')
    expect(c.changes).toEqual([{ open: true }])
    c.setProps({ open: true })
    expect(c.state()).toBe('open')
    expect(c.changes).toEqual([{ open: true }])
    c.setProps({ open: undefined })
    c.click()
    expect(c.state()).toBe('closed')
    c.stop()
  })
})
