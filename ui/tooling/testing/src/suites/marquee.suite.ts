import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { marqueeAnatomy, marqueeKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'
import { heldPress } from './shared/press-channel'

// 跑马灯是容器，APG 没有对应模式；判据锁四件：方向连同它所在的轴如实落到根上、
// 悬停暂停缺省开而铺满缺省关、速度只走内联变量不占语义属性、暂停开关按按钮模式给名字与状态。
// 滚多快、怎么滚归皮肤，这里不验动画本身——动画是样式层的事实，不是结构契约。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'
const BUTTON = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

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
      // 不给内容：皮肤按状态画暂停 / 播放图标，名字全靠 aria-label
      { part: 'autoplay-trigger', tag: 'button' },
    ],
  },
  cases: [
    {
      name: '缺省：往左滚、轴是横的，悬停暂停开、铺满关，根不写 role',
      spec: { apg: APG },
      initial: {
        parts: {
          'root': {
            'role': null,
            'data-direction': 'left',
            'data-orientation': 'horizontal',
            'data-pause-on-hover': '',
            'data-paused': null,
            'data-auto-fill': null,
          },
          // 名字是下一步的动作，不带 aria-pressed：名字与按压态各说各的会念成「暂停 已按下」
          'autoplay-trigger': {
            'type': 'button',
            'aria-label': 'Pause scrolling',
            'aria-pressed': null,
            'aria-controls': '@part(content)',
            'data-state': 'running',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-size': 'md',
            'data-xh-action-variant': 'outline',
          },
        },
      },
      steps: [
        { kind: 'raw', why: '速度没给时根上不该出现那条变量；快照不采集 style', run: expectSpeed(null) },
      ],
    },
    {
      name: '受控暂停：paused 翻真落成 data-paused，翻假当场撤掉',
      spec: { apg: APG },
      props: { paused: true },
      initial: {
        parts: { root: { 'data-paused': '' } },
      },
      steps: [
        {
          kind: 'setProps',
          props: { paused: false },
          expect: {
            parts: { root: { 'data-paused': null } },
          },
        },
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
      name: '悬停暂停写 false 才关，铺满写 true 才开；关掉时不留空属性',
      spec: { apg: APG },
      props: { pauseOnHover: false, autoFill: true },
      initial: {
        parts: {
          root: {
            'data-pause-on-hover': null,
            'data-auto-fill': '',
          },
        },
      },
    },
    {
      name: '按一下暂停开关停住、再按一下继续：名字、状态与根上的 data-paused 一起换',
      spec: { apg: BUTTON },
      steps: [
        {
          kind: 'click',
          part: 'autoplay-trigger',
          expect: {
            parts: {
              'root': { 'data-paused': '' },
              'autoplay-trigger': { 'aria-label': 'Resume scrolling', 'data-state': 'paused', 'aria-pressed': null },
            },
            events: [{ type: 'paused-change', detail: { paused: true } }],
          },
        },
        {
          kind: 'click',
          part: 'autoplay-trigger',
          expect: {
            parts: {
              'root': { 'data-paused': null },
              'autoplay-trigger': { 'aria-label': 'Pause scrolling', 'data-state': 'running' },
            },
            events: [{ type: 'paused-change', detail: { paused: false } }],
          },
        },
      ],
    },
    {
      name: 'defaultPaused 给非受控初值：一进来就停着，开关的名字是继续',
      spec: { apg: BUTTON },
      props: { defaultPaused: true },
      initial: {
        parts: {
          'root': { 'data-paused': '' },
          'autoplay-trigger': { 'aria-label': 'Resume scrolling', 'data-state': 'paused' },
        },
      },
    },
    {
      name: 'translations 换掉两种状态下的名字',
      spec: { apg: BUTTON },
      props: { translations: { autoplayTriggerPause: '暂停滚动', autoplayTriggerPlay: '继续滚动' } },
      initial: {
        parts: { 'autoplay-trigger': { 'aria-label': '暂停滚动' } },
      },
      steps: [
        {
          kind: 'click',
          part: 'autoplay-trigger',
          expect: { parts: { 'autoplay-trigger': { 'aria-label': '继续滚动' } } },
        },
      ],
    },
    {
      name: 'Enter / Space 由原生按钮负责：暂停开关得是 <button type="button">',
      spec: { apg: `${BUTTON}#keyboardinteraction` },
      covers: ['marquee.kbd.activate'],
      steps: [nativeActivation('marquee', 'autoplay-trigger')],
    },
    {
      name: '按住暂停开关期间投影 data-pressed，抬起或失焦撤下',
      spec: { apg: BUTTON },
      covers: ['marquee.kbd.press'],
      steps: [heldPress('marquee', 'autoplay-trigger')],
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
      name: '三个部件各一份，按窗口 / 轨道 / 开关的文档序排列',
      spec: { apg: APG },
      initial: {
        order: ['root', 'content', 'autoplay-trigger'],
        counts: { 'root': 1, 'content': 1, 'autoplay-trigger': 1 },
      },
    },
  ],
}
