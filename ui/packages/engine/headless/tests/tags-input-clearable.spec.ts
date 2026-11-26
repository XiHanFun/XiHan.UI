// @vitest-environment jsdom
// TagsInput 的 clearable：缺省开着，写 false 收起清空按钮并拦下 api.clear()。
import type { MachineConfig, MachineSchema } from '@xihan-ui/core'
import type { TagsInputSchema, TagsInputValueChangeDetails } from '../src/tags-input'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTagsInput, tagsInputMachine, tagsInputStructure } from '../src/tags-input'

type Dict = Record<string, unknown>

function start<S extends MachineSchema>(machine: MachineConfig<S>, initial: S['props']) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<S['props']>(initial)
  const service = createService(machine, { props: () => props.get(), runtime })
  runtime.start()
  return { service, setProps: (next: Partial<S['props']>) => props.set({ ...props.get(), ...next }) }
}

describe('tags-input clearable', () => {
  function makeTags(initial: TagsInputSchema['props'] = {}) {
    const changes: TagsInputValueChangeDetails[] = []
    const { service, setProps } = start<TagsInputSchema>(tagsInputMachine, { ...initial, onValueChange: d => changes.push(d) })
    return { service, setProps, changes, api: () => connectTagsInput(service, normalizeProps) }
  }

  it('缺省开着：有标签时清空按钮露出，api.clear() 清掉标签与输入文本', () => {
    const f = makeTags({ defaultValue: ['a', 'b'], defaultInputValue: 'c' })
    expect(f.api().clearable).toBe(true)
    expect(f.api().canClear).toBe(true)
    expect((f.api().getClearTriggerProps() as Dict).hidden).toBeUndefined()
    f.api().clear()
    expect(f.api().value).toEqual([])
    expect(f.api().inputValue).toBe('')
  })

  it('写 false 即关掉：清空按钮收起、api.clear() 被拦下，逐个删除照旧可用', () => {
    const f = makeTags({ defaultValue: ['a', 'b'], clearable: false })
    expect(f.api().clearable).toBe(false)
    expect(f.api().canClear).toBe(false)
    expect((f.api().getClearTriggerProps() as Dict).hidden).toBe(true)
    f.api().clear()
    expect(f.api().value).toEqual(['a', 'b'])
    expect(f.changes).toEqual([])
    f.api().deleteValue('a')
    expect(f.api().value).toEqual(['b'])
  })

  it('关掉时清空按钮不进按压通道；按住途中关掉也一并撤下', () => {
    const f = makeTags({ defaultValue: ['a'] })
    f.service.send({ type: 'PRESS.START' })
    expect(f.service.context.get('pressed')).toBe(true)
    f.setProps({ clearable: false })
    expect(f.service.context.get('pressed')).toBe(false)
    f.service.send({ type: 'PRESS.START' })
    expect(f.service.context.get('pressed')).toBe(false)
  })

  it('标准结构：关掉 clearable 就不铺清空按钮', () => {
    const control = (clearable: boolean): string[] => {
      const nodes = tagsInputStructure({ value: [], showCount: false, clearable })
      return (nodes.find(node => node.part === 'control')?.children ?? []).map(node => (node as { part: string }).part)
    }
    expect(control(true)).toEqual(['input', 'clear-trigger'])
    expect(control(false)).toEqual(['input'])
  })
})
