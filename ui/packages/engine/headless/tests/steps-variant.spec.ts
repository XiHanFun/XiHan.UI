// @vitest-environment jsdom
//
// steps 的标记形态：number 是盛内容的序号圆点（缺省），dot 是不盛内容的小圆点。形态是样式轴，
// 只投影到 root 与圆点上，语义、状态、键盘与按压通道都不随形态变。
import type { StepsSchema } from '../src/steps'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSteps, stepsMachine } from '../src/steps'

type Props = StepsSchema['props']
type Dict = Record<string, unknown>

function makeSteps(props: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const service = createService(stepsMachine, { runtime, props: () => ({ count: 3, ...props }) as Props })
  runtime.start()
  return () => connectSteps(service, normalizeProps)
}

describe('步骤条 · 标记形态', () => {
  it('不写 variant 时显式落 number：root 与每个圆点都带 data-variant，没有「不传」的第四种形态', () => {
    const api = makeSteps({})()
    expect((api.getRootProps() as Dict)['data-variant']).toBe('number')
    for (const index of [0, 1, 2])
      expect((api.getIndicatorProps({ index }) as Dict)['data-variant']).toBe('number')
  })

  it('variant=dot 写在 root 与圆点上，圆点照旧对读屏隐藏、照报三态', () => {
    const api = makeSteps({ variant: 'dot', defaultValue: 1 })()
    expect((api.getRootProps() as Dict)['data-variant']).toBe('dot')
    const states = [0, 1, 2].map(index => api.getIndicatorProps({ index }) as Dict)
    expect(states.map(props => props['data-variant'])).toEqual(['dot', 'dot', 'dot'])
    expect(states.map(props => props['data-state'])).toEqual(['completed', 'current', 'incomplete'])
    expect(states.every(props => props['aria-hidden'] === true)).toBe(true)
  })

  it('形态不改语义：trigger 仍是 tab、接 row 档，连接线、标题与面板不带形态', () => {
    const number = makeSteps({ defaultValue: 1 })()
    const dot = makeSteps({ variant: 'dot', defaultValue: 1 })()
    const strip = (props: Dict): Dict => Object.fromEntries(Object.entries(props).filter(([key]) => !key.startsWith('on') && key !== 'id' && key !== 'aria-controls'))
    for (const index of [0, 1, 2]) {
      expect(strip(dot.getTriggerProps({ index }) as Dict)).toEqual(strip(number.getTriggerProps({ index }) as Dict))
      expect(dot.getSeparatorProps({ index })).toEqual(number.getSeparatorProps({ index }))
      expect(dot.getTitleProps({ index })).toEqual(number.getTitleProps({ index }))
      expect((dot.getItemProps({ index }) as Dict)['data-variant']).toBeUndefined()
    }
  })

  it('只读展示下同样投影形态', () => {
    const api = makeSteps({ variant: 'dot', readOnly: true })()
    expect((api.getRootProps() as Dict)['data-variant']).toBe('dot')
    expect((api.getIndicatorProps({ index: 0 }) as Dict)['data-variant']).toBe('dot')
  })
})
