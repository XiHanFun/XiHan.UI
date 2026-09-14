// 折叠面板的收起窗口：皮肤给 content 声明了 display，UA 的 [hidden]{display:none} 被盖掉，
// 收起动画播完之前节点仍在渲染——这一段窗口靠 inert 把内容挡在读屏与 Tab 序之外。
import type { CollapsibleSchema } from '../src/collapsible'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { accordionMachine, connectAccordion } from '../src/accordion'
import { collapsibleMachine, connectCollapsible } from '../src/collapsible'

function collapsible(props: Partial<CollapsibleSchema['props']>) {
  const runtime = createVanillaRuntime()
  const service = createService(collapsibleMachine, { props: () => props, runtime })
  runtime.start()
  return () => connectCollapsible(service, normalizeProps)
}

describe('收起态的 content', () => {
  it('同时发 hidden 与 inert：前者保住无 JS 与 SSR，后者管动画那段窗口', () => {
    const content = collapsible({})().getContentProps() as Record<string, unknown>
    expect(content.hidden).toBe(true)
    expect(content.inert).toBe(true)
  })

  it('展开态两个都不发', () => {
    const content = collapsible({ defaultOpen: true })().getContentProps() as Record<string, unknown>
    expect(content.hidden).toBeUndefined()
    expect(content.inert).toBeUndefined()
  })

  it('data-state 恒有值，皮肤据此选进场还是退场那条动画', () => {
    expect((collapsible({})().getContentProps() as Record<string, unknown>)['data-state']).toBe('closed')
    expect((collapsible({ defaultOpen: true })().getContentProps() as Record<string, unknown>)['data-state']).toBe('open')
  })
})

describe('手风琴的面板', () => {
  const collection = [{ value: 'a', title: 'A' }, { value: 'b', title: 'B' }]

  function accordion(props: Record<string, unknown>) {
    const runtime = createVanillaRuntime()
    const service = createService(accordionMachine, { props: () => ({ collection, ...props }), runtime })
    runtime.start()
    return () => connectAccordion(service, normalizeProps)
  }

  it('收起的面板同时发 hidden 与 inert', () => {
    const api = accordion({})()
    const content = api.getContentProps({ value: 'a' }) as Record<string, unknown>
    expect(content.hidden).toBe(true)
    expect(content.inert).toBe(true)
  })

  it('展开的那一项两个都不发，其余项照旧挡住', () => {
    const api = accordion({ defaultValue: ['a'] })()
    const open = api.getContentProps({ value: 'a' }) as Record<string, unknown>
    const shut = api.getContentProps({ value: 'b' }) as Record<string, unknown>
    expect(open.hidden).toBeUndefined()
    expect(open.inert).toBeUndefined()
    expect(shut.hidden).toBe(true)
    expect(shut.inert).toBe(true)
  })

  it('每一项的 data-state 各算各的，皮肤据此各选各的动画', () => {
    const api = accordion({ defaultValue: ['a'] })()
    expect((api.getContentProps({ value: 'a' }) as Record<string, unknown>)['data-state']).toBe('open')
    expect((api.getContentProps({ value: 'b' }) as Record<string, unknown>)['data-state']).toBe('closed')
  })
})
