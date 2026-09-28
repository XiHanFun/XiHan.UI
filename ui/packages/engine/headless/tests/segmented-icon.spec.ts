// segmented 的段内图标：节点 icon 进元信息，item-icon 部件对读屏隐藏、状态标记与段一致。
import type { SegmentedSchema } from '../src'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSegmented, segmentedAnatomy, segmentedMachine } from '../src'

type Dict = Record<string, unknown>
type Props = SegmentedSchema['props']

function make(initial: Props) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Props>(initial)
  const service = createService(segmentedMachine, { props: () => props.get(), runtime })
  runtime.start()
  return () => connectSegmented(service, normalizeProps)
}

describe('segmented · 段内图标', () => {
  it('item-icon 排在 item 与 item-text 之间', () => {
    const names = segmentedAnatomy.parts
    expect(names.indexOf('item-icon')).toBe(names.indexOf('item') + 1)
    expect(names.indexOf('item-text')).toBe(names.indexOf('item-icon') + 1)
  })

  it('节点写了 icon 才进元信息，没写不带这个键', () => {
    const api = make({
      collection: [
        { value: 'list', label: '列表', icon: '☰' },
        { value: 'grid', label: '网格' },
      ],
    })()
    expect(api.collection[0]).toEqual({ value: 'list', label: '列表', icon: '☰', disabled: false })
    expect(api.collection[1]).not.toHaveProperty('icon')
  })

  it('图标部件对读屏隐藏，选中、禁用与只读标记跟着段走', () => {
    const api = make({
      defaultValue: 'list',
      readOnly: true,
      collection: [
        { value: 'list', icon: '☰' },
        { value: 'grid', icon: '▦', disabled: true },
      ],
    })()
    const checked = api.getItemIconProps({ value: 'list' }) as Dict
    expect(checked['data-scope']).toBe('segmented')
    expect(checked['data-part']).toBe('item-icon')
    expect(checked['aria-hidden']).toBe(true)
    expect(checked['data-state']).toBe('checked')
    expect(checked['data-readonly']).toBe('')
    const disabled = api.getItemIconProps({ value: 'grid' }) as Dict
    expect(disabled['data-state']).toBe('unchecked')
    expect(disabled['data-disabled']).toBe('')
  })
})
