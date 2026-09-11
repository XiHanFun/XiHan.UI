import type { DiagnosticRecord } from '../src/kernel/diagnostics/types'
import type { MachineConfig, MachineErrorCode, MachineSchema } from '../src/machine'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '../src/kernel/diagnostics/channel'
import { isDev } from '../src/kernel/utils/dev'
import { COMBINATOR, createMachine, createService, MachineError, setup } from '../src/machine'
import { createVanillaRuntime } from '../src/machine/vanilla'

interface StrictImplementationSchema extends MachineSchema {
  props: { version?: number }
  context: Record<string, never>
  computed: Record<string, never>
  refs: Record<string, never>
  state: 'active' | 'done'
  event: { type: 'RUN' }
  tag: never
  guard: 'validGuard' | 'missingGuard'
  action: 'outerAction' | 'validAction' | 'missingAction'
  effect: 'resourceEffect' | 'validEffect' | 'missingEffect'
}

type MissingRuntimeCode = Extract<MachineErrorCode, 'MISSING_ACTION' | 'MISSING_GUARD' | 'MISSING_EFFECT'>

function captureError(task: () => void): unknown {
  try {
    task()
  }
  catch (error) {
    return error
  }
  return undefined
}

function expectRuntimeFailure(error: unknown, code: MissingRuntimeCode): MachineError {
  expect(error).toBeInstanceOf(MachineError)
  expect((error as MachineError).code).toBe(code)
  return error as MachineError
}

function baseConfig(
  name: string,
  overrides: Partial<MachineConfig<StrictImplementationSchema>>,
): MachineConfig<StrictImplementationSchema> {
  return {
    name,
    initialState: () => 'active',
    states: {
      active: {},
      done: {},
    },
    ...overrides,
  }
}

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('error')
})

describe('机器实现引用的严格契约', () => {
  const staticCases: Array<[
    string,
    MachineErrorCode,
    Partial<MachineConfig<StrictImplementationSchema>>,
  ]> = [
    ['action', 'UNKNOWN_ACTION', { entry: ['missingAction'] }],
    ['guard', 'UNKNOWN_GUARD', { states: { active: { on: { RUN: { guard: 'missingGuard' } } }, done: {} } }],
    ['effect', 'UNKNOWN_EFFECT', { effects: ['missingEffect'] }],
  ]

  it.each(staticCases)('静态拒绝未实现的 %s', (_kind, code, overrides) => {
    expect(isDev()).toBe(true)

    const error = captureError(() => createMachine(baseConfig(`static-${_kind}`, overrides)))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe(code)
  })

  it('递归审计嵌套组合 guard 的具名引用', () => {
    const { guards } = setup<StrictImplementationSchema>()

    const error = captureError(() => createMachine(baseConfig('nested-combinator', {
      states: {
        active: {
          on: {
            RUN: { guard: guards.and('validGuard', guards.not('missingGuard')) },
          },
        },
        done: {},
      },
      implementations: {
        guards: { validGuard: () => true },
      },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('UNKNOWN_GUARD')
  })

  it('递归拒绝组合 guard 内的裸内联函数', () => {
    const { guards } = setup<StrictImplementationSchema>()

    const error = captureError(() => createMachine(baseConfig('nested-inline-guard', {
      states: {
        active: {
          on: {
            RUN: { guard: guards.and('validGuard', () => true) },
          },
        },
        done: {},
      },
      implementations: {
        guards: { validGuard: () => true },
      },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('INLINE_IMPL')
  })

  it('拒绝循环组合 guard 元数据', () => {
    const cyclic = () => true
    Object.defineProperty(cyclic, COMBINATOR, {
      value: { op: 'and', args: [cyclic] },
    })

    const error = captureError(() => createMachine(baseConfig('cyclic-combinator', {
      states: {
        active: { on: { RUN: { guard: cyclic as never } } },
        done: {},
      },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('INLINE_IMPL')
  })

  it('拒绝组合 guard 访问器元数据且不调用 getter', () => {
    let getterCalls = 0
    const accessor = () => true
    Object.defineProperty(accessor, COMBINATOR, {
      get: () => {
        getterCalls += 1
        return { op: 'and', args: ['validGuard'] }
      },
    })

    const error = captureError(() => createMachine(baseConfig('accessor-combinator', {
      states: {
        active: { on: { RUN: { guard: accessor as never } } },
        done: {},
      },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('INLINE_IMPL')
    expect(getterCalls).toBe(0)
  })

  it('拒绝畸形组合 guard 元数据', () => {
    const malformed = () => true
    Object.defineProperty(malformed, COMBINATOR, {
      value: { op: 'xor', args: [] },
    })

    const error = captureError(() => createMachine(baseConfig('malformed-combinator', {
      states: {
        active: { on: { RUN: { guard: malformed as never } } },
        done: {},
      },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('INLINE_IMPL')
  })

  it.each([
    ['继承实现', Object.create({ missingAction: () => {} })],
    ['非函数实现', { missingAction: 'not callable' }],
  ])('静态拒绝%s', (_label, actions) => {
    const error = captureError(() => createMachine(baseConfig(`invalid-static-${_label}`, {
      entry: ['missingAction'],
      implementations: { actions: actions as never },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('UNKNOWN_ACTION')
  })

  it('静态审计拒绝访问器且不调用 getter', () => {
    let getterCalls = 0
    const actions = Object.defineProperty({}, 'missingAction', {
      get: () => {
        getterCalls += 1
        return () => {}
      },
    })

    const error = captureError(() => createMachine(baseConfig('static-accessor', {
      entry: ['missingAction'],
      implementations: { actions: actions as never },
    })))

    expect(error).toBeInstanceOf(MachineError)
    expect((error as MachineError).code).toBe('UNKNOWN_ACTION')
    expect(getterCalls).toBe(0)
  })

  it('动态 action 列表先完整校验再失败', () => {
    expect(isDev()).toBe(true)
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    let validCalls = 0
    const { createMachine } = setup<StrictImplementationSchema>()
    const machine = createMachine(baseConfig('dynamic-action-development', {
      entry: () => ['validAction', 'missingAction'],
      implementations: {
        actions: {
          validAction: () => {
            validCalls += 1
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = expectRuntimeFailure(captureError(runtime.start), 'MISSING_ACTION')

    expect(validCalls).toBe(0)
    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual(['MISSING_ACTION'])
    expect(records[0]?.detail?.reason).toBe(error)
  })

  it('inspect 抛错不会遮蔽无目标转移的缺项错误或阻止停机', () => {
    setDiagnosticsDedupe(false)
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    const inspectError = new Error('inspect failed')
    const machine = createMachine(baseConfig('inspect-missing-action', {
      states: {
        active: { on: { RUN: { actions: ['outerAction'] } } },
        done: {},
      },
      implementations: {
        actions: {
          outerAction: ({ action }) => action(() => ['missingAction']),
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, {
      props: () => ({}),
      runtime,
      inspect: () => {
        throw inspectError
      },
    })
    runtime.start()

    const error = expectRuntimeFailure(captureError(() => service.send({ type: 'RUN' })), 'MISSING_ACTION')

    expect(error).not.toBe(inspectError)
    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual(['MISSING_ACTION', 'MACHINE_CRASHED'])
    expect(records[0]?.detail?.reason).toBe(error)
    expect(records[1]?.detail?.reason).toBe(error)
  })

  it('动态 guard 引用不会降级成 false', () => {
    expect(isDev()).toBe(true)
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    const { createMachine } = setup<StrictImplementationSchema>()
    const machine = createMachine(baseConfig('dynamic-guard-development', {
      entry: ({ guard }) => {
        guard('missingGuard')
        return []
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = expectRuntimeFailure(captureError(runtime.start), 'MISSING_GUARD')

    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual(['MISSING_GUARD'])
    expect(records[0]?.detail?.reason).toBe(error)
  })

  it('动态 effect 列表先完整校验再失败', () => {
    expect(isDev()).toBe(true)
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    let validSetups = 0
    const { createMachine } = setup<StrictImplementationSchema>()
    const machine = createMachine(baseConfig('dynamic-effect-development', {
      states: {
        active: { effects: () => ['validEffect', 'missingEffect'] },
        done: {},
      },
      implementations: {
        effects: {
          validEffect: () => {
            validSetups += 1
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = expectRuntimeFailure(captureError(runtime.start), 'MISSING_EFFECT')

    expect(validSetups).toBe(0)
    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual(['MISSING_EFFECT'])
    expect(records[0]?.detail?.reason).toBe(error)
  })

  it.each([
    ['action', 'MISSING_ACTION', ({ action }: { action: (keys: () => Array<'validAction' | 'missingAction'>) => void }) => {
      action(() => ['validAction', 'missingAction'])
    }],
    ['guard', 'MISSING_GUARD', ({ guard }: { guard: (name: 'missingGuard') => boolean }) => {
      guard('missingGuard')
    }],
  ] as const)('无目标转移中的动态 %s 缺项会终止服务', (_kind, code, invoke) => {
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    let validCalls = 0
    const machine = createMachine(baseConfig(`targetless-${_kind}`, {
      states: {
        active: { on: { RUN: { actions: ['outerAction'] } } },
        done: {},
      },
      implementations: {
        actions: {
          outerAction: params => invoke(params as never),
          validAction: () => {
            validCalls += 1
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = expectRuntimeFailure(captureError(() => service.send({ type: 'RUN' })), code)

    expect(validCalls).toBe(0)
    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual([code])
    expect(records[0]?.detail?.reason).toBe(error)
  })

  it('tracker 中的动态缺项会终止服务', () => {
    const runtime = createVanillaRuntime()
    const version = runtime.signal(0)
    const machine = createMachine(baseConfig('tracker-missing-action', {
      watch: ({ track, prop, action }) => {
        track([() => prop('version')], () => action(() => ['missingAction']))
      },
    }))
    const service = createService(machine, { props: () => ({ version: version.get() }), runtime })
    runtime.start()

    const error = expectRuntimeFailure(captureError(() => version.set(1)), 'MISSING_ACTION')

    expect(service.getStatus()).toBe('Stopped')
    expect(error.code).toBe('MISSING_ACTION')
  })

  it('effect 留出的异步 action 引用缺项时会终止服务并只清理一次', () => {
    let invokeLater: VoidFunction | undefined
    let cleanupCalls = 0
    const machine = createMachine(baseConfig('async-effect-missing-action', {
      states: {
        active: { effects: ['resourceEffect'] },
        done: {},
      },
      implementations: {
        effects: {
          resourceEffect: ({ action }) => {
            invokeLater = () => action(() => ['missingAction'])
            return () => {
              cleanupCalls += 1
            }
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = expectRuntimeFailure(captureError(() => invokeLater!()), 'MISSING_ACTION')

    expect(service.getStatus()).toBe('Stopped')
    expect(cleanupCalls).toBe(1)
    expect(error.code).toBe('MISSING_ACTION')
    runtime.stop()
    expect(cleanupCalls).toBe(1)
  })

  it('正常 stop 会整批预检动态 exit 并抛出原缺项错误', () => {
    setDiagnosticsDedupe(false)
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    let validCalls = 0
    const machine = createMachine(baseConfig('dynamic-exit-missing', {
      exit: () => ['validAction', 'missingAction'],
      implementations: {
        actions: {
          validAction: () => {
            validCalls += 1
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = expectRuntimeFailure(captureError(runtime.stop), 'MISSING_ACTION')

    expect(validCalls).toBe(0)
    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual(['MISSING_ACTION', 'MACHINE_CRASHED'])
    expect(records[0]?.detail?.reason).toBe(error)
    expect(records[1]?.detail?.reason).toBe(error)
  })

  it('cleanup 失败与动态 exit 缺项会完整聚合并保留诊断身份', () => {
    const records: DiagnosticRecord[] = []
    onDiagnostic(record => records.push(record))
    const cleanupError = new Error('cleanup failed')
    const machine = createMachine(baseConfig('dynamic-exit-cleanup-failure', {
      exit: () => ['missingAction'],
      states: {
        active: { effects: ['resourceEffect'] },
        done: {},
      },
      implementations: {
        effects: {
          resourceEffect: () => () => {
            throw cleanupError
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })
    runtime.start()

    const error = captureError(runtime.stop)

    expect(error).toBeInstanceOf(AggregateError)
    const failures = (error as AggregateError).errors
    expect(failures[0]).toBe(cleanupError)
    expect(failures[1]).toBeInstanceOf(MachineError)
    expect((failures[1] as MachineError).code).toBe('MISSING_ACTION')
    expect(service.getStatus()).toBe('Stopped')
    expect(records.map(record => record.detail?.machineCode)).toEqual(['MISSING_ACTION', 'MACHINE_CRASHED'])
    expect(records[0]?.detail?.reason).toBe(failures[1])
    expect(records[1]?.detail?.reason).toBe(error)
  })

  it.each([
    ['继承实现', Object.create({ missingAction: () => {} })],
    ['非函数实现', { missingAction: 'not callable' }],
  ])('运行时拒绝动态列表引用的%s', (_label, actions) => {
    const machine = createMachine(baseConfig(`invalid-runtime-${_label}`, {
      entry: () => ['missingAction'],
      implementations: { actions: actions as never },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = expectRuntimeFailure(captureError(runtime.start), 'MISSING_ACTION')

    expect(service.getStatus()).toBe('Stopped')
    expect(error.code).toBe('MISSING_ACTION')
  })

  it('运行时拒绝访问器且不调用 getter', () => {
    let getterCalls = 0
    const actions = Object.defineProperty({}, 'missingAction', {
      get: () => {
        getterCalls += 1
        return () => {}
      },
    })
    const machine = createMachine(baseConfig('runtime-accessor', {
      entry: () => ['missingAction'],
      implementations: { actions: actions as never },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = expectRuntimeFailure(captureError(runtime.start), 'MISSING_ACTION')

    expect(service.getStatus()).toBe('Stopped')
    expect(error.code).toBe('MISSING_ACTION')
    expect(getterCalls).toBe(0)
  })
})
