// @vitest-environment jsdom
//
// Vue 与 React 的逐帧对拍。
//
// 与 vue×wc 那一份分开跑：那边 30 条排除九成是 Light DOM 作者手写模型造成的，
// 与 React 无关；塞进同一次调用会把最该比的那一对连坐掉。
//
// 这里没有 EXCLUDED，只有 PENDING——两家都是「组件自己渲染部件、prop 被消费不落 DOM」
// 的同一类模型，理论上每个组件都该逐帧对得上，对不上就是缺陷。名单只随铺开进度缩短。
import { describe, expect, it } from 'vitest'
import { createReactHarness } from '../../../packages/adapters/react/tests/harness'
import { createVueHarness } from '../../../packages/adapters/vue/tests/harness'
import { accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, cardSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, hoverCardSuite, inputGroupSuite, loadingBarSuite, menuSuite, notificationSuite, numberFieldSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, runParity, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timelineSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite } from '../src'

/** React 侧已经铺到、纳入逐帧对拍的组件。 */
const SUITES = [accordionSuite, alertSuite, avatarGroupSuite, avatarSuite, badgeSuite, breadcrumbSuite, buttonSuite, cardSuite, checkboxGroupSuite, checkboxSuite, collapsibleSuite, contextMenuSuite, dialogSuite, drawerSuite, editableSuite, emptyStateSuite, fieldArraySuite, fieldsetSuite, fieldSuite, formSuite, hoverCardSuite, inputGroupSuite, loadingBarSuite, menuSuite, notificationSuite, numberFieldSuite, paginationSuite, passwordInputSuite, pinInputSuite, popconfirmSuite, popoverSuite, progressSuite, radioGroupSuite, ratingSuite, segmentedSuite, selectSuite, separatorSuite, skeletonSuite, spinnerSuite, statisticSuite, stepsSuite, switchSuite, tabsSuite, tagsInputSuite, tagSuite, textFieldSuite, timelineSuite, toastSuite, toggleGroupSuite, toggleSuite, tooltipSuite]

/** React 侧还没铺到的组件。每批合入时删掉对应行；删空即本文件的覆盖等式自动收紧到全集。 */
const PENDING = new Set([
  'affix',
  'anchor',
  'approval',
  'back-top',
  'button-group',
  'calendar',
  'carousel',
  'cascader',
  'clipboard',
  'code-view',
  'color-picker',
  'combobox',
  'command',
  'date-field',
  'date-picker',
  'descriptions',
  'diff-view',
  'download-trigger',
  'file-upload',
  'flex',
  'float-button',
  'floating-panel',
  'gradient-text',
  'grid',
  'heatmap',
  'highlight',
  'hotkeys',
  'icon',
  'icon-wrapper',
  'image',
  'image-cropper',
  'image-viewer',
  'infinite-scroll',
  'json-viewer',
  'layout',
  'list',
  'listbox',
  'log',
  'markdown-stream',
  'marquee',
  'masonry',
  'mention',
  'menubar',
  'message-feed',
  'navigation-menu',
  'number-animation',
  'page-header',
  'prompt-input',
  'qr-code',
  'question-flow',
  'reasoning',
  'resizable',
  'scroll-area',
  'scrollbar',
  'side-nav',
  'signature-pad',
  'slider',
  'sortable',
  'splitter',
  'table',
  'tag-group',
  'time-field',
  'time-picker',
  'timer',
  'timestamp',
  'tool-call',
  'toolbar',
  'tour',
  'transfer',
  'tree',
  'tree-select',
  'truncate',
  'typography',
  'virtualizer',
  'watermark',
])

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
  it('每个套件要么在对拍，要么记在待铺名单里', () => {
    const running = new Set(SUITES.map(s => s.component))
    const all = suiteFilesOnDisk()

    expect(all.filter(c => !running.has(c) && !PENDING.has(c))).toEqual([])
    expect([...PENDING].filter(c => !all.includes(c))).toEqual([])
    expect([...running].filter(c => PENDING.has(c))).toEqual([])
    expect(running.size + PENDING.size).toBe(all.length)
  })
})
