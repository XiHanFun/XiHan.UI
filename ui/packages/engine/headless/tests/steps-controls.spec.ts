// @vitest-environment jsdom
// 触发器的 aria-controls 只在有面板时才写：适配器把面板在不在场交进 parts，一块都没挂（只当进度条用）就不指。
import type { StepsSchema } from '../src/steps'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSteps, stepsMachine } from '../src/steps'

function triggerControls(props: StepsSchema['props']): (string | undefined)[] {
  const runtime = createVanillaRuntime()
  const service = createService(stepsMachine, { props: () => props, runtime })
  runtime.start()
  const api = connectSteps(service, normalizeProps)
  const controls = [0, 1].map(index => (api.getTriggerProps({ index }) as Record<string, unknown>)['aria-controls'] as string | undefined)
  runtime.stop()
  return controls
}

describe('steps 触发器的 aria-controls', () => {
  it('缺省（面板还没数出来、服务端直出）按有面板写，指向同下标的面板', () => {
    const controls = triggerControls({ count: 2 })
    expect(controls.every(id => typeof id === 'string' && id.length > 0)).toBe(true)
    expect(controls[0]).not.toBe(controls[1])
  })

  it('挂着面板时照写', () => {
    expect(triggerControls({ count: 2, parts: { content: true } }).every(Boolean)).toBe(true)
  })

  it('一块面板都没挂时不写，免得指向不存在的节点', () => {
    expect(triggerControls({ count: 2, parts: { content: false } })).toEqual([undefined, undefined])
  })
})
