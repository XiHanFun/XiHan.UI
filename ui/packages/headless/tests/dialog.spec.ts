import type { DialogSchema } from '../src'
import { normalizeProps } from '@xihan-ui/core'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectDialog, dialogMachine } from '../src'

function makeService(props: DialogSchema['props'] = {}) {
  const runtime = createVanillaRuntime()
  const service = createService(dialogMachine, { props: () => props, runtime })
  runtime.start()
  return service
}

describe('dialogMachine', () => {
  it('默认 closed，defaultOpen 决定初态', () => {
    expect(makeService().state.get()).toBe('closed')
    expect(makeService({ defaultOpen: true }).state.get()).toBe('open')
  })

  it('oPEN / CLOSE / TOGGLE 转移', () => {
    const s = makeService()
    s.send({ type: 'OPEN' })
    expect(s.state.get()).toBe('open')
    s.send({ type: 'CLOSE' })
    expect(s.state.get()).toBe('closed')
    s.send({ type: 'TOGGLE' })
    expect(s.state.get()).toBe('open')
    s.send({ type: 'TOGGLE' })
    expect(s.state.get()).toBe('closed')
  })
})

describe('connectDialog', () => {
  it('content 的 role / aria-modal / aria-labelledby / data-state', () => {
    const s = makeService()
    const content = connectDialog(s, normalizeProps).getContentProps() as Record<string, unknown>
    expect(content.role).toBe('dialog')
    expect(content['aria-modal']).toBe('true')
    expect(content['data-scope']).toBe('dialog')
    expect(content['data-part']).toBe('content')
    expect(content['data-state']).toBe('closed')
    expect(typeof content['aria-labelledby']).toBe('string')
  })

  it('alertdialog role + 非模态显式 aria-modal="false"', () => {
    const content = connectDialog(makeService({ role: 'alertdialog', modal: false }), normalizeProps).getContentProps() as Record<string, unknown>
    expect(content.role).toBe('alertdialog')
    // 省略与显式 false 在读屏那里不是一回事：前者是"没说"，后者是"明确说了不是模态"
    expect(content['aria-modal']).toBe('false')
  })

  it('trigger 的 aria-haspopup / aria-expanded / aria-controls', () => {
    const s = makeService({ defaultOpen: true })
    const trigger = connectDialog(s, normalizeProps).getTriggerProps() as Record<string, unknown>
    expect(trigger['aria-haspopup']).toBe('dialog')
    expect(trigger['aria-expanded']).toBe('true')
    expect(trigger['aria-controls']).toBe(connectDialog(s, normalizeProps).getContentProps().id)
  })

  it('setOpen 驱动状态；closeTrigger aria-label 取 translations', () => {
    const s = makeService()
    const api = connectDialog(s, normalizeProps)
    api.setOpen(true)
    expect(s.state.get()).toBe('open')

    const close = connectDialog(makeService({ translations: { close: '关闭' } }), normalizeProps).getCloseTriggerProps() as Record<string, unknown>
    expect(close['aria-label']).toBe('关闭')
  })
})
