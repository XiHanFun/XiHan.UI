import type { DiagnosticRecord } from '../src/kernel/diagnostics/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getDiagnostics,
  onDiagnostic,
  reportDiagnostic,
  resetDiagnostics,
  setDiagnosticsConsoleOutput,
  setDiagnosticsDedupe,
  setDiagnosticsLevel,
} from '../src/kernel/diagnostics/channel'
import { DIAGNOSTIC_CODES } from '../src/kernel/diagnostics/codes'
import { invariant, warn } from '../src/kernel/utils/invariant'

function collect(): DiagnosticRecord[] {
  const seen: DiagnosticRecord[] = []
  onDiagnostic(r => void seen.push(r))
  return seen
}

beforeEach(() => {
  resetDiagnostics()
  setDiagnosticsConsoleOutput(false)
  setDiagnosticsLevel('warn')
})

describe('诊断通道', () => {
  it('投递的记录原样送到订阅者', () => {
    const seen = collect()
    reportDiagnostic({ code: 'x.y', level: 'warn', message: 'm', scope: 'dialog', part: 'content' })
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ code: 'x.y', level: 'warn', message: 'm', scope: 'dialog', part: 'content' })
  })

  it('退订后不再收到', () => {
    const seen: DiagnosticRecord[] = []
    const off = onDiagnostic(r => void seen.push(r))
    reportDiagnostic({ code: 'a', level: 'warn', message: '1' })
    off()
    reportDiagnostic({ code: 'b', level: 'warn', message: '2' })
    expect(seen.map(r => r.code)).toEqual(['a'])
  })

  it('多个订阅者各收一份', () => {
    const a = collect()
    const b = collect()
    reportDiagnostic({ code: 'a', level: 'error', message: 'm' })
    expect(a).toHaveLength(1)
    expect(b).toHaveLength(1)
  })
})

describe('级别阈值', () => {
  it('silent 丢弃全部', () => {
    const seen = collect()
    setDiagnosticsLevel('silent')
    for (const level of ['error', 'warn'] as const)
      reportDiagnostic({ code: level, level, message: 'm' })
    expect(seen).toHaveLength(0)
  })

  it('error 只放行 error', () => {
    const seen = collect()
    setDiagnosticsLevel('error')
    for (const level of ['error', 'warn'] as const)
      reportDiagnostic({ code: level, level, message: 'm' })
    expect(seen.map(r => r.level)).toEqual(['error'])
  })

  it('warn 放行 error 与 warn', () => {
    const seen = collect()
    setDiagnosticsLevel('warn')
    for (const level of ['error', 'warn'] as const)
      reportDiagnostic({ code: level, level, message: 'm' })
    expect(seen.map(r => r.level)).toEqual(['error', 'warn'])
  })

  it('getLevel 回读设置值', () => {
    setDiagnosticsLevel('error')
    expect(getDiagnostics().getLevel()).toBe('error')
  })
})

describe('去重', () => {
  it('同 code + scope + instanceId + part 只报一次', () => {
    const seen = collect()
    const record = { code: 'c', level: 'warn', message: 'm', scope: 's', instanceId: '1', part: 'p' } as const
    reportDiagnostic(record)
    reportDiagnostic(record)
    reportDiagnostic(record)
    expect(seen).toHaveLength(1)
  })

  it('四元组任一不同即分别上报', () => {
    const seen = collect()
    reportDiagnostic({ code: 'c', level: 'warn', message: 'm', scope: 's', instanceId: '1', part: 'p' })
    reportDiagnostic({ code: 'c', level: 'warn', message: 'm', scope: 's', instanceId: '2', part: 'p' })
    reportDiagnostic({ code: 'c', level: 'warn', message: 'm', scope: 's', instanceId: '2', part: 'q' })
    expect(seen).toHaveLength(3)
  })

  it('同 code 下文案不同视为不同问题，各报一次', () => {
    const seen = collect()
    reportDiagnostic({ code: 'c', level: 'warn', message: '第一次' })
    reportDiagnostic({ code: 'c', level: 'warn', message: '第二次' })
    reportDiagnostic({ code: 'c', level: 'warn', message: '第一次' })
    expect(seen.map(r => r.message)).toEqual(['第一次', '第二次'])
  })

  it('去重表满后整体清空，不无界增长', () => {
    const seen = collect()
    for (let i = 0; i < 1200; i++)
      reportDiagnostic({ code: 'c', level: 'warn', message: `第 ${i} 条` })
    expect(seen).toHaveLength(1200)
    // 表已清空过一次，最早那条不再被压
    reportDiagnostic({ code: 'c', level: 'warn', message: '第 0 条' })
    expect(seen).toHaveLength(1201)
  })

  it('关掉后同一条重复上报', () => {
    const seen = collect()
    setDiagnosticsDedupe(false)
    reportDiagnostic({ code: 'c', level: 'warn', message: 'm' })
    reportDiagnostic({ code: 'c', level: 'warn', message: 'm' })
    expect(seen).toHaveLength(2)
  })
})

describe('隔离性', () => {
  it('订阅者抛错不影响其余订阅者与调用方', () => {
    const seen: DiagnosticRecord[] = []
    onDiagnostic(() => {
      throw new Error('订阅者炸了')
    })
    onDiagnostic(r => void seen.push(r))
    expect(() => reportDiagnostic({ code: 'c', level: 'error', message: 'm' })).not.toThrow()
    expect(seen).toHaveLength(1)
  })

  it('console 输出可关闭', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setDiagnosticsConsoleOutput(false)
    reportDiagnostic({ code: 'c', level: 'warn', message: 'm' })
    expect(spy).not.toHaveBeenCalled()
    setDiagnosticsConsoleOutput(true)
    reportDiagnostic({ code: 'd', level: 'warn', message: 'm' })
    expect(spy).toHaveBeenCalledOnce()
    spy.mockRestore()
  })

  it('console 按级别选通道', () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setDiagnosticsConsoleOutput(true)
    reportDiagnostic({ code: 'a', level: 'error', message: 'm' })
    reportDiagnostic({ code: 'b', level: 'warn', message: 'm' })
    expect(err).toHaveBeenCalledOnce()
    expect(wrn).toHaveBeenCalledOnce()
    err.mockRestore()
    wrn.mockRestore()
  })

  it('全局单例跨调用共享', () => {
    expect(getDiagnostics()).toBe(getDiagnostics())
  })
})

describe('invariant 与 warn 接入通道', () => {
  it('条件为真时不投递', () => {
    const seen = collect()
    invariant(true, '不该出现')
    warn(true, '不该出现')
    expect(seen).toHaveLength(0)
  })

  it('warn 条件为假时投递 warn 级', () => {
    const seen = collect()
    warn(false, '出问题了')
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ code: DIAGNOSTIC_CODES.warn, level: 'warn', message: '出问题了' })
  })

  it('invariant 条件为假时投递 error 级', () => {
    const seen = collect()
    try {
      invariant(false, '不变式破了')
    }
    catch {}
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ code: DIAGNOSTIC_CODES.invariant, level: 'error', message: '不变式破了' })
  })
})
