import type { MachineConfig, MachineSchema } from '../src'
import { beforeEach, describe, expect, it } from 'vitest'
import { createService, setup } from '../src'
import { createVanillaRuntime } from '../src/vanilla'

interface ToggleSchema extends MachineSchema {
  props: { defaultPressed?: boolean }
  context: { pressed: boolean }
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'off' | 'on'
  event: { type: 'TOGGLE' }
  tag: never
  guard: never
  action: 'togglePressed' | 'invokeOnChange'
  effect: never
}

let changes: boolean[] = []

function makeToggle(): MachineConfig<ToggleSchema> {
  const { createMachine } = setup<ToggleSchema>()
  return createMachine({
    name: 'toggle',
    context: ({ prop, cell }) => ({
      pressed: cell(() => ({ defaultValue: prop('defaultPressed') ?? false })),
    }),
    initialState: ({ prop }) => (prop('defaultPressed') ? 'on' : 'off'),
    states: {
      off: { on: { TOGGLE: { target: 'on', actions: ['togglePressed', 'invokeOnChange'] } } },
      on: { on: { TOGGLE: { target: 'off', actions: ['togglePressed', 'invokeOnChange'] } } },
    },
    implementations: {
      actions: {
        togglePressed: ({ context }) => context.set('pressed', p => !p),
        invokeOnChange: ({ context }) => changes.push(context.get('pressed')),
      },
    },
  })
}

describe('createService（toggle 端到端）', () => {
  beforeEach(() => {
    changes = []
  })

  it('挂载前为 NotStarted，start 后进入初态', () => {
    const runtime = createVanillaRuntime()
    const service = createService(makeToggle(), { props: () => ({}), runtime })
    expect(service.getStatus()).toBe('NotStarted')
    runtime.start()
    expect(service.getStatus()).toBe('Started')
    expect(service.state.get()).toBe('off')
    expect(service.context.get('pressed')).toBe(false)
  })

  it('send 触发转移、跑 actions、改 context', () => {
    const runtime = createVanillaRuntime()
    const service = createService(makeToggle(), { props: () => ({}), runtime })
    runtime.start()

    service.send({ type: 'TOGGLE' })
    expect(service.state.get()).toBe('on')
    expect(service.context.get('pressed')).toBe(true)
    expect(service.state.previous()).toBe('off')
    expect(changes).toEqual([true])

    service.send({ type: 'TOGGLE' })
    expect(service.state.get()).toBe('off')
    expect(service.context.get('pressed')).toBe(false)
    expect(changes).toEqual([true, false])
  })

  it('defaultPressed 决定初态', () => {
    const runtime = createVanillaRuntime()
    const service = createService(makeToggle(), { props: () => ({ defaultPressed: true }), runtime })
    runtime.start()
    expect(service.state.get()).toBe('on')
    expect(service.context.get('pressed')).toBe(true)
  })

  it('挂载前 send 抛错，stop 后为 Stopped', () => {
    const runtime = createVanillaRuntime()
    const service = createService(makeToggle(), { props: () => ({}), runtime })
    expect(() => service.send({ type: 'TOGGLE' })).toThrow(/SEND_BEFORE_MOUNT/)
    runtime.start()
    runtime.stop()
    expect(service.getStatus()).toBe('Stopped')
  })

  it('未定义事件被静默丢弃，不改状态', () => {
    const runtime = createVanillaRuntime()
    const service = createService(makeToggle(), { props: () => ({}), runtime })
    runtime.start()
    service.send({ type: 'UNKNOWN' } as never)
    expect(service.state.get()).toBe('off')
  })
})

describe('watch 受控回写', () => {
  interface CtrlSchema extends MachineSchema {
    props: { open?: boolean }
    context: Record<string, never>
    computed: Record<string, never>
    refs: Record<string, never>
    state: 'closed' | 'open'
    event: { type: 'CONTROLLED.OPEN' } | { type: 'CONTROLLED.CLOSE' }
    tag: never
    guard: never
    action: 'syncOpen'
    effect: never
  }

  function makeCtrl(): MachineConfig<CtrlSchema> {
    const { createMachine } = setup<CtrlSchema>()
    return createMachine({
      name: 'ctrl',
      initialState: ({ prop }) => (prop('open') ? 'open' : 'closed'),
      watch: ({ track, prop, action }) => track([() => prop('open')], () => action(['syncOpen'])),
      states: {
        closed: { on: { 'CONTROLLED.OPEN': { target: 'open' } } },
        open: { on: { 'CONTROLLED.CLOSE': { target: 'closed' } } },
      },
      implementations: {
        actions: {
          syncOpen: ({ prop, send }) => {
            const open = prop('open')
            if (open === undefined)
              return
            send(open ? { type: 'CONTROLLED.OPEN' } : { type: 'CONTROLLED.CLOSE' })
          },
        },
      },
    })
  }

  it('挂载前翻转受控 prop：不撞 SEND_BEFORE_MOUNT，挂载后状态跟随', () => {
    const runtime = createVanillaRuntime()
    const open = runtime.signal(false)
    const service = createService(makeCtrl(), { props: () => ({ open: open.get() }), runtime })
    expect(service.getStatus()).toBe('NotStarted')
    expect(() => open.set(true)).not.toThrow()
    runtime.start()
    expect(service.state.get()).toBe('open')
  })

  it('挂载后翻转受控 prop：状态跟随', () => {
    const runtime = createVanillaRuntime()
    const open = runtime.signal(false)
    const service = createService(makeCtrl(), { props: () => ({ open: open.get() }), runtime })
    runtime.start()
    expect(service.state.get()).toBe('closed')
    open.set(true)
    expect(service.state.get()).toBe('open')
    open.set(false)
    expect(service.state.get()).toBe('closed')
  })
})

describe('effects 生命周期', () => {
  interface LampSchema extends MachineSchema {
    props: Record<string, never>
    context: Record<string, never>
    computed: Record<string, never>
    refs: Record<string, never>
    state: 'idle' | 'active'
    event: { type: 'START' } | { type: 'STOP' }
    tag: never
    guard: never
    action: never
    effect: 'tick'
  }

  it('进入状态挂载 effect、退出时 cleanup', () => {
    const { createMachine } = setup<LampSchema>()
    const log: string[] = []
    const lamp = createMachine({
      name: 'lamp',
      initialState: () => 'idle',
      states: {
        idle: { on: { START: { target: 'active' } } },
        active: { effects: ['tick'], on: { STOP: { target: 'idle' } } },
      },
      implementations: {
        effects: {
          tick: () => {
            log.push('mount')
            return () => log.push('cleanup')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(lamp, { props: () => ({}), runtime })
    runtime.start()
    expect(log).toEqual([])
    service.send({ type: 'START' })
    expect(log).toEqual(['mount'])
    service.send({ type: 'STOP' })
    expect(log).toEqual(['mount', 'cleanup'])
  })
})
