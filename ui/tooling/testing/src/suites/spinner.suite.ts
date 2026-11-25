import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { spinnerAnatomy, spinnerKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

/**
 * 遮罩形态：Vue / React 的 XhSpinner 打上 overlay 自己铺出外框、内容、遮罩与转圈，夹具里只给被包住的内容；
 * Web Components 由作者在 Light DOM 里写出同一副结构。
 */
const OVERLAY: FixtureNode = {
  part: 'container',
  tag: 'div',
  children: [
    { tag: 'p', text: '表格内容', only: ['vue', 'react'] },
    { part: 'content', tag: 'div', only: ['wc'], children: [{ tag: 'p', text: '表格内容' }] },
    { part: 'mask', tag: 'div', only: ['wc'], children: [{ part: 'root', tag: 'span' }] },
  ],
}

// 转圈图形来自皮肤的伪元素，结构里只有活区容器与一个可选的可见文案节点；遮罩形态另有外框、内容与遮罩。
export const spinnerSuite: ConformanceSuite = {
  component: 'spinner',
  anatomy: spinnerAnatomy,
  keyboard: spinnerKeyboard,
  fixture: {
    part: 'root',
    tag: 'span',
    children: [{ part: 'label', tag: 'span', text: '加载中' }],
  },
  cases: [
    {
      name: '默认：root 是 polite 活区，带兜底可及名，不上 data-size',
      spec: { apg: APG },
      initial: {
        order: ['root', 'label'],
        counts: { root: 1, label: 1 },
        parts: {
          root: {
            'role': 'status',
            'aria-live': 'polite',
            'aria-label': 'Loading',
            'data-size': null,
            'data-variant': 'arc',
          },
          // 文案节点只是内容，不该自带角色
          label: { 'role': null, 'aria-live': null },
        },
      },
    },
    {
      name: 'label：换掉读屏念的名字',
      spec: { apg: APG },
      props: { label: '正在上传' },
      initial: {
        parts: { root: { 'aria-label': '正在上传' } },
      },
    },
    {
      name: 'translations：没给 label 时用语言包的默认文案',
      spec: { apg: APG },
      props: { translations: { label: '加载中' } },
      initial: {
        parts: { root: { 'aria-label': '加载中' } },
      },
    },
    {
      name: 'label 压过 translations：这一处的名字比语言包的默认值更具体',
      spec: { apg: APG },
      props: { label: '正在上传', translations: { label: '加载中' } },
      initial: {
        parts: { root: { 'aria-label': '正在上传' } },
      },
    },
    {
      name: 'size：接线到 data-size',
      spec: { apg: APG },
      props: { size: 'lg' },
      initial: {
        parts: { root: { 'data-size': 'lg' } },
      },
    },
    {
      name: 'variant：接线到 data-variant，默认形态是 arc',
      spec: { apg: APG },
      props: { variant: 'dots' },
      initial: {
        parts: { root: { 'data-variant': 'dots' } },
      },
    },
    {
      name: '缺省横排：data-orientation 为 horizontal',
      spec: { apg: APG },
      initial: {
        parts: { root: { 'data-orientation': 'horizontal' } },
      },
    },
    {
      name: 'orientation：接线到 data-orientation，竖排时转圈在上、配文在下',
      spec: { apg: APG },
      props: { orientation: 'vertical' },
      initial: {
        parts: { root: { 'data-orientation': 'vertical' } },
      },
    },
    {
      name: '宿主换文案：活区的名字当场跟着改',
      spec: { apg: APG },
      props: { label: '正在上传' },
      steps: [
        {
          kind: 'setProps',
          props: { label: '就快好了' },
          expect: {
            parts: { root: { 'aria-label': '就快好了', 'role': 'status' } },
          },
        },
      ],
    },
    {
      name: '缺省即刻露面：data-state 为 visible',
      spec: { apg: APG },
      initial: {
        parts: { root: { 'data-state': 'visible' } },
      },
    },
    {
      name: 'delay：挂载后先藏着，等够时长才露面；活区语义等待期间照旧',
      spec: { apg: APG },
      props: { delay: 40 },
      initial: {
        parts: { root: { 'data-state': 'hidden', 'role': 'status', 'aria-label': 'Loading' } },
      },
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'visible' } },
          expect: { parts: { root: { 'data-state': 'visible' } } },
        },
      ],
    },
    {
      name: 'loading 为 false：转圈藏起、活区语义照旧；改回 true 即刻露面',
      spec: { apg: APG },
      props: { loading: false },
      initial: {
        parts: { root: { 'data-state': 'hidden', 'role': 'status' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { loading: true },
          expect: { parts: { root: { 'data-state': 'visible' } } },
        },
      ],
    },
    {
      name: '遮罩形态：内容报忙且不可交互，遮罩露面，转圈缺省竖排',
      spec: { apg: APG },
      props: { overlay: true },
      fixture: () => OVERLAY,
      initial: {
        counts: { container: 1, content: 1, mask: 1, root: 1 },
        parts: {
          container: { 'data-state': 'visible' },
          content: { 'aria-busy': 'true', 'inert': '' },
          mask: { 'data-state': 'visible', 'data-fullscreen': null },
          root: { 'role': 'status', 'data-orientation': 'vertical', 'data-state': 'visible' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { loading: false },
          expect: {
            parts: {
              content: { 'aria-busy': null, 'inert': null },
              mask: { 'data-state': 'hidden' },
              root: { 'data-state': 'hidden' },
            },
          },
        },
      ],
    },
    {
      name: '遮罩形态 fullscreen：投影在外框与遮罩上',
      spec: { apg: APG },
      props: { overlay: true, fullscreen: true },
      fixture: () => OVERLAY,
      initial: {
        parts: {
          container: { 'data-fullscreen': '' },
          mask: { 'data-fullscreen': '' },
        },
      },
    },
  ],
}
