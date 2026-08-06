import type { ConformanceSuite } from '../conformance/types'
import { spinnerAnatomy, spinnerKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

// 转圈图形来自皮肤的伪元素，结构里只有活区容器与一个可选的可见文案节点。
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
  ],
}
