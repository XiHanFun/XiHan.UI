// @vitest-environment jsdom
//
// steps 的只读展示形态：只呈现进度——语义换成有序列表，trigger 只排版，不聚焦、不接事件、不置灰。
import type { StepsSchema } from '../src/steps'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it, vi } from 'vitest'
import { connectSteps, stepsMachine } from '../src/steps'

type Props = StepsSchema['props']
type Dict = Record<string, unknown>

function makeSteps(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(stepsMachine, { runtime, props: () => ({ count: 3, ...props }) as Props })
  runtime.start()
  return () => connectSteps(service, normalizeProps)
}

describe('步骤条 · 只读展示', () => {
  it('list 换成有序列表：不进 Tab 序列、不接键盘，名字照留', () => {
    const list = makeSteps({ readOnly: true, translations: { list: '开通进度' } })().getListProps() as Dict
    expect(list.role).toBe('list')
    expect(list['aria-label']).toBe('开通进度')
    expect(list.tabindex).toBeUndefined()
    expect(list['aria-orientation']).toBeUndefined()
    expect(list.onKeydown).toBeUndefined()
    expect(list.onFocus).toBeUndefined()
  })

  it('item 是列表项，当前步 aria-current=step；不置灰', () => {
    const api = makeSteps({ readOnly: true, defaultValue: 1, collection: [{}, { disabled: true }, {}] })()
    const current = api.getItemProps({ index: 1 }) as Dict
    expect(current.role).toBe('listitem')
    expect(current['aria-current']).toBe('step')
    expect(current['data-disabled']).toBeUndefined()
    expect((api.getItemProps({ index: 0 }) as Dict)['aria-current']).toBeUndefined()
  })

  it('trigger 只是排版容器：没有按钮语义、焦点与事件，不投影 Action Control', () => {
    const trigger = makeSteps({ readOnly: true, defaultValue: 1 })().getTriggerProps({ index: 0 }) as Dict
    expect(trigger['data-scope']).toBe('steps')
    expect(trigger['data-part']).toBe('trigger')
    expect(trigger['data-state']).toBe('completed')
    expect(trigger['data-readonly']).toBe('')
    for (const key of ['type', 'role', 'tabindex', 'aria-selected', 'aria-controls', 'aria-disabled', 'data-xh-action-control', 'onClick', 'onFocus', 'onKeyDown', 'onPointerDown'])
      expect(trigger[key], key).toBeUndefined()
  })

  it('面板只随步序显隐，不带 tabpanel 语义', () => {
    const api = makeSteps({ readOnly: true, defaultValue: 1 })()
    const content = api.getContentProps({ index: 1 }) as Dict
    expect(content.role).toBeUndefined()
    expect(content['aria-labelledby']).toBeUndefined()
    expect(content.tabindex).toBeUndefined()
    expect(content.hidden).toBeUndefined()
    expect((api.getContentProps({ index: 0 }) as Dict).hidden).toBe(true)
  })

  it('步序仍由 setValue 驱动，变化照常通知', () => {
    const onValueChange = vi.fn()
    const api = makeSteps({ readOnly: true, onValueChange })
    api().setValue(2)
    expect(api().value).toBe(2)
    expect(onValueChange).toHaveBeenCalledWith({ value: 2 })
    expect(api().readOnly).toBe(true)
  })

  it('不开 readOnly 时 trigger 仍是 tab', () => {
    const trigger = makeSteps({})().getTriggerProps({ index: 0 }) as Dict
    expect(trigger.role).toBe('tab')
    expect(trigger['data-readonly']).toBeUndefined()
  })
})
