import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { funnelChartAnatomy, funnelChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const GRAPHICS = 'https://www.w3.org/TR/graphics-aria-1.0/'

/** 四个阶段，按先后排好：阶段下标就是数据下标。 */
const DATA = [
  { stage: 'Visit', users: 1000 },
  { stage: 'Sign up', users: 400 },
  { stage: 'Order', users: 100 },
  { stage: 'Repeat', users: 40 },
] as const

// 用例看静止时的 DOM 契约：过渡关掉
const PROPS = { data: DATA, nameField: 'stage', valueField: 'users', locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 graphics-document，每个阶段是带可及名的 graphics-symbol，转化率写在相邻阶段之间',
    spec: { apg: GRAPHICS },
    initial: {
      counts: { 'stage': 4, 'stage-label': 4, 'conversion': 3, 'tooltip': 1, 'summary': 1, 'table-region': 1, 'table': 1 },
      parts: {
        'plot': { 'role': 'graphics-document', 'aria-roledescription': 'chart' },
        'stage': [
          { 'role': 'graphics-symbol', 'aria-label': 'Visit, 1,000', 'tabindex': '0' },
          { 'role': 'graphics-symbol', 'aria-label': 'Sign up, 400, 40.0% of previous', 'tabindex': '-1' },
          { 'role': 'graphics-symbol', 'aria-label': 'Order, 100, 25.0% of previous', 'tabindex': '-1' },
          { 'role': 'graphics-symbol', 'aria-label': 'Repeat, 40, 40.0% of previous', 'tabindex': '-1' },
        ],
        'stage-label': [{ 'aria-hidden': 'true' }],
        'conversion': [{ 'aria-hidden': 'true' }],
        'tooltip': { 'aria-hidden': 'true', 'data-state': 'hidden' },
        'empty': { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在第一阶段',
    spec: { apg: APG },
    covers: ['funnel-chart.kbd.tab'],
    steps: [
      singleTabStop('funnel-chart', 'stage', 'plot'),
      {
        kind: 'focus',
        part: 'stage[0]',
        via: 'keyboard',
        expect: {
          activeElement: { part: 'stage[0]', exact: true },
          parts: { tooltip: { 'data-state': 'visible' } },
        },
      },
    ],
  },
  {
    name: 'ArrowDown / ArrowRight 下一阶段，ArrowUp / ArrowLeft 上一阶段',
    spec: { apg: APG },
    covers: ['funnel-chart.kbd.next', 'funnel-chart.kbd.prev'],
    steps: [
      { kind: 'focus', part: 'stage[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowDown',
        expect: {
          activeElement: { part: 'stage[1]', exact: true },
          parts: { stage: [{ tabindex: '-1' }, { tabindex: '0' }, { tabindex: '-1' }, { tabindex: '-1' }] },
        },
      },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'stage[2]', exact: true } } },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'stage[1]', exact: true } } },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'stage[0]', exact: true } } },
    ],
  },
  {
    name: 'Home / End / PageDown：第一 / 最后一个阶段，按页跨阶段',
    spec: { apg: APG },
    covers: ['funnel-chart.kbd.first', 'funnel-chart.kbd.last', 'funnel-chart.kbd.page'],
    steps: [
      { kind: 'focus', part: 'stage[1]', via: 'keyboard' },
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'stage[3]', exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'stage[0]', exact: true } } },
      { kind: 'key', key: 'PageDown', expect: { activeElement: { part: 'stage[1]', exact: true } } },
    ],
  },
  {
    name: 'direction="up"：金字塔里上键是下一阶段',
    spec: { apg: APG },
    props: { direction: 'up' },
    steps: [
      { kind: 'focus', part: 'stage[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'stage[1]', exact: true } } },
      { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'stage[0]', exact: true } } },
    ],
  },
  {
    name: 'Enter / Space：报告聚焦的阶段',
    spec: { apg: APG },
    covers: ['funnel-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: 'stage[2]', via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['funnel-chart.kbd.dismiss'],
    steps: [
      { kind: 'focus', part: 'stage[1]', via: 'keyboard', expect: { parts: { tooltip: { 'data-state': 'visible' } } } },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          activeElement: { part: 'stage[1]', exact: true },
          parts: { tooltip: { 'data-state': 'hidden' } },
        },
      },
    ],
  },
  {
    name: '受控 hiddenSeries：隐藏的阶段不画，转化率跳过它重算',
    spec: { adr: 'controlled-uncontrolled' },
    props: { hiddenSeries: ['Sign up'] },
    initial: {
      counts: { stage: 3, conversion: 2 },
      parts: { stage: [{ 'aria-label': 'Visit, 1,000' }, { 'aria-label': 'Order, 100, 10.0% of previous' }] },
    },
  },
  {
    name: '受控 activeKey：别的图联动过来的阶段点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: 'Order' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: 'conversion="none"：不写转化率',
    spec: { adr: 'chart-variant' },
    props: { conversion: 'none' },
    initial: { counts: { conversion: 0 } },
  },
  {
    name: '没有数据：空态显示，绘图区没有阶段',
    spec: { adr: 'chart-empty' },
    props: { data: [] },
    initial: {
      counts: { stage: 0 },
      parts: { empty: { hidden: null } },
    },
  },
]

export const funnelChartSuite: ConformanceSuite = {
  component: 'funnel-chart',
  anatomy: funnelChartAnatomy,
  keyboard: funnelChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: 'Conversion' },
      {
        part: 'viewport',
        children: [
          { part: 'plot', tag: 'svg' },
          { part: 'empty' },
        ],
      },
      { part: 'tooltip' },
    ],
  },
  cases: cases.map(c => ({ environment: chartEnvironment('funnel-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
