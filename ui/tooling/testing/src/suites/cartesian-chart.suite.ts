import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { cartesianChartAnatomy, cartesianChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const GRAPHICS = 'https://www.w3.org/TR/graphics-aria-1.0/'

/** 三个类目、两个柱系列：够演出沿键移动、在同一个键上换系列与图例显隐。 */
const DATA = [
  { month: '一月', online: 120, store: 80 },
  { month: '二月', online: 150, store: 60 },
  { month: '三月', online: 90, store: 110 },
] as const

const SERIES = [
  { mark: 'bar', x: 'month', y: 'online', name: '线上' },
  { mark: 'bar', x: 'month', y: 'store', name: '门店' },
] as const

// 用例看静止时的 DOM 契约：过渡关掉，另有一条用例单看收场
const PROPS = { data: DATA, series: SERIES, locale: 'en-US', animated: false } as const

/** 柱的 part 下标：系列分组按图例次序，组内按类目次序。 */
function bar(series: 'online' | 'store', month: 0 | 1 | 2): string {
  return `bar[${(series === 'online' ? 0 : 3) + month}]`
}

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 graphics-document，系列是 graphics-object，每根柱是带可及名的 graphics-symbol',
    spec: { apg: GRAPHICS },
    initial: {
      counts: { 'legend-item': 2, 'series': 2, 'bar': 6, 'tooltip': 1, 'summary': 1, 'table': 1 },
      parts: {
        'root': { 'data-orientation': 'vertical', 'aria-busy': null },
        'plot': { 'role': 'graphics-document', 'aria-roledescription': 'chart' },
        'legend': { 'role': 'toolbar', 'aria-label': 'Legend', 'hidden': null },
        'legend-item': [
          { 'aria-pressed': 'true', 'tabindex': '0', 'data-value': 'online' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': 'store' },
        ],
        'series': [
          { 'role': 'graphics-object', 'aria-roledescription': 'series', 'aria-label': '线上' },
          { 'role': 'graphics-object', 'aria-roledescription': 'series', 'aria-label': '门店' },
        ],
        [bar('online', 0)]: { 'role': 'graphics-symbol', 'aria-label': '一月, 线上 120', 'tabindex': '0' },
        [bar('store', 2)]: { 'role': 'graphics-symbol', 'aria-label': '三月, 门店 110', 'tabindex': '-1' },
        'tooltip': { 'aria-hidden': 'true', 'data-state': 'hidden' },
        'empty': { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在第一个可见系列的第一个数据上',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.tab'],
    steps: [
      singleTabStop('cartesian-chart', 'bar', 'plot'),
      {
        kind: 'focus',
        part: bar('online', 0),
        via: 'keyboard',
        expect: {
          activeElement: { part: bar('online', 0), exact: true },
          parts: { tooltip: { 'data-state': 'visible' } },
        },
      },
    ],
  },
  {
    name: 'ArrowRight / ArrowLeft：沿自变量移到下一个 / 上一个键，锚点随之换位',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.next', 'cartesian-chart.kbd.prev'],
    steps: [
      { kind: 'focus', part: bar('online', 0), via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: {
          activeElement: { part: bar('online', 1), exact: true },
          parts: { [bar('online', 0)]: { tabindex: '-1' }, [bar('online', 1)]: { tabindex: '0' } },
        },
      },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: bar('online', 0), exact: true } } },
    ],
  },
  {
    name: 'ArrowUp / ArrowDown：在同一个键上换系列',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.series-next', 'cartesian-chart.kbd.series-prev'],
    steps: [
      { kind: 'focus', part: bar('online', 1), via: 'keyboard' },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: bar('store', 1), exact: true } } },
      { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: bar('online', 1), exact: true } } },
    ],
  },
  {
    name: 'Home / End：当前系列的第一个 / 最后一个数据',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.first', 'cartesian-chart.kbd.last'],
    steps: [
      { kind: 'focus', part: bar('store', 1), via: 'keyboard' },
      { kind: 'key', key: 'End', expect: { activeElement: { part: bar('store', 2), exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: bar('store', 0), exact: true } } },
    ],
  },
  {
    name: 'PageDown / PageUp：跨 10% 的键，至少一个',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.page'],
    steps: [
      { kind: 'focus', part: bar('online', 0), via: 'keyboard' },
      { kind: 'key', key: 'PageDown', expect: { activeElement: { part: bar('online', 1), exact: true } } },
      { kind: 'key', key: 'PageUp', expect: { activeElement: { part: bar('online', 0), exact: true } } },
    ],
  },
  {
    name: 'Enter / Space：报告聚焦的数据',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: bar('online', 2), via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.dismiss'],
    steps: [
      { kind: 'focus', part: bar('online', 1), via: 'keyboard', expect: { parts: { tooltip: { 'data-state': 'visible' } } } },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          activeElement: { part: bar('online', 1), exact: true },
          parts: { tooltip: { 'data-state': 'hidden' } },
        },
      },
    ],
  },
  {
    name: '图例：左右键在项之间移动，Enter 切换显隐，隐藏的系列从绘图区移除',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.legend-move', 'cartesian-chart.kbd.legend-toggle'],
    steps: [
      { kind: 'focus', part: 'legend-item[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: {
          activeElement: { part: 'legend-item[1]', exact: true },
          parts: { 'legend-item': [{ tabindex: '-1' }, { tabindex: '0' }] },
        },
      },
      {
        kind: 'click',
        part: 'legend-item[1]',
        expect: {
          counts: { series: 1, bar: 3 },
          parts: { 'legend-item': [{ 'aria-pressed': 'true' }, { 'aria-pressed': 'false' }] },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['store'] } }],
        },
      },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'legend-item[0]', exact: true } } },
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
          parts: { 'legend-item': [{ 'aria-pressed': 'true' }, { 'aria-pressed': 'true' }] },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['online'] } }],
        },
      },
      { kind: 'setProps', props: { hiddenSeries: ['online'] } },
      {
        kind: 'settle',
        until: { attr: { part: 'legend-item[0]', name: 'aria-pressed', value: 'false' } },
        expect: { counts: { series: 1, bar: 3 } },
      },
    ],
  },
  {
    name: '受控 activeKey：外部写入的键点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: '二月' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: 'pending：保留上一帧，根上 aria-busy',
    spec: { adr: 'chart-pending' },
    props: { pending: true },
    initial: {
      counts: { bar: 6 },
      parts: { root: { 'aria-busy': 'true', 'data-loading': '' } },
    },
  },
  {
    name: '过渡：图例隐藏的系列先收场，收场期间不进可访问树，走完才从绘图区移除',
    spec: { adr: 'chart-transition' },
    props: { animated: true },
    skipParity: '过渡按真实时钟逐帧推进，中间帧的几何随各适配器的提交时机而不同',
    steps: [
      {
        kind: 'click',
        part: 'legend-item[1]',
        expect: {
          counts: { series: 2 },
          parts: { series: [{ 'aria-hidden': null, 'role': 'graphics-object' }, { 'aria-hidden': 'true', 'role': null }] },
        },
      },
      { kind: 'settle', until: { absent: 'series[1]' }, expect: { counts: { series: 1, bar: 3 } } },
    ],
  },
  {
    name: '堆叠合计：每个类目在整叠外侧写合计，只给眼睛看',
    spec: { adr: 'chart-labels' },
    props: {
      series: [
        { ...SERIES[0], stack: 's' },
        { ...SERIES[1], stack: 's' },
      ],
      totals: true,
    },
    initial: {
      counts: { 'total-label': 3 },
      parts: { 'total-label': [{ 'aria-hidden': 'true' }, { 'aria-hidden': 'true' }, { 'aria-hidden': 'true' }] },
    },
  },
  {
    name: '没有数据：空态显示，绘图区没有数据标记',
    spec: { adr: 'chart-empty' },
    props: { data: [] },
    initial: {
      counts: { bar: 0 },
      parts: { empty: { hidden: null } },
    },
  },
]

export const cartesianChartSuite: ConformanceSuite = {
  component: 'cartesian-chart',
  anatomy: cartesianChartAnatomy,
  keyboard: cartesianChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: '月度销售额' },
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
  cases: cases.map(c => ({ environment: chartEnvironment('cartesian-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
