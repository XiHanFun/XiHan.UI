import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { timelineAnatomy, timelineKeyboard } from '@xihan-ui/headless'

// 时间线是一份已经发生的事件清单，APG 没有对应模式；
// 判据锁三件事：列表语义、三轴如实落位、条目之间除语气色外没有任何状态差别。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

/** 一条三事件的订单流水，中间与末尾各带一个语气色。 */
const timelineTree: FixtureNode = {
  part: 'root',
  tag: 'ol',
  children: [
    {
      part: 'item',
      tag: 'li',
      children: [
        { part: 'indicator', tag: 'span' },
        { part: 'connector', tag: 'span' },
        {
          part: 'content',
          children: [
            { part: 'time', tag: 'time', text: '09:12', attrs: { datetime: '2026-07-01T09:12' } },
            { part: 'title', text: '订单已创建' },
            { part: 'description', text: '下单来源：网页端' },
          ],
        },
      ],
    },
    {
      part: 'item',
      tag: 'li',
      attrs: { tone: 'success' },
      children: [
        { part: 'indicator', tag: 'span' },
        { part: 'connector', tag: 'span' },
        {
          part: 'content',
          children: [
            { part: 'time', tag: 'time', text: '10:30', attrs: { datetime: '2026-07-01T10:30' } },
            { part: 'title', text: '已发货' },
            { part: 'description', text: '承运商已揽收' },
          ],
        },
      ],
    },
    {
      part: 'item',
      tag: 'li',
      attrs: { tone: 'danger' },
      children: [
        { part: 'indicator', tag: 'span' },
        { part: 'connector', tag: 'span' },
        {
          part: 'content',
          children: [
            { part: 'time', tag: 'time', text: '14:05', attrs: { datetime: '2026-07-02T14:05' } },
            { part: 'title', text: '派送失败' },
            { part: 'description', text: '收件人电话无人接听' },
          ],
        },
      ],
    },
  ],
}

/** 整棵树的文档序：三条事件，每条各一份圆点、连线与内容三块。 */
const FULL_ORDER = [
  'root',
  'item[0]',
  'indicator[0]',
  'connector[0]',
  'content[0]',
  'time[0]',
  'title[0]',
  'description[0]',
  'item[1]',
  'indicator[1]',
  'connector[1]',
  'content[1]',
  'time[1]',
  'title[1]',
  'description[1]',
  'item[2]',
  'indicator[2]',
  'connector[2]',
  'content[2]',
  'time[2]',
  'title[2]',
  'description[2]',
]

export const timelineSuite: ConformanceSuite = {
  component: 'timeline',
  anatomy: timelineAnatomy,
  keyboard: timelineKeyboard,
  fixture: timelineTree,
  cases: [
    {
      name: '整棵部件树各就各位：三条事件，每条一份圆点、连线与内容',
      spec: { apg: APG },
      initial: {
        order: FULL_ORDER,
        counts: {
          root: 1,
          item: 3,
          indicator: 3,
          connector: 3,
          content: 3,
          time: 3,
          title: 3,
          description: 3,
        },
      },
    },
    {
      name: '缺省：根报列表语义、方向恒有值，侧别与尺寸不写就不输出',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': {
            'role': 'list',
            // 方向恒有值，读一眼 DOM 就知道这条线往哪走
            'data-orientation': 'vertical',
            'data-placement': null,
            'data-size': null,
          },
          'item[0]': {
            'role': 'listitem',
            'data-orientation': 'vertical',
            'data-placement': null,
            // 尺寸只写在根上，条目不重复标注
            'data-size': null,
          },
        },
      },
    },
    {
      name: '三轴如实落到根上，方向与侧别在条目与连线上各再写一份',
      spec: { apg: APG },
      props: { orientation: 'horizontal', placement: 'alternate', size: 'lg' },
      initial: {
        parts: {
          'root': {
            'data-orientation': 'horizontal',
            'data-placement': 'alternate',
            'data-size': 'lg',
          },
          'item[0]': {
            'data-orientation': 'horizontal',
            'data-placement': 'alternate',
            'data-size': null,
          },
          'connector[0]': {
            'data-orientation': 'horizontal',
            // 侧别不落到连线上：线走哪一列由条目的网格决定
            'data-placement': null,
          },
        },
      },
    },
    {
      name: '语气逐条落在圆点上：条目本身与内容都不带语气',
      spec: { apg: APG },
      initial: {
        parts: {
          // 没写语气的那条不留空属性
          'indicator[0]': { 'data-tone': null },
          'indicator[1]': { 'data-tone': 'success' },
          'indicator[2]': { 'data-tone': 'danger' },
          'item[1]': { 'data-tone': null },
          'content[1]': { 'data-tone': null },
        },
      },
    },
    {
      name: '不搬步骤条的状态语义：没有当前项、没有完成态，任何部件都不产出状态属性',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': { 'data-state': null, 'data-complete': null, 'aria-current': null },
          'item[0]': {
            'data-state': null,
            'aria-current': null,
            'aria-selected': null,
            'aria-disabled': null,
            // 事件不可点：不进 Tab 序列，也没有 roving tabindex
            'tabindex': null,
          },
          'item[1]': { 'data-state': null, 'aria-current': null, 'tabindex': null },
          'item[2]': { 'data-state': null, 'aria-current': null, 'tabindex': null },
          'indicator[0]': { 'data-state': null },
          'connector[0]': { 'data-state': null },
          'title[0]': { 'data-state': null },
          'description[0]': { 'data-state': null },
        },
      },
    },
    {
      name: '圆点与连线对读屏隐藏，文字三块不加 role',
      spec: { apg: APG },
      initial: {
        parts: {
          'indicator[0]': { 'aria-hidden': 'true', 'role': null },
          'connector[0]': { 'aria-hidden': 'true', 'role': null },
          'content[0]': { 'aria-hidden': null, 'role': null },
          // 标题不占标题层级，时间线嵌在页面哪一层由使用者决定
          'title[0]': { 'aria-hidden': null, 'role': null },
          'description[0]': { 'aria-hidden': null, 'role': null },
          'time[0]': { 'aria-hidden': null, 'role': null },
        },
      },
    },
    {
      name: '只写内容也成立：圆点、连线、时刻与说明一个不写照样是一条合法事件',
      spec: { apg: APG },
      fixture: () => ({
        part: 'root',
        tag: 'ol',
        children: [
          {
            part: 'item',
            tag: 'li',
            children: [
              { part: 'content', children: [{ part: 'title', text: '仓库已创建' }] },
            ],
          },
        ],
      }),
      initial: {
        order: ['root', 'item', 'content', 'title'],
        counts: { root: 1, item: 1, content: 1, title: 1, indicator: 0, connector: 0, time: 0, description: 0 },
        parts: {
          root: { role: 'list' },
          item: { role: 'listitem' },
        },
      },
    },
  ],
}
