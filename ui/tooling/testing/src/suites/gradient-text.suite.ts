import type { ConformanceSuite } from '../conformance/types'
import { gradientTextAnatomy, gradientTextKeyboard } from '@xihan-ui/headless'

// 只给一段文字换个上色方式，APG 没有对应模式；判据只锁「走向如实落到根上、两端颜色不占语义属性、根上不多写角色」。
// 两端颜色走的是根上的内联 CSS 变量，快照不采集 style，所以这里只能反证它们没落到 data-* 上。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const gradientTextSuite: ConformanceSuite = {
  component: 'gradient-text',
  anatomy: gradientTextAnatomy,
  keyboard: gradientTextKeyboard,
  fixture: {
    part: 'root',
    tag: 'span',
    text: '曦寒前端组件库',
  },
  cases: [
    {
      name: '缺省：走向落 to-right，根不写 role',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'aria-hidden': null,
            'data-direction': 'to-right',
          },
        },
      },
    },
    {
      name: '走向按档位名原样落出，换算成哪个 to <边或角> 归皮肤',
      spec: { apg: APG },
      props: { direction: 'to-bottom-right' },
      initial: {
        parts: {
          root: { 'data-direction': 'to-bottom-right' },
        },
      },
    },
    {
      name: '两端颜色只走内联变量，不占 data-*、也不改语义',
      spec: { apg: APG },
      props: { from: '#ff5500', to: '#0055ff' },
      initial: {
        parts: {
          root: {
            'data-from': null,
            'data-to': null,
            'role': null,
            'data-direction': 'to-right',
          },
        },
      },
    },
    {
      name: '换走向：direction 由 to-right 改成 to-bottom，根上当场跟着换',
      spec: { apg: APG },
      props: { direction: 'to-right' },
      initial: {
        parts: { root: { 'data-direction': 'to-right' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { direction: 'to-bottom' },
          expect: {
            parts: { root: { 'data-direction': 'to-bottom' } },
          },
        },
      ],
    },
    {
      name: '解剖只有根：被上色的是作者的文字，不额外产生角色节点',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
      },
    },
  ],
}
