// @vitest-environment jsdom
import type { ConformanceSuite } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVueHarness } from '../../../packages/vue/tests/harness'
import { createWcHarness } from '../../../packages/wc/tests/harness'
import {
  alertSuite,
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
  emptyStateSuite,
  fieldSuite,
  fileUploadSuite,
  formSuite,
  hoverCardSuite,
  imageSuite,
  loadingBarSuite,
  menubarSuite,
  navigationMenuSuite,
  numberFieldSuite,
  paginationSuite,
  pinInputSuite,
  popoverSuite,
  ratingSuite,
  runParity,

  scrollAreaSuite,
  separatorSuite,
  skeletonSuite,
  sliderSuite,
  spinnerSuite,
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
 * 集合族占了排除项的大半，同一个根因：fixture 的 attrs 在两个 harness 里含义不同——
 * Vue 侧 `h(组件, { ...attrs })` 让它变成组件 props（声明过的被消费、不落 DOM），
 * WC 侧 `el.setAttribute` 让它变成 DOM 属性。禁用声明正落在这个差异上，
 * 而那是两端作者侧 API 的真实区别，不是缺陷，逐帧比对本就不适用。
 *
 * 其余三类：部件形态不同构、入口名永久性差异、presence 模型不同，
 * 以及真实分歧——最后一类是待办不是结论，逐条注明了差在哪。
 */
const SUITES: readonly ConformanceSuite[] = [
  alertSuite,
  emptyStateSuite,
  skeletonSuite,
  spinnerSuite,
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
  fieldSuite,
  fileUploadSuite,
  formSuite,
  hoverCardSuite,
  imageSuite,
  loadingBarSuite,
  menubarSuite,
  navigationMenuSuite,
  numberFieldSuite,
  paginationSuite,
  pinInputSuite,
  popoverSuite,
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
  'accordion': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'checkbox': 'WC 侧 indicator 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'checkbox-group': '同上，且集合条目的禁用声明经 aria-disabled 改写',
  'code-block': '语言标注的入口名两侧永久不同（WC 必须叫 code-lang，lang 是 HTML 全局属性）',
  'color-picker': '真实分歧：挂载时焦点落点不同（Vue 在 area-thumb，WC 在 channel-input），11/15 条同一根因',
  'combobox': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'composer': '真实分歧：stop 是全仓唯一无载荷的语义事件，Vue 发 undefined、WC 发 null',
  'context-menu': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'dialog': '两端 presence 模型不同：Vue 关闭即卸载 content，WC 是 Light DOM 不删作者节点',
  'drawer': '同 dialog',
  'listbox': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'menu': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'progress': 'WC 侧 track/range 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'radio-group': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'select': '同集合族，另加 WC 要作者手写影子 select',
  'steps': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'switch': 'WC 侧 thumb 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'tabs': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'toggle-group': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'toolbar': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
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
