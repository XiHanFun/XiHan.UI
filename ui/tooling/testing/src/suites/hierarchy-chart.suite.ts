import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { hierarchyChartAnatomy, hierarchyChartKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'
import { singleTabStop } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/'

/**
 * 三个大区、五个城市。兄弟按值从大到小排：South 100、East 80、North 20。
 * 节点在绘图区里浅层在前、同层按先根次序：South、East、North、Shenzhen、Guangzhou、Shanghai、Hangzhou、Beijing。
 */
const DATA = {
  name: 'All',
  children: [
    { name: 'East', children: [{ name: 'Shanghai', value: 50 }, { name: 'Hangzhou', value: 30 }] },
    { name: 'South', children: [{ name: 'Guangzhou', value: 40 }, { name: 'Shenzhen', value: 60 }] },
    { name: 'North', children: [{ name: 'Beijing', value: 20 }] },
  ],
} as const

// 用例看静止时的 DOM 契约：过渡关掉。旭日图的兄弟次序只看数据，不看几何
const PROPS = { data: DATA, layout: 'sunburst', locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：绘图区是 tree，节点是带层级、组内位置与展开态的 treeitem；还在最顶层时路径收起',
    spec: { apg: APG },
    initial: {
      counts: { 'node': 8, 'path-item': 1, 'tooltip': 1, 'summary': 1, 'table-region': 1, 'table': 1 },
      parts: {
        plot: { 'role': 'tree', 'aria-roledescription': 'tree chart' },
        node: [
          { 'role': 'treeitem', 'aria-label': 'South, 100, 50.0% of All', 'aria-level': '1', 'aria-setsize': '3', 'aria-posinset': '1', 'aria-expanded': 'true', 'tabindex': '0' },
          { 'aria-label': 'East, 80, 40.0% of All', 'aria-posinset': '2', 'tabindex': '-1' },
          { 'aria-label': 'North, 20, 10.0% of All', 'aria-posinset': '3' },
          { 'aria-label': 'Shenzhen, 60, 60.0% of South', 'aria-level': '2', 'aria-setsize': '2', 'aria-posinset': '1', 'aria-expanded': null },
        ],
        path: { hidden: '' },
        legend: { 'hidden': '', 'aria-hidden': 'true' },
        tooltip: { 'aria-hidden': 'true', 'data-state': 'hidden' },
        empty: { hidden: '' },
      },
    },
  },
  {
    name: 'Tab：绘图区只占一个 Tab 位，落在第一层最大的节点',
    spec: { apg: APG },
    covers: ['hierarchy-chart.kbd.tab'],
    steps: [
      singleTabStop('hierarchy-chart', 'node', 'plot'),
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
    name: 'ArrowRight / ArrowLeft 同一层的下一个 / 上一个兄弟，Home / End 到头尾',
    spec: { apg: APG },
    covers: ['hierarchy-chart.kbd.next', 'hierarchy-chart.kbd.prev', 'hierarchy-chart.kbd.first', 'hierarchy-chart.kbd.last'],
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
      { kind: 'key', key: 'End', expect: { activeElement: { part: 'node[2]', exact: true } } },
      { kind: 'key', key: 'Home', expect: { activeElement: { part: 'node[0]', exact: true } } },
      { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'node[0]', exact: true } } },
    ],
  },
  {
    name: 'ArrowDown 进入第一个子节点，ArrowUp 回到父节点',
    spec: { apg: APG },
    covers: ['hierarchy-chart.kbd.child', 'hierarchy-chart.kbd.parent'],
    steps: [
      { kind: 'focus', part: 'node[1]', via: 'keyboard' },
      { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'node[5]', exact: true } } },
      { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'node[6]', exact: true } } },
      { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'node[1]', exact: true } } },
    ],
  },
  {
    name: 'Enter 下钻：路径展开，焦点落到第一个子节点；Backspace 上钻，焦点落回刚才的根',
    spec: { apg: APG },
    covers: ['hierarchy-chart.kbd.drill', 'hierarchy-chart.kbd.up'],
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      {
        kind: 'key',
        key: 'Enter',
        expect: {
          activeElement: { part: 'node[0]', exact: true },
          counts: { 'node': 2, 'path-item': 2 },
          parts: {
            'node': [{ 'aria-label': 'Shenzhen, 60, 60.0% of South', 'aria-level': '1' }],
            'path': { hidden: null },
            'path-item': [{ 'aria-current': null }, { 'aria-current': 'location', 'aria-disabled': 'true' }],
          },
        },
      },
      {
        kind: 'key',
        key: 'Backspace',
        expect: {
          activeElement: { part: 'node[0]', exact: true },
          counts: { 'node': 8, 'path-item': 1 },
          parts: { node: [{ 'aria-label': 'South, 100, 50.0% of All' }] },
        },
      },
    ],
  },
  {
    name: 'Space 报告聚焦的节点；叶子上的 Enter 同样报告按下',
    spec: { apg: APG },
    covers: ['hierarchy-chart.kbd.press'],
    steps: [
      { kind: 'focus', part: 'node[1]', via: 'keyboard' },
      { kind: 'key', key: 'Space', expect: { events: [{ type: 'datum-press' }] } },
      { kind: 'focus', part: 'node[7]', via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { counts: { node: 8 }, events: [{ type: 'datum-press' }] } },
    ],
  },
  {
    name: 'Escape：收起提示框，焦点留在原处',
    spec: { apg: APG },
    covers: ['hierarchy-chart.kbd.dismiss'],
    steps: [
      { kind: 'focus', part: 'node[1]', via: 'keyboard', expect: { parts: { tooltip: { 'data-state': 'visible' } } } },
      {
        kind: 'key',
        key: 'Escape',
        expect: {
          activeElement: { part: 'node[1]', exact: true },
          parts: { tooltip: { 'data-state': 'hidden' } },
        },
      },
    ],
  },
  {
    name: '点路径上层的项回到那一层，报 root-key-change',
    spec: { adr: 'controlled-uncontrolled' },
    props: { defaultRootKey: 'East' },
    initial: { counts: { 'node': 2, 'path-item': 2 } },
    steps: [
      {
        kind: 'click',
        part: 'path-item[0]',
        expect: {
          counts: { 'node': 8, 'path-item': 1 },
          events: [{ type: 'root-key-change', detail: { rootKey: null } }],
        },
      },
    ],
  },
  {
    name: '受控 rootKey：点路径只派发事件，宿主写回后才换根',
    spec: { adr: 'controlled-uncontrolled' },
    props: { rootKey: 'South' },
    steps: [
      {
        kind: 'click',
        part: 'path-item[0]',
        expect: {
          counts: { node: 2 },
          events: [{ type: 'root-key-change', detail: { rootKey: null } }],
        },
      },
      // Web Components 的属性写不出受控的 null（摘掉属性是「没给」）：宿主写回另一个节点
      { kind: 'setProps', props: { rootKey: 'East' } },
      {
        kind: 'settle',
        until: { attr: { part: 'node[0]', name: 'aria-label', value: 'Shanghai, 50, 62.5% of East' } },
        expect: { counts: { node: 2 } },
      },
    ],
  },
  {
    name: '受控 activeKey：别的图联动过来的节点点亮提示框，不回派 datum-active',
    spec: { adr: 'controlled-uncontrolled' },
    props: { activeKey: null },
    steps: [
      { kind: 'setProps', props: { activeKey: 'East' } },
      {
        kind: 'settle',
        until: { attr: { part: 'tooltip', name: 'data-state', value: 'visible' } },
        expect: { events: [] },
      },
    ],
  },
  {
    name: 'colorBy="value"：图例每个看得见的层一条色阶，下钻后跟着换',
    spec: { adr: 'chart-variant' },
    props: { colorBy: 'value' },
    initial: {
      counts: { 'legend-scale': 2, 'legend-scale-bar': 2 },
      parts: {
        'legend': { 'hidden': null, 'aria-hidden': 'true' },
        'legend-scale': [{ 'data-level': '1' }, { 'data-level': '2' }],
        'legend-scale-value': [{ 'data-edge': 'min' }, { 'data-edge': 'max' }],
      },
    },
    steps: [
      { kind: 'focus', part: 'node[0]', via: 'keyboard' },
      { kind: 'key', key: 'Enter', expect: { counts: { 'legend-scale': 1 }, parts: { 'legend-scale': [{ 'data-level': '1' }] } } },
    ],
  },
  {
    name: 'depth=1：只看得见第一层，有子节点的节点是收起的',
    spec: { adr: 'chart-variant' },
    props: { depth: 1 },
    initial: {
      counts: { node: 3 },
      parts: { node: [{ 'aria-expanded': 'false' }] },
    },
  },
  {
    name: '没有数据：空态显示，绘图区没有节点',
    spec: { adr: 'chart-empty' },
    props: { data: [] },
    initial: {
      counts: { node: 0 },
      parts: { empty: { hidden: null } },
    },
  },
]

export const hierarchyChartSuite: ConformanceSuite = {
  component: 'hierarchy-chart',
  anatomy: hierarchyChartAnatomy,
  keyboard: hierarchyChartKeyboard,
  defaultProps: PROPS,
  fixture: {
    part: 'root',
    tag: 'figure',
    children: [
      { part: 'caption', tag: 'figcaption', text: 'Sales by region' },
      { part: 'path', tag: 'nav' },
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
  cases: cases.map(c => ({ environment: chartEnvironment('hierarchy-chart'), ...c, props: { ...PROPS, ...c.props } })),
}
