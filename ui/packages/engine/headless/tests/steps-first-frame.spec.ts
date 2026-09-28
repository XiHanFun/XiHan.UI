// 步骤条的首帧：挂载时就走过、此后一直没被回退到的步，序号圆点投影 data-instant，对号直接呈现；
// 此后才走过的步不带，对号淡入。步序退到哪一步，那一步之后就不再算首帧。
import type { StepsSchema } from '../src/steps'
import { createService, normalizeProps } from '@xihan-ui/core'
import { createVanillaRuntime } from '@xihan-ui/core/vanilla'
import { describe, expect, it } from 'vitest'
import { connectSteps, stepsMachine } from '../src/steps'

type Props = StepsSchema['props']

function makeSteps(initial: Partial<Props>) {
  const runtime = createVanillaRuntime()
  const props = runtime.signal<Partial<Props>>({ count: 4, ...initial })
  const service = createService(stepsMachine, { runtime, props: () => props.get() as Props })
  runtime.start()
  const instant = (): unknown[] => [0, 1, 2, 3].map(index =>
    (connectSteps(service, normalizeProps).getIndicatorProps({ index }) as Record<string, unknown>)['data-instant'])
  return { instant, setValue: (value: number) => props.set({ ...props.get(), value }) }
}

describe('步骤条 · 首帧的对号', () => {
  it('挂载时走过的步带 data-instant，没走过的不带', () => {
    expect(makeSteps({ value: 2 }).instant()).toEqual(['', '', undefined, undefined])
  })

  it('往前走：新走过的步不带；往回退：退到的那一步起不再算首帧，再走回来也不带回', () => {
    const steps = makeSteps({ value: 2 })
    steps.setValue(3)
    expect(steps.instant()).toEqual(['', '', undefined, undefined])
    steps.setValue(1)
    expect(steps.instant()).toEqual(['', undefined, undefined, undefined])
    steps.setValue(3)
    expect(steps.instant()).toEqual(['', undefined, undefined, undefined])
  })
})
