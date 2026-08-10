import type { ConformanceSuite } from '../conformance/types'
import { iconWrapperAnatomy, iconWrapperKeyboard } from '@xihan-ui/headless'

// 图标底座是展示节点，APG 没有对应模式；判据只锁「三轴如实落到根上、根不替作者声明语义」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const iconWrapperSuite: ConformanceSuite = {
  component: 'icon-wrapper',
  anatomy: iconWrapperAnatomy,
  keyboard: iconWrapperKeyboard,
  fixture: {
    part: 'root',
    children: [{ tag: 'span', text: '★' }],
  },
  cases: [
    {
      name: '缺省：根不写 role，也不替作者写 aria-hidden，三轴一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'aria-hidden': null,
            'data-variant': null,
            'data-tone': null,
            'data-size': null,
          },
        },
      },
    },
    {
      name: '三轴如实落到根上',
      spec: { apg: APG },
      props: { variant: 'subtle', tone: 'success', size: 'lg' },
      initial: {
        parts: {
          root: {
            'data-variant': 'subtle',
            'data-tone': 'success',
            'data-size': 'lg',
          },
        },
      },
    },
    {
      name: '作者写的标注跟着走：底座只加自己的三轴，不动作者的属性',
      spec: { apg: APG },
      fixture: base => ({ ...base, attrs: { 'aria-hidden': 'true' } }),
      initial: {
        parts: {
          root: { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: '只有根一个角色节点',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
      },
    },
  ],
}
