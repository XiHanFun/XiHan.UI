// @vitest-environment jsdom
//
// Vue 与 React 的逐帧对拍。
//
// 与 vue×wc 那一份分开跑：那边 30 条排除九成是 Light DOM 作者手写模型造成的，
// 与 React 无关；塞进同一次调用会把最该比的那一对连坐掉。
//
// 这里既没有 EXCLUDED 也没有 PENDING——两家都是「组件自己渲染部件、prop 被消费不落 DOM」
// 的同一类模型，每个组件都该逐帧对得上，对不上就是缺陷。目录里的套件全数在对拍。
import { describe, expect, it } from 'vitest'
import { createReactHarness } from '../../../packages/adapters/react/tests/harness'
import { createVueHarness } from '../../../packages/adapters/vue/tests/harness'
import { accordionSuite, affixSuite, alertSuite, anchorSuite, approvalSuite, avatarGroupSuite, avatarSuite, backTopSuite, badgeSuite, breadcrumbSuite, buttonGroupSuite, buttonSuite, calendarSuite, cardSuite, carouselSuite, cascaderSuite, checkboxGroupSuite, checkboxSuite, clipboardSuite, codeViewSuite, collapsibleSuite, colorPickerSuite, comboboxSuite, commandSuite, contextMenuSuite, dateFieldSuite, datePickerSuite, descriptionsSuite, dialogSuite, diffViewSuite, downloadTriggerSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, fileUploadSuite, flexSuite, floatButtonSuite, floatingPanelSuite, formSuite, gradientTextSuite, gridSuite, heatmapSuite, highlightSuite, hotkeysSuite, hoverCardSuite, iconSuite, iconWrapperSuite, imageCropperSuite, imageSuite, imageViewerSuite, infiniteScrollSuite, inputGroupSuite, jsonViewerSuite, layoutSuite, listboxSuite, listSuite, loadingBarSuite, logSuite, markdownStreamSuite, marqueeSuite, masonrySuite, mentionSuite, menubarSuite, menuSuite, messageFeedSuite, navigationMenuSuite, notificationSuite, numberAnimationSuite, numberFieldSuite, pageHeaderSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, promptInputSuite, qrCodeSuite, questionFlowSuite, radioGroupSuite, ratingSuite, reasoningSuite, resizableSuite, runParity, scrollAreaSuite, scrollbarSuite, segmentedSuite, selectSuite, separatorSuite, sideNavSuite, signaturePadSuite, skeletonSuite, sliderSuite, sortableSuite, spinnerSuite, splitterSuite, statisticSuite, stepsSuite, switchSuite, tableSuite, tabsSuite, tagGroupSuite, tagsInputSuite, tagSuite, textFieldSuite, timeFieldSuite, timelineSuite, timePickerSuite, timerSuite, timestampSuite, toastSuite, toggleGroupSuite, toggleSuite, toolbarSuite, toolCallSuite, tooltipSuite, tourSuite, transferSuite, treeSelectSuite, treeSuite, truncateSuite, typographySuite, virtualizerSuite, watermarkSuite } from '../src'

/** React 侧已经铺到、纳入逐帧对拍的组件。 */
const SUITES = [accordionSuite, affixSuite, alertSuite, anchorSuite, approvalSuite, avatarGroupSuite, avatarSuite, backTopSuite, badgeSuite, breadcrumbSuite, buttonGroupSuite, buttonSuite, calendarSuite, cardSuite, carouselSuite, cascaderSuite, checkboxGroupSuite, checkboxSuite, clipboardSuite, codeViewSuite, collapsibleSuite, colorPickerSuite, comboboxSuite, commandSuite, contextMenuSuite, dateFieldSuite, datePickerSuite, descriptionsSuite, dialogSuite, diffViewSuite, downloadTriggerSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldSuite, fieldsetSuite, fileUploadSuite, flexSuite, floatButtonSuite, floatingPanelSuite, formSuite, gradientTextSuite, gridSuite, heatmapSuite, highlightSuite, hotkeysSuite, hoverCardSuite, iconSuite, iconWrapperSuite, imageCropperSuite, imageSuite, imageViewerSuite, infiniteScrollSuite, inputGroupSuite, jsonViewerSuite, layoutSuite, listSuite, listboxSuite, loadingBarSuite, logSuite, markdownStreamSuite, marqueeSuite, masonrySuite, mentionSuite, menuSuite, menubarSuite, messageFeedSuite, navigationMenuSuite, notificationSuite, numberAnimationSuite, numberFieldSuite, pageHeaderSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, promptInputSuite, qrCodeSuite, questionFlowSuite, radioGroupSuite, ratingSuite, reasoningSuite, resizableSuite, scrollAreaSuite, scrollbarSuite, segmentedSuite, selectSuite, separatorSuite, sideNavSuite, signaturePadSuite, skeletonSuite, sliderSuite, sortableSuite, spinnerSuite, splitterSuite, statisticSuite, stepsSuite, switchSuite, tableSuite, tabsSuite, tagGroupSuite, tagSuite, tagsInputSuite, textFieldSuite, timeFieldSuite, timePickerSuite, timelineSuite, timerSuite, timestampSuite, toastSuite, toggleGroupSuite, toggleSuite, toolCallSuite, toolbarSuite, tooltipSuite, tourSuite, transferSuite, treeSelectSuite, treeSuite, truncateSuite, typographySuite, virtualizerSuite, watermarkSuite]

runParity([createVueHarness(), createReactHarness()], SUITES, { describe, it }, {
  // 焦点由提交后的回调放下去，两家排这一步的时机不同（React 在离散事件末尾同步跑完，
  // Vue 排在 nextTick 链上），而两侧的 tick 都盯 DOM 变动、看不见移焦——同一帧里
  // 一个已经移完、另一个还在半路，同一份代码两次跑能得出两种结果。实测五轮里红一轮。
  // 焦点本身不放过：各自的一致性套件用 settle 等着断言，那一侧是确定的。
  ignore: ['activeElement'],
})

/** 套件全集取自目录，不取 allSuites：拿被审对象当分母，漏登记的组件根本不进等式。 */
function suiteFilesOnDisk(): string[] {
  return Object.keys(import.meta.glob('../src/suites/*.suite.ts'))
    .map(p => p.slice(p.lastIndexOf('/') + 1).replace('.suite.ts', ''))
    .sort()
}

describe('vue×react 对拍覆盖登记', () => {
  it('目录里的套件一个不落地在对拍', () => {
    const running = new Set(SUITES.map(s => s.component))
    const all = suiteFilesOnDisk()

    expect(all.filter(c => !running.has(c))).toEqual([])
    expect([...running].filter(c => !all.includes(c))).toEqual([])
    expect(running.size).toBe(all.length)
  })
})
