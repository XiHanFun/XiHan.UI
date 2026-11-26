// @vitest-environment jsdom
// TagGroup 的 name：视觉隐藏的文本输入作表单出口，值是按逗号拼起的选中值。
import type { MachineConfig, MachineSchema } from '@xihan-ui/core'
import type { TagGroupSchema, TagGroupValueChangeDetails } from '../src/tag-group'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectTagGroup, tagGroupMachine, tagGroupStructure } from '../src/tag-group'

type Dict = Record<string, unknown>

function start<S extends MachineSchema>(machine: MachineConfig<S>, initial: S['props']) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<S['props']>(initial)
  const service = createService(machine, { props: () => props.get(), runtime })
  runtime.start()
  return { service, setProps: (next: Partial<S['props']>) => props.set({ ...props.get(), ...next }) }
}

describe('tag-group name', () => {
  function makeGroup(initial: TagGroupSchema['props'] = {}) {
    const changes: TagGroupValueChangeDetails[] = []
    const f = start<TagGroupSchema>(tagGroupMachine, { ...initial, onValueChange: d => changes.push(d) })
    return { ...f, changes, api: () => connectTagGroup(f.service, normalizeProps) }
  }

  it('表单出口：视觉隐藏的文本输入，值是按逗号拼起的选中值', () => {
    const f = makeGroup({ name: 'stack', selectionMode: 'multiple', defaultValue: ['vue', 'react'] })
    const hidden = f.api().getHiddenInputProps() as Dict
    expect(hidden).toMatchObject({ 'type': 'text', 'name': 'stack', 'value': 'vue,react', 'tabindex': -1, 'aria-hidden': true })
    expect(hidden.style).toBeTruthy()
    f.api().toggle('vue')
    expect((f.api().getHiddenInputProps() as Dict).value).toBe('react')
  })

  it('没给 name 不带 name；没选时是空串，required 拦下表单', () => {
    expect((makeGroup({ selectionMode: 'single' }).api().getHiddenInputProps() as Dict).name).toBeUndefined()
    const required = makeGroup({ name: 'stack', selectionMode: 'single', required: true }).api().getHiddenInputProps() as Dict
    expect(required.value).toBe('')
    expect(required.required).toBe(true)
  })

  it('禁用时不提交；只读随 prop 走', () => {
    expect((makeGroup({ name: 'stack', disabled: true }).api().getHiddenInputProps() as Dict).disabled).toBe(true)
    expect((makeGroup({ name: 'stack', readOnly: true }).api().getHiddenInputProps() as Dict).readonly).toBe(true)
  })

  it('表单重置：选中集合回到 defaultValue', () => {
    const f = makeGroup({ name: 'stack', selectionMode: 'multiple', defaultValue: ['vue'] })
    f.api().toggle('react')
    expect(f.api().value).toEqual(['vue', 'react'])
    f.service.send({ type: 'FORM.RESET' })
    expect(f.api().value).toEqual(['vue'])
    expect(f.changes.at(-1)).toEqual({ value: ['vue'] })
  })

  it('标准结构：给了 hiddenInput 才在列表之后铺表单出口', () => {
    const parts = (hiddenInput: boolean): string[] => tagGroupStructure({ collection: [] }, { hiddenInput }).map(node => node.part)
    expect(parts(false)).toEqual(['list'])
    expect(parts(true)).toEqual(['list', 'hidden-input'])
  })
})
