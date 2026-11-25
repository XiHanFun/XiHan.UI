import type { ConformanceSuite } from '../conformance/types'
import { containerAnatomy, containerKeyboard } from '@xihan-ui/headless'

// 排版容器，APG 没有对应模式；判据只锁「最大宽度档如实落到根上、缺省档也写出、根上不多写语义」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

export const containerSuite: ConformanceSuite = {
  component: 'container',
  anatomy: containerAnatomy,
  keyboard: containerKeyboard,
  // 版心里放两段作者内容：子项是作者的，不额外产生角色节点
  fixture: {
    part: 'root',
    tag: 'div',
    children: [
      { tag: 'h2', text: '标题' },
      { tag: 'p', text: '正文' },
    ],
  },
  cases: [
    {
      name: '缺省：最大宽度落 lg，缺省档也写出；根上不写 role、不可聚焦',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': null,
            'tabindex': null,
            'data-max-width': 'lg',
          },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '四个断点档原样落 data-max-width，换算成多宽归皮肤',
      spec: { apg: APG },
      props: { maxWidth: 'sm' },
      initial: { parts: { root: { 'data-max-width': 'sm' } } },
      steps: [
        { kind: 'setProps', props: { maxWidth: 'md' } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-max-width', value: 'md' } },
        },
        { kind: 'setProps', props: { maxWidth: 'xl' } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-max-width', value: 'xl' } },
        },
      ],
    },
    {
      name: 'full：不限宽也落一个档名，不靠缺席表达',
      spec: { apg: APG },
      props: { maxWidth: 'full' },
      initial: { parts: { root: { 'data-max-width': 'full' } } },
    },
  ],
}
