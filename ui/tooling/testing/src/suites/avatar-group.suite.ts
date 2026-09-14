import type { ConformanceSuite } from '../conformance/types'
import { avatarGroupAnatomy, avatarGroupKeyboard } from '@xihan-ui/headless'

// 头像组是容器，APG 没有对应模式；判据只锁「上限与档位如实落到根上、溢出计数拿得到自己的身份」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const avatarGroupSuite: ConformanceSuite = {
  component: 'avatar-group',
  anatomy: avatarGroupAnatomy,
  keyboard: avatarGroupKeyboard,
  fixture: {
    part: 'root',
    children: [
      { tag: 'span', text: '曦' },
      { tag: 'span', text: '寒' },
      { part: 'overflow-item', text: '+2' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，上限与档位一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-max': null,
            'data-size': null,
          },
        },
      },
    },
    {
      name: '上限如实落成 data-max',
      spec: { apg: APG },
      props: { max: 4 },
      initial: {
        parts: {
          root: { 'data-max': '4' },
        },
      },
    },
    {
      name: '档位如实落到根上，组内每一枚从根继承',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'data-size': 'lg' },
        },
      },
    },
    {
      name: '溢出计数各一份，排在这一排的末尾',
      spec: { apg: APG },
      initial: {
        order: ['root', 'overflow-item'],
        counts: { 'root': 1, 'overflow-item': 1 },
      },
    },
  ],
}
