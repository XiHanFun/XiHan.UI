// @vitest-environment jsdom
import type { ConformanceSuite } from '../src'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVueHarness } from '../../../packages/adapters/vue/tests/harness'
import { createWcHarness } from '../../../packages/adapters/web-components/tests/harness'
import {
  affixSuite,
  alertSuite,
  allSuites,
  anchorSuite,
  avatarGroupSuite,
  avatarSuite,
  backTopSuite,
  badgeSuite,
  breadcrumbSuite,
  buttonGroupSuite,
  buttonSuite,
  calendarSuite,
  cardSuite,
  carouselSuite,
  cascaderSuite,
  clipboardSuite,
  collapsibleSuite,
  countdownSuite,
  dateFieldSuite,
  datePickerSuite,
  descriptionsSuite,
  downloadTriggerSuite,
  dynamicInputSuite,
  editableSuite,
  ellipsisSuite,
  emptyStateSuite,
  fieldsetSuite,
  fieldSuite,
  fileUploadSuite,
  flexSuite,
  floatButtonSuite,
  floatingPanelSuite,
  formSuite,
  gradientTextSuite,
  gridSuite,
  heatmapSuite,
  highlightSuite,
  hotkeysSuite,
  hoverCardSuite,
  iconWrapperSuite,
  imageCropperSuite,
  imageSuite,
  infiniteScrollSuite,
  jsonViewerSuite,
  layoutSuite,
  listSuite,
  loadingBarSuite,
  logSuite,
  marqueeSuite,
  menubarSuite,
  navigationMenuSuite,
  numberAnimationSuite,
  numberFieldSuite,
  pageHeaderSuite,
  paginationSuite,
  passwordInputSuite,
  pinInputSuite,
  popconfirmSuite,
  popoverSuite,
  popselectSuite,
  qrCodeSuite,
  ratingSuite,
  resultSuite,
  runParity,
  scrollAreaSuite,
  scrollbarSuite,
  separatorSuite,
  signaturePadSuite,
  skeletonSuite,
  sliderSuite,
  spaceSuite,
  spinnerSuite,
  splitterSuite,
  statisticSuite,
  tableSuite,
  tagsInputSuite,
  tagSuite,
  textFieldSuite,
  threadSuite,
  timeFieldSuite,
  timelineSuite,
  timePickerSuite,
  timerSuite,
  timeSuite,
  toasterSuite,
  toastSuite,
  toggleSuite,
  tooltipSuite,
  tourSuite,
  transferSuite,
  treeSelectSuite,
  treeSuite,
  typographySuite,
  virtualizerSuite,
  watermarkSuite,
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
  scrollbarSuite,
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
  affixSuite,
  avatarGroupSuite,
  backTopSuite,
  buttonGroupSuite,
  cardSuite,
  countdownSuite,
  descriptionsSuite,
  dynamicInputSuite,
  ellipsisSuite,
  flexSuite,
  floatButtonSuite,
  gradientTextSuite,
  gridSuite,
  highlightSuite,
  iconWrapperSuite,
  infiniteScrollSuite,
  layoutSuite,
  listSuite,
  logSuite,
  marqueeSuite,
  numberAnimationSuite,
  pageHeaderSuite,
  popconfirmSuite,
  popselectSuite,
  qrCodeSuite,
  resultSuite,
  statisticSuite,
  timeSuite,
  timelineSuite,
  typographySuite,
  watermarkSuite,
  spaceSuite,
  tagSuite,
  passwordInputSuite,
  fieldsetSuite,
  jsonViewerSuite,
  timerSuite,
  heatmapSuite,
  downloadTriggerSuite,
  hotkeysSuite,
  imageCropperSuite,
  signaturePadSuite,
  floatingPanelSuite,
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
  'icon': 'WC 侧 glyph 空壳由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'image-viewer': '同 dialog：Vue 关闭即卸载 content，WC 是 Light DOM 不删作者节点',
  'drawer': '同 dialog',
  'listbox': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'masonry': 'Vue 版由组件铺列、并把每个子节点各包一层，WC 侧 column 与 item 归作者手写，同一份 fixture 在两端铺不出同构 DOM',
  'mention': '同集合族：候选的禁用声明两端不同，WC 侧 disabled 落成 DOM 属性，Vue 侧被 prop 消费',
  'menu': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'progress': 'WC 侧 track/range 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'radio-group': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'segmented': '同集合族：条目的禁用声明两端不同，Vue 是被消费的组件 prop（不落 DOM），WC 落成 DOM 属性',
  'select': '同集合族，另加 WC 要作者手写影子 select',
  'side-nav': '折叠态弹出面板的定位层 Vue 由 branch-content 组件内部装配并搬到浮层落点，WC 由作者手写在 branch 里，fixture 不同构',
  'steps': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'switch': 'WC 侧 thumb 由作者手写，Vue 版组件内部渲染，fixture 不同构',
  'tabs': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'toggle-group': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
  'toolbar': '两端作者侧的禁用声明 API 不同：Vue 是组件 prop（被消费、不落 DOM），WC 要作者写 aria-disabled，逐帧比对不适用',
}

runParity([createVueHarness(), createWcHarness()], SUITES, { describe, it })

/** 套件全集取自目录，不取 allSuites：拿被审对象当分母，漏登记的组件根本不进等式。 */
function suiteFilesOnDisk(): string[] {
  return Object.keys(import.meta.glob('../src/suites/*.suite.ts'))
    .map(p => p.slice(p.lastIndexOf('/') + 1).replace('.suite.ts', ''))
    .sort()
}

describe('parity 覆盖登记', () => {
  it('磁盘上的每份套件都登记进了 allSuites', () => {
    const registered = allSuites.map(s => s.component).sort()
    expect(registered).toEqual(suiteFilesOnDisk())
  })

  it('每个套件要么在跑，要么写明了为什么不跑', () => {
    const running = new Set(SUITES.map(s => s.component))
    const excluded = new Set(Object.keys(EXCLUDED))
    const all = suiteFilesOnDisk()

    expect(all.filter(c => !running.has(c) && !excluded.has(c))).toEqual([])
    expect([...excluded].filter(c => !all.includes(c))).toEqual([])
    expect([...running].filter(c => excluded.has(c))).toEqual([])
    expect(running.size + excluded.size).toBe(all.length)
  })
})
