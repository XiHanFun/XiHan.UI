import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { sankeyChartAnatomy, sankeyChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const GRAPHICS = 'https://www.w3.org/TR/graphics-aria-1.0/'

/**
 * 四列：[Search, Ads] → [Home] → [Detail] → [Order, Leave]；三个分组各两个节点。
 * 绘图区里流带在前（link[0–6]，按数据次序），节点在后（node[0–5]，按节点数据的次序）。
 */
const NODES = [
  { id: 'search', name: 'Search', group: 'Channel' },
  { id: 'ads', name: 'Ads', group: 'Channel' },
  { id: 'home', name: 'Home', group: 'Page' },
  { id: 'detail', name: 'Detail', group: 'Page' },
  { id: 'order', name: 'Order', group: 'Outcome' },
  { id: 'leave', name: 'Leave', group: 'Outcome' },
] as const

const LINKS = [
  { source: 'search', target: 'home', value: 300 },
  { source: 'ads', target: 'home', value: 200 },
  { source: 'ads', target: 'detail', value: 100 },
  { source: 'home', target: 'detail', value: 350 },
  { source: 'home', target: 'leave', value: 150 },
  { source: 'detail', target: 'order', value: 250 },
  { source: 'detail', target: 'leave', value: 200 },
] as const

// 用例看静止时的 DOM 契约：过渡关掉
const PROPS = { nodes: NODES, links: LINKS, locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 graphics-document，节点是带可及名的 graphics-symbol，流带对读屏隐藏；三组时显示图例',
    spec: { apg: GRAPHICS },
    initial: {
      counts: { 'legend-item': 3, 'link': 7, 'node': 6, 'gradient': 0, 'tooltip': 1, 'summary': 1, 'table-region': 1, 'table': 1 },
      parts: {
        'plot': { 'role': 'graphics-document', 'aria-roledescription': 'chart' },
        'legend': { 'role': 'toolbar', 'aria-label': 'Legend', 'hidden': null },
        'legend-item': [
          { 'aria-pressed': 'true', 'tabindex': '0', 'data-value': 'Channel' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': 'Page' },
          { 'aria-pressed': 'true', 'tabindex': '-1', 'data-value': 'Outcome' },
        ],
        'link': [{ 'aria-hidden': 'true', 'role': null, 'tabindex': null }],
        'node': [
          { 'role': 'graphics-symbol', 'aria-label': 'Search, 300', 'tabindex': '0' },
          { 'role': 'graphics-symbol', 'aria-label': 'Ads, 300', 'tabindex': '-1' },
          { 'role': 'graphics-symbol', 'aria-label': 'Home, 500', 'tabindex': '-1' },
        ],
        'tooltip': { 'aria-hidden': 'true', 'data-state': 'hidden' },
        'empty': { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在第一列最上面的节点',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.tab'],
    steps: [
      singleTabStop('sankey-chart', 'node', 'plot'),
      {
        kind: 'focus',
        part: 'node[0]',
        via: 'keyboard',
        expect: {
          activeElement: { part: 'node[0]', exact: true },
          parts: { tooltip: { 'data-state': 'visible' } },
        },
      },
    ],
  },
  {
    name: 'ArrowDown / ArrowUp 在同一列里走',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.next', 'sankey-chart.kbd.prev'],
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowDown',
        expect: {
          activeElement: { part: 'node[1]', exact: true },
          parts: { node: [{ tabindex: '-1' }, { tabindex: '0' }] },
        },
      },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'node[0]', exact: true } } },
    ],
  },
  {
    name: 'ArrowRight / ArrowLeft 沿流向跨列，取流量最大的相连节点',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.downstream', 'sankey-chart.kbd.upstream'],
    steps: [
      { kind: 'focus', part: 'node[1]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'node[2]', exact: true } } },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'node[3]', exact: true } } },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'node[4]', exact: true } } },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'node[3]', exact: true } } },
    ],
  },
  {
    name: 'Home / End：第一列与最后一列里位置最近的节点',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.first', 'sankey-chart.kbd.last'],
    steps: [
      { kind: 'focus', part: 'node[2]', via: 'keyboard' },
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'node[4]', exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'node[0]', exact: true } } },
    ],
  },
  {
    name: 'Enter / Space：报告聚焦的节点',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: 'node[3]', via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.dismiss'],
    steps: [
      { kind: 'focus', part: 'node[2]', via: 'keyboard', expect: { parts: { tooltip: { 'data-state': 'visible' } } } },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          activeElement: { part: 'node[2]', exact: true },
          parts: { tooltip: { 'data-state': 'hidden' } },
        },
      },
    ],
  },
  {
    name: '图例：左右键在项之间移动，点击切换一组的显隐，那一组的节点与连着它们的流带不画',
    spec: { apg: APG },
    covers: ['sankey-chart.kbd.legend-move', 'sankey-chart.kbd.legend-toggle'],
    steps: [
      { kind: 'focus', part: 'legend-item[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'legend-item[1]', exact: true } } },
      {
        kind: 'click',
        part: 'legend-item[2]',
        expect: {
          counts: { node: 4, link: 4 },
          parts: { 'legend-item': [{ 'aria-pressed': 'true' }, { 'aria-pressed': 'true' }, { 'aria-pressed': 'false' }] },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['Outcome'] } }],
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
          counts: { node: 6 },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['Channel'] } }],
        },
      },
      { kind: 'setProps', props: { hiddenSeries: ['Channel'] } },
      {
        kind: 'settle',
        until: { attr: { part: 'legend-item[0]', name: 'aria-pressed', value: 'false' } },
        expect: { counts: { node: 4, link: 4 } },
      },
    ],
  },
  {
    name: '受控 activeKey：别的图联动过来的节点点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: 'home' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: 'orientation="vertical"：左右键在一行里走、上下键跨行',
    spec: { adr: 'chart-variant' },
    props: { orientation: 'vertical' },
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'node[1]', exact: true } } },
      { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'node[2]', exact: true } } },
    ],
  },
  {
    name: 'linkColor="gradient"：每条流带一个渐变，两端各一个色标',
    spec: { adr: 'chart-variant' },
    props: { linkColor: 'gradient' },
    initial: {
      counts: { 'gradient': 7, 'gradient-stop': 14 },
      // 色标的色槽与偏移不进快照（适配器噪音之外只采结构属性）：看流带挂上了渐变
      parts: { link: [{ 'data-gradient': '' }] },
    },
  },
  {
    name: '没有流带：空态显示，绘图区没有节点',
    spec: { adr: 'chart-empty' },
    props: { links: [] },
    initial: {
      counts: { node: 0, link: 0 },
      parts: { empty: { hidden: null } },
    },
  },
]

export const sankeyChartSuite: ConformanceSuite = {
  component: 'sankey-chart',
  anatomy: sankeyChartAnatomy,
  keyboard: sankeyChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: 'Visitor flow' },
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
  cases: cases.map(c => ({ environment: chartEnvironment('sankey-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
