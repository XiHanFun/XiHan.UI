import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { pageHeaderAnatomy, pageHeaderKeyboard } from '@xihan-ui/headless'

// 页头是容器，APG 没有对应模式；判据只锁「两个轴如实落到根上、各段拿得到自己的身份、
// 返回位除身份外一个属性都不多写」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

/** 一整块页头：返回位、标题、副标题、行尾操作、整行另起的页脚。 */
const pageHeaderTree: FixtureNode = {
  part: 'root',
  children: [
    {
      part: 'back-trigger',
      tag: 'button',
      text: '返回',
      attrs: { 'type': 'button', 'aria-label': '返回上一页' },
    },
    { part: 'title', text: '订单详情' },
    { part: 'description', text: '编号 SO-20260731-004' },
    { part: 'extra', children: [{ tag: 'button', text: '导出' }] },
    { part: 'footer', text: '创建于 7 月 31 日 09:12' },
  ],
}

export const pageHeaderSuite: ConformanceSuite = {
  component: 'page-header',
  anatomy: pageHeaderAnatomy,
  keyboard: pageHeaderKeyboard,
  fixture: pageHeaderTree,
  cases: [
    {
      name: '缺省：根不写 role，两个轴一律不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-size': null,
            'data-bordered': null,
          },
        },
      },
    },
    {
      name: '尺寸如实落到根上',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'data-size': 'lg' },
        },
      },
    },
    {
      name: '分隔线落成 data-bordered，关掉时不留空属性',
      spec: { apg: APG },
      props: { bordered: true },
      initial: {
        parts: {
          root: { 'data-bordered': '' },
        },
      },
    },
    {
      name: '关掉分隔线：根上不留 data-bordered',
      spec: { apg: APG },
      props: { bordered: false },
      initial: {
        parts: {
          root: { 'data-bordered': null },
        },
      },
    },
    {
      name: '返回位只拿身份：不补 role、不占 Tab 位，作者写的 type 与可及名字原样留着',
      spec: { apg: APG },
      initial: {
        parts: {
          'back-trigger': {
            'role': null,
            'tabindex': null,
            'aria-hidden': null,
            'type': 'button',
            'aria-label': '返回上一页',
          },
        },
      },
    },
    {
      name: '各段各一份，按返回 / 标题 / 副标题 / 操作 / 页脚的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'back-trigger', 'title', 'description', 'extra', 'footer'],
        counts: {
          'root': 1,
          'back-trigger': 1,
          'title': 1,
          'description': 1,
          'extra': 1,
          'footer': 1,
        },
      },
    },
    {
      name: '只写标题也是一块合法的页头：其余各段缺席',
      spec: { apg: APG },
      fixture: base => ({ ...base, children: [{ part: 'title', text: '订单详情' }] }),
      initial: {
        order: ['root', 'title'],
        counts: { 'root': 1, 'title': 1, 'back-trigger': 0, 'description': 0, 'extra': 0, 'footer': 0 },
      },
    },
  ],
}
