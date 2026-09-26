import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { pieChartAnatomy, pieChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const GRAPHICS = 'https://www.w3.org/TR/graphics-aria-1.0/'

/** 四个扇区：按数值从大到小排好的次序与数据次序相同，扇区下标就是数据下标。 */
const DATA = [
  { channel: '搜索', visits: 40 },
  { channel: '直接访问', visits: 30 },
  { channel: '社交', visits: 20 },
  { channel: '邮件', visits: 10 },
] as const

// 用例看静止时的 DOM 契约：过渡关掉，另有一条用例单看收场
const PROPS = { data: DATA, nameField: 'channel', valueField: 'visits', locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 graphics-document，每个扇区是带可及名的 graphics-symbol，环形中心显示合计',
    spec: { apg: GRAPHICS },
    initial: {
      counts: { 'legend-item': 4, 'slice': 4, 'leader-line': 4, 'slice-label': 4, 'tooltip': 1, 'summary': 1, 'table': 1 },
      parts: {
        'plot': { 'role': 'graphics-document', 'aria-roledescription': 'chart' },
        'legend': { 'role': 'toolbar', 'aria-label': 'Legend', 'hidden': null },
        'legend-item': [
          { 'aria-pressed': 'true', 'tabindex': '0', 'data-value': '搜索' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': '直接访问' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': '社交' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': '邮件' },
        ],
        'slice': [
          { 'role': 'graphics-symbol', 'aria-label': '搜索, 40, 40.0%', 'tabindex': '0' },
          { 'role': 'graphics-symbol', 'aria-label': '直接访问, 30, 30.0%', 'tabindex': '-1' },
          { 'role': 'graphics-symbol', 'aria-label': '社交, 20, 20.0%', 'tabindex': '-1' },
          { 'role': 'graphics-symbol', 'aria-label': '邮件, 10, 10.0%', 'tabindex': '-1' },
        ],
        'center': { hidden: null },
        'tooltip': { 'aria-hidden': 'true', 'data-state': 'hidden' },
        'empty': { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在 12 点方向的第一个扇区',
    spec: { apg: APG },
    covers: ['pie-chart.kbd.tab'],
    steps: [
      singleTabStop('pie-chart', 'slice', 'plot'),
      {
        kind: 'focus',
        part: 'slice[0]',
        expect: {
          activeElement: { part: 'slice[0]', exact: true },
          parts: { tooltip: { 'data-state': 'visible' } },
        },
      },
    ],
  },
  {
    name: 'ArrowRight / ArrowDown 顺时针，ArrowLeft / ArrowUp 逆时针',
    spec: { apg: APG },
    covers: ['pie-chart.kbd.next', 'pie-chart.kbd.prev'],
    steps: [
      { kind: 'focus', part: 'slice[0]' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: {
          activeElement: { part: 'slice[1]', exact: true },
          parts: { slice: [{ tabindex: '-1' }, { tabindex: '0' }, { tabindex: '-1' }, { tabindex: '-1' }] },
        },
      },
      { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'slice[2]', exact: true } } },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'slice[1]', exact: true } } },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'slice[0]', exact: true } } },
    ],
  },
  {
    name: 'Home / End：第一个 / 最后一个扇区',
    spec: { apg: APG },
    covers: ['pie-chart.kbd.first', 'pie-chart.kbd.last'],
    steps: [
      { kind: 'focus', part: 'slice[1]' },
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'slice[3]', exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'slice[0]', exact: true } } },
    ],
  },
  {
    name: 'Enter / Space：报告聚焦的扇区',
    spec: { apg: APG },
    covers: ['pie-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: 'slice[2]' },
      { kind: 'key', key: 'Enter', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['pie-chart.kbd.dismiss'],
    steps: [
      { kind: 'focus', part: 'slice[1]', expect: { parts: { tooltip: { 'data-state': 'visible' } } } },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          activeElement: { part: 'slice[1]', exact: true },
          parts: { tooltip: { 'data-state': 'hidden' } },
        },
      },
    ],
  },
  {
    name: '图例：左右键在项之间移动，Enter 切换显隐，隐藏的扇区从绘图区移除',
    spec: { apg: APG },
    covers: ['pie-chart.kbd.legend-move', 'pie-chart.kbd.legend-toggle'],
    steps: [
      { kind: 'focus', part: 'legend-item[0]' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: {
          activeElement: { part: 'legend-item[1]', exact: true },
          parts: { 'legend-item': [{ tabindex: '-1' }, { tabindex: '0' }, { tabindex: '-1' }, { tabindex: '-1' }] },
        },
      },
      {
        kind: 'click',
        part: 'legend-item[1]',
        expect: {
          counts: { slice: 3 },
          parts: { 'legend-item': [{ 'aria-pressed': 'true' }, { 'aria-pressed': 'false' }, { 'aria-pressed': 'true' }, { 'aria-pressed': 'true' }] },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['直接访问'] } }],
        },
      },
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'legend-item[3]', exact: true } } },
    ],
  },
  {
    name: '受控 hiddenSeries：点图例只派发事件，宿主写回后才隐藏',
    spec: { adr: 'controlled-uncontrolled' },
    props: { hiddenSeries: [] },
    steps: [
      {
        kind: 'click',
        part: 'legend-item[0]',
        expect: {
          counts: { slice: 4 },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['搜索'] } }],
        },
      },
      { kind: 'setProps', props: { hiddenSeries: ['搜索'] } },
      {
        kind: 'settle',
        until: { attr: { part: 'legend-item[0]', name: 'aria-pressed', value: 'false' } },
        expect: { counts: { slice: 3 } },
      },
    ],
  },
  {
    name: '受控 activeKey：别的图联动过来的类目点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: '社交' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: 'variant="pie"：实心饼没有环形中心',
    spec: { adr: 'chart-variant' },
    props: { variant: 'pie' },
    initial: { parts: { center: { hidden: '' } } },
  },
  {
    name: '过渡：图例隐藏的扇区先收拢，收场期间不可聚焦、不进可访问树，走完才从绘图区移除',
    spec: { adr: 'chart-transition' },
    props: { animated: true },
    skipParity: '过渡按真实时钟逐帧推进，中间帧的几何随各适配器的提交时机而不同',
    steps: [
      {
        kind: 'click',
        part: 'legend-item[0]',
        expect: {
          counts: { slice: 4 },
          // 留下的扇区在前，收场的扇区排在最后
          parts: { slice: [{ 'aria-hidden': null }, { 'aria-hidden': null }, { 'aria-hidden': null }, { 'aria-hidden': 'true', 'tabindex': null, 'role': null }] },
        },
      },
      { kind: 'settle', until: { absent: 'slice[3]' }, expect: { counts: { slice: 3 } } },
    ],
  },
  {
    name: '全部为 0：空态显示，绘图区没有扇区',
    spec: { adr: 'chart-empty' },
    props: { data: [{ channel: '搜索', visits: 0 }, { channel: '邮件', visits: 0 }] },
    initial: {
      counts: { slice: 0 },
      parts: { empty: { hidden: null }, center: { hidden: '' } },
    },
  },
]

export const pieChartSuite: ConformanceSuite = {
  component: 'pie-chart',
  anatomy: pieChartAnatomy,
  keyboard: pieChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: '访问来源' },
      { part: 'legend' },
      {
        part: 'viewport',
        children: [
          { part: 'plot', tag: 'svg' },
          { part: 'center' },
          { part: 'empty' },
        ],
      },
      { part: 'tooltip' },
    ],
  },
  cases: cases.map(c => ({ environment: chartEnvironment('pie-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
