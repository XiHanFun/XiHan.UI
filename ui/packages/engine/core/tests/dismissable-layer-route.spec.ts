import type {
  DismissPathHit,
  DismissRouteEntry,
  DismissRouteReadiness,
} from '../src/behavior/dismissable-layer/route'
import { describe, expect, it } from 'vitest'
import {
  matchesDismissPrefix,
  planOutsideDismissRoute,
} from '../src/behavior/dismissable-layer/route'

function entry(
  candidate: string,
  hit: DismissPathHit = 'outside',
): DismissRouteEntry<string> {
  return { candidate, hit, readiness: 'ready' }
}

function barrier(
  readiness: Exclude<DismissRouteReadiness, 'ready'>,
): DismissRouteEntry<string> {
  return { readiness }
}

describe('dismissableLayer 纯路由计划', () => {
  it('全在层外时按栈顶到栈底生成连续候选', () => {
    expect(planOutsideDismissRoute([
      entry('top'),
      entry('middle'),
      entry('bottom'),
    ])).toEqual({ candidates: ['top', 'middle', 'bottom'], barrier: null })
  })

  it('命中中层内部时只计划它上面的外部层', () => {
    expect(planOutsideDismissRoute([
      entry('top'),
      entry('middle', 'inside'),
      entry('bottom'),
    ])).toEqual({ candidates: ['top'], barrier: 'inside' })
  })

  it('命中 surface 时计划到该层为止', () => {
    expect(planOutsideDismissRoute([
      entry('top'),
      entry('surface-owner', 'surface'),
      entry('bottom'),
    ])).toEqual({ candidates: ['top', 'surface-owner'], barrier: 'surface' })
  })

  it.each([
    'missing-participant',
    'unarmed',
    'missing-node',
  ] as const)('%s 层成为屏障，不能越过它关闭更低层', (readiness) => {
    expect(planOutsideDismissRoute([
      entry('top'),
      barrier(readiness),
      entry('bottom'),
    ])).toEqual({ candidates: ['top'], barrier: readiness })
  })

  it('inert 豁免在任何层求值前封住整条计划', () => {
    expect(planOutsideDismissRoute([entry('top')], true))
      .toEqual({ candidates: [], barrier: 'inert-exempt' })
  })

  it('计划与候选数组均被冻结', () => {
    const plan = planOutsideDismissRoute([entry('top')])
    expect(Object.isFrozen(plan)).toBe(true)
    expect(Object.isFrozen(plan.candidates)).toBe(true)
  })

  it('连续退栈只接受原计划的严格前缀', () => {
    const bottom = {}
    const middle = {}
    const top = {}
    const original = [bottom, middle, top]

    expect(matchesDismissPrefix(original, original, 3)).toBe(true)
    expect(matchesDismissPrefix([bottom, middle], original, 2)).toBe(true)
    expect(matchesDismissPrefix([bottom], original, 1)).toBe(true)
    expect(matchesDismissPrefix([bottom, top], original, 2)).toBe(false)
    expect(matchesDismissPrefix([bottom, middle, {}], original, 3)).toBe(false)
  })
})
