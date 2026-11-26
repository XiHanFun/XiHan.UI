// @vitest-environment jsdom
// Editable 的 required：根带 data-required，输入框带 aria-required。
import type { MachineConfig, MachineSchema } from '@xihan-ui/core'
import type { EditableSchema } from '../src/editable'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectEditable, editableMachine } from '../src/editable'

type Dict = Record<string, unknown>

function start<S extends MachineSchema>(machine: MachineConfig<S>, initial: S['props']) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<S['props']>(initial)
  const service = createService(machine, { props: () => props.get(), runtime })
  runtime.start()
  return { service }
}

describe('editable required', () => {
  it('根带 data-required，输入框带 aria-required；不写原生 required', () => {
    const f = start<EditableSchema>(editableMachine, { required: true })
    const api = connectEditable(f.service, normalizeProps)
    expect(api.required).toBe(true)
    expect((api.getRootProps() as Dict)['data-required']).toBe('')
    const input = api.getInputProps() as Dict
    expect(input['aria-required']).toBe('true')
    // 预览态这份输入框收着，原生 required 的提示落不到它身上
    expect(input.required).toBeUndefined()
  })

  it('没写时 data-required 缺席，aria-required 显式为 false', () => {
    const api = connectEditable(start<EditableSchema>(editableMachine, {}).service, normalizeProps)
    expect(api.required).toBe(false)
    expect((api.getRootProps() as Dict)['data-required']).toBeUndefined()
    expect((api.getInputProps() as Dict)['aria-required']).toBe('false')
  })
})
