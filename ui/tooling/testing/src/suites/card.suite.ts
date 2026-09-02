import type { ConformanceSuite } from '../conformance/types'
import { cardAnatomy, cardKeyboard } from '@xihan-ui/headless'

// 卡片是容器，APG 没有对应模式；判据只锁「三轴与两个开关如实落到根上、各段拿得到自己的身份」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const cardSuite: ConformanceSuite = {
  component: 'card',
  anatomy: cardAnatomy,
  keyboard: cardKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'cover', text: '封面' },
      {
        part: 'header',
        children: [
          { part: 'title', text: '本月账单' },
          { part: 'description', text: '账期 7 月 1 日至 7 月 31 日' },
        ],
      },
      { part: 'body', text: '共 128 笔' },
      { part: 'footer', text: '去支付' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，三轴一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-variant': null,
            'data-size': null,
            'data-hoverable': null,
            'data-split': null,
          },
        },
      },
    },
    {
      name: '三轴如实落到根上',
      spec: { apg: APG },
      props: { variant: 'elevated', size: 'lg' },
      initial: {
        parts: {
          root: {
            'data-variant': 'elevated',
            'data-size': 'lg',
          },
        },
      },
    },
    {
      name: '两个开关落成 data-*，关掉时不留空属性',
      spec: { apg: APG },
      props: { hoverable: true, segmented: false },
      initial: {
        parts: {
          root: {
            'data-hoverable': '',
            'data-split': null,
          },
        },
      },
    },
    {
      name: '各段各一份，按封面 / 头 / 身 / 脚的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'cover', 'header', 'title', 'description', 'body', 'footer'],
        counts: { root: 1, cover: 1, header: 1, title: 1, description: 1, body: 1, footer: 1 },
      },
    },
  ],
}
