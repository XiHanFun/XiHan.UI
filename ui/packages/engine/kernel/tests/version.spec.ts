import type { DiagnosticRecord } from '../src'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkLockstepVersion, DIAGNOSTIC_CODES, onDiagnostic, resetDiagnostics, VERSION } from '../src'

const seen: DiagnosticRecord[] = []
let off: (() => void) | undefined

beforeEach(() => {
  seen.length = 0
  resetDiagnostics()
  off = onDiagnostic(record => void seen.push(record))
})

afterEach(() => {
  off?.()
})

describe('锁步版本检查', () => {
  it('版本一致时不报', () => {
    checkLockstepVersion('vue', '1.0.0-alpha.2', '1.0.0-alpha.2')
    expect(seen).toHaveLength(0)
  })

  it('版本不一致时报 core.version-mismatch', () => {
    checkLockstepVersion('vue', '1.0.0-alpha.3', '1.0.0-alpha.2')
    expect(seen).toHaveLength(1)
    expect(seen[0]).toMatchObject({ code: DIAGNOSTIC_CODES.versionMismatch, level: 'warn' })
    expect(seen[0]!.detail).toMatchObject({ name: 'vue', version: '1.0.0-alpha.3', kernelVersion: '1.0.0-alpha.2' })
  })

  it('同一条不一致只报一次(通道去重)', () => {
    checkLockstepVersion('vue', '1.0.0-alpha.3', '1.0.0-alpha.2')
    checkLockstepVersion('vue', '1.0.0-alpha.3', '1.0.0-alpha.2')
    expect(seen).toHaveLength(1)
  })

  it('kernel 导出了自己的版本号', () => {
    expect(typeof VERSION).toBe('string')
    expect(VERSION).toMatch(/^\d+\.\d+\.\d+/)
  })
})
