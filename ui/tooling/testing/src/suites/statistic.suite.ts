import type { ConformanceSuite } from '../conformance/types'
import { statisticAnatomy, statisticKeyboard } from '@xihan-ui/headless'

// 一块统计数是纯展示，APG 没有对应模式；判据只锁「两个轴如实落到根上、各段拿得到自己的身份、组件不额外插语义」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const statisticSuite: ConformanceSuite = {
  component: 'statistic',
  anatomy: statisticAnatomy,
  keyboard: statisticKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', tag: 'span', text: '本月新增用户' },
      { part: 'prefix', tag: 'span', text: '↑' },
      { part: 'value', tag: 'span', text: '12,480' },
      { part: 'suffix', tag: 'span', text: '人' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，两个轴一律不输出，各段也不带 role',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-size': null,
            'data-tone': null,
          },
          // 标签与数值只是文本，不占标题层级、不互相引用
          label: { 'role': null, 'aria-labelledby': null },
          value: { 'role': null, 'aria-labelledby': null },
        },
      },
    },
    {
      name: 'size：接线到 data-size，语义不变',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'data-size': 'lg', 'role': null },
        },
      },
    },
    {
      name: '语气只落在根上，子部件不重复标注',
      spec: { apg: APG },
      props: { tone: 'success' },
      initial: {
        parts: {
          root: { 'data-tone': 'success' },
          value: { 'data-tone': null },
          prefix: { 'data-tone': null },
          suffix: { 'data-tone': null },
        },
      },
    },
    {
      name: '前后缀是数值的一部分，不对读屏隐藏',
      spec: { apg: APG },
      initial: {
        parts: {
          prefix: { 'aria-hidden': null, 'role': null },
          suffix: { 'aria-hidden': null, 'role': null },
        },
      },
    },
    {
      name: '数字由涨转跌：语气由 success 改成 danger，根上当场跟着换',
      spec: { apg: APG },
      props: { tone: 'success' },
      initial: {
        parts: { root: { 'data-tone': 'success' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { tone: 'danger' },
          expect: {
            parts: { root: { 'data-tone': 'danger' } },
          },
        },
      ],
    },
    {
      name: '各段各一份，按标签 / 前缀 / 数值 / 后缀的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'label', 'prefix', 'value', 'suffix'],
        counts: { root: 1, label: 1, prefix: 1, value: 1, suffix: 1 },
      },
    },
  ],
}
