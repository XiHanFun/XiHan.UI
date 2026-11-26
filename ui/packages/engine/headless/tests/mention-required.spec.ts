// @vitest-environment jsdom
// Mention 的 required：输入框带原生 required 与 aria-required。
import type { MachineConfig, MachineSchema } from '@xihan-ui/core'
import type { MentionSchema } from '../src/mention'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectMention, mentionMachine } from '../src/mention'

type Dict = Record<string, unknown>

function start<S extends MachineSchema>(machine: MachineConfig<S>, initial: S['props']) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<S['props']>(initial)
  const service = createService(machine, { props: () => props.get(), runtime })
  runtime.start()
  return { service }
}

describe('mention required', () => {
  it('输入框带原生 required 与 aria-required', () => {
    const on = start<MentionSchema>(mentionMachine, { required: true })
    const input = connectMention(on.service, normalizeProps).getInputProps() as Dict
    expect(input.required).toBe(true)
    expect(input['aria-required']).toBe('true')
  })

  it('没写时不带原生 required，aria-required 显式为 false', () => {
    const off = start<MentionSchema>(mentionMachine, {})
    const input = connectMention(off.service, normalizeProps).getInputProps() as Dict
    expect(input.required).toBeUndefined()
    expect(input['aria-required']).toBe('false')
  })
})
