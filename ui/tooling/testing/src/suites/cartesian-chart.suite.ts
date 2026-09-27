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
    name: '散点：每行一个点，点是带可及名的 graphics-symbol、roving 取 Tab 位；色标画成点的形状',
    spec: { apg: GRAPHICS },
    props: {
      data: [
        { x: 1, a: 3, b: 5 },
        { x: 2, a: 4, b: 2 },
        { x: 2, a: 6 },
      ],
      series: [
        { mark: 'scatter', x: 'x', y: 'a', name: '甲' },
        { mark: 'scatter', x: 'x', y: 'b', name: '乙' },
      ],
    },
    initial: {
      counts: { point: 5, bar: 0 },
      parts: {
        'point[0]': { 'role': 'graphics-symbol', 'aria-label': '1, 甲 3', 'tabindex': '0' },
        'point[2]': { 'role': 'graphics-symbol', 'aria-label': '2, 甲 6', 'tabindex': '-1' },
        'legend-swatch': [{ 'data-mark': 'point', 'data-symbol': 'circle' }, { 'data-mark': 'point', 'data-symbol': 'square' }],
      },
    },
    steps: [
      { kind: 'focus', part: 'point[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: { activeElement: { part: 'point[1]', exact: true } },
      },
    ],
  },
  {
    name: '按值着色：点写段号，图例末尾生成色阶（名字、两端的值、渐变条），只给眼睛看',
    spec: { adr: 'chart-sequential' },
    props: {
      data: [
        { x: 1, y: 3, t: 10 },
        { x: 2, y: 4, t: 30 },
      ],
      series: [{ mark: 'scatter', x: 'x', y: 'y', color: 't', name: '甲' }],
      palette: 'teal',
    },
    initial: {
      counts: { 'point': 2, 'legend-scale': 1, 'legend-scale-value': 2 },
      parts: {
        'root': { 'data-palette': 'teal' },
        'legend': { hidden: null },
        'legend-scale': { 'aria-hidden': 'true', 'hidden': null },
        'legend-scale-value': [{ 'data-edge': 'min' }, { 'data-edge': 'max' }],
        'point[0]': { 'data-seg': 'low' },
        'point[1]': { 'data-seg': 'high' },
      },
    },
  },
  {
    name: '注释：参考带垫在数据下、平均线压在数据上，标签与标记都只给眼睛看',
    spec: { adr: 'chart-annotations' },
    props: {
      annotations: [
        { kind: 'band', axis: 'y', from: 60, to: 100, label: '常态' },
        { kind: 'average', series: 'online' },
      ],
    },
    initial: {
      counts: { 'annotation': 2, 'annotation-label': 2 },
      parts: {
        'annotation': [
          { 'data-kind': 'band', 'aria-hidden': 'true' },
          { 'data-kind': 'average', 'aria-hidden': 'true' },
        ],
        'annotation-label': [{ 'data-kind': 'band', 'aria-hidden': 'true' }, { 'data-kind': 'average', 'aria-hidden': 'true' }],
      },
    },
  },
  {
    name: '瀑布：一步按涨跌写 data-trend，小计不写；相邻两步之间的连接线只给眼睛看',
    spec: { adr: 'chart-waterfall' },
    props: {
      data: [
        { item: 'a', v: 100 },
        { item: 'b', v: -40 },
        { item: 'c', total: true },
      ],
      series: [{ mark: 'bar', x: 'item', y: 'v', waterfall: { total: 'total' } }],
    },
    initial: {
      counts: { bar: 3, connector: 2 },
      parts: {
        bar: [{ 'data-trend': 'rise' }, { 'data-trend': 'fall' }, { 'data-trend': null, 'aria-label': 'c, v 60' }],
        connector: [{ 'aria-hidden': 'true' }, { 'aria-hidden': 'true' }],
      },
    },
  },
  {
    name: 'K 线：实体是可聚焦的 graphics-symbol，可及名写出四个价；影线只给眼睛看',
    spec: { apg: GRAPHICS },
    props: {
      data: [
        { day: 'a', o: 10, h: 12, l: 9, c: 11 },
        { day: 'b', o: 11, h: 11, l: 8, c: 9 },
      ],
      series: [{ mark: 'candlestick', x: 'day', open: 'o', high: 'h', low: 'l', close: 'c', name: '价' }],
    },
    initial: {
      counts: { candle: 2, wick: 2 },
      parts: {
        candle: [
          { 'role': 'graphics-symbol', 'data-trend': 'rise', 'data-style': 'candle', 'tabindex': '0', 'aria-label': 'a, 价 Open 10, High 12, Low 9, Close 11' },
          { 'data-trend': 'fall', 'tabindex': '-1' },
        ],
        wick: [{ 'aria-hidden': 'true', 'data-trend': 'rise' }, { 'aria-hidden': 'true', 'data-trend': 'fall' }],
      },
    },
    steps: [
      { kind: 'focus', part: 'candle[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'candle[1]', exact: true } } },
    ],
  },
  {
    name: '箱线：箱是可聚焦的 graphics-symbol，可及名写出五数；须线、中位线与离群点只给眼睛看',
    spec: { apg: GRAPHICS },
    props: {
      data: [
        ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 100].map(v => ({ g: 'a', v })),
        ...[5, 6, 7, 8].map(v => ({ g: 'b', v })),
      ],
      series: [{ mark: 'boxplot', x: 'g', y: 'v', name: '值' }],
    },
    initial: {
      counts: { box: 2, whisker: 2, median: 2, outlier: 1 },
      parts: {
        box: [
          { 'role': 'graphics-symbol', 'data-style': 'box', 'tabindex': '0', 'aria-label': 'a, 值 Min 1, Q1 3.25, Median 5.5, Q3 7.75, Max 9' },
          { tabindex: '-1' },
        ],
        outlier: { 'aria-hidden': 'true' },
        median: [{ 'aria-hidden': 'true' }, { 'aria-hidden': 'true' }],
      },
    },
    steps: [
      { kind: 'focus', part: 'box[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'box[1]', exact: true } } },
    ],
  },
  {
    name: '键盘刷选：Shift + 方向键从锚点起沿自变量刷，框外的柱淡出；Escape 清掉；两次都派发 brush-selection-change',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.brush'],
    props: { brush: 'x' },
    initial: { counts: { brush: 0 }, parts: { plot: { 'data-selectable': '', 'data-touch-axis': 'horizontal' } } },
    steps: [
      { kind: 'focus', part: bar('online', 0), via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowRight',
        modifiers: ['Shift'],
        expect: {
          activeElement: { part: bar('online', 1), exact: true },
          counts: { brush: 1 },
          parts: { bar: [{ 'data-dimmed': null }, { 'data-dimmed': null }, { 'data-dimmed': '' }] },
          events: [
            { type: 'active-key-change', detail: { activeKey: '二月' } },
            { type: 'brush-selection-change' },
            { type: 'datum-active' },
          ],
        },
      },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          counts: { brush: 0 },
          parts: { bar: [{ 'data-dimmed': null }, { 'data-dimmed': null }, { 'data-dimmed': null }] },
          events: [{ type: 'brush-selection-change', detail: { selection: null, data: [] } }, { type: 'datum-active', detail: null }],
        },
      },
    ],
  },
  {
    name: '键盘缩放：绘图区里按 + 以聚焦的数据为中心放大，按 − 缩回整条轴，两次都派发 window-change',
    spec: { apg: APG },
    covers: ['cartesian-chart.kbd.zoom-in', 'cartesian-chart.kbd.zoom-out'],
    props: { zoom: 'x' },
    initial: { parts: { plot: { 'data-touch-axis': 'horizontal', 'data-zoomed': null } } },
    steps: [
      { kind: 'focus', part: bar('online', 0), via: 'keyboard' },
      { kind: 'key', key: '+', expect: { parts: { plot: { 'data-zoomed': '' } }, events: [{ type: 'window-change' }] } },
      {
        kind: 'key',
        key: '-',
        expect: {
          parts: { plot: { 'data-zoomed': null } },
          events: [{ type: 'window-change', detail: { window: { x: null, y: null } } }],
        },
      },
    ],
  },
  {
    name: '缩放条：两端的手柄是 slider，读出窗口两端对着的类目；方向键移动一端并派发 window-change',
    spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/' },
    covers: ['cartesian-chart.kbd.zoom-edge'],
    props: { zoom: 'x', defaultWindow: { x: ['一月', '二月'] } },
    initial: {
      counts: { 'bar': 4, 'zoom-handle': 2 },
      parts: {
        'zoom-slider': { 'role': 'group', 'aria-label': 'Zoom', 'hidden': null },
        'zoom-handle': [
          { 'role': 'slider', 'data-placement': 'start', 'aria-valuenow': '0', 'aria-valuetext': '一月', 'aria-label': 'Window start' },
          { 'role': 'slider', 'data-placement': 'end', 'aria-valuenow': '67', 'aria-valuetext': '二月', 'aria-label': 'Window end' },
        ],
      },
    },
    steps: [
      { kind: 'focus', part: 'zoom-handle[1]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'End',
        expect: {
          parts: { 'zoom-handle': [{ 'aria-valuenow': '0' }, { 'aria-valuenow': '100', 'aria-valuetext': '三月' }] },
          events: [{ type: 'window-change', detail: { window: { x: null, y: null } } }],
        },
      },
      { kind: 'settle', until: { attr: { part: 'zoom-handle[1]', name: 'aria-valuenow', value: '100' } }, expect: { counts: { bar: 6 } } },
    ],
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
      { part: 'zoom-slider' },
      { part: 'tooltip' },
    ],
  },
  cases: cases.map(c => ({ environment: chartEnvironment('cartesian-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
