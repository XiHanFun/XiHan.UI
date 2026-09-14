import type { MachineConfig, MachineSchema } from '../src/machine'
import { beforeEach, describe, expect, it } from 'vitest'
import { onDiagnostic } from '../src/kernel/diagnostics/channel'
import { createService, MachineError, setup } from '../src/machine'
import { createVanillaRuntime } from '../src/machine/vanilla'

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

describe('effects 批量初始化事务', () => {
  interface EffectTransactionSchema extends MachineSchema {
    props: Record<string, never>
    context: Record<string, never>
    computed: Record<string, never>
    refs: Record<string, never>
    state: 'active'
    event: { type: 'NOOP' }
    tag: never
    guard: never
    action: never
    effect: 'first' | 'second' | 'fail'
  }

  function captureError(task: () => void): unknown {
    try {
      task()
    }
    catch (error) {
      return error
    }
    throw new Error('预期操作抛错')
  }

  it('后一项 effect 初始化失败时逆序回滚已取得的 cleanup', () => {
    const { createMachine } = setup<EffectTransactionSchema>()
    const order: string[] = []
    const setupError = new Error('effect setup failed')
    const machine = createMachine({
      name: 'effect-setup-rollback',
      initialState: () => 'active',
      states: {
        active: { effects: ['first', 'second', 'fail'] },
      },
      implementations: {
        effects: {
          first: () => {
            order.push('setup:first')
            return () => order.push('cleanup:first')
          },
          second: () => {
            order.push('setup:second')
            return () => order.push('cleanup:second')
          },
          fail: () => {
            order.push('setup:fail')
            throw setupError
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start)

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).cause).toBe(setupError)
    expect(service.getStatus()).toBe('Stopped')
    expect(order).toEqual([
      'setup:first',
      'setup:second',
      'setup:fail',
      'cleanup:second',
      'cleanup:first',
    ])

    runtime.stop()
    expect(order).toHaveLength(5)
  })

  it('回滚 cleanup 的多项异常不中断清理并与初始化异常一起报告', () => {
    const { createMachine } = setup<EffectTransactionSchema>()
    const order: string[] = []
    const setupError = new Error('effect setup failed')
    const firstCleanupError = new Error('first cleanup failed')
    const secondCleanupError = new Error('second cleanup failed')
    const machine = createMachine({
      name: 'effect-rollback-errors',
      initialState: () => 'active',
      states: {
        active: { effects: ['first', 'second', 'fail'] },
      },
      implementations: {
        effects: {
          first: () => () => {
            order.push('cleanup:first')
            throw firstCleanupError
          },
          second: () => () => {
            order.push('cleanup:second')
            throw secondCleanupError
          },
          fail: () => {
            throw setupError
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start)
    const cause = (error as MachineError).cause

    expect(error).toBeInstanceOf(MachineError)
    expect(cause).toBeInstanceOf(AggregateError)
    expect((cause as AggregateError).cause).toBe(setupError)
    expect((cause as AggregateError).errors).toEqual([
      setupError,
      secondCleanupError,
      firstCleanupError,
    ])
    expect(order).toEqual(['cleanup:second', 'cleanup:first'])
  })

  it('成功批次在卸载时按资源取得逆序执行 cleanup', () => {
    const { createMachine } = setup<EffectTransactionSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'effect-successful-batch',
      initialState: () => 'active',
      states: {
        active: { effects: ['first', 'second'] },
      },
      implementations: {
        effects: {
          first: () => {
            order.push('setup:first')
            return () => order.push('cleanup:first')
          },
          second: () => {
            order.push('setup:second')
            return () => order.push('cleanup:second')
          },
          fail: () => {
            throw new Error('本用例不应该执行 fail effect')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    createService(machine, { props: () => ({}), runtime })

    runtime.start()
    runtime.stop()

    expect(order).toEqual([
      'setup:first',
      'setup:second',
      'cleanup:second',
      'cleanup:first',
    ])
  })

  it('停机时跨状态路径按全局资源取得逆序清理', () => {
    interface CrossPathSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'stateEffect' | 'rootFirst' | 'rootSecond'
    }

    const { createMachine } = setup<CrossPathSchema>()
    const order: string[] = []
    const effect = (name: string) => () => {
      order.push(`setup:${name}`)
      return () => order.push(`cleanup:${name}`)
    }
    const machine = createMachine({
      name: 'effect-cross-path-lifo',
      initialState: () => 'active',
      effects: ['rootFirst', 'rootSecond'],
      states: {
        active: { effects: ['stateEffect'] },
      },
      implementations: {
        effects: {
          stateEffect: effect('state'),
          rootFirst: effect('root-first'),
          rootSecond: effect('root-second'),
        },
      },
    })
    const runtime = createVanillaRuntime()
    createService(machine, { props: () => ({}), runtime })

    runtime.start()
    runtime.stop()

    expect(order).toEqual([
      'setup:state',
      'setup:root-first',
      'setup:root-second',
      'cleanup:root-second',
      'cleanup:root-first',
      'cleanup:state',
    ])
  })

  it('合法 __init__ 初态与机器根 effect 使用不相交的内部路径', () => {
    interface InitNamedStateSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: '__init__'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'stateResource' | 'rootResource'
    }

    const { createMachine } = setup<InitNamedStateSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'init-named-state',
      initialState: () => '__init__',
      effects: ['rootResource'],
      states: {
        __init__: { effects: ['stateResource'] },
      },
      implementations: {
        effects: {
          stateResource: () => {
            order.push('setup:state')
            return () => order.push('cleanup:state')
          },
          rootResource: () => {
            order.push('setup:root')
            return () => order.push('cleanup:root')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    runtime.start()
    expect(service.state.get()).toBe('__init__')
    expect(order).toEqual(['setup:state', 'setup:root'])

    runtime.stop()
    expect(order).toEqual([
      'setup:state',
      'setup:root',
      'cleanup:root',
      'cleanup:state',
    ])
  })

  it('停机先关闭事件入口，cleanup 和 machine exit 内的 send 不会重新进入状态机', () => {
    interface StopSendSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active' | 'reopened'
      event: { type: 'REOPEN' }
      tag: never
      guard: never
      action: 'sendFromExit'
      effect: 'activeEffect' | 'unexpectedEffect'
    }

    const { createMachine } = setup<StopSendSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'stop-closes-event-entry',
      initialState: () => 'active',
      exit: ['sendFromExit'],
      states: {
        active: {
          effects: ['activeEffect'],
          on: { REOPEN: { target: 'reopened' } },
        },
        reopened: { effects: ['unexpectedEffect'] },
      },
      implementations: {
        actions: {
          sendFromExit: ({ send }) => {
            order.push('exit')
            send({ type: 'REOPEN' })
          },
        },
        effects: {
          activeEffect: ({ send }) => {
            order.push('setup:active')
            return () => {
              order.push('cleanup:active')
              send({ type: 'REOPEN' })
            }
          },
          unexpectedEffect: () => {
            order.push('setup:unexpected')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    runtime.stop()

    expect(service.getStatus()).toBe('Stopped')
    expect(service.state.get()).toBe('active')
    expect(order).toEqual(['setup:active', 'cleanup:active', 'exit'])
  })

  it('宿主重复 start 触发服务重复挂载不变式，旧资源只清理一次', () => {
    interface DuplicateStartSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'resource'
    }

    const { createMachine } = setup<DuplicateStartSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'duplicate-effect-path',
      initialState: () => 'active',
      states: {
        active: { effects: ['resource'] },
      },
      implementations: {
        effects: {
          resource: () => {
            order.push('setup')
            return () => order.push('cleanup')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = captureError(runtime.start)
    const invariant = (error as MachineError).cause

    expect(error).toBeInstanceOf(MachineError)
    expect(invariant).toBeInstanceOf(MachineError)
    expect((invariant as MachineError).code).toBe('DUPLICATE_SERVICE_MOUNT')
    expect(order).toEqual(['setup', 'cleanup'])
    expect(service.getStatus()).toBe('Stopped')

    runtime.start()
    runtime.stop()
    expect(order).toEqual(['setup', 'cleanup'])
  })

  it('返回 void 的 effect 也占用状态路径，重复 start 不会再次执行 setup', () => {
    interface VoidEffectSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'announce'
    }

    const { createMachine } = setup<VoidEffectSchema>()
    let setups = 0
    const machine = createMachine({
      name: 'duplicate-void-effect-path',
      initialState: () => 'active',
      states: {
        active: { effects: ['announce'] },
      },
      implementations: {
        effects: {
          announce: () => {
            setups += 1
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = captureError(runtime.start)

    expect(error).toBeInstanceOf(MachineError)
    expect(((error as MachineError).cause as MachineError).code).toBe('DUPLICATE_SERVICE_MOUNT')
    expect(setups).toBe(1)
    expect(service.getStatus()).toBe('Stopped')

    runtime.start()
    expect(setups).toBe(1)
  })

  it('effect setup 内重入 start 时占位路径拒绝第二批挂载并各清理一次', () => {
    interface ReentrantStartSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'stateResource' | 'currentResource' | 'reenterStart'
    }

    const runtime = createVanillaRuntime()
    const { createMachine } = setup<ReentrantStartSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'effect-reentrant-start',
      initialState: () => 'active',
      effects: ['currentResource', 'reenterStart'],
      states: {
        active: { effects: ['stateResource'] },
      },
      implementations: {
        effects: {
          stateResource: () => {
            order.push('setup:state')
            return () => order.push('cleanup:state')
          },
          currentResource: () => {
            order.push('setup:current')
            return () => order.push('cleanup:current')
          },
          reenterStart: () => {
            order.push('setup:reenter')
            runtime.start()
          },
        },
      },
    })
    const service = createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start) as MachineError
    const innerCrash = error.cause as MachineError
    const invariant = innerCrash.cause as MachineError

    expect(error).toBeInstanceOf(MachineError)
    expect(innerCrash).toBeInstanceOf(MachineError)
    expect(invariant).toBeInstanceOf(MachineError)
    expect(invariant.code).toBe('DUPLICATE_SERVICE_MOUNT')
    expect(order).toEqual([
      'setup:state',
      'setup:current',
      'setup:reenter',
      'cleanup:current',
      'cleanup:state',
    ])
    expect(service.getStatus()).toBe('Stopped')

    runtime.stop()
    expect(order).toHaveLength(5)
  })

  it('初始状态同步转移后目标 effect 重入 mount 不会留下幽灵初态资源', () => {
    interface InterleavedMountSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active' | 'closed'
      event: { type: 'CLOSE' }
      tag: never
      guard: never
      action: never
      effect: 'activeResource' | 'closedResource'
    }

    const runtime = createVanillaRuntime()
    const { createMachine } = setup<InterleavedMountSchema>()
    const order: string[] = []
    const reentryErrors: unknown[] = []
    let activeSetups = 0
    const machine = createMachine({
      name: 'effect-interleaved-mount',
      initialState: () => 'active',
      states: {
        active: {
          effects: ['activeResource'],
          on: { CLOSE: { target: 'closed' } },
        },
        closed: { effects: ['closedResource'] },
      },
      implementations: {
        effects: {
          activeResource: ({ send }) => {
            activeSetups += 1
            const setupIndex = activeSetups
            order.push(`setup:active:${setupIndex}`)
            if (setupIndex === 1)
              send({ type: 'CLOSE' })
            return () => order.push(`cleanup:active:${setupIndex}`)
          },
          closedResource: () => {
            order.push('setup:closed')
            try {
              runtime.start()
            }
            catch (error) {
              reentryErrors.push(error)
            }
            return () => order.push('cleanup:closed')
          },
        },
      },
    })
    const service = createService(machine, { props: () => ({}), runtime })

    runtime.start()

    const crash = reentryErrors[0] as MachineError
    const invariant = crash?.cause as MachineError
    expect(activeSetups).toBe(1)
    expect(reentryErrors).toHaveLength(1)
    expect(crash).toBeInstanceOf(MachineError)
    expect(crash.code).toBe('MACHINE_CRASHED')
    expect(invariant).toBeInstanceOf(MachineError)
    expect(invariant.code).toBe('DUPLICATE_SERVICE_MOUNT')
    expect(service.getStatus()).toBe('Stopped')
    expect(order).toEqual([
      'setup:active:1',
      'cleanup:active:1',
      'setup:closed',
      'cleanup:closed',
    ])

    runtime.stop()
    expect(order).toHaveLength(4)
  })

  it('根 effect 的同步转移不会被外层初始 entry 与状态提交覆盖', () => {
    interface RootSendSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active' | 'closed'
      event: { type: 'CLOSE' }
      tag: never
      guard: never
      action: 'enterActive' | 'enterClosed'
      effect: 'activeResource' | 'closedResource' | 'rootResource'
    }

    const { createMachine } = setup<RootSendSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'effect-root-send-during-initialization',
      initialState: () => 'active',
      effects: ['rootResource'],
      states: {
        active: {
          effects: ['activeResource'],
          entry: ['enterActive'],
          on: { CLOSE: { target: 'closed' } },
        },
        closed: {
          effects: ['closedResource'],
          entry: ['enterClosed'],
        },
      },
      implementations: {
        actions: {
          enterActive: () => order.push('entry:active'),
          enterClosed: () => order.push('entry:closed'),
        },
        effects: {
          activeResource: () => {
            order.push('setup:active')
            return () => order.push('cleanup:active')
          },
          closedResource: () => {
            order.push('setup:closed')
            return () => order.push('cleanup:closed')
          },
          rootResource: ({ send }) => {
            order.push('setup:root')
            send({ type: 'CLOSE' })
            return () => order.push('cleanup:root')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    runtime.start()

    expect(service.getStatus()).toBe('Started')
    expect(service.state.get()).toBe('closed')
    expect(order).toEqual([
      'setup:active',
      'setup:root',
      'entry:active',
      'cleanup:active',
      'setup:closed',
      'entry:closed',
    ])

    runtime.stop()
    expect(order).toEqual([
      'setup:active',
      'setup:root',
      'entry:active',
      'cleanup:active',
      'setup:closed',
      'entry:closed',
      'cleanup:closed',
      'cleanup:root',
    ])
  })

  it.each([
    ['有 effect', true],
    ['无 effect', false],
  ] as const)('started 服务重复 mount（%s）都报告服务级不变式并停止', (_label, withEffect) => {
    interface DuplicateMountSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'resource'
    }

    const { createMachine } = setup<DuplicateMountSchema>()
    let setups = 0
    let cleanups = 0
    const machine = createMachine({
      name: `duplicate-service-mount-${withEffect ? 'effect' : 'empty'}`,
      initialState: () => 'active',
      states: {
        active: { effects: withEffect ? ['resource'] : undefined },
      },
      implementations: {
        effects: {
          resource: () => {
            setups += 1
            return () => {
              cleanups += 1
            }
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const crash = captureError(runtime.start) as MachineError
    const invariant = crash.cause as MachineError

    expect(crash).toBeInstanceOf(MachineError)
    expect(crash.code).toBe('MACHINE_CRASHED')
    expect(invariant).toBeInstanceOf(MachineError)
    expect(invariant.code).toBe('DUPLICATE_SERVICE_MOUNT')
    expect(service.getStatus()).toBe('Stopped')
    expect(setups).toBe(withEffect ? 1 : 0)
    expect(cleanups).toBe(withEffect ? 1 : 0)

    runtime.stop()
    expect(cleanups).toBe(withEffect ? 1 : 0)
  })

  it('effect setup 内停机后当场清理迟到资源并终止后续编排', () => {
    interface StopDuringSetupSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: 'unexpectedMachineEntry' | 'unexpectedStateEntry'
      effect: 'stopDuringSetup' | 'unexpectedRoot'
    }

    const runtime = createVanillaRuntime()
    const { createMachine } = setup<StopDuringSetupSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'effect-stop-during-setup',
      initialState: () => 'active',
      entry: ['unexpectedMachineEntry'],
      effects: ['unexpectedRoot'],
      states: {
        active: {
          effects: ['stopDuringSetup'],
          entry: ['unexpectedStateEntry'],
        },
      },
      implementations: {
        actions: {
          unexpectedMachineEntry: () => order.push('entry:machine'),
          unexpectedStateEntry: () => order.push('entry:state'),
        },
        effects: {
          stopDuringSetup: () => {
            order.push('setup:stop')
            runtime.stop()
            return () => order.push('cleanup:late')
          },
          unexpectedRoot: () => {
            order.push('setup:root')
          },
        },
      },
    })
    const service = createService(machine, { props: () => ({}), runtime })

    runtime.start()

    expect(service.getStatus()).toBe('Stopped')
    expect(order).toEqual(['setup:stop', 'cleanup:late'])
  })

  it('初始 effect 同步发送的转移会等当前批次完整挂载后执行', () => {
    interface OwnershipLossSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active' | 'closed'
      event: { type: 'CLOSE' }
      tag: never
      guard: never
      action: never
      effect: 'leavePath' | 'followingEffect'
    }

    const { createMachine } = setup<OwnershipLossSchema>()
    const order: string[] = []
    const machine = createMachine({
      name: 'effect-path-ownership-loss',
      initialState: () => 'active',
      states: {
        active: {
          effects: ['leavePath', 'followingEffect'],
          on: { CLOSE: { target: 'closed' } },
        },
        closed: {},
      },
      implementations: {
        effects: {
          leavePath: ({ send }) => {
            order.push('setup:leave')
            send({ type: 'CLOSE' })
            return () => order.push('cleanup:late')
          },
          followingEffect: () => {
            order.push('setup:following')
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    runtime.start()

    expect(service.getStatus()).toBe('Started')
    expect(service.state.get()).toBe('closed')
    expect(order).toEqual(['setup:leave', 'setup:following', 'cleanup:late'])
    runtime.stop()
  })

  it('effect setup 内停机后迟到 cleanup 的异常仍向外暴露', () => {
    interface StopCleanupErrorSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'stopDuringSetup' | 'unexpectedRoot'
    }

    const runtime = createVanillaRuntime()
    const { createMachine } = setup<StopCleanupErrorSchema>()
    const cleanupError = new Error('late cleanup failed')
    let rootSetups = 0
    const machine = createMachine({
      name: 'effect-stop-cleanup-error',
      initialState: () => 'active',
      effects: ['unexpectedRoot'],
      states: {
        active: { effects: ['stopDuringSetup'] },
      },
      implementations: {
        effects: {
          stopDuringSetup: () => {
            runtime.stop()
            return () => {
              throw cleanupError
            }
          },
          unexpectedRoot: () => {
            rootSetups += 1
          },
        },
      },
    })
    const service = createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start) as MachineError

    expect(error).toBeInstanceOf(MachineError)
    expect(error.cause).toBe(cleanupError)
    expect(service.getStatus()).toBe('Stopped')
    expect(rootSetups).toBe(0)
  })

  it.each([
    ['cleanup', true],
    ['machine exit', false],
  ] as const)('%s 抛出 undefined 时仍会被收集并原样抛出', (_label, fromCleanup) => {
    interface UndefinedFailureSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: 'failExit'
      effect: 'failCleanup'
    }

    const { createMachine } = setup<UndefinedFailureSchema>()
    const undefinedFailure: unknown = undefined
    const machine = createMachine({
      name: `effect-undefined-${fromCleanup ? 'cleanup' : 'exit'}`,
      initialState: () => 'active',
      exit: fromCleanup ? undefined : ['failExit'],
      states: {
        active: { effects: fromCleanup ? ['failCleanup'] : undefined },
      },
      implementations: {
        actions: {
          failExit: () => {
            throw undefinedFailure
          },
        },
        effects: {
          failCleanup: () => () => {
            throw undefinedFailure
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    let didThrow = false
    try {
      runtime.stop()
    }
    catch (error) {
      didThrow = true
      expect(error).toBeUndefined()
    }

    expect(didThrow).toBe(true)
    expect(service.getStatus()).toBe('Stopped')
  })

  it('正常停机的 cleanup 与 exit 聚合异常以同一对象进入诊断并抛出', () => {
    interface StopDiagnosticSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: 'failExit'
      effect: 'failCleanup'
    }

    const cleanupFailure: unknown = undefined
    const exitFailure: unknown = null
    const { createMachine } = setup<StopDiagnosticSchema>()
    const machine = createMachine({
      name: 'effect-normal-stop-diagnostic',
      initialState: () => 'active',
      exit: ['failExit'],
      states: {
        active: { effects: ['failCleanup'] },
      },
      implementations: {
        actions: {
          failExit: () => {
            throw exitFailure
          },
        },
        effects: {
          failCleanup: () => () => {
            throw cleanupFailure
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    const diagnostics: unknown[] = []
    const stopDiagnostics = onDiagnostic((record) => {
      if (record.scope === 'effect-normal-stop-diagnostic')
        diagnostics.push(record.detail?.reason)
    })
    runtime.start()

    const error = captureError(runtime.stop) as AggregateError
    stopDiagnostics()

    expect(error).toBeInstanceOf(AggregateError)
    expect(error.errors).toEqual([cleanupFailure, exitFailure])
    expect(diagnostics).toEqual([error])
    expect(service.getStatus()).toBe('Stopped')
  })

  it('正常停机 cleanup 抛出不可格式化对象时诊断不会覆盖原异常', () => {
    interface UnprintableCleanupSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'failCleanup'
    }

    const cleanupFailure = {
      toString: () => {
        throw new Error('toString failed')
      },
    }
    const { createMachine } = setup<UnprintableCleanupSchema>()
    const machine = createMachine({
      name: 'effect-unprintable-stop-diagnostic',
      initialState: () => 'active',
      states: {
        active: { effects: ['failCleanup'] },
      },
      implementations: {
        effects: {
          failCleanup: () => () => {
            throw cleanupFailure
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    createService(machine, { props: () => ({}), runtime })
    const diagnostics: Array<{ message: string, reason: unknown }> = []
    const stopDiagnostics = onDiagnostic((record) => {
      if (record.scope === 'effect-unprintable-stop-diagnostic') {
        diagnostics.push({
          message: record.message,
          reason: record.detail?.reason,
        })
      }
    })
    runtime.start()

    const error = captureError(runtime.stop)
    stopDiagnostics()

    expect(error).toBe(cleanupFailure)
    expect(diagnostics).toEqual([{
      message: '<无法格式化的异常>',
      reason: cleanupFailure,
    }])
  })

  it.each([
    ['null', null, 'null'],
    ['undefined', undefined, 'undefined'],
    ['number', 42, '42'],
    ['unprintable object', { toString: () => { throw new Error('toString failed') } }, '<无法格式化的异常>'],
  ] as const)('初始化抛出 %s 时安全生成崩溃信息并保留 cause', (_label, thrown, message) => {
    interface NonErrorSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active'
      event: { type: 'NOOP' }
      tag: never
      guard: never
      action: never
      effect: 'fail'
    }

    const { createMachine } = setup<NonErrorSchema>()
    const machine = createMachine({
      name: `effect-non-error-${_label}`,
      initialState: () => 'active',
      states: {
        active: { effects: ['fail'] },
      },
      implementations: {
        effects: {
          fail: () => {
            throw thrown
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start) as MachineError

    expect(error).toBeInstanceOf(MachineError)
    expect(error.message).toContain(message)
    expect(error.cause).toBe(thrown)
  })

  it('路径 cleanup 抛错前先摘除登记，停机不会重复执行', () => {
    interface PathCleanupSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active' | 'idle'
      event: { type: 'STOP' }
      tag: never
      guard: never
      action: never
      effect: 'first' | 'second'
    }

    const { createMachine } = setup<PathCleanupSchema>()
    const order: string[] = []
    const cleanupError = new Error('second cleanup failed')
    const machine = createMachine({
      name: 'effect-path-dispose',
      initialState: () => 'active',
      states: {
        active: {
          effects: ['first', 'second'],
          on: { STOP: { target: 'idle' } },
        },
        idle: {},
      },
      implementations: {
        effects: {
          first: () => () => order.push('cleanup:first'),
          second: () => () => {
            order.push('cleanup:second')
            throw cleanupError
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = captureError(() => service.send({ type: 'STOP' }))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).cause).toBe(cleanupError)
    expect(service.getStatus()).toBe('Stopped')
    expect(order).toEqual(['cleanup:second', 'cleanup:first'])

    runtime.stop()
    expect(order).toEqual(['cleanup:second', 'cleanup:first'])
  })

  it('崩溃停机会清完所有 effect、执行 exit 并聚合完整异常链', () => {
    interface StopTransactionSchema extends MachineSchema {
      props: Record<string, never>
      context: Record<string, never>
      computed: Record<string, never>
      refs: Record<string, never>
      state: 'active' | 'idle'
      event: { type: 'STOP' }
      tag: never
      guard: never
      action: 'failExit'
      effect: 'stateEffect' | 'rootFirst' | 'rootSecond'
    }

    const { createMachine } = setup<StopTransactionSchema>()
    const order: string[] = []
    const stateCleanupError = new Error('state cleanup failed')
    const rootFirstError = new Error('root first cleanup failed')
    const rootSecondError = new Error('root second cleanup failed')
    const exitError = new Error('machine exit failed')
    const machine = createMachine({
      name: 'effect-stop-transaction',
      initialState: () => 'active',
      effects: ['rootFirst', 'rootSecond'],
      exit: ['failExit'],
      states: {
        active: {
          effects: ['stateEffect'],
          on: { STOP: { target: 'idle' } },
        },
        idle: {},
      },
      implementations: {
        actions: {
          failExit: () => {
            order.push('exit')
            throw exitError
          },
        },
        effects: {
          stateEffect: () => () => {
            order.push('cleanup:state')
            throw stateCleanupError
          },
          rootFirst: () => () => {
            order.push('cleanup:root-first')
            throw rootFirstError
          },
          rootSecond: () => () => {
            order.push('cleanup:root-second')
            throw rootSecondError
          },
        },
      },
    })
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    const diagnostics: unknown[] = []
    const stopDiagnostics = onDiagnostic((record) => {
      if (record.scope === 'effect-stop-transaction')
        diagnostics.push(record.detail?.reason)
    })
    runtime.start()

    const error = captureError(() => service.send({ type: 'STOP' }))
    stopDiagnostics()
    const failures = (error as AggregateError).errors
    const crash = failures[0] as MachineError

    expect(error).toBeInstanceOf(AggregateError)
    expect((error as AggregateError).cause).toBe(crash)
    expect(crash).toBeInstanceOf(MachineError)
    expect(crash.cause).toBe(stateCleanupError)
    expect(failures).toEqual([
      crash,
      rootSecondError,
      rootFirstError,
      exitError,
    ])
    expect(order).toEqual([
      'cleanup:state',
      'cleanup:root-second',
      'cleanup:root-first',
      'exit',
    ])
    expect(service.getStatus()).toBe('Stopped')
    expect(diagnostics).toEqual([error])

    runtime.stop()
    expect(order).toHaveLength(4)
  })
})
