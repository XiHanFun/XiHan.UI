import type { ConformanceSuite } from '../conformance/types'
import { emptyStateAnatomy, emptyStateKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

export const emptyStateSuite: ConformanceSuite = {
  component: 'empty-state',
  anatomy: emptyStateAnatomy,
  keyboard: emptyStateKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'icon', tag: 'span', children: [{ text: '∅' }] },
      { part: 'title', tag: 'p', children: [{ text: '没有匹配的结果' }] },
      { part: 'description', tag: 'p', children: [{ text: '换个关键词，或者把筛选条件放宽一些' }] },
      { part: 'action', children: [{ tag: 'button', text: '清空筛选' }] },
    ],
  },
  cases: [
    {
      name: '默认：root 是 role=status 活区，图标对读屏隐藏，不写 data-size',
      spec: { apg: APG },
      initial: {
        order: ['root', 'icon', 'title', 'description', 'action'],
        counts: { root: 1, icon: 1, title: 1, description: 1, action: 1 },
        parts: {
          root: {
            'role': 'status',
            'data-size': null,
            // 活区自己念内容，root 不再借标题当名字
            'aria-labelledby': null,
          },
          icon: { 'aria-hidden': 'true', 'role': null },
          // 标题与说明只是普通文本，不占标题层级、不带 role
          title: { role: null },
          description: { role: null },
          action: { role: null },
        },
      },
    },
    {
      name: 'live=off：首屏静态占位不当活区，root 上不写 role',
      spec: { apg: APG },
      props: { live: 'off' },
      initial: {
        parts: {
          root: { role: null },
          icon: { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: 'size：接线到 data-size，语义不变',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'role': 'status', 'data-size': 'lg' },
        },
      },
    },
    {
      name: '筛选后转回空态：live 由 off 改回 polite，root 当场变成活区',
      spec: { apg: APG },
      props: { live: 'off' },
      initial: {
        parts: { root: { role: null } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { live: 'polite' },
          expect: {
            parts: { root: { role: 'status' } },
          },
        },
      ],
    },
  ],
}
