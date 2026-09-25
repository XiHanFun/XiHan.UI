import { describe, expect, it } from 'vitest'
import { isVizError, VizError } from '../src'

describe('错误类型', () => {
  it('带着错误码、消息与冻结的 detail', () => {
    const error = new VizError('XH_VIZ_INVALID_ARGUMENT', 'count 必须是正数', { count: -1 })
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('VizError')
    expect(error.code).toBe('XH_VIZ_INVALID_ARGUMENT')
    expect(error.message).toBe('count 必须是正数')
    expect(error.detail).toEqual({ count: -1 })
    expect(Object.isFrozen(error.detail)).toBe(true)
  })

  it('detail 是传入对象的副本，改原对象不影响错误', () => {
    const detail: Record<string, unknown> = { value: 1 }
    const error = new VizError('XH_VIZ_INVALID_ARGUMENT', 'x', detail)
    detail.value = 2
    expect(error.detail.value).toBe(1)
  })

  it('isVizError 认实例，也认重复安装产生的同形对象', () => {
    expect(isVizError(new VizError('XH_VIZ_INVALID_ARGUMENT', 'x'))).toBe(true)
    expect(isVizError({ name: 'VizError', code: 'XH_VIZ_INVALID_ARGUMENT', message: 'x' })).toBe(true)
  })

  it('isVizError 不认普通错误与别家的错误码', () => {
    expect(isVizError(new Error('x'))).toBe(false)
    expect(isVizError({ name: 'VizError', code: 'XH_CHART_MISSING_NAME' })).toBe(false)
    expect(isVizError(null)).toBe(false)
    expect(isVizError('VizError')).toBe(false)
  })
})
