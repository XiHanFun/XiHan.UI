// @vitest-environment jsdom
import type { ConformanceSuite } from '@xihan-ui/testing'
import { badgeSuite, buttonSuite, checkboxSuite, collapsibleSuite, progressSuite, runConformance, separatorSuite, switchSuite, toggleSuite } from '@xihan-ui/testing'
import { afterEach, beforeEach, describe, it, vi } from 'vitest'
import { createWcHarness } from './harness'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

// switch 无 portal/presence 分歧，复用共享用例、只把 fixture 换成 WC 行为宿主形态
// （用户显式写 root/thumb 角色节点，Vue 版 XhSwitch 是内部渲染 thumb）。
// 受控用例排除：HTML 布尔属性表达不了 undefined（checked=false 会被 harness 抹成缺省=非受控），
// 与 WC dialog 受控 open 同因延后，待 controlled 属性机制（设计 §11.2.9b）。
const wcSwitchSuite: ConformanceSuite = {
  ...switchSuite,
  fixture: { part: 'root', tag: 'button', children: [{ part: 'thumb', tag: 'span' }] },
  cases: switchSuite.cases.filter(c => !(c.props && 'checked' in c.props)),
}

// checkbox 与 switch 同因：受控用例排除，fixture 换成行为宿主形态（indicator 由用户显式写）。
const wcCheckboxSuite: ConformanceSuite = {
  ...checkboxSuite,
  fixture: { part: 'root', tag: 'button', children: [{ part: 'indicator', tag: 'span' }] },
  cases: checkboxSuite.cases.filter(c => !(c.props && 'checked' in c.props)),
}

// collapsible 的 fixture 三个 part 本就由用户显式写，两侧同构、整份复用；
// 只排除受控 open（布尔属性表达不了 undefined，与 switch/dialog 同因）。
const wcCollapsibleSuite: ConformanceSuite = {
  ...collapsibleSuite,
  cases: collapsibleSuite.cases.filter(c => !(c.props && 'open' in c.props)),
}

// toggle 与 switch 同因：受控用例排除；fixture 只有 root 一个 part，两侧同构。
const wcToggleSuite: ConformanceSuite = {
  ...toggleSuite,
  cases: toggleSuite.cases.filter(c => !(c.props && 'pressed' in c.props)),
}

// progress 的 track/range 在 Vue 版由组件内部渲染，WC 版由作者手写，故只换 fixture；
// 用例断言全在 root 上，两侧同一份。
const wcProgressSuite: ConformanceSuite = {
  ...progressSuite,
  fixture: { part: 'root', tag: 'div', children: [{ part: 'track', children: [{ part: 'range' }] }] },
}

// 同一份规格喂给 WC 适配器实现，逐帧核对。separator/badge 无状态无受控，整份复用。
runConformance(
  createWcHarness(),
  [badgeSuite, buttonSuite, wcCheckboxSuite, wcCollapsibleSuite, wcProgressSuite, separatorSuite, wcSwitchSuite, wcToggleSuite],
  { describe, it },
  { enforceKeyboardCoverage: false },
)
