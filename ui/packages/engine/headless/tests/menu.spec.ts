// @vitest-environment jsdom
import type { MenuSchema } from '../src/menu'
import { normalizeProps } from '@xihan-ui/kernel'
import { createService } from '@xihan-ui/machine'
import { createVanillaRuntime } from '@xihan-ui/machine/vanilla'
import { describe, expect, it } from 'vitest'
import { connectMenu, menuMachine } from '../src/menu'

type Props = MenuSchema['props']
type Dict = Record<string, unknown>

function mount(initial: Partial<Props> = {}) {
  const props: Partial<Props> = { ...initial }
  const runtime = createVanillaRuntime()
  const service = createService(menuMachine, { props: () => props, runtime })
  runtime.start()
  return {
    service,
    api: () => connectMenu(service, normalizeProps),
  }
}

describe('条目高亮标记', () => {
  it('收起态没有锚点：条目不打 data-highlighted，Tab 位也不归任何条目', () => {
    const h = mount()
    const item = h.api().getItemProps({ value: 'copy' }) as Dict
    expect(item['data-highlighted']).toBeUndefined()
    expect(item.tabindex).toBe(-1)
  })

  it('焦点落到条目上即同步打 data-highlighted，且整组只有它一个', () => {
    const h = mount()
    h.service.send({ type: 'OPEN', focus: 'none' })
    h.service.send({ type: 'ITEM.FOCUS', value: 'copy' })
    expect(h.api().focusedValue).toBe('copy')
    expect((h.api().getItemProps({ value: 'copy' }) as Dict)['data-highlighted']).toBe('')
    expect((h.api().getItemProps({ value: 'copy' }) as Dict).tabindex).toBe(0)
    expect((h.api().getItemProps({ value: 'paste' }) as Dict)['data-highlighted']).toBeUndefined()
  })

  it('焦点回到 content 自身时锚点清空，标记随之摘掉', () => {
    const h = mount()
    h.service.send({ type: 'OPEN', focus: 'none' })
    h.service.send({ type: 'ITEM.FOCUS', value: 'copy' })
    h.service.send({ type: 'FOCUS.CLEAR' })
    expect((h.api().getItemProps({ value: 'copy' }) as Dict)['data-highlighted']).toBeUndefined()
  })

  it('装饰箭头对读屏隐藏：aria-hidden 写布尔', () => {
    const h = mount()
    expect((h.api().getArrowProps() as Dict)['aria-hidden']).toBe(true)
  })
})
