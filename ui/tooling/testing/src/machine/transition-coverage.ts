import type { KeyboardRow } from '@xihan-ui/headless'
import type { ConformanceSuite } from '../conformance/types'

/** 所有用例 covers 反查到的键盘行 id 并集。 */
export function coveredRows(suite: ConformanceSuite): Set<string> {
  const covered = new Set<string>()
  for (const c of suite.cases) {
    for (const id of c.covers ?? [])
      covered.add(id)
  }
  return covered
}

/** 用例 covers 里指向不存在行的 id（拼写错/规格漂移）。 */
export function danglingCovers(suite: ConformanceSuite): string[] {
  const rowIds = new Set(suite.keyboard.rows.map(r => r.id))
  const bad = new Set<string>()
  for (const c of suite.cases) {
    for (const id of c.covers ?? []) {
      if (!rowIds.has(id))
        bad.add(id)
    }
  }
  return [...bad]
}

/** 键盘表里尚未被任何用例覆盖的行。 */
export function missingKeyboardRows(suite: ConformanceSuite): KeyboardRow[] {
  const covered = coveredRows(suite)
  return suite.keyboard.rows.filter(r => !covered.has(r.id))
}
