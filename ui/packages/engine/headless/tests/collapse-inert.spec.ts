// 折叠面板的收起窗口：皮肤给 content 声明了 display，UA 的 [hidden]{display:none} 被盖掉，
// 收起动画播完之前节点仍在渲染——这一段窗口靠 inert 把内容挡在读屏与 Tab 序之外。
import type { CollapsibleSchema } from '../src/collapsible'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
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
