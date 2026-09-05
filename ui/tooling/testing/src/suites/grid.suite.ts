import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { gridAnatomy, gridKeyboard } from '@xihan-ui/headless'

// 排版容器，APG 没有对应模式；判据只锁「四个排版参数如实落到根上（列数还可逐档写成断点属性）、
// 每一格自报的占位落到自己身上」。哪一档在多宽的视口上接管由皮肤定，不在这里断言。
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
            'data-cols-sm': null,
            'data-cols-md': null,
            'data-cols-lg': null,
            'data-cols-xl': null,
            'data-gap': null,
            'data-align': null,
            'data-justify-items': null,
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
      name: '列数给整数：只落 data-cols，一个断点档都不输出',
      spec: { apg: APG },
      props: { cols: 3 },
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'item[2]'],
        counts: { root: 1, item: 3 },
        parts: {
          root: {
            'data-cols': '3',
            'data-cols-sm': null,
            'data-cols-md': null,
            'data-cols-lg': null,
            'data-cols-xl': null,
          },
        },
      },
    },
    {
      name: '列数给断点对象：base 落 data-cols，写了的档逐档落，没写的档不输出',
      spec: { apg: APG },
      props: { cols: { base: 1, md: 2, xl: 4 } },
      initial: {
        order: ['root', 'item[0]', 'item[1]', 'item[2]'],
        counts: { root: 1, item: 3 },
        parts: {
          'root': {
            'data-cols': '1',
            'data-cols-sm': null,
            'data-cols-md': '2',
            'data-cols-lg': null,
            'data-cols-xl': '4',
          },
          // 逐档的列数是根一层的事，不落到格子上
          'item[0]': {
            'data-cols': null,
            'data-cols-md': null,
          },
        },
      },
    },
    {
      name: '列数给断点对象但不写 base：base 仍按一列，其余各档如实落',
      spec: { apg: APG },
      props: { cols: { sm: 2, lg: 3 } },
      initial: {
        parts: {
          root: {
            'data-cols': '1',
            'data-cols-sm': '2',
            'data-cols-md': null,
            'data-cols-lg': '3',
            'data-cols-xl': null,
          },
        },
      },
    },
    {
      name: '两条对齐轴如实落到根上',
      spec: { apg: APG },
      props: { align: 'center', justifyItems: 'end' },
      initial: {
        parts: {
          root: {
            'data-align': 'center',
            'data-justify-items': 'end',
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
      name: '列数越界按没写算：超过 12、0、负数、小数都落回一列，断点档同理不输出',
      spec: { apg: APG },
      props: { cols: { base: 16, sm: 0, md: -2, lg: 2.5, xl: 12 } },
      initial: {
        parts: {
          root: {
            'data-cols': '1',
            'data-cols-sm': null,
            'data-cols-md': null,
            'data-cols-lg': null,
            'data-cols-xl': '12',
          },
        },
      },
    },
    {
      name: '跨列与错列越界按没写算：span 收 1 至 12、offset 收 1 至 11，出界即不输出',
      spec: { apg: APG },
      props: { cols: 4 },
      fixture: (base): FixtureNode => ({
        ...base,
        children: [
          { part: 'item', attrs: { span: '13' }, text: '甲' },
          { part: 'item', attrs: { offset: '12' }, text: '乙' },
          { part: 'item', attrs: { span: '0', offset: '-1' }, text: '丙' },
        ],
      }),
      initial: {
        parts: {
          'item[0]': { 'data-span': null },
          'item[1]': { 'data-offset': null },
          'item[2]': { 'data-span': null, 'data-offset': null },
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
