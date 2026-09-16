import type { ConformanceSuite } from '../conformance/types'
import { cardAnatomy, cardKeyboard } from '@xihan-ui/headless'

// 卡片是容器，APG 没有对应模式；判据只锁语义层级与各段身份。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const cardSuite: ConformanceSuite = {
  component: 'card',
  anatomy: cardAnatomy,
  keyboard: cardKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'header',
        children: [
          { part: 'title', text: '本月账单' },
          { part: 'description', text: '账期 7 月 1 日至 7 月 31 日' },
        ],
      },
      { part: 'content', text: '共 128 笔' },
      { part: 'footer', text: '去支付' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，形态落 outline',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-variant': 'outline',
          },
        },
      },
    },
    {
      name: '显式形态如实落到根上',
      spec: { apg: APG },
      props: { variant: 'ghost' },
      initial: {
        parts: {
          root: {
            'data-variant': 'ghost',
          },
        },
      },
    },
    {
      name: '各段各一份，按头 / 标题 / 说明 / 内容 / 脚的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'header', 'title', 'description', 'content', 'footer'],
        counts: { root: 1, header: 1, title: 1, description: 1, content: 1, footer: 1 },
      },
    },
  ],
}
