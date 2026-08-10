import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { marqueeAnatomy, marqueeKeyboard } from '@xihan-ui/headless'

// 跑马灯是容器，APG 没有对应模式；判据锁三件：方向连同它所在的轴如实落到根上、
// 两个开关关掉时不留空属性、速度只走内联变量不占语义属性。
// 滚多快、怎么滚归皮肤，这里不验动画本身——动画是样式层的事实，不是结构契约。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

function rootEl(doc: Document): Element {
  const el = doc.querySelector('[data-scope="marquee"][data-part="root"]')
  if (!el)
    throw new Error('找不到 marquee 的 root 部件')
  return el
}

/** 读根上内联样式里的速度变量；快照不采集 style，这条只能这么验。 */
function readSpeed(doc: Document): string | null {
  const match = /--xh-marquee-speed:\s*([^;]+)/.exec(rootEl(doc).getAttribute('style') ?? '')
  return match ? match[1]!.trim() : null
}

function expectSpeed(expected: string | null) {
  return ({ doc, adapterName }: RawStepContext): void => {
    const actual = readSpeed(doc)
    if (actual !== expected)
      throw new Error(`${adapterName}: 根上的 --xh-marquee-speed 期望 ${expected ?? '不写出'}，实际 ${actual ?? '不写出'}`)
  }
}

export const marqueeSuite: ConformanceSuite = {
  component: 'marquee',
  anatomy: marqueeAnatomy,
  keyboard: marqueeKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'content', text: '曦寒前端组件库' },
    ],
  },
  cases: [
    {
      name: '缺省：往左滚、轴是横的，两个开关不输出，根不写 role',
      spec: { apg: APG },
      initial: {
        parts: {
          root: {
            'role': null,
            'data-direction': 'left',
            'data-orientation': 'horizontal',
            'data-pause-on-hover': null,
            'data-auto-fill': null,
          },
        },
      },
      steps: [
        { kind: 'raw', why: '速度没给时根上不该出现那条变量；快照不采集 style', run: expectSpeed(null) },
      ],
    },
    {
      name: '换方向：轴跟着方向一起换，上下两档落成竖轴',
      spec: { apg: APG },
      props: { direction: 'right' },
      initial: {
        parts: {
          root: { 'data-direction': 'right', 'data-orientation': 'horizontal' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { direction: 'up' },
          expect: {
            parts: { root: { 'data-direction': 'up', 'data-orientation': 'vertical' } },
          },
        },
        {
          kind: 'setProps',
          props: { direction: 'down' },
          expect: {
            parts: { root: { 'data-direction': 'down', 'data-orientation': 'vertical' } },
          },
        },
      ],
    },
    {
      name: '两个开关落成 data-*，关掉时不留空属性',
      spec: { apg: APG },
      props: { pauseOnHover: true, autoFill: false },
      initial: {
        parts: {
          root: {
            'data-pause-on-hover': '',
            'data-auto-fill': null,
          },
        },
      },
    },
    {
      name: '速度只走内联变量，不占 data-*、也不改语义',
      spec: { apg: APG },
      props: { speed: 90 },
      initial: {
        parts: {
          root: {
            'data-speed': null,
            'role': null,
            'data-direction': 'left',
          },
        },
      },
      steps: [
        { kind: 'raw', why: '速度是连续量，皮肤要拿它做除法，只能落在内联变量上', run: expectSpeed('90') },
        {
          kind: 'setProps',
          props: { speed: 240 },
        },
        { kind: 'raw', why: '换速度后变量当场跟着换', run: expectSpeed('240') },
      ],
    },
    {
      name: '非正的速度不写出：0 与负数不是速度，往回走由 direction 表达',
      spec: { apg: APG },
      props: { speed: 0 },
      initial: {
        parts: { root: { 'data-direction': 'left' } },
      },
      steps: [
        { kind: 'raw', why: '写出 0 会让皮肤算出无穷长的一圈，动画整段不跑', run: expectSpeed(null) },
      ],
    },
    {
      name: '两个部件各一份，按窗口 / 轨道的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'content'],
        counts: { root: 1, content: 1 },
      },
    },
  ],
}
