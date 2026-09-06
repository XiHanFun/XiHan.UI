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
import { runParity, switchSuite } from '../src'

/** React 侧已经铺到、纳入逐帧对拍的组件。 */
const SUITES = [switchSuite]

/** React 侧还没铺到的组件。每批合入时删掉对应行；删空即本文件的覆盖等式自动收紧到全集。 */
const PENDING = new Set([
  'accordion',
  'affix',
  'alert',
  'anchor',
  'approval',
  'avatar',
  'avatar-group',
  'back-top',
  'badge',
  'breadcrumb',
  'button',
  'button-group',
  'calendar',
  'card',
  'carousel',
  'cascader',
  'checkbox',
  'checkbox-group',
  'clipboard',
  'code-view',
  'collapsible',
  'color-picker',
  'combobox',
  'command',
  'context-menu',
  'date-field',
  'date-picker',
  'descriptions',
  'dialog',
  'diff-view',
  'download-trigger',
  'drawer',
  'editable',
  'empty-state',
  'field',
  'field-array',
  'fieldset',
  'file-upload',
  'flex',
  'float-button',
  'floating-panel',
  'form',
  'gradient-text',
  'grid',
  'heatmap',
  'highlight',
  'hotkeys',
  'hover-card',
  'icon',
  'icon-wrapper',
  'image',
  'image-cropper',
  'image-viewer',
  'infinite-scroll',
  'input-group',
  'json-viewer',
  'layout',
  'list',
  'listbox',
  'loading-bar',
  'log',
  'markdown-stream',
  'marquee',
  'masonry',
  'mention',
  'menu',
  'menubar',
  'message-feed',
  'navigation-menu',
  'notification',
  'number-animation',
  'number-field',
  'page-header',
  'pagination',
  'password-input',
  'pin-input',
  'popconfirm',
  'popover',
  'progress',
  'prompt-input',
  'qr-code',
  'question-flow',
  'radio-group',
  'rating',
  'reasoning',
  'resizable',
  'scroll-area',
  'scrollbar',
  'segmented',
  'select',
  'separator',
  'side-nav',
  'signature-pad',
  'skeleton',
  'slider',
  'sortable',
  'spinner',
  'splitter',
  'statistic',
  'steps',
  'table',
  'tabs',
  'tag',
  'tag-group',
  'tags-input',
  'text-field',
  'time-field',
  'time-picker',
  'timeline',
  'timer',
  'timestamp',
  'toast',
  'toggle',
  'toggle-group',
  'tool-call',
  'toolbar',
  'tooltip',
  'tour',
  'transfer',
  'tree',
  'tree-select',
  'truncate',
  'typography',
  'virtualizer',
  'watermark',
])

runParity([createVueHarness(), createReactHarness()], SUITES, { describe, it })

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
