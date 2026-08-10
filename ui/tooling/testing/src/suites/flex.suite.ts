import type { ConformanceSuite } from '../conformance/types'
import { flexAnatomy, flexKeyboard } from '@xihan-ui/headless'

// 排版容器，APG 没有对应模式；判据只锁「六个排版参数如实落到根上、根上不多写语义」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const flexSuite: ConformanceSuite = {
  component: 'flex',
  anatomy: flexAnatomy,
  keyboard: flexKeyboard,
  fixture: {
    part: 'root',
    tag: 'div',
    children: [
      { tag: 'span', text: '甲' },
      { tag: 'span', text: '乙' },
      { tag: 'span', text: '丙' },
    ],
  },
  cases: [
    {
      name: '缺省：方向落 row，其余排版参数一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-direction': 'row',
            'data-align': null,
            'data-justify': null,
            'data-gap': null,
            'data-wrap': null,
            'data-inline': null,
          },
        },
      },
    },
    {
      name: '方向与两条对齐轴如实落到根上',
      spec: { apg: APG },
      props: { direction: 'column', align: 'center', justify: 'between' },
      initial: {
        parts: {
          root: {
            'data-direction': 'column',
            'data-align': 'center',
            'data-justify': 'between',
          },
        },
      },
    },
    {
      name: '间距按档位名原样落出，换算成哪个令牌归皮肤',
      spec: { apg: APG },
      props: { gap: 'lg' },
      initial: {
        parts: {
          root: {
            'data-gap': 'lg',
          },
        },
      },
    },
    {
      name: '两个开关落成 data-*，关掉时不留空属性',
      spec: { apg: APG },
      props: { wrap: true, inline: false },
      initial: {
        parts: {
          root: {
            'data-wrap': '',
            'data-inline': null,
          },
        },
      },
    },
    {
      name: '解剖只有根：子项是作者的内容，不额外产生角色节点',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
      },
    },
  ],
}
