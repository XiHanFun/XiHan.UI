import type { MachineConfig, MachineSchema } from '../src/machine'
import { describe, expect, expectTypeOf, it } from 'vitest'
import { createMachine, MachineError, setup } from '../src/machine'

// 一个最小 toggle schema。
interface ToggleSchema extends MachineSchema {
  props: { defaultPressed?: boolean }
  context: { pressed: boolean }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event: { type: 'TOGGLE' } | { type: 'SET', value: boolean }
  tag: never
  guard: never
  action: 'invokeOnChange'
  effect: never
}

function makeToggle(): MachineConfig<ToggleSchema> {
  const { createMachine: create } = setup<ToggleSchema>()
  return create({
    name: 'toggle',
    initialState: ({ prop }) => (prop('defaultPressed') ? 'on' : 'off'),
    states: {
      off: { on: { TOGGLE: { target: 'on', actions: ['invokeOnChange'] } } },
      on: { on: { TOGGLE: { target: 'off', actions: ['invokeOnChange'] } } },
    },
    implementations: {
      actions: { invokeOnChange: () => {} },
    },
  })
}

describe('createMachine', () => {
  it('恒等返回 config 并构建索引', () => {
    const m = makeToggle()
    expect(m.name).toBe('toggle')
    expect(typeof m.initialState).toBe('function')
  })

  it('引用未实现的 action 时抛错', () => {
    expect(() => createMachine<ToggleSchema>({
      name: 'bad',
      initialState: () => 'off',
      states: {
        off: { on: { TOGGLE: { target: 'on', actions: ['invokeOnChange'] } } },
        on: {},
      },
      // 故意不提供 implementations.actions
    })).toThrow(MachineError)
  })

  it('initial 不是子状态时抛错', () => {
    expect(() => createMachine<ToggleSchema>({
      name: 'bad-initial',
      initialState: () => 'off',
      states: {
        // 故意写一个不在 states 里的 initial
        off: { initial: 'nope', states: { a: {} } },
        on: {},
      },
    })).toThrow(/BAD_INITIAL|MISSING_INITIAL/)
  })

  it('类型：initialState 返回值被约束为 state 联合', () => {
    expectTypeOf<ReturnType<MachineConfig<ToggleSchema>['initialState']>>().toEqualTypeOf<'off' | 'on'>()
  })
})
