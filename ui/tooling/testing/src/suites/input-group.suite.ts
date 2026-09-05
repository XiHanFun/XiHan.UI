import type { ConformanceSuite } from '../conformance/types'
import { inputGroupAnatomy, inputGroupKeyboard } from '@xihan-ui/headless'

// 输入组是容器，APG 没有对应模式；判据只锁「根不替组内控件出角色、档位如实落到根上、
// 前后缀块拿得到自己的身份」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const inputGroupSuite: ConformanceSuite = {
  component: 'input-group',
  anatomy: inputGroupAnatomy,
  keyboard: inputGroupKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'item', tag: 'span', text: 'https://' },
      { tag: 'input', attrs: { 'aria-label': '域名' } },
      { part: 'item', tag: 'span', text: '.com' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，也不输出档位',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-size': null,
          },
        },
      },
    },
    {
      name: '档位如实落成 data-size，皮肤按它给前后缀块换档',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'data-size': 'lg' },
        },
      },
    },
    {
      name: '前后缀块不接角色也不进 Tab 序列：只拿身份，不加 role / tabindex',
      spec: { apg: APG },
      initial: {
        parts: {
          'item[0]': { role: null, tabindex: null },
          'item[1]': { role: null, tabindex: null },
        },
      },
    },
    {
      name: '前后缀块可以有多枚，按文档序排在组里',
      spec: { apg: APG },
      initial: {
        order: ['root', 'item[0]', 'item[1]'],
        counts: { root: 1, item: 2 },
      },
    },
  ],
}
