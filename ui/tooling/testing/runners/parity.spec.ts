// @vitest-environment jsdom
import type { ConformanceSuite } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVueHarness } from '../../../packages/vue/tests/harness'
import { createWcHarness } from '../../../packages/wc/tests/harness'
import {
  allSuites,
  anchorSuite,
  avatarSuite,
  badgeSuite,
  breadcrumbSuite,
  buttonSuite,
  calendarSuite,
  carouselSuite,
  cascaderSuite,
  clipboardSuite,
  collapsibleSuite,
  dateFieldSuite,
  datePickerSuite,
  editableSuite,
  formSuite,
  hoverCardSuite,
  imageSuite,
  loadingBarSuite,
  menubarSuite,
  navigationMenuSuite,
  numberFieldSuite,
  paginationSuite,
  pinInputSuite,
  ratingSuite,
  runParity,
  scrollAreaSuite,
  separatorSuite,
  sliderSuite,
  splitterSuite,
  tableSuite,
  tagsInputSuite,
  textFieldSuite,
  threadSuite,
  timeFieldSuite,
  timePickerSuite,
  toasterSuite,
  toastSuite,
  toggleSuite,
  tooltipSuite,
  tourSuite,
  transferSuite,
  treeSelectSuite,
  treeSuite,
  virtualizerSuite,
} from '../src'

beforeEach(() => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {} }))
})

afterEach(() => {
  document.body.innerHTML = ''
  vi.unstubAllGlobals()
})

/**
 * 逐帧比对只在两侧喂的是同一棵 fixture 时才成立，且两端行为已经统一。
 * 收得进来的列在 SUITES，收不进来的必须在 EXCLUDED 里写明理由——
 * 末尾那条门禁保证两者之和等于全部套件，新增组件不登记就红。
 *
 * 排除理由分四类：fixture 不同构（WC 是行为宿主，若干部件由作者手写、
 * 禁用声明用 aria-disabled）、入口名永久性差异、presence 模型不同、
 * 以及真实分歧——最后一类是待办不是结论，逐条注明了差在哪。
 */
const SUITES: readonly ConformanceSuite[] = [
  anchorSuite,
  avatarSuite,
  badgeSuite,
  breadcrumbSuite,
  buttonSuite,
  calendarSuite,
  carouselSuite,
  cascaderSuite,
  clipboardSuite,
  collapsibleSuite,
  dateFieldSuite,
  datePickerSuite,
  editableSuite,
  formSuite,
  hoverCardSuite,
  imageSuite,
  loadingBarSuite,
  menubarSuite,
  navigationMenuSuite,
  numberFieldSuite,
  paginationSuite,
  pinInputSuite,
  ratingSuite,
  scrollAreaSuite,
  separatorSuite,
  sliderSuite,
  splitterSuite,
  tableSuite,
  tagsInputSuite,
  textFieldSuite,
  threadSuite,
  timeFieldSuite,
  timePickerSuite,
  toastSuite,
  toasterSuite,
  toggleSuite,
  tooltipSuite,
  tourSuite,
  transferSuite,
  treeSuite,
  treeSelectSuite,
  virtualizerSuite,
]

/** 暂不做逐帧比对的套件与理由。它们的跨适配器保证由两侧各自跑同一份 conformance 规格提供。 */
const EXCLUDED: Readonly<Record<string, string>> = {
  'accordion': 'WC 侧把作者禁用声明改写成 aria-disabled，两侧 fixture 不同构',
  'checkbox': 'WC 侧 indicator 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'checkbox-group': '同上，且集合条目的禁用声明经 aria-disabled 改写',
  'code-block': '语言标注的入口名两侧永久不同（WC 必须叫 code-lang，lang 是 HTML 全局属性）',
  'color-picker': '真实分歧：挂载时焦点落点不同（WC 在 area-thumb，Vue 在 channel-input），11/15 条同一根因',
  'combobox': 'WC 侧集合条目经 aria-disabled 改写，两侧 fixture 不同构',
  'composer': '真实分歧：stop 是全仓唯一无载荷的语义事件，Vue 发 undefined、WC 发 null',
  'context-menu': 'WC 侧集合条目经 aria-disabled 改写，两侧 fixture 不同构',
  'dialog': '两端 presence 模型不同：Vue 关闭即卸载 content，WC 是 Light DOM 不删作者节点',
  'drawer': '同 dialog',
  'field': '真实分歧：WC 侧 control 是 div，label 的 for 关联不上',
  'file-upload': '真实分歧：删掉持有焦点的条目后两侧焦点落点不同，删完焦点该去哪尚未定规格',
  'listbox': '真实分歧：两侧 DOM 全程不同，17 条无一通过，待逐条定位',
  'menu': 'WC 侧集合条目经 aria-disabled 改写，两侧 fixture 不同构',
  'popover': '真实分歧：点 close-trigger 关闭后焦点去处不同（WC 留在 close-trigger，Vue 回 trigger）',
  'progress': 'WC 侧 track/range 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'radio-group': 'WC 侧集合条目经 aria-disabled 改写，两侧 fixture 不同构',
  'select': 'WC 侧要作者手写影子 select，且集合条目经 aria-disabled 改写',
  'steps': 'WC 侧集合条目经 aria-disabled 改写，两侧 fixture 不同构',
  'switch': 'WC 侧 thumb 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'tabs': 'WC 侧集合条目经 aria-disabled 改写，两侧 fixture 不同构',
  'toggle-group': '同上',
  'toolbar': '同上',
}

runParity([createVueHarness(), createWcHarness()], SUITES, { describe, it })

describe('parity 覆盖登记', () => {
  it('每个套件要么在跑，要么写明了为什么不跑', () => {
    const running = new Set(SUITES.map(s => s.component))
    const excluded = new Set(Object.keys(EXCLUDED))
    const all = allSuites.map(s => s.component)

    expect(all.filter(c => !running.has(c) && !excluded.has(c))).toEqual([])
    expect([...excluded].filter(c => !all.includes(c))).toEqual([])
    expect([...running].filter(c => excluded.has(c))).toEqual([])
    expect(running.size + excluded.size).toBe(all.length)
  })
})
