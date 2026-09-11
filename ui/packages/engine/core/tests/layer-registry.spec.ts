// @vitest-environment jsdom

import type { Layer } from '../src/kernel/structure/layer-registry'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFocusScope } from '../src/behavior/focus-scope'
import { hideOutside } from '../src/kernel/capability/a11y/hide-outside'
import { getInertRegistry } from '../src/kernel/capability/a11y/inert-registry'
import {
  onDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '../src/kernel/diagnostics/channel'
import { DIAGNOSTIC_CODES } from '../src/kernel/diagnostics/codes'
import { createCounterIdGenerator } from '../src/kernel/id-generator'
import { createRuntimeConfig } from '../src/kernel/runtime-config'
import { createScope } from '../src/kernel/scope'
import { createLayerRegistry } from '../src/kernel/structure/layer-registry'

const cleanups: Array<() => void> = []

function layerInput(): Omit<Layer, 'id'> {
  let modal = false
  return {
    kind: 'popover',
    node: () => null,
    branches: () => [],
    isModal: () => modal,
    setModal: value => void (modal = value),
    surfaces: () => [],
  }
}

function captureError(run: () => void): unknown {
  try {
    run()
  }
  catch (error) {
    return error
  }
  throw new Error('预期操作抛错，但操作成功了')
}

async function frames(count = 1): Promise<void> {
  for (let index = 0; index < count; index++)
    await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))
}

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsDedupe(false)
  setDiagnosticsLevel('warn')
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse())
    cleanup()
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  resetDiagnostics()
})

describe('layer registry 快照', () => {
  it('固化唯一归属的 Document 与注册表公共记录', () => {
    const registry = createLayerRegistry(document)
    const otherDocument = document.implementation.createHTMLDocument('other')

    expect(registry.ownerDocument).toBe(document)
    expect(Object.isFrozen(registry)).toBe(true)
    expect(() => {
      (registry as { ownerDocument: Document }).ownerDocument = otherDocument
    }).toThrow(TypeError)
    expect(registry.ownerDocument).toBe(document)
  })

  it('list 与订阅者取得冻结快照，旧快照不会随新状态改变', () => {
    const registry = createLayerRegistry(document)
    const empty = registry.list()
    let delivered: readonly Layer[] | undefined

    expect(Object.isFrozen(empty)).toBe(true)
    expect(() => (empty as Layer[]).push({ id: '伪造层', ...layerInput() })).toThrow(TypeError)

    registry.subscribe((snapshot) => {
      delivered = snapshot
      expect(Object.isFrozen(snapshot)).toBe(true)
      expect(() => (snapshot as Layer[]).splice(0, 1)).toThrow(TypeError)
    })

    const forgedInput = { ...layerInput(), id: '伪造层' } as Omit<Layer, 'id'>
    const registration = registry.register(forgedInput)
    expect(delivered).toBe(registry.list())
    expect(registry.list()).toEqual([registration.layer])
    expect(empty).toEqual([])
    expect(registration.layer.id).toBe('layer-1')
    expect(Object.isFrozen(registration.layer)).toBe(true)
    expect(() => {
      (registration.layer as { kind: Layer['kind'] }).kind = 'modal'
    }).toThrow(TypeError)
    registration.layer.setModal(true)
    expect(registration.layer.isModal()).toBe(true)
  })
})

describe('layer registry 注册事务', () => {
  it('通知失败会通知完全部订阅者、恢复原快照并跳过失败 ID', () => {
    const registry = createLayerRegistry(document)
    const before = registry.list()
    const notificationError = new Error('注册通知失败')
    const observed: string[][] = []
    let failingCalls = 0
    let lateCalls = 0
    let stopFailing = (): void => {}

    stopFailing = registry.subscribe(() => {
      failingCalls++
      if (failingCalls === 1) {
        stopFailing()
        registry.subscribe(() => void lateCalls++)
        throw notificationError
      }
    })
    registry.subscribe(snapshot => void observed.push(snapshot.map(layer => layer.id)))

    expect(() => registry.register(layerInput())).toThrow(notificationError)
    expect(failingCalls).toBe(2)
    expect(lateCalls).toBe(0)
    expect(observed).toEqual([['layer-1'], []])
    expect(registry.list()).toBe(before)

    const registration = registry.register(layerInput())
    expect(registration.layer.id).toBe('layer-2')
    expect(lateCalls).toBe(1)
  })

  it('前向通知与回滚通知的全部异常按发生顺序聚合', () => {
    const registry = createLayerRegistry(document)
    const forwardA = new Error('前向 A')
    const forwardB = new Error('前向 B')
    const rollbackA = new Error('回滚 A')

    registry.subscribe((snapshot) => {
      throw snapshot.length ? forwardA : rollbackA
    })
    registry.subscribe((snapshot) => {
      if (snapshot.length)
        throw forwardB
    })

    const error = captureError(() => void registry.register(layerInput())) as AggregateError
    expect(error).toBeInstanceOf(AggregateError)
    const changeError = error.errors[0] as AggregateError
    expect(error.cause).toBe(changeError)
    expect(changeError).toBeInstanceOf(AggregateError)
    expect(changeError.cause).toBe(forwardA)
    expect(changeError.errors).toEqual([forwardA, forwardB])
    expect(error.errors).toEqual([changeError, rollbackA])
    expect(registry.list()).toEqual([])
  })

  it('订阅者抛出 undefined 仍会触发补偿并原样上抛', () => {
    const registry = createLayerRegistry(document)
    const before = registry.list()
    const notificationError: unknown = undefined
    let threw = false

    registry.subscribe((snapshot) => {
      if (snapshot.length)
        throw notificationError
    })

    try {
      registry.register(layerInput())
    }
    catch (error) {
      threw = true
      expect(error).toBeUndefined()
    }
    expect(threw).toBe(true)
    expect(registry.list()).toBe(before)
  })

  it('输入构造抛错也会消耗已经分配的 ID', () => {
    const registry = createLayerRegistry(document)
    const setupError = new Error('读取 layer 输入失败')
    const input = layerInput()
    Object.defineProperty(input, 'node', {
      enumerable: true,
      get: () => {
        throw setupError
      },
    })

    expect(() => registry.register(input)).toThrow(setupError)
    expect(registry.register(layerInput()).layer.id).toBe('layer-2')
  })

  it('订阅者主动抛出的 AggregateError 保留原对象与叶子异常', () => {
    const registry = createLayerRegistry(document)
    const firstLeaf = new Error('业务叶子 A')
    const secondLeaf = new Error('业务叶子 B')
    const subscriberError = new AggregateError([firstLeaf, secondLeaf], '业务聚合异常')

    registry.subscribe((snapshot) => {
      if (snapshot.length)
        throw subscriberError
    })

    const error = captureError(() => void registry.register(layerInput())) as AggregateError
    expect(error).toBe(subscriberError)
    expect(error.errors).toEqual([firstLeaf, secondLeaf])
  })

  it('不同注册表各自从 layer-1 分配 ID', () => {
    const firstRegistry = createLayerRegistry(document)
    const secondRegistry = createLayerRegistry(document)

    expect(firstRegistry.register(layerInput()).layer.id).toBe('layer-1')
    expect(secondRegistry.register(layerInput()).layer.id).toBe('layer-1')
  })
})

describe('layer registry 释放事务', () => {
  it('通知失败仍永久移除层，外层只消费一次 cleanup 也不会留下幽灵层', () => {
    const registry = createLayerRegistry(document)
    const registration = registry.register(layerInput())
    const firstError = new Error('释放通知 A')
    const secondError = new Error('释放通知 B')
    const observedA: number[] = []
    const observedB: number[] = []

    registry.subscribe((snapshot) => {
      observedA.push(snapshot.length)
      throw firstError
    })
    registry.subscribe((snapshot) => {
      observedB.push(snapshot.length)
      throw secondError
    })

    let consumed = false
    const outerCleanup = (): void => {
      if (consumed)
        return
      consumed = true
      registration.dispose()
    }
    const error = captureError(outerCleanup) as AggregateError
    expect(error).toBeInstanceOf(AggregateError)
    expect(error.cause).toBe(firstError)
    expect(error.errors).toEqual([firstError, secondError])
    expect(registry.list()).toEqual([])
    expect(observedA).toEqual([0])
    expect(observedB).toEqual([0])

    outerCleanup()
    expect(observedA).toEqual([0])
    expect(observedB).toEqual([0])
  })

  it('释放通知中重复调用同一 cleanup 保持幂等', () => {
    const registry = createLayerRegistry(document)
    const registration = registry.register(layerInput())
    let calls = 0

    registry.subscribe(() => {
      calls++
      registration.dispose()
    })

    registration.dispose()
    expect(calls).toBe(1)
    expect(registry.list()).toEqual([])
  })

  it('非栈顶诊断与通知都抛错时仍提交释放并按阶段聚合', () => {
    const registry = createLayerRegistry(document)
    const lower = registry.register(layerInput())
    const upper = registry.register(layerInput())
    const diagnosticError = new Error('诊断输出失败')
    const notificationError = new Error('释放订阅失败')
    setDiagnosticsConsoleOutput(true)
    vi.spyOn(console, 'error').mockImplementation(() => {
      throw diagnosticError
    })
    registry.subscribe(() => {
      throw notificationError
    })

    let consumed = false
    const outerCleanup = (): void => {
      if (consumed)
        return
      consumed = true
      lower.dispose()
    }
    const error = captureError(outerCleanup) as AggregateError

    expect(error).toBeInstanceOf(AggregateError)
    expect(error.cause).toBe(diagnosticError)
    expect(error.errors).toEqual([diagnosticError, notificationError])
    expect(registry.list()).toEqual([upper.layer])

    outerCleanup()
    expect(registry.list()).toEqual([upper.layer])
  })

  it('乱序释放在状态改变前报告诊断', () => {
    const registry = createLayerRegistry(document)
    const lower = registry.register(layerInput())
    const upper = registry.register(layerInput())
    const before = registry.list()
    const diagnosticSnapshots: Array<readonly Layer[]> = []

    const stop = onDiagnostic((record) => {
      if (record.code === DIAGNOSTIC_CODES.layerDisposeNotTop)
        diagnosticSnapshots.push(registry.list())
    })
    lower.dispose()
    stop()

    expect(diagnosticSnapshots).toEqual([before])
    expect(registry.list()).toEqual([upper.layer])
    upper.dispose()
  })
})

describe('layer registry 通知边界', () => {
  it('通知期间明确拒绝嵌套 register 与 dispose', () => {
    const registry = createLayerRegistry(document)
    const lower = registry.register(layerInput())
    const nestedErrors: unknown[] = []

    const stop = registry.subscribe(() => {
      nestedErrors.push(captureError(() => void registry.register(layerInput())))
      nestedErrors.push(captureError(lower.dispose))
    })
    const upper = registry.register(layerInput())
    stop()

    expect(upper.layer.id).toBe('layer-2')
    expect(nestedErrors).toHaveLength(2)
    for (const error of nestedErrors) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toMatch(/LayerRegistry 通知期间禁止嵌套 register\/dispose/)
    }

    const third = registry.register(layerInput())
    expect(third.layer.id).toBe('layer-3')
    third.dispose()
    upper.dispose()
    lower.dispose()
  })

  it('固定当轮订阅者，退订未执行者不跳过且新增者从下轮开始', () => {
    const registry = createLayerRegistry(document)
    const calls: string[] = []
    let firstNotification = true
    let stopB = (): void => {}

    registry.subscribe(() => {
      calls.push('A')
      if (!firstNotification)
        return
      firstNotification = false
      stopB()
      registry.subscribe(() => void calls.push('C'))
    })
    stopB = registry.subscribe(() => void calls.push('B'))

    registry.register(layerInput())
    expect(calls).toEqual(['A', 'B'])

    calls.length = 0
    registry.register(layerInput())
    expect(calls).toEqual(['A', 'C'])
  })

  it('未捕获的嵌套注册会让外层补偿且不消耗嵌套 ID', () => {
    const registry = createLayerRegistry(document)
    let tryNested = true

    registry.subscribe((snapshot) => {
      if (!snapshot.length || !tryNested)
        return
      tryNested = false
      registry.register(layerInput())
    })

    expect(() => registry.register(layerInput())).toThrow(/通知期间禁止嵌套 register\/dispose/)
    expect(registry.list()).toEqual([])
    expect(registry.register(layerInput()).layer.id).toBe('layer-2')
  })
})

describe('layer registry 真实订阅者补偿', () => {
  it('失败注册补偿后下层 FocusScope 恢复焦点抢回', async () => {
    const outside = document.createElement('button')
    const container = document.createElement('div')
    const inside = document.createElement('button')
    container.appendChild(inside)
    document.body.append(outside, container)
    outside.focus()

    const registry = createLayerRegistry(document)
    const lower = registry.register({
      ...layerInput(),
      kind: 'modal',
      node: () => container,
      isModal: () => true,
    })
    cleanups.push(lower.dispose)
    const config = createRuntimeConfig({
      scope: createScope(container, createCounterIdGenerator()),
      layerRegistry: registry,
    })
    const focusScope = createFocusScope({
      config,
      layer: lower.layer,
      container: () => container,
      trapped: () => true,
    })
    cleanups.push(() => focusScope.dispose())
    await frames(2)
    expect(document.activeElement).toBe(inside)

    const registrationError = new Error('上层登记通知失败')
    const stopFailure = registry.subscribe((snapshot) => {
      if (snapshot.length === 2)
        throw registrationError
    })
    cleanups.push(stopFailure)
    expect(() => registry.register({
      ...layerInput(),
      node: () => outside,
    })).toThrow(registrationError)
    expect(registry.top()).toBe(lower.layer)

    outside.focus()
    expect(document.activeElement).toBe(inside)
  })

  it('失败注册补偿会让 hideOutside 重新接管临时上层节点', () => {
    const background = document.createElement('div')
    const lowerNode = document.createElement('div')
    const upperNode = document.createElement('div')
    background.setAttribute('aria-hidden', 'false')
    document.body.append(background, lowerNode, upperNode)

    const registry = createLayerRegistry(document)
    const lower = registry.register({
      ...layerInput(),
      kind: 'modal',
      node: () => lowerNode,
      isModal: () => true,
    })
    cleanups.push(lower.dispose)
    const cleanupHide = hideOutside(
      () => [lowerNode, ...registry.elementsAbove(lower.layer)],
      {
        scope: createScope(lowerNode, createCounterIdGenerator()),
        layerRegistry: registry,
      },
    )
    cleanups.push(cleanupHide)
    const inert = getInertRegistry(document)
    expect(upperNode.inert).toBe(true)
    expect(inert.countOf(upperNode)).toBe(1)

    const observedUpperInert: boolean[] = []
    const registrationError = new Error('临时上层登记失败')
    const stopFailure = registry.subscribe((snapshot) => {
      observedUpperInert.push(upperNode.inert === true)
      if (snapshot.length === 2)
        throw registrationError
    })
    cleanups.push(stopFailure)
    expect(() => registry.register({
      ...layerInput(),
      node: () => upperNode,
    })).toThrow(registrationError)

    expect(observedUpperInert).toEqual([false, true])
    expect(registry.list()).toEqual([lower.layer])
    expect(upperNode.inert).toBe(true)
    expect(inert.countOf(upperNode)).toBe(1)

    stopFailure()
    cleanupHide()
    expect(background.inert === true).toBe(false)
    expect(upperNode.inert === true).toBe(false)
    expect(inert.countOf(background)).toBe(0)
    expect(inert.countOf(upperNode)).toBe(0)
    expect(background.getAttribute('aria-hidden')).toBe('false')
  })
})
