import assert from 'node:assert/strict'
import { resolve } from 'node:path'
import { before, beforeEach, describe, test } from 'node:test'
import { pathToFileURL } from 'node:url'

const distPath = process.env.XIHAN_CORE_PRODUCTION_TEST_DIST
assert.ok(distPath, '必须由生产契约 runner 注入独立构建目录')

let COMBINATOR
let createMachine
let createService
let createVanillaRuntime
let isDev
let MachineError
let onDiagnostic
let resetDiagnostics
let setDiagnosticsConsoleOutput
let setDiagnosticsDedupe
let setDiagnosticsLevel
let setup

before(async () => {
  ({
    COMBINATOR,
    createMachine,
    createService,
    createVanillaRuntime,
    isDev,
    MachineError,
    onDiagnostic,
    resetDiagnostics,
    setDiagnosticsConsoleOutput,
    setDiagnosticsDedupe,
    setDiagnosticsLevel,
    setup,
  } = await import(pathToFileURL(resolve(distPath, 'machine-implementation-entry.mjs')).href))
})

function baseConfig(name, overrides = {}) {
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

function captureError(task) {
  try {
    task()
  }
  catch (error) {
    return error
  }
  assert.fail('预期任务抛出异常')
}

function expectRuntimeFailure(error, code) {
  assert.ok(error instanceof MachineError)
  assert.equal(error.code, code)
}

function collectDiagnostics() {
  const records = []
  onDiagnostic(record => records.push(record))
  return records
}

describe('生产构建中的机器实现引用契约', () => {
  beforeEach(() => {
    assert.equal(isDev(), false)
    resetDiagnostics()
    setDiagnosticsConsoleOutput(false)
    setDiagnosticsLevel('error')
  })

  test('静态 action、guard 与 effect 缺项均在创建时失败', () => {
    const cases = [
      ['action', 'UNKNOWN_ACTION', { entry: ['missingAction'] }],
      ['guard', 'UNKNOWN_GUARD', { states: { active: { on: { RUN: { guard: 'missingGuard' } } }, done: {} } }],
      ['effect', 'UNKNOWN_EFFECT', { effects: ['missingEffect'] }],
    ]

    for (const [kind, code, overrides] of cases) {
      const error = captureError(() => createMachine(baseConfig(`production-static-${kind}`, overrides)))
      assert.ok(error instanceof MachineError)
      assert.equal(error.code, code)
    }
  })

  test('嵌套组合 guard、继承实现、访问器与非函数实现均被静态拒绝', () => {
    const { guards } = setup()
    const nestedError = captureError(() => createMachine(baseConfig('production-nested-combinator', {
      states: {
        active: { on: { RUN: { guard: guards.and('validGuard', guards.not('missingGuard')) } } },
        done: {},
      },
      implementations: { guards: { validGuard: () => true } },
    })))
    assert.ok(nestedError instanceof MachineError)
    assert.equal(nestedError.code, 'UNKNOWN_GUARD')

    const inlineError = captureError(() => createMachine(baseConfig('production-nested-inline', {
      states: {
        active: { on: { RUN: { guard: guards.and('validGuard', () => true) } } },
        done: {},
      },
      implementations: { guards: { validGuard: () => true } },
    })))
    assert.ok(inlineError instanceof MachineError)
    assert.equal(inlineError.code, 'INLINE_IMPL')

    const cyclic = () => true
    Object.defineProperty(cyclic, COMBINATOR, {
      value: { op: 'and', args: [cyclic] },
    })
    const cyclicError = captureError(() => createMachine(baseConfig('production-cyclic-combinator', {
      states: {
        active: { on: { RUN: { guard: cyclic } } },
        done: {},
      },
    })))
    assert.ok(cyclicError instanceof MachineError)
    assert.equal(cyclicError.code, 'INLINE_IMPL')

    let combinatorGetterCalls = 0
    const accessorCombinator = () => true
    Object.defineProperty(accessorCombinator, COMBINATOR, {
      get: () => {
        combinatorGetterCalls += 1
        return { op: 'and', args: ['validGuard'] }
      },
    })
    const accessorError = captureError(() => createMachine(baseConfig('production-accessor-combinator', {
      states: {
        active: { on: { RUN: { guard: accessorCombinator } } },
        done: {},
      },
    })))
    assert.ok(accessorError instanceof MachineError)
    assert.equal(accessorError.code, 'INLINE_IMPL')
    assert.equal(combinatorGetterCalls, 0)

    const malformed = () => true
    Object.defineProperty(malformed, COMBINATOR, {
      value: { op: 'xor', args: [] },
    })
    const malformedError = captureError(() => createMachine(baseConfig('production-malformed-combinator', {
      states: {
        active: { on: { RUN: { guard: malformed } } },
        done: {},
      },
    })))
    assert.ok(malformedError instanceof MachineError)
    assert.equal(malformedError.code, 'INLINE_IMPL')

    let getterCalls = 0
    const accessorActions = Object.defineProperty({}, 'missingAction', {
      get: () => {
        getterCalls += 1
        return () => {}
      },
    })
    for (const [kind, actions] of [
      ['inherited', Object.create({ missingAction: () => {} })],
      ['non-callable', { missingAction: true }],
      ['accessor', accessorActions],
    ]) {
      const error = captureError(() => createMachine(baseConfig(`production-static-${kind}`, {
        entry: ['missingAction'],
        implementations: { actions },
      })))
      assert.ok(error instanceof MachineError)
      assert.equal(error.code, 'UNKNOWN_ACTION')
    }
    assert.equal(getterCalls, 0)
  })

  test('动态 action 列表缺项时不会执行列表前部 action', () => {
    const records = collectDiagnostics()
    let validCalls = 0
    const machine = createMachine(baseConfig('production-dynamic-action', {
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

    const error = captureError(runtime.start)

    expectRuntimeFailure(error, 'MISSING_ACTION')
    assert.equal(validCalls, 0)
    assert.equal(service.getStatus(), 'Stopped')
    assert.deepEqual(records.map(record => record.detail?.machineCode), ['MISSING_ACTION'])
    assert.equal(records[0]?.detail?.reason, error)
  })

  test('动态 guard 缺项时不会降级成 false', () => {
    const records = collectDiagnostics()
    const machine = createMachine(baseConfig('production-dynamic-guard', {
      entry: ({ guard }) => {
        guard('missingGuard')
        return []
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start)

    expectRuntimeFailure(error, 'MISSING_GUARD')
    assert.equal(service.getStatus(), 'Stopped')
    assert.deepEqual(records.map(record => record.detail?.machineCode), ['MISSING_GUARD'])
    assert.equal(records[0]?.detail?.reason, error)
  })

  test('动态 effect 列表缺项时不会初始化列表前部 effect', () => {
    const records = collectDiagnostics()
    let validSetups = 0
    const machine = createMachine(baseConfig('production-dynamic-effect', {
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

    const error = captureError(runtime.start)

    expectRuntimeFailure(error, 'MISSING_EFFECT')
    assert.equal(validSetups, 0)
    assert.equal(service.getStatus(), 'Stopped')
    assert.deepEqual(records.map(record => record.detail?.machineCode), ['MISSING_EFFECT'])
    assert.equal(records[0]?.detail?.reason, error)
  })

  test('无目标转移与 tracker 中的动态缺项都会终止服务', () => {
    for (const [kind, code, outerAction] of [
      ['action', 'MISSING_ACTION', ({ action }) => action(() => ['validAction', 'missingAction'])],
      ['guard', 'MISSING_GUARD', ({ guard }) => guard('missingGuard')],
    ]) {
      let validCalls = 0
      const machine = createMachine(baseConfig(`production-targetless-${kind}`, {
        states: {
          active: { on: { RUN: { actions: ['outerAction'] } } },
          done: {},
        },
        implementations: {
          actions: {
            outerAction,
            validAction: () => {
              validCalls += 1
            },
          },
        },
      }))
      const runtime = createVanillaRuntime()
      const service = createService(machine, { props: () => ({}), runtime })
      runtime.start()

      const error = captureError(() => service.send({ type: 'RUN' }))

      expectRuntimeFailure(error, code)
      assert.equal(validCalls, 0)
      assert.equal(service.getStatus(), 'Stopped')
    }

    const runtime = createVanillaRuntime()
    const version = runtime.signal(0)
    const trackerMachine = createMachine(baseConfig('production-tracker-missing', {
      watch: ({ track, prop, action }) => {
        track([() => prop('version')], () => action(() => ['missingAction']))
      },
    }))
    const trackerService = createService(trackerMachine, {
      props: () => ({ version: version.get() }),
      runtime,
    })
    runtime.start()

    const trackerError = captureError(() => version.set(1))

    expectRuntimeFailure(trackerError, 'MISSING_ACTION')
    assert.equal(trackerService.getStatus(), 'Stopped')
  })

  test('inspect 抛错不会遮蔽缺项错误或阻止停机', () => {
    setDiagnosticsDedupe(false)
    const records = collectDiagnostics()
    const inspectError = new Error('inspect failed')
    const machine = createMachine(baseConfig('production-inspect-missing', {
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

    const error = captureError(() => service.send({ type: 'RUN' }))

    expectRuntimeFailure(error, 'MISSING_ACTION')
    assert.notEqual(error, inspectError)
    assert.equal(service.getStatus(), 'Stopped')
    assert.deepEqual(records.map(record => record.detail?.machineCode), ['MISSING_ACTION', 'MACHINE_CRASHED'])
    assert.equal(records[0]?.detail?.reason, error)
    assert.equal(records[1]?.detail?.reason, error)
  })

  test('effect 留出的异步 action 缺项会终止服务并只清理一次', () => {
    let invokeLater
    let cleanupCalls = 0
    const machine = createMachine(baseConfig('production-async-effect-missing', {
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

    const error = captureError(invokeLater)

    expectRuntimeFailure(error, 'MISSING_ACTION')
    assert.equal(service.getStatus(), 'Stopped')
    assert.equal(cleanupCalls, 1)
    runtime.stop()
    assert.equal(cleanupCalls, 1)
  })

  test('正常 stop 会整批预检动态 exit 并抛出同一缺项错误', () => {
    setDiagnosticsDedupe(false)
    const records = collectDiagnostics()
    let validCalls = 0
    const machine = createMachine(baseConfig('production-dynamic-exit', {
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

    const error = captureError(runtime.stop)

    expectRuntimeFailure(error, 'MISSING_ACTION')
    assert.equal(validCalls, 0)
    assert.equal(service.getStatus(), 'Stopped')
    assert.deepEqual(records.map(record => record.detail?.machineCode), ['MISSING_ACTION', 'MACHINE_CRASHED'])
    assert.equal(records[0]?.detail?.reason, error)
    assert.equal(records[1]?.detail?.reason, error)
  })

  test('动态列表拒绝继承、访问器与非函数实现且不调用 getter', () => {
    let getterCalls = 0
    const accessorActions = Object.defineProperty({}, 'missingAction', {
      get: () => {
        getterCalls += 1
        return () => {}
      },
    })
    for (const [kind, actions] of [
      ['inherited', Object.create({ missingAction: () => {} })],
      ['non-callable', { missingAction: true }],
      ['accessor', accessorActions],
    ]) {
      const machine = createMachine(baseConfig(`production-runtime-${kind}`, {
        entry: () => ['missingAction'],
        implementations: { actions },
      }))
      const runtime = createVanillaRuntime()
      const service = createService(machine, { props: () => ({}), runtime })

      const error = captureError(runtime.start)

      expectRuntimeFailure(error, 'MISSING_ACTION')
      assert.equal(service.getStatus(), 'Stopped')
    }
    assert.equal(getterCalls, 0)
  })

  test('动态缺项与 effect 回滚异常同时发生时仍向外抛出完整异常链', () => {
    const records = collectDiagnostics()
    const cleanupError = new Error('rollback cleanup failed')
    let cleanupCalls = 0
    const machine = createMachine(baseConfig('production-missing-during-effect', {
      states: {
        active: { effects: () => ['resourceEffect', 'missingGuardEffect'] },
        done: {},
      },
      implementations: {
        effects: {
          resourceEffect: () => () => {
            cleanupCalls += 1
            throw cleanupError
          },
          missingGuardEffect: ({ guard }) => {
            guard('missingGuard')
          },
        },
      },
    }))
    const runtime = createVanillaRuntime()
    const service = createService(machine, { props: () => ({}), runtime })

    const error = captureError(runtime.start)

    assert.ok(error instanceof AggregateError)
    assert.ok(error.errors[0] instanceof MachineError)
    assert.equal(error.errors[0].code, 'MISSING_GUARD')
    assert.equal(error.errors[1], cleanupError)
    assert.equal(cleanupCalls, 1)
    assert.equal(service.getStatus(), 'Stopped')
    assert.deepEqual(records.map(record => record.detail?.machineCode), ['MISSING_GUARD', 'MACHINE_CRASHED'])
    assert.equal(records[0]?.detail?.reason, error.errors[0])
    assert.equal(records[1]?.detail?.reason, error)
  })
})
