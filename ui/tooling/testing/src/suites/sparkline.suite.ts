import type { ConformanceCase, ConformanceSuite } from '../conformance/types'
import { sparklineAnatomy, sparklineKeyboard } from '@xihan-ui/headless'
import { chartEnvironment } from './shared/chart-environment'

// 迷你图是一幅图像，APG 里对应的是「命名与描述」那一节：可及名由作者写，描述指向自动摘要；
// 不可聚焦、不接按键。判据锁住三端生成同一副图形与同一段摘要。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'

// 用例看静止时的 DOM 契约：过渡关掉
const PROPS = { data: [3, 5, 4, 8, 6, 9], locale: 'en-US', animated: false } as const

const cases: readonly ConformanceCase[] = [
  {
    name: '初始：根是 role="img"，描述指向摘要；缺省形态 line、语气 neutral，画一条折线与末点',
    spec: { apg: APG },
    initial: {
      order: ['root', 'summary', 'line', 'dot'],
      counts: { 'summary': 1, 'line': 1, 'dot': 1, 'area-fill': 0, 'bar': 0, 'band': 0 },
      parts: {
        root: { 'role': 'img', 'aria-label': '周销量', 'data-variant': 'line', 'data-tone': 'neutral', 'tabindex': null },
        dot: { 'data-marker': 'last' },
      },
    },
  },
  {
    name: 'area：折线下铺一层面积；extremes 另标最高与最低点',
    spec: { adr: 'chart-variant' },
    props: { variant: 'area', markers: 'extremes', data: [3, 9, 4, 1, 6] },
    initial: {
      counts: { 'area-fill': 1, 'line': 1, 'dot': 3 },
      parts: { dot: [{ 'data-marker': 'last' }, { 'data-marker': 'max' }, { 'data-marker': 'min' }] },
    },
  },
  {
    name: 'bar：一个值一根柱，末点那根带强调；写了参考带就多画一条底',
    spec: { adr: 'chart-variant' },
    props: { variant: 'bar', band: [4, 7] },
    initial: {
      counts: { band: 1, bar: 6, line: 0, dot: 0 },
      parts: {
        bar: [
          { 'data-marker': null },
          { 'data-marker': null },
          { 'data-marker': null },
          { 'data-marker': null },
          { 'data-marker': null },
          { 'data-marker': 'last' },
        ],
      },
    },
  },
  {
    name: 'win-loss：只看正负，0 不画；正负各带涨跌',
    spec: { adr: 'chart-variant' },
    props: { variant: 'win-loss', data: [2, -1, 0, 3], markers: 'none' },
    initial: {
      counts: { bar: 3 },
      parts: { bar: [{ 'data-trend': 'rise' }, { 'data-trend': 'fall' }, { 'data-trend': 'rise' }] },
    },
  },
  {
    name: '语气：写在根上，整条取语气色',
    spec: { adr: 'chart-variant' },
    props: { tone: 'danger' },
    initial: { parts: { root: { 'data-tone': 'danger' } } },
  },
  {
    name: '数据更新：图形按新数据重画，摘要随之改写',
    spec: { adr: 'chart-transition' },
    steps: [
      { kind: 'setProps', props: { data: [] } },
      { kind: 'settle', until: { attr: { part: 'root', name: 'data-state', value: 'empty' } }, expect: { counts: { line: 0, dot: 0 } } },
      { kind: 'setProps', props: { data: [1, 2] } },
      { kind: 'settle', until: { attr: { part: 'root', name: 'data-state', value: null } }, expect: { counts: { line: 1, dot: 1 } } },
    ],
  },
  {
    name: '没有数据：根上 data-state="empty"，不画图形',
    spec: { adr: 'chart-empty' },
    props: { data: [] },
    initial: {
      counts: { line: 0, dot: 0, summary: 1 },
      parts: { root: { 'data-state': 'empty' } },
    },
  },
]

export const sparklineSuite: ConformanceSuite = {
  component: 'sparkline',
  anatomy: sparklineAnatomy,
  keyboard: sparklineKeyboard,
  defaultProps: PROPS,
  fixture: { part: 'root', tag: 'svg', attrs: { 'aria-label': '周销量' } },
  cases: cases.map(c => ({ environment: chartEnvironment('sparkline', { part: 'root', width: 96, height: 20 }), ...c, props: { ...PROPS, ...c.props } })),
}
