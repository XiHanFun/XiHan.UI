// @xihan-ui/testing —— 跨适配器一致性套件运行时（私有，不发布）。

export { applyStep } from './conformance/apply-step'
export type { ApplyContext } from './conformance/apply-step'
export { checkExpectation } from './conformance/match'
export { recordTrace, runConformance, runParity } from './conformance/run'
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
export { accordionSuite } from './suites/accordion.suite'
export { avatarSuite } from './suites/avatar.suite'
export { badgeSuite } from './suites/badge.suite'
export { buttonSuite } from './suites/button.suite'
export { checkboxSuite } from './suites/checkbox.suite'
export { collapsibleSuite } from './suites/collapsible.suite'
export { dialogSuite } from './suites/dialog.suite'
export { fieldSuite } from './suites/field.suite'
export { menuSuite } from './suites/menu.suite'
export { numberFieldSuite } from './suites/number-field.suite'
export { popoverSuite } from './suites/popover.suite'
export { progressSuite } from './suites/progress.suite'
export { radioGroupSuite } from './suites/radio-group.suite'
export { selectSuite } from './suites/select.suite'
export { separatorSuite } from './suites/separator.suite'
export { dispatchClickOnDisabled } from './suites/shared/disabled-press'
export { nativeActivation, singleTabStop } from './suites/shared/native-activation'
export { switchSuite } from './suites/switch.suite'
export { tabsSuite } from './suites/tabs.suite'
export { toggleSuite } from './suites/toggle.suite'
export { tooltipSuite } from './suites/tooltip.suite'
