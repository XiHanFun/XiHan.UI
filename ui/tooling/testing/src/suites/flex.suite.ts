import type { ConformanceSuite } from '../conformance/types'
import { flexAnatomy, flexKeyboard } from '@xihan-ui/headless'

// 排版容器，APG 没有对应模式；判据只锁「六个排版参数如实落到根上、根上不多写语义」，
// 外加分隔符两端铺出同一种结构。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const flexSuite: ConformanceSuite = {
  component: 'flex',
  anatomy: flexAnatomy,
  keyboard: flexKeyboard,
  // 三个子项两道缝：分隔符相间摆在中间，首尾不摆
  fixture: {
    part: 'root',
    tag: 'div',
    children: [
      { tag: 'span', text: '甲' },
      { part: 'split', tag: 'span' },
      { tag: 'span', text: '乙' },
      { part: 'split', tag: 'span' },
      { tag: 'span', text: '丙' },
    ],
  },
  cases: [
    {
      name: '缺省：方向落 horizontal，其余排版参数一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-orientation': 'horizontal',
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
      props: { orientation: 'vertical', align: 'center', justify: 'between' },
      initial: {
        parts: {
          root: {
            'data-orientation': 'vertical',
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
      name: '行内：data-inline 落成空属性——皮肤唯一改 display 的开关只认它在场',
      spec: { apg: APG },
      props: { inline: true },
      initial: {
        parts: {
          root: {
            'data-inline': '',
          },
        },
      },
    },
    {
      name: '分隔符：两端都铺成角色节点，逐个带 aria-hidden，不额外拿到别的语义',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/' },
      initial: {
        order: ['root', 'split[0]', 'split[1]'],
        counts: { root: 1, split: 2 },
        parts: {
          split: [
            { 'aria-hidden': 'true', 'role': null },
            { 'aria-hidden': 'true', 'role': null },
          ],
        },
      },
    },
    {
      name: '解剖只有根与分隔符：子项是作者的内容，不额外产生角色节点',
      spec: { apg: APG },
      fixture: base => ({ ...base, children: base.children?.filter(node => node.part !== 'split') }),
      initial: {
        order: ['root'],
        counts: { root: 1, split: 0 },
      },
    },
  ],
}
