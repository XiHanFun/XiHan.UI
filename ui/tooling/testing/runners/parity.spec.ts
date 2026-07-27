// @vitest-environment jsdom
import type { ConformanceSuite } from '../src'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createVueHarness } from '../../../packages/vue/tests/harness'
import { createWcHarness } from '../../../packages/wc/tests/harness'
import {
  avatarSuite,
  badgeSuite,
  buttonSuite,
  collapsibleSuite,
  numberFieldSuite,
  runParity,
  separatorSuite,
  tooltipSuite,
} from '../src'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/**
 * 逐帧比对只在两侧喂的是同一棵 fixture 时才成立。
 * WC 侧改写过 fixture 的那些组件（switch/checkbox/progress 换角色节点形态、
 * 集合类把 disabled 改写成 aria-disabled、select 要作者手写影子 select、
 * field 要把 label/control 换成原生标签），两端结构本就不同，逐帧比对没有意义——
 * 它们的跨适配器保证由两侧各自跑同一份 conformance 规格来提供。
 *
 * 这里收的是"同一份 fixture 两侧都能直接跑"的组件。
 */

/** 受控用例在 WC 上被布尔属性挡住（见两侧 conformance.spec 的说明），取两端都跑得了的交集。 */
function withoutControlled(suite: ConformanceSuite, key: string): ConformanceSuite {
  return { ...suite, cases: suite.cases.filter(c => !(c.props && key in c.props)) }
}

const SUITES: readonly ConformanceSuite[] = [
  buttonSuite,
  badgeSuite,
  separatorSuite,
  avatarSuite,
  numberFieldSuite,
  withoutControlled(collapsibleSuite, 'open'),
  withoutControlled(tooltipSuite, 'open'),
]

runParity([createVueHarness(), createWcHarness()], SUITES, { describe, it })
