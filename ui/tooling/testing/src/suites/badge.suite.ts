import type { ConformanceSuite } from '../conformance/types'
import { badgeAnatomy, badgeKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const badgeSuite: ConformanceSuite = {
  component: 'badge',
  anatomy: badgeAnatomy,
  keyboard: badgeKeyboard,
  // root 是锚点，被标记的东西与角标都在它里面
  fixture: {
    part: 'root',
    tag: 'span',
    children: [
      { text: '收件箱' },
      { part: 'indicator', tag: 'span' },
    ],
  },
  cases: [
    {
      name: '默认：锚点加角标两层，纯展示无 role，落点默认右上',
      spec: { apg: APG },
      initial: {
        order: ['root', 'indicator'],
        counts: { root: 1, indicator: 1 },
        parts: {
          root: { 'role': null, 'data-placement': 'top-end' },
          // 角标的标签面已经交回给 tag，这一轴整个删掉了
          indicator: { 'role': null, 'data-variant': null, 'data-placement': 'top-end' },
        },
      },
    },
    {
      name: '计数为 0 时角标收起，锚点还在',
      spec: { apg: APG },
      props: { count: 0 },
      initial: {
        parts: { indicator: { hidden: '' } },
      },
    },
    {
      name: '给了整句就由它当可及名字：光念数字听不出这是什么',
      spec: { apg: APG },
      props: { count: 3, label: '3 条未读' },
      initial: {
        parts: { indicator: { 'aria-label': '3 条未读', 'role': 'status' } },
      },
    },
    {
      name: '落点接线到两层：定位归皮肤，方位由 data-placement 说了算',
      spec: { apg: APG },
      props: { count: 1, placement: 'bottom-start' },
      initial: {
        parts: {
          root: { 'data-placement': 'bottom-start' },
          indicator: { 'data-placement': 'bottom-start' },
        },
      },
    },
  ],
}
