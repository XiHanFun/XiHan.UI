// 线形的三样外观：分段按整格亮起、条纹的标记、缓冲段的比例，以及写错地方时的诊断。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ProgressProps } from '../src/progress'
import { DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { connectProgress } from '../src/progress'

type Dict = Record<string, any>

const stops: Array<() => void> = []
afterEach(() => {
  while (stops.length) stops.pop()!()
})

function captured(): DiagnosticRecord[] {
  const records: DiagnosticRecord[] = []
  stops.push(onDiagnostic(r => records.push(r)))
  return records
}

function api(props: ProgressProps) {
  return connectProgress(props, normalizeProps)
}

describe('分段', () => {
  it('轨道带上分段标记与格数，填充按整格走：3.5 格只亮 3 格', () => {
    const a = api({ value: 35, steps: 10 })
    expect(a.steps).toBe(10)
    const track = a.getTrackProps() as Dict
    expect(track['data-stepped']).toBe('')
    expect(track.style['--xh-_progress-steps']).toBe('10')
    expect((a.getRangeProps() as Dict).style['--xh-_progress-value']).toBe('0.3')
  })

  it('整格落在浮点尾差上也算亮起：3 / 8 在 8 格里亮 3 格', () => {
    const a = api({ value: 3, max: 8, steps: 8 })
    expect((a.getRangeProps() as Dict).style['--xh-_progress-value']).toBe(String(3 / 8))
  })

  it('读屏报的仍是实际值，不跟着取整', () => {
    const root = api({ value: 35, steps: 10 }).getRootProps() as Dict
    expect(root['aria-valuenow']).toBe('35')
  })

  it('一格都没亮满时填充按零进度收起', () => {
    expect((api({ value: 5, steps: 10 }).getRangeProps() as Dict)['data-empty']).toBe('')
  })

  it('不是不小于 2 的整数：报选项被忽略，按没分段处理', () => {
    const records = captured()
    for (const steps of [1, 2.5, 0, -3, Number.NaN]) {
      const a = api({ value: 40, steps })
      expect(a.steps).toBe(0)
      expect((a.getTrackProps() as Dict)['data-stepped']).toBeUndefined()
    }
    expect(records.filter(r => r.code === DIAGNOSTIC_CODES.progressOptionIgnored)).toHaveLength(5)
  })
})

describe('条纹', () => {
  it('填充带上条纹标记，状态照常随进度走', () => {
    const range = api({ value: 40, striped: true }).getRangeProps() as Dict
    expect(range['data-striped']).toBe('')
    expect(range['data-state']).toBe('loading')
    expect((api({ value: 100, striped: true }).getRangeProps() as Dict)['data-state']).toBe('complete')
  })

  it('没开条纹时不带标记', () => {
    expect((api({ value: 40 }).getRangeProps() as Dict)['data-striped']).toBeUndefined()
  })
})

describe('缓冲', () => {
  it('缓冲值换成占满值的比例写给缓冲段，越界夹到满值', () => {
    const a = api({ value: 30, buffer: 60 })
    expect(a.buffer).toBe(0.6)
    const buffer = a.getBufferProps() as Dict
    expect(buffer.hidden).toBeUndefined()
    expect(buffer.style['--xh-_progress-buffer']).toBe('0.6')
    expect(api({ value: 30, buffer: 180 }).buffer).toBe(1)
  })

  it('缓冲段取填充那一族：没写语气时取品牌，写了语气跟着语气', () => {
    expect((api({ value: 30, buffer: 60 }).getBufferProps() as Dict)['data-tone']).toBe('brand')
    expect((api({ value: 30, buffer: 60, tone: 'success' }).getBufferProps() as Dict)['data-tone']).toBe('success')
  })

  it('没有缓冲值或进度未知时缓冲段带 hidden', () => {
    expect((api({ value: 30 }).getBufferProps() as Dict).hidden).toBe(true)
    const unknown = api({ indeterminate: true, buffer: 60 })
    expect(unknown.buffer).toBeNull()
    expect((unknown.getBufferProps() as Dict).hidden).toBe(true)
  })

  it('量没有缓冲：meter 语义下报选项被忽略，不画缓冲段', () => {
    const records = captured()
    const a = api({ value: 30, buffer: 60, semantics: 'meter' })
    expect(a.buffer).toBeNull()
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.progressOptionIgnored)).toBe(true)
  })
})

describe('只对线形生效', () => {
  it('环形上写分段、条纹或缓冲：报一条选项被忽略，三样都按没给处理', () => {
    const records = captured()
    const a = api({ value: 40, variant: 'circle', steps: 4, striped: true, buffer: 60 })
    expect(a.steps).toBe(0)
    expect(a.buffer).toBeNull()
    expect((a.getRangeProps() as Dict)['data-striped']).toBeUndefined()
    const issues = records.filter(r => r.code === DIAGNOSTIC_CODES.progressOptionIgnored)
    expect(issues).toHaveLength(1)
    expect(issues[0]!.detail).toMatchObject({ variant: 'circle', props: ['steps', 'striped', 'buffer'] })
  })

  it('striped 写成 false 不算写了', () => {
    const records = captured()
    api({ value: 40, variant: 'dashboard', striped: false })
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.progressOptionIgnored)).toBe(false)
  })
})
