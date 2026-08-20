import type { ConformanceSuite } from '../conformance/types'
import { masonryAnatomy, masonryKeyboard } from '@xihan-ui/headless'

// 排版容器，APG 没有对应模式；判据只锁「排布参数如实落到根上、列报位次、项报原序与落点」。
// 落格算法本身由 headless 单测按数字验，这里不重复；无布局环境量到的高度全是 0，
// 此时最短列优先与逐列填都退成逐列轮流，三项三列正好各占一列。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const masonrySuite: ConformanceSuite = {
  component: 'masonry',
  anatomy: masonryAnatomy,
  keyboard: masonryKeyboard,
  fixture: {
    part: 'root',
    children: [
      { text: '甲' },
      { text: '乙' },
      { text: '丙' },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，间距与落格策略都不输出；三项按缺省三列各落一列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'column[0]', 'item[0]', 'column[1]', 'item[1]', 'column[2]', 'item[2]'],
        counts: { root: 1, column: 3, item: 3 },
        parts: {
          'root': {
            'role': null,
            'data-gap': null,
            // 布尔状态位走 dataAttr，假值不输出，皮肤的 [data-sequential] 才不会误命中
            'data-sequential': null,
          },
          'column[0]': {
            'role': null,
            'data-index': '0',
          },
          'column[2]': {
            'data-index': '2',
          },
          'item[0]': {
            'role': null,
            'data-index': '0',
            'data-column': '0',
          },
        },
        activeElement: null,
      },
    },
    {
      name: '间距档位如实落到根上，换算成哪个令牌归皮肤',
      spec: { apg: APG },
      props: { gap: 'lg' },
      initial: {
        parts: {
          'root': { 'data-gap': 'lg' },
          // 间距是根一层的事，不落到列与项上
          'column[0]': { 'data-gap': null },
          'item[0]': { 'data-gap': null },
        },
      },
    },
    {
      name: '逐列填如实落到根上',
      spec: { apg: APG },
      props: { sequential: true },
      initial: {
        parts: {
          'root': { 'data-sequential': '' },
          'item[0]': { 'data-column': '0' },
          'item[2]': { 'data-column': '2' },
        },
      },
    },
    {
      name: '列报自己排第几，项报原序与落点：重排后 DOM 序等于列序，原序只剩 data-index 认得出来',
      spec: { apg: APG },
      initial: {
        parts: {
          'column[0]': { 'data-index': '0', 'data-column': null },
          'column[1]': { 'data-index': '1' },
          'item[1]': { 'data-index': '1', 'data-column': '1' },
          'item[2]': { 'data-index': '2', 'data-column': '2' },
        },
      },
    },
  ],
}
