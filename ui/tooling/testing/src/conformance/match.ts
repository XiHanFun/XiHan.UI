import type { ActiveElementRef, AttrExpectation, DomSnapshot, SnapshotExpectation } from './types'

function parseRef(ref: string): { part: string, index: number, hasIndex: boolean } {
  const m = /^(.+?)\[(\d+)\]$/.exec(ref)
  return m ? { part: m[1]!, index: Number(m[2]), hasIndex: true } : { part: ref, index: 0, hasIndex: false }
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function diffAttrs(actual: Readonly<Record<string, string | null>>, exp: AttrExpectation, label: string): string[] {
  const errs: string[] = []
  for (const [k, v] of Object.entries(exp)) {
    const got = k in actual ? actual[k]! : null
    if (got !== v)
      errs.push(`${label}.${k}: 期望 ${JSON.stringify(v)}，实际 ${JSON.stringify(got)}`)
  }
  return errs
}

function checkParts(actual: DomSnapshot, parts: NonNullable<SnapshotExpectation['parts']>): string[] {
  const errs: string[] = []
  for (const [ref, exp] of Object.entries(parts)) {
    const { part, index } = parseRef(ref)
    const instances = actual.parts[part] ?? []
    if (Array.isArray(exp)) {
      exp.forEach((e, i) => {
        const inst = instances[i]
        if (!inst)
          errs.push(`part ${part}[${i}] 不存在`)
        else
          errs.push(...diffAttrs(inst.attrs, e, `${part}[${i}]`))
      })
    }
    else {
      const inst = instances[index]
      if (!inst)
        errs.push(`part ${ref} 不存在`)
      else
        errs.push(...diffAttrs(inst.attrs, exp as AttrExpectation, ref))
    }
  }
  return errs
}

function checkActive(expected: string | null | undefined, actual: ActiveElementRef | null): string[] {
  if (expected === undefined)
    return []
  const fmt = (a: ActiveElementRef | null): string => (a ? `${a.part}[${a.index}]${a.exact ? '' : '(内)'}` : 'null')
  if (expected === null)
    return actual === null ? [] : [`activeElement: 期望不在任何 part，实际 ${fmt(actual)}`]
  const { part, index, hasIndex } = parseRef(expected)
  if (!actual || actual.part !== part || (hasIndex && actual.index !== index))
    return [`activeElement: 期望 ${expected}，实际 ${fmt(actual)}`]
  return []
}

function checkEvents(expected: SnapshotExpectation['events'], actual: DomSnapshot['events']): string[] {
  if (!expected)
    return []
  const errs: string[] = []
  if (actual.length !== expected.length)
    errs.push(`events: 期望 ${expected.length} 个，实际 ${actual.length} 个（${JSON.stringify(actual)}）`)
  expected.forEach((e, i) => {
    const got = actual[i]
    if (!got) {
      errs.push(`events[${i}]: 缺失，期望 ${JSON.stringify(e)}`)
      return
    }
    if (got.type !== e.type)
      errs.push(`events[${i}].type: 期望 ${e.type}，实际 ${got.type}`)
    if (e.detail !== undefined && !deepEqual(got.detail, e.detail))
      errs.push(`events[${i}].detail: 期望 ${JSON.stringify(e.detail)}，实际 ${JSON.stringify(got.detail)}`)
  })
  return errs
}

/** 深度子集匹配：返回失败信息列表，空数组即通过。 */
export function checkExpectation(actual: DomSnapshot, expected: SnapshotExpectation, label: string): string[] {
  const errs: string[] = []
  if (actual.strayParts.length)
    errs.push(`存在越界 part（anatomy 泄漏）：${actual.strayParts.join(', ')}`)
  if (expected.parts)
    errs.push(...checkParts(actual, expected.parts))
  if (expected.order && !deepEqual([...expected.order], [...actual.order]))
    errs.push(`order: 期望 ${JSON.stringify(expected.order)}，实际 ${JSON.stringify(actual.order)}`)
  if (expected.counts) {
    for (const [part, n] of Object.entries(expected.counts)) {
      const got = actual.parts[part]?.length ?? 0
      if (got !== n)
        errs.push(`counts.${part}: 期望 ${n}，实际 ${got}`)
    }
  }
  errs.push(...checkActive(expected.activeElement, actual.activeElement))
  errs.push(...checkEvents(expected.events, actual.events))
  return errs.map(e => `[${label}] ${e}`)
}
