// @xihan-ui/testing —— 跨适配器一致性套件运行时（私有，不发布）。

export { applyStep } from './conformance/apply-step'
export type { ApplyContext } from './conformance/apply-step'
export { checkExpectation } from './conformance/match'
export { recordTrace, runConformance } from './conformance/run'
export type { RunOptions } from './conformance/run'
export type {
  ActiveElementExpectation,
  ActiveElementRef,
  AdapterEvent,
  AdapterHarness,
  AdapterName,
  AttrExpectation,
  ConformanceCase,
  ConformanceSuite,
  DomSnapshot,
  Fixture,
  FixtureNode,
  KeyName,
  ModifierKey,
  PartRef,
  PartSnapshot,
  SettleCondition,
  SnapshotExpectation,
  Step,
  StepWithExpect,
  TestHooks,
} from './conformance/types'
export { coveredRows, danglingCovers, missingKeyboardRows } from './machine/transition-coverage'
export { collectDomSnapshot } from './snapshot/collect'
export type { CollectOptions } from './snapshot/collect'
export { normalizeAttrs } from './snapshot/normalize'
export { buttonSuite } from './suites/button.suite'
export { dialogSuite } from './suites/dialog.suite'
