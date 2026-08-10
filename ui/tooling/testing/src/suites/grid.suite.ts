import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { gridAnatomy, gridKeyboard } from '@xihan-ui/headless'

// 排版容器，APG 没有对应模式；判据只锁「四个排版参数如实落到根上、每一格自报的占位落到自己身上」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const gridSuite: ConformanceSuite = {
  component: 'grid',
  anatomy: gridAnatomy,
  keyboard: gridKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'item', text: '甲' },
      { part: 'item', text: '乙' },
      { part: 'item', text: '丙' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，列数落 1，其余排版参数一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': {
            'role': null,
            'data-cols': '1',
            'data-gap': null,
            'data-align': null,
            'data-justify': null,
          },
          'item[0]': {
            'role': null,
            'data-span': null,
            'data-offset': null,
          },
        },
      },
    },
    {
      name: '列数与间距档位如实落到根上，换算成哪个令牌归皮肤',
      spec: { apg: APG },
      props: { cols: 3, gap: 'lg' },
      initial: {
        parts: {
          root: {
            'data-cols': '3',
            'data-gap': 'lg',
          },
        },
      },
    },
    {
      name: '两条对齐轴如实落到根上',
      spec: { apg: APG },
      props: { align: 'center', justify: 'end' },
      initial: {
        parts: {
          root: {
            'data-align': 'center',
            'data-justify': 'end',
          },
        },
      },
    },
    {
      name: '跨列与错列由每一格自报，落在自己身上、不落到根上',
      spec: { apg: APG },
      props: { cols: 4 },
      fixture: (base): FixtureNode => ({
        ...base,
        children: [
          { part: 'item', attrs: { span: '2' }, text: '甲' },
          { part: 'item', attrs: { offset: '1' }, text: '乙' },
          { part: 'item', text: '丙' },
        ],
      }),
      initial: {
        parts: {
          'root': {
            'data-cols': '4',
            'data-span': null,
            'data-offset': null,
          },
          'item[0]': {
            'data-span': '2',
            'data-offset': null,
          },
          'item[1]': {
            'data-span': null,
            'data-offset': '1',
          },
          'item[2]': {
            'data-span': null,
            'data-offset': null,
          },
        },
      },
    },
    {
      name: '一个根带三格，按文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'item[2]'],
        counts: { root: 1, item: 3 },
      },
    },
  ],
}
