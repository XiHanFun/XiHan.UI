import type {
  DismissPathHit,
  DismissRouteEntry,
  DismissRouteReadiness,
} from '../src/behavior/dismissable-layer/route'
import { describe, expect, it } from 'vitest'
import {
  isDismissRouteTerminal,
  matchesDismissRemainder,
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

/** 只护祖先的层（内联层）对应的项。 */
function parentsOnly(entry: DismissRouteEntry<string>): DismissRouteEntry<string> {
  return { ...entry, parentsOnly: true }
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
    'shielded',
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

  it.each([
    'missing-participant',
    'unarmed',
    'missing-node',
    'shielded',
  ] as const)('只护祖先的 %s 层不进候选也不成为屏障，更低的层照常求值', (readiness) => {
    expect(planOutsideDismissRoute([
      entry('top'),
      parentsOnly(barrier(readiness)),
      entry('bottom'),
    ])).toEqual({ candidates: ['top', 'bottom'], barrier: null })
  })

  it('只护祖先的层被命中内部时不进候选也不成为屏障', () => {
    expect(planOutsideDismissRoute([
      parentsOnly(entry('hint', 'inside')),
      entry('middle'),
      entry('lower', 'inside'),
      entry('bottom'),
    ])).toEqual({ candidates: ['middle'], barrier: 'inside' })
  })

  it('只护祖先的层在层外照常进候选，命中 surface 时仍停在它这里', () => {
    expect(planOutsideDismissRoute([
      parentsOnly(entry('hint')),
      entry('bottom'),
    ])).toEqual({ candidates: ['hint', 'bottom'], barrier: null })
    expect(planOutsideDismissRoute([
      parentsOnly(entry('hint', 'surface')),
      entry('bottom'),
    ])).toEqual({ candidates: ['hint'], barrier: 'surface' })
  })

  it('一项之后是否还要解析更低的层', () => {
    expect(isDismissRouteTerminal(entry('layer'))).toBe(false)
    expect(isDismissRouteTerminal(entry('layer', 'inside'))).toBe(true)
    expect(isDismissRouteTerminal(entry('layer', 'surface'))).toBe(true)
    expect(isDismissRouteTerminal(barrier('unarmed'))).toBe(true)
    expect(isDismissRouteTerminal(parentsOnly(entry('hint')))).toBe(false)
    expect(isDismissRouteTerminal(parentsOnly(entry('hint', 'inside')))).toBe(false)
    expect(isDismissRouteTerminal(parentsOnly(entry('hint', 'surface')))).toBe(true)
    expect(isDismissRouteTerminal(parentsOnly(barrier('unarmed')))).toBe(false)
  })

  it('连续退栈只接受原计划去掉已退栈各层之后剩下的那几项', () => {
    const bottom = {}
    const middle = {}
    const top = {}
    const original = [bottom, middle, top]

    expect(matchesDismissRemainder(original, original, new Set())).toBe(true)
    expect(matchesDismissRemainder([bottom, middle], original, new Set([top]))).toBe(true)
    expect(matchesDismissRemainder([bottom], original, new Set([top, middle]))).toBe(true)
    expect(matchesDismissRemainder([], original, new Set(original))).toBe(true)
    // 上面留着没退栈的层、从中间退栈：剩下的次序不变即匹配
    expect(matchesDismissRemainder([bottom, top], original, new Set([middle]))).toBe(true)
    expect(matchesDismissRemainder([top], original, new Set([bottom, middle]))).toBe(true)
    // 多退了一层、少退了一层、换了次序、混进新层都不匹配
    expect(matchesDismissRemainder([bottom], original, new Set([top]))).toBe(false)
    expect(matchesDismissRemainder([bottom, middle, top], original, new Set([top]))).toBe(false)
    expect(matchesDismissRemainder([middle, bottom], original, new Set([top]))).toBe(false)
    expect(matchesDismissRemainder([bottom, middle, {}], original, new Set([top]))).toBe(false)
    expect(matchesDismissRemainder([bottom, middle, top, {}], original, new Set())).toBe(false)
  })
})
