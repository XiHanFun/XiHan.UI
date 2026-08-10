import type { ConformanceSuite } from '../conformance/types'
import { buttonGroupAnatomy, buttonGroupKeyboard } from '@xihan-ui/headless'

// 按钮组是容器，APG 没有对应模式；判据只锁「一组按钮对读屏是一个整体、排布与三轴如实落到根上」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const buttonGroupSuite: ConformanceSuite = {
  component: 'button-group',
  anatomy: buttonGroupAnatomy,
  keyboard: buttonGroupKeyboard,
  fixture: {
    part: 'root',
    children: [
      { tag: 'button', text: '日' },
      { tag: 'button', text: '周' },
      { tag: 'button', text: '月' },
    ],
  },
  cases: [
    {
      name: '缺省：role=group，横排，三轴一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': 'group',
            'data-orientation': 'horizontal',
            'data-variant': null,
            'data-tone': null,
            'data-size': null,
          },
        },
      },
    },
    {
      name: '竖排：只改 data-orientation，不发 aria-orientation（role=group 不收）',
      spec: { apg: APG },
      props: { orientation: 'vertical' },
      initial: {
        parts: {
          root: {
            'role': 'group',
            'data-orientation': 'vertical',
            'aria-orientation': null,
          },
        },
      },
    },
    {
      name: '三轴如实落到根上，组内每一段从根继承',
      spec: { apg: APG },
      props: { variant: 'outline', tone: 'brand', size: 'sm' },
      initial: {
        parts: {
          root: {
            'data-variant': 'outline',
            'data-tone': 'brand',
            'data-size': 'sm',
          },
        },
      },
    },
    {
      name: '只有根一个角色节点：组内每一段是作者自己的按钮',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
      },
    },
  ],
}
