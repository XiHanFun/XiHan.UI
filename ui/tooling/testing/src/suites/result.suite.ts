import type { ConformanceSuite } from '../conformance/types'
import { resultAnatomy, resultKeyboard } from '@xihan-ui/headless'

// 结果页是容器，APG 没有对应模式；判据只锁「两个轴如实落到根上、各段拿得到自己的身份、图标不进无障碍树」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const resultSuite: ConformanceSuite = {
  component: 'result',
  anatomy: resultAnatomy,
  keyboard: resultKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'icon', tag: 'span', text: '?' },
      { part: 'title', tag: 'p', text: '404 页面不存在' },
      { part: 'description', tag: 'p', text: '地址可能敲错了，或者这条记录已经被删掉' },
      { part: 'action', children: [{ tag: 'button', text: '回到首页' }] },
    ],
  },
  cases: [
    {
      name: '缺省：根不写 role，两个轴一律不输出，图标对读屏隐藏',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-status': null,
            'data-size': null,
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
      name: 'status 只落成 data-status，不改任何语义属性',
      spec: { apg: APG },
      props: { status: '404' },
      initial: {
        parts: {
          root: {
            'data-status': '404',
            'role': null,
            'aria-live': null,
          },
          // 换 status 不会给图标补上可及名字，它始终是装饰
          icon: { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: 'size：接线到 data-size，语义不变',
      spec: { apg: APG },
      props: { status: 'success', size: 'lg' },
      initial: {
        parts: {
          root: { 'data-status': 'success', 'data-size': 'lg', 'role': null },
        },
      },
    },
    {
      name: '重试之后结果换了一种：status 由 error 改成 success，根上当场跟着换',
      spec: { apg: APG },
      props: { status: 'error' },
      initial: {
        parts: { root: { 'data-status': 'error' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { status: 'success' },
          expect: {
            parts: { root: { 'data-status': 'success' } },
          },
        },
      ],
    },
    {
      name: '各段各一份，按图标 / 标题 / 说明 / 操作的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'icon', 'title', 'description', 'action'],
        counts: { root: 1, icon: 1, title: 1, description: 1, action: 1 },
      },
    },
  ],
}
