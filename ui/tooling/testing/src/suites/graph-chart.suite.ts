import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { graphChartAnatomy, graphChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/'
const GRAPHICS = 'https://www.w3.org/TR/graphics-aria-1.0/'

/**
 * 三组：Core 三角形 Alpha–Beta–Gamma，Edge 一对 Delta–Epsilon，Leaf 一个 Zeta；Gamma–Delta、Epsilon–Zeta 把它们串起来。
 * 节点在 DOM 里按阅读序（分组再名字）：node[0–5] 依次是 Alpha、Beta、Gamma、Delta、Epsilon、Zeta。
 * 环形布局自 12 点顺时针排开，组间留空当：Alpha 在正上方，Gamma 在右边，Zeta 在左边。
 */
const NODES = [
  { id: 'a', name: 'Alpha', group: 'Core' },
  { id: 'b', name: 'Beta', group: 'Core' },
  { id: 'c', name: 'Gamma', group: 'Core' },
  { id: 'd', name: 'Delta', group: 'Edge' },
  { id: 'e', name: 'Epsilon', group: 'Edge' },
  { id: 'f', name: 'Zeta', group: 'Leaf' },
] as const

const LINKS = [
  { source: 'a', target: 'b' },
  { source: 'a', target: 'c' },
  { source: 'b', target: 'c' },
  { source: 'c', target: 'd' },
  { source: 'd', target: 'e' },
  { source: 'e', target: 'f' },
] as const

// 用例看静止时的 DOM 契约：过渡关掉；环形布局的位置只看阅读序，三端逐字一致
const PROPS = { nodes: NODES, links: LINKS, layout: 'circular', locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 graphics-document，节点是带可及名的 graphics-symbol，连线对读屏隐藏；三组时显示图例',
    spec: { apg: GRAPHICS },
    initial: {
      counts: { 'legend-item': 3, 'link': 6, 'arrow': 0, 'node': 6, 'tooltip': 1, 'summary': 1, 'table': 1 },
      parts: {
        plot: { 'role': 'graphics-document', 'aria-roledescription': 'chart' },
        legend: { 'role': 'toolbar', 'aria-label': 'Legend', 'hidden': null },
        link: [{ 'aria-hidden': 'true', 'role': null, 'tabindex': null }],
        node: [
          { 'role': 'graphics-symbol', 'aria-label': 'Alpha, 2 links', 'tabindex': '0' },
          { 'role': 'graphics-symbol', 'aria-label': 'Beta, 2 links', 'tabindex': '-1' },
          { 'role': 'graphics-symbol', 'aria-label': 'Gamma, 3 links', 'tabindex': '-1' },
        ],
        tooltip: { 'aria-hidden': 'true', 'data-state': 'hidden' },
        empty: { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在阅读序的第一个节点',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.tab'],
    steps: [
      singleTabStop('graph-chart', 'node', 'plot'),
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
    name: '方向键朝那个方向 45° 锥形里找最近的节点',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.move'],
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'ArrowRight',
        expect: {
          activeElement: { part: 'node[1]', exact: true },
          parts: { node: [{ tabindex: '-1' }, { tabindex: '0' }] },
        },
      },
      { kind: 'focus', part: 'node[2]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'node[5]', exact: true } } },
    ],
  },
  {
    name: 'Home / End：阅读序的头尾',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.first', 'graph-chart.kbd.last'],
    steps: [
      { kind: 'focus', part: 'node[2]', via: 'keyboard' },
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'node[5]', exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'node[0]', exact: true } } },
    ],
  },
  {
    name: 'Enter / Space：报告聚焦的节点',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: 'node[3]', via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'zoom 开着：+ 放大一档，0 回到原样',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.zoom'],
    props: { zoom: true },
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      { kind: 'key', key: '+', expect: { parts: { plot: { 'data-zoomed': '' } } } },
      { kind: 'key', key: '0', expect: { parts: { plot: { 'data-zoomed': null } } } },
    ],
  },
  {
    name: '受控 view：缩放只派发 view-change，宿主写回后才放大',
    spec: { adr: 'controlled-uncontrolled' },
    props: { zoom: true, view: { k: 1, x: 0, y: 0 } },
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      { kind: 'key', key: '+', expect: { parts: { plot: { 'data-zoomed': null } }, events: [{ type: 'view-change' }] } },
      { kind: 'setProps', props: { view: { k: 1.25, x: 0, y: 0 } } },
      { kind: 'settle', until: { attr: { part: 'plot', name: 'data-zoomed', value: '' } } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.dismiss'],
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
    name: '图例：左右键在项之间移动，点击切换一组的显隐，那一组的节点与连着它们的线不画',
    spec: { apg: APG },
    covers: ['graph-chart.kbd.legend-move', 'graph-chart.kbd.legend-toggle'],
    steps: [
      { kind: 'focus', part: 'legend-item[0]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'legend-item[1]', exact: true } } },
      {
        kind: 'click',
        part: 'legend-item[1]',
        expect: {
          counts: { node: 4, link: 3 },
          parts: { 'legend-item': [{ 'aria-pressed': 'true' }, { 'aria-pressed': 'false' }, { 'aria-pressed': 'true' }] },
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['Edge'] } }],
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
          events: [{ type: 'hidden-series-change', detail: { hiddenSeries: ['Core'] } }],
        },
      },
      { kind: 'setProps', props: { hiddenSeries: ['Core'] } },
      {
        kind: 'settle',
        until: { attr: { part: 'legend-item[0]', name: 'aria-pressed', value: 'false' } },
        expect: { counts: { node: 3, link: 2 } },
      },
    ],
  },
  {
    name: '受控 activeKey：别的图联动过来的节点点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: 'c' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: 'directed：每条线一个箭头',
    spec: { adr: 'chart-variant' },
    props: { directed: true },
    initial: { counts: { link: 6, arrow: 6 }, parts: { arrow: [{ 'aria-hidden': 'true' }] } },
  },
  {
    name: 'layout="tree"：从没有入边的节点组树，节点按深度优先的先序排列',
    spec: { adr: 'chart-variant' },
    props: {
      layout: 'tree',
      nodes: [{ id: 'r', name: 'Root' }, { id: 'x', name: 'X' }, { id: 'y', name: 'Y' }, { id: 'x1', name: 'X1' }],
      links: [{ source: 'r', target: 'x' }, { source: 'r', target: 'y' }, { source: 'x', target: 'x1' }],
    },
    initial: {
      counts: { 'node': 4, 'link': 3, 'legend-item': 0 },
      parts: { node: [{ 'aria-label': 'Root, 2 links' }, { 'aria-label': 'X, 2 links' }, { 'aria-label': 'X1, 1 link' }, { 'aria-label': 'Y, 1 link' }] },
    },
  },
  {
    name: 'layout="preset"：按节点上的坐标摆放；连线上的字对读屏隐藏，数据表多一列',
    spec: { adr: 'chart-variant' },
    props: {
      layout: 'preset',
      nodes: [{ id: 'a', name: 'Alpha', x: 0, y: 0 }, { id: 'b', name: 'Beta', x: 100, y: 0 }],
      links: [{ source: 'a', target: 'b', label: 'owns' }],
    },
    initial: {
      counts: { 'node': 2, 'link': 1, 'link-label': 1 },
      parts: { 'link-label': [{ 'aria-hidden': 'true' }] },
    },
  },
  {
    name: '没有节点：空态显示，绘图区没有节点',
    spec: { adr: 'chart-empty' },
    props: { nodes: [], links: [] },
    initial: {
      counts: { node: 0, link: 0 },
      parts: { empty: { hidden: null } },
    },
  },
]

export const graphChartSuite: ConformanceSuite = {
  component: 'graph-chart',
  anatomy: graphChartAnatomy,
  keyboard: graphChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: 'Service map' },
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
  cases: cases.map(c => ({ environment: chartEnvironment('graph-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
