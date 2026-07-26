// @vitest-environment jsdom
import type { ConformanceSuite } from '@xihan-ui/testing'
import { buttonSuite, runConformance, switchSuite } from '@xihan-ui/testing'
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

// 同一份规格喂给 WC 适配器实现，逐帧核对（M2-A1 的 WC 侧）。
runConformance(createWcHarness(), [buttonSuite, wcSwitchSuite], { describe, it }, { enforceKeyboardCoverage: false })
