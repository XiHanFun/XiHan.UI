import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { skeletonAnatomy, skeletonKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'

/**
 * 一块典型的卡片占位：左边一个头像位，下面两行文字位。
 * 头像那根自报 circle，其余两根不报，跟着容器走。
 */
const skeletonTree: FixtureNode = {
  part: 'root',
  children: [
    { part: 'bone', attrs: { variant: 'circle' } },
    { part: 'bone' },
    { part: 'bone' },
  ],
}

export const skeletonSuite: ConformanceSuite = {
  component: 'skeleton',
  anatomy: skeletonAnatomy,
  keyboard: skeletonKeyboard,
  fixture: skeletonTree,
  cases: [
    {
      name: '默认：容器报忙不隐藏，骨架条全部退出无障碍树',
      spec: { apg: APG },
      initial: {
        order: ['root', 'bone[0]', 'bone[1]', 'bone[2]'],
        counts: { root: 1, bone: 3 },
        parts: {
          'root': {
            'aria-busy': 'true',
            // 容器绝不能写 aria-hidden：它会连同自己的 aria-busy 一起被摘出无障碍树，
            // 加载态就再也报不出去了
            'aria-hidden': null,
            'data-state': 'loading',
            'hidden': null,
            'role': null,
          },
          // 纯装饰，不进无障碍树，也不占 Tab 序列
          'bone[0]': { 'aria-hidden': 'true', 'role': null, 'tabindex': null },
          'bone[1]': { 'aria-hidden': 'true', 'role': null, 'tabindex': null },
          'bone[2]': { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: '形状：自报的那根按自己的来，没报的跟容器默认值 text',
      spec: { apg: APG },
      initial: {
        parts: {
          'bone[0]': { 'data-variant': 'circle' },
          'bone[1]': { 'data-variant': 'text' },
          'bone[2]': { 'data-variant': 'text' },
        },
      },
    },
    {
      name: '容器 variant 换成 rect：没自报形状的跟着换，自报的那根不受影响',
      spec: { apg: APG },
      props: { variant: 'rect' },
      initial: {
        parts: {
          'bone[0]': { 'data-variant': 'circle' },
          'bone[1]': { 'data-variant': 'rect' },
          'bone[2]': { 'data-variant': 'rect' },
        },
      },
    },
    {
      name: 'loading=false 挂载：不报忙、不藏骨架条，整块收起',
      spec: { apg: APG },
      props: { loading: false },
      initial: {
        counts: { root: 1, bone: 3 },
        parts: {
          'root': {
            'aria-busy': null,
            'data-state': 'loaded',
            'hidden': '',
          },
          // 内容已就位，没有需要藏起来的装饰
          'bone[0]': { 'aria-hidden': null, 'data-variant': 'circle' },
          'bone[1]': { 'aria-hidden': null },
        },
      },
    },
    {
      name: '数据回来：loading 翻假的那一帧，忙态与隐藏一起撤掉',
      spec: { apg: APG },
      steps: [
        {
          kind: 'setProps',
          props: { loading: false },
          expect: {
            parts: {
              'root': { 'aria-busy': null, 'data-state': 'loaded', 'hidden': '' },
              'bone[0]': { 'aria-hidden': null },
              'bone[1]': { 'aria-hidden': null },
              'bone[2]': { 'aria-hidden': null },
            },
          },
        },
        {
          kind: 'setProps',
          props: { loading: true },
          expect: {
            parts: {
              'root': { 'aria-busy': 'true', 'data-state': 'loading', 'hidden': null },
              'bone[0]': { 'aria-hidden': 'true' },
            },
          },
        },
      ],
    },
  ],
}
