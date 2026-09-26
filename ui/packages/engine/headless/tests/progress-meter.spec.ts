// 量（meter）的刻画：分段色带与当前分段、读屏文字里的分段名、目标刻度、量程刻度、仪表盘的指针，以及只在 meter 下生效的诊断。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { ProgressProps, ProgressThreshold } from '../src/progress'
import { DIAGNOSTIC_CODES, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { afterEach, describe, expect, it } from 'vitest'
import { connectProgress, PROGRESS_VIEW } from '../src/progress'

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

const ZONES: readonly ProgressThreshold[] = [
  { value: 60, tone: 'success', label: '正常' },
  { value: 85, tone: 'warning', label: '警戒' },
  { value: 100, tone: 'danger', label: '危险' },
]

function api(props: ProgressProps) {
  return connectProgress({ semantics: 'meter', locale: 'en-US', ...props }, normalizeProps)
}

describe('分段', () => {
  it('上界换成占满值的比例，第一段从 0 起、后一段接着前一段', () => {
    const a = api({ value: 72, thresholds: ZONES })
    expect(a.bands.map(b => [b.from, b.to, b.tone])).toEqual([[0, 0.6, 'success'], [0.6, 0.85, 'warning'], [0.85, 1, 'danger']])
    expect((a.getRootProps() as Dict)['data-banded']).toBe('')
  })

  it('当前值所在的分段决定填充色；读屏在百分数后补上分段名', () => {
    const a = api({ value: 72, thresholds: ZONES })
    expect((a.getRangeProps() as Dict)['data-tone']).toBe('warning')
    expect((a.getRootProps() as Dict)['aria-valuetext']).toBe('72%, 警戒')
  })

  it('落在分界上算前一段；0 算第一段；超出最后一段的上界不落在任何一段', () => {
    expect((api({ value: 60, thresholds: ZONES }).getRangeProps() as Dict)['data-tone']).toBe('success')
    expect((api({ value: 0, thresholds: ZONES }).getRangeProps() as Dict)['data-tone']).toBe('success')
    const beyond = api({ value: 90, thresholds: [{ value: 50, tone: 'success' }] })
    expect((beyond.getRangeProps() as Dict)['data-tone']).toBeUndefined()
    expect((beyond.getRootProps() as Dict)['aria-valuetext']).toBeUndefined()
  })

  it('作者给了 valueText 就只念作者那句；分段文字模板可按语言替换', () => {
    expect((api({ value: 72, thresholds: ZONES, valueText: '已用 72 GB' }).getRootProps() as Dict)['aria-valuetext']).toBe('已用 72 GB')
    const zh = api({ value: 72, thresholds: ZONES, translations: { segmentValueText: ({ value, label }) => `${value}，${label}` } })
    expect((zh.getRootProps() as Dict)['aria-valuetext']).toBe('72%，警戒')
  })

  it('线形色带按比例落位；环形色带是同一圈上的一段虚线，从分段的起点起画', () => {
    const line = api({ value: 72, thresholds: ZONES })
    expect((line.getThresholdProps(line.bands[1]!) as Dict).style).toMatchObject({ '--xh-_progress-from': '0.6', '--xh-_progress-to': '0.85' })
    const ring = api({ value: 72, thresholds: ZONES, variant: 'circle' })
    const track = ring.getTrackProps() as Dict
    const band = ring.getThresholdProps(ring.bands[1]!) as Dict
    expect(band.r).toBe(track.r)
    expect(band.transform).toBe(track.transform)
    const span = Number.parseFloat(track.style.strokeDasharray)
    expect(Number.parseFloat(band.style.strokeDasharray)).toBeCloseTo(span * 0.25, 2)
    expect(Number(band.style.strokeDashoffset)).toBeCloseTo(-span * 0.6, 2)
  })

  it('上界不升序或越出满值：报区间不合法，整组不画', () => {
    const records = captured()
    const a = api({ value: 50, thresholds: [{ value: 80, tone: 'success' }, { value: 40, tone: 'danger' }] })
    expect(a.bands).toEqual([])
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.chartInvalidRange)).toBe(true)
    expect(api({ value: 50, thresholds: [{ value: 120, tone: 'danger' }] }).bands).toEqual([])
  })
})

describe('目标与刻度', () => {
  it('目标值换成比例；线形按比例落位', () => {
    const a = api({ value: 40, target: 75 })
    expect(a.target).toBe(0.75)
    const props = a.getTargetProps() as Dict
    expect(props.hidden).toBeUndefined()
    expect(props.style).toMatchObject({ '--xh-_progress-at': '0.75' })
  })

  it('没有目标时目标部件收起；目标越出 [0, max] 报错不画', () => {
    expect((api({ value: 40 }).getTargetProps() as Dict).hidden).toBe(true)
    const records = captured()
    expect(api({ value: 40, target: 140 }).target).toBeNull()
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.chartInvalidRange)).toBe(true)
  })

  it('环形的目标刻度横穿整条弧，落在目标值的角度上', () => {
    const a = api({ value: 40, target: 50, variant: 'circle' })
    const line = a.getTargetProps() as Dict
    // 整环从 12 点起笔，走到一半是 6 点：竖直向下
    expect(line.x1).toBeCloseTo(PROGRESS_VIEW / 2, 3)
    expect(line.x2).toBeCloseTo(PROGRESS_VIEW / 2, 3)
    expect(line.y1).toBeLessThan(line.y2)
    expect(line.y2).toBeCloseTo(PROGRESS_VIEW, 3)
  })

  it('scale=true：从 0 到满值取好读的步长，刻度值按 locale 写', () => {
    const a = api({ value: 40, max: 2000, scale: true })
    expect(a.ticks.map(t => t.value)).toEqual([0, 500, 1000, 1500, 2000])
    expect(a.ticks.map(t => t.label)).toEqual(['0', '500', '1,000', '1,500', '2,000'])
    expect((a.getScaleProps() as Dict).hidden).toBeUndefined()
  })

  it('刻度数量与数字格式可调；两端的刻度值贴着轨道两端对齐', () => {
    const a = api({ value: 40, scale: { ticks: 2, format: { style: 'percent' } }, max: 1 })
    expect(a.ticks.map(t => t.label)).toEqual(['0%', '50%', '100%'])
    const aligns = a.ticks.map(t => (a.getScaleLabelProps(t) as Dict).style['--xh-_progress-label-align'])
    expect(aligns).toEqual(['0', '0.5', '1'])
  })

  it('环形刻度值落在弧的内侧：整环 12 点的那个刻度在正上方', () => {
    const a = api({ value: 40, scale: true, variant: 'circle' })
    const style = (a.getScaleLabelProps(a.ticks[0]!) as Dict).style
    expect(style['--xh-_progress-x']).toBe('50%')
    expect(Number.parseFloat(style['--xh-_progress-y'])).toBeGreaterThan(5)
    expect(Number.parseFloat(style['--xh-_progress-y'])).toBeLessThan(30)
  })
})

describe('指针', () => {
  it('仪表盘 indicator="needle"：指针按当前值的角度转过去，弧上的填充收起', () => {
    const a = api({ value: 50, variant: 'dashboard', indicator: 'needle' })
    expect(a.indicator).toBe('needle')
    const needle = a.getNeedleProps() as Dict
    expect(needle.hidden).toBeUndefined()
    // 缺省缺口 75° 朝下：一半处正对 12 点，即从 3 点逆时针转 90°
    expect(needle.style['--xh-_progress-needle-angle']).toBe('270deg')
    expect((a.getRangeProps() as Dict)['data-indicator']).toBe('needle')
    expect((a.getRootProps() as Dict)['data-indicator']).toBe('needle')
  })

  it('不是仪表盘时指针不画，报一条警告', () => {
    const records = captured()
    const a = api({ value: 50, variant: 'circle', indicator: 'needle' })
    expect(a.indicator).toBe('fill')
    expect((a.getNeedleProps() as Dict).hidden).toBe(true)
    expect(records.some(r => r.code === DIAGNOSTIC_CODES.warn && r.scope === 'progress')).toBe(true)
  })
})

describe('只在 meter 下生效', () => {
  it('进度语义下用了分段、目标或刻度：报 meter-only，按没给处理', () => {
    const records = captured()
    const a = connectProgress({ value: 50, thresholds: ZONES, target: 80, scale: true }, normalizeProps)
    expect(a.bands).toEqual([])
    expect(a.target).toBeNull()
    expect(a.ticks).toEqual([])
    const record = records.find(r => r.code === DIAGNOSTIC_CODES.chartMeterOnly)
    expect(record?.detail).toEqual({ props: ['thresholds', 'target', 'scale'] })
    expect((a.getRootProps() as Dict).role).toBe('progressbar')
  })

  it('什么都没给时不报任何诊断，部件都收起', () => {
    const records = captured()
    const a = connectProgress({ value: 50 }, normalizeProps)
    expect(records).toEqual([])
    expect((a.getScaleProps() as Dict).hidden).toBe(true)
    expect((a.getNeedleProps() as Dict).hidden).toBe(true)
    expect((a.getRootProps() as Dict)['data-banded']).toBeUndefined()
  })
})
