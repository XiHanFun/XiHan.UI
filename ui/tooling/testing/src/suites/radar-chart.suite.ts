import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { radarChartAnatomy, radarChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const GRAPHICS = 'https://www.w3.org/TR/graphics-aria-1.0/'

/** 两个实体、四个指标：顶点按实体排、实体内按指标排，A 的四个顶点是 point[0–3]，B 的是 point[4–7]。 */
const DATA = [
  { model: 'A', speed: 80, power: 60, range: 70, price: 40 },
  { model: 'B', speed: 60, power: 90, range: 50, price: 70 },
] as const

const INDICATORS = [
  { key: 'speed', label: 'Speed' },
  { key: 'power', label: 'Power' },
  { key: 'range', label: 'Range' },
  { key: 'price', label: 'Price' },
] as const

// 用例看静止时的 DOM 契约：过渡关掉
const PROPS = { data: DATA, nameField: 'model', indicators: INDICATORS, locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 graphics-document，每个实体是 graphics-object，每个顶点是带可及名的 graphics-symbol',
    spec: { apg: GRAPHICS },
    initial: {
      counts: { 'legend-item': 2, 'series': 2, 'point': 8, 'grid-ring': 4, 'spoke': 4, 'indicator-label': 4, 'tooltip': 1, 'summary': 1, 'table-region': 1, 'table': 1 },
      parts: {
        'plot': { 'role': 'graphics-document', 'aria-roledescription': 'chart' },
        'legend': { 'role': 'toolbar', 'aria-label': 'Legend', 'hidden': null },
        'legend-item': [
          { 'aria-pressed': 'true', 'tabindex': '0', 'data-value': 'A' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': 'B' },
        ],
        'series': [
          { 'role': 'graphics-object', 'aria-label': 'A' },
          { 'role': 'graphics-object', 'aria-label': 'B' },
        ],
        'point': [
          { 'role': 'graphics-symbol', 'aria-label': 'Speed, A 80', 'tabindex': '0' },
          { 'role': 'graphics-symbol', 'aria-label': 'Power, A 60', 'tabindex': '-1' },
        ],
        'indicator-label': [{ 'aria-hidden': 'true' }],
        'tooltip': { 'aria-hidden': 'true', 'data-state': 'hidden' },
        'empty': { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在第一个实体 12 点方向的顶点',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.tab'],
    steps: [
      singleTabStop('radar-chart', 'point', 'plot'),
      {
        kind: 'focus',
        part: 'point[0]',
        via: 'keyboard',
        expect: {
          activeElement: { part: 'point[0]', exact: true },
          parts: { tooltip: { 'data-state': 'visible' } },
        },
      },
    ],
  },
  {
    name: 'ArrowRight / ArrowLeft：沿顺时针在同一个实体的指标之间走',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.next', 'radar-chart.kbd.prev'],
    steps: [
      { kind: 'focus', part: 'point[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: {
          activeElement: { part: 'point[1]', exact: true },
          parts: { point: [{ tabindex: '-1' }, { tabindex: '0' }, { tabindex: '-1' }, { tabindex: '-1' }] },
        },
      },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'point[0]', exact: true } } },
    ],
  },
  {
    name: 'ArrowUp / ArrowDown：在同一个指标上换实体',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.series-next', 'radar-chart.kbd.series-prev'],
    steps: [
      { kind: 'focus', part: 'point[1]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'point[5]', exact: true } } },
      { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'point[1]', exact: true } } },
    ],
  },
  {
    name: 'Home / End：同一个实体的第一个 / 最后一个指标',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.first', 'radar-chart.kbd.last'],
    steps: [
      { kind: 'focus', part: 'point[1]', via: 'keyboard' },
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'point[3]', exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'point[0]', exact: true } } },
    ],
  },
  {
    name: 'Enter / Space：报告聚焦的顶点',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: 'point[2]', via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.dismiss'],
    steps: [
      { kind: 'focus', part: 'point[1]', via: 'keyboard', expect: { parts: { tooltip: { 'data-state': 'visible' } } } },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          activeElement: { part: 'point[1]', exact: true },
          parts: { tooltip: { 'data-state': 'hidden' } },
        },
      },
    ],
  },
  {
    name: '图例：左右键在项之间移动，点击切换显隐，隐藏的实体从绘图区移除',
    spec: { apg: APG },
    covers: ['radar-chart.kbd.legend-move', 'radar-chart.kbd.legend-toggle'],
    steps: [
      { kind: 'focus', part: 'legend-item[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'legend-item[1]', exact: true } } },
      {
        kind: 'click',
        part: 'legend-item[1]',
        expect: {
          counts: { series: 1, point: 4 },
          parts: { 'legend-item': [{ 'aria-pressed': 'true' }, { 'aria-pressed': 'false' }] },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['B'] } }],
        },
      },
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
          counts: { series: 2 },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['A'] } }],
        },
      },
      { kind: 'setProps', props: { hiddenSeries: ['A'] } },
      {
        kind: 'settle',
        until: { attr: { part: 'legend-item[0]', name: 'aria-pressed', value: 'false' } },
        expect: { counts: { series: 1 } },
      },
    ],
  },
  {
    name: '受控 activeKey：别的图联动过来的指标点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: 'power' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: '没有数据：空态显示，绘图区没有实体',
    spec: { adr: 'chart-empty' },
    props: { data: [] },
    initial: {
      counts: { series: 0, point: 0 },
      parts: { empty: { hidden: null } },
    },
  },
]

export const radarChartSuite: ConformanceSuite = {
  component: 'radar-chart',
  anatomy: radarChartAnatomy,
  keyboard: radarChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: '车型对比' },
      { part: 'legend' },
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
  cases: cases.map(c => ({ environment: chartEnvironment('radar-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
