// @vitest-environment jsdom
//
// steps 当前步的完成比例（percent）：只落在正停着、且显示为 current 的那一步的序号圆点上。
// 可操作时圆点在 tab 里，比例作为触发器的描述（圆点对读屏隐藏、名字就是那句比例）；
// 只读展示下圆点是一个 progressbar。点状形态与非有限数按没给处理并报 steps.option-ignored。
import type { DiagnosticRecord } from '@xihan-ui/core'
import type { StepsSchema } from '../src/steps'
import { createService, DIAGNOSTIC_CODES, getDiagnostics, normalizeProps, onDiagnostic } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { connectSteps, stepsMachine } from '../src/steps'

type Props = StepsSchema['props']
type Dict = Record<string, unknown>

function makeSteps(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(stepsMachine, { runtime, props: () => ({ count: 3, ...props }) as Props })
  runtime.start()
  return () => connectSteps(service, normalizeProps)
}

let records: DiagnosticRecord[] = []
let off: (() => void) | null = null

beforeEach(() => {
  getDiagnostics().reset()
  getDiagnostics().setConsoleOutput(false)
  getDiagnostics().setLevel('warn')
  records = []
  off = onDiagnostic(record => records.push(record))
})

afterEach(() => {
  off?.()
  getDiagnostics().reset()
})

const style = (props: Dict): Dict => props.style as Dict

describe('步骤条 · 当前步的完成比例', () => {
  it('可操作时：当前步的圆点带比例与环标记，触发器以它为描述；圆点对读屏隐藏、名字是那句比例', () => {
    const api = makeSteps({ defaultValue: 1, percent: 40 })()
    const indicator = api.getIndicatorProps({ index: 1 }) as Dict
    expect(indicator['data-progress']).toBe('')
    expect(style(indicator)['--xh-_steps-progress']).toBe('0.4')
    expect(indicator.role).toBe('img')
    expect(indicator['aria-label']).toBe('40% complete')
    expect(indicator['aria-hidden']).toBe(true)
    expect(typeof indicator.id).toBe('string')
    expect((api.getTriggerProps({ index: 1 }) as Dict)['aria-describedby']).toBe(indicator.id)
  })

  it('别的步不带比例：圆点只是装饰、显式撤掉内联比例，触发器没有描述', () => {
    const api = makeSteps({ defaultValue: 1, percent: 40 })()
    for (const index of [0, 2]) {
      const indicator = api.getIndicatorProps({ index }) as Dict
      expect(indicator['data-progress']).toBeUndefined()
      expect(indicator.role).toBeUndefined()
      expect(indicator.id).toBeUndefined()
      expect(indicator['aria-hidden']).toBe(true)
      expect(style(indicator)['--xh-_steps-progress']).toBeUndefined()
      expect((api.getTriggerProps({ index }) as Dict)['aria-describedby']).toBeUndefined()
    }
  })

  it('不给比例时什么都不投影', () => {
    const api = makeSteps({ defaultValue: 1 })()
    const indicator = api.getIndicatorProps({ index: 1 }) as Dict
    expect(indicator['data-progress']).toBeUndefined()
    expect(indicator.role).toBeUndefined()
    expect((api.getTriggerProps({ index: 1 }) as Dict)['aria-describedby']).toBeUndefined()
  })

  it('只读展示下当前步的圆点是一个 progressbar：名字、取值区间、当前值与读法齐全，不对读屏隐藏', () => {
    const api = makeSteps({ defaultValue: 1, percent: 62.5, readOnly: true })()
    const indicator = api.getIndicatorProps({ index: 1 }) as Dict
    expect(indicator.role).toBe('progressbar')
    expect(indicator['aria-label']).toBe('Step progress')
    expect(indicator['aria-valuemin']).toBe('0')
    expect(indicator['aria-valuemax']).toBe('100')
    expect(indicator['aria-valuenow']).toBe('62.5')
    // 读法按取整后的百分数
    expect(indicator['aria-valuetext']).toBe('63% complete')
    expect(indicator['aria-hidden']).toBeUndefined()
    expect(style(indicator)['--xh-_steps-progress']).toBe('0.625')
  })

  it('translations 改名字与读法', () => {
    const api = makeSteps({
      defaultValue: 1,
      percent: 30,
      readOnly: true,
      translations: { progressLabel: '本步进度', progressValueText: value => `已完成 ${value}%` },
    })()
    const indicator = api.getIndicatorProps({ index: 1 }) as Dict
    expect(indicator['aria-label']).toBe('本步进度')
    expect(indicator['aria-valuetext']).toBe('已完成 30%')
    const interactive = makeSteps({ defaultValue: 1, percent: 30, translations: { progressValueText: value => `已完成 ${value}%` } })()
    expect((interactive.getIndicatorProps({ index: 1 }) as Dict)['aria-label']).toBe('已完成 30%')
  })

  it('越界的比例夹回 [0, 100]，不报错', () => {
    expect(style(makeSteps({ defaultValue: 1, percent: 140 })().getIndicatorProps({ index: 1 }) as Dict)['--xh-_steps-progress']).toBe('1')
    expect(style(makeSteps({ defaultValue: 1, percent: -5 })().getIndicatorProps({ index: 1 }) as Dict)['--xh-_steps-progress']).toBe('0')
    expect(records).toEqual([])
  })

  it('非有限数报 steps.option-ignored，按没给处理', () => {
    const api = makeSteps({ defaultValue: 1, percent: Number.NaN })()
    expect((api.getIndicatorProps({ index: 1 }) as Dict)['data-progress']).toBeUndefined()
    expect(records.map(r => [r.code, r.level, r.scope])).toEqual([[DIAGNOSTIC_CODES.stepsOptionIgnored, 'error', 'steps']])
  })

  it('点状形态画不下进度环：报 steps.option-ignored，按没给处理', () => {
    const api = makeSteps({ defaultValue: 1, percent: 40, variant: 'dot' })()
    const indicator = api.getIndicatorProps({ index: 1 }) as Dict
    expect(indicator['data-progress']).toBeUndefined()
    expect(indicator.role).toBeUndefined()
    expect((api.getTriggerProps({ index: 1 }) as Dict)['aria-describedby']).toBeUndefined()
    expect(records.map(r => r.code)).toEqual([DIAGNOSTIC_CODES.stepsOptionIgnored])
  })

  it('走到完成位时没有当前步，也就没有进度环；statuses 把当前步改成别的状态时同样不画', () => {
    const complete = makeSteps({ defaultValue: 3, percent: 40 })()
    for (const index of [0, 1, 2])
      expect((complete.getIndicatorProps({ index }) as Dict)['data-progress']).toBeUndefined()
    const overridden = makeSteps({ defaultValue: 1, percent: 40, statuses: { 1: 'completed' } })()
    expect((overridden.getIndicatorProps({ index: 1 }) as Dict)['data-progress']).toBeUndefined()
  })

  it('换步时比例跟着当前步走', () => {
    const api = makeSteps({ defaultValue: 0, percent: 50 })
    expect((api().getIndicatorProps({ index: 0 }) as Dict)['data-progress']).toBe('')
    api().goToNextStep()
    expect((api().getIndicatorProps({ index: 0 }) as Dict)['data-progress']).toBeUndefined()
    expect((api().getIndicatorProps({ index: 1 }) as Dict)['data-progress']).toBe('')
  })
})
