import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { numberAnimationAnatomy, numberAnimationKeyboard } from '@xihan-ui/headless'

// status 是 ARIA 的角色定义，不是一种键盘模式，APG 那边没有与之对应的交互规格
const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#status'

// 只有一个部件，数字就写在它里面
const FIXTURE: FixtureNode = { part: 'root' }

/** 跑动按真实时钟推进，两侧一次录制里跑到第几帧天然对不齐。 */
const CLOCK_BOUND = '数字按真实时钟逐帧推进，两侧一次录制里跑到第几帧天然对不齐'

function rootEl(doc: Document): HTMLElement {
  const el = doc.querySelector<HTMLElement>('[data-scope="number-animation"][data-part="root"]')
  if (!el)
    throw new Error('fixture 里没有 root 部件')
  return el
}

/** 数字只落文本，不进归一化快照，要验只能直接读节点。 */
function assertText(expected: string): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const actual = rootEl(doc).textContent
    if (actual !== expected)
      throw new Error(`数字期望 ${expected}，实际 ${actual || '(空)'}`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/**
 * 数值动画。
 *
 * 静态用例一律把 active 关掉：跑起来之后每一帧的数字都随真实时钟漂，
 * 逐帧断言与跨适配器比对都没法成立。真跑起来的那几条单独写，并标 skipParity。
 */
export const numberAnimationSuite: ConformanceSuite = {
  component: 'number-animation',
  anatomy: numberAnimationAnatomy,
  keyboard: numberAnimationKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '缺省：root 是 status 但闭麦，两个视觉轴一律不输出',
      spec: { apg: SPEC },
      props: { active: false },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': 'status',
            // status 的隐含 aria-live 就是 polite，不写等于默认开着；
            // 一个每帧都在变的数字用 polite 会把读屏刷爆，所以缺省必须显式写成 off
            'aria-live': 'off',
            'data-state': 'idle',
            'data-size': null,
            'data-tone': null,
            // 一段会变的文字，不可聚焦、不进 Tab 序列
            'tabindex': null,
          },
        },
        activeElement: null,
        events: [],
      },
      steps: [
        { kind: 'raw', why: '数字只落文本，不进归一化快照', run: assertText('0') },
      ],
    },
    {
      name: 'from 是起点：停着时显示的就是它，按 precision 与 separator 铺字',
      spec: { apg: SPEC },
      props: { active: false, from: 1234567.891, precision: 2, separator: ',' },
      steps: [
        { kind: 'raw', why: '数字只落文本', run: assertText('1,234,567.89') },
      ],
    },
    {
      name: '不给分隔符就不分隔：库不替作者猜是逗号还是空格',
      spec: { apg: SPEC },
      props: { active: false, from: 1234567, precision: 0 },
      steps: [
        { kind: 'raw', why: '数字只落文本', run: assertText('1234567') },
      ],
    },
    {
      name: '两个视觉轴如实落到根上',
      spec: { apg: SPEC },
      props: { active: false, size: 'lg', tone: 'success' },
      initial: {
        parts: {
          root: { 'data-size': 'lg', 'data-tone': 'success', 'role': 'status' },
        },
      },
    },
    {
      name: 'live 开到 polite 才播报，缺省闭麦',
      spec: { apg: SPEC },
      props: { active: false, live: 'polite' },
      initial: {
        parts: { root: { 'aria-live': 'polite' } },
      },
    },
    {
      name: '改起点：数字当场落到新起点，停着就不会自己跑起来',
      spec: { apg: SPEC },
      props: { active: false, from: 5, to: 900 },
      steps: [
        { kind: 'raw', why: '数字只落文本', run: assertText('5') },
        {
          kind: 'setProps',
          props: { from: 42 },
          expect: { parts: { root: { 'data-state': 'idle' } } },
        },
        { kind: 'raw', why: '数字只落文本', run: assertText('42') },
      ],
    },
    {
      name: '停着就一步都不挪：过了几十帧数字还在起点上',
      spec: { apg: SPEC },
      props: { active: false, from: 0, to: 100, duration: 30 },
      skipParity: CLOCK_BOUND,
      steps: [
        {
          kind: 'raw',
          why: '"什么都没发生"只能靠真等一段时间来验；时长是 30ms，等它十倍',
          run: async ({ doc, flush }) => {
            await sleep(300)
            await flush()
            const actual = rootEl(doc).textContent
            if (actual !== '0')
              throw new Error(`停着的数字不该动，期望 0，实际 ${actual || '(空)'}`)
            if (rootEl(doc).getAttribute('data-state') !== 'idle')
              throw new Error('active 为假时不该离开 idle')
          },
        },
      ],
    },
    {
      name: '走完一轮：状态落回 idle，数字停在终点本身而不是逼近值',
      spec: { apg: SPEC },
      props: { from: 0, to: 5000, duration: 40, separator: ',' },
      skipParity: CLOCK_BOUND,
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'idle' } },
          expect: { parts: { root: { 'data-state': 'idle' } } },
        },
        {
          kind: 'raw',
          why: '终点值只落文本；逐帧累出来的浮点尾巴会让它停在 4999 上，必须逐字比',
          run: assertText('5,000'),
        },
      ],
    },
    {
      name: 'active 翻真才起跑，翻真之后走到终点',
      spec: { apg: SPEC },
      props: { active: false, from: 0, to: 88, duration: 40 },
      skipParity: CLOCK_BOUND,
      steps: [
        { kind: 'setProps', props: { active: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'idle' } },
        },
        { kind: 'raw', why: '终点值只落文本', run: assertText('88') },
      ],
    },
    {
      name: '跑完之后改终点照样重新跑起来：数字跟着数据走，不必再拨 active',
      spec: { apg: SPEC },
      props: { from: 0, to: 10, duration: 30 },
      skipParity: CLOCK_BOUND,
      steps: [
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-state', value: 'idle' } } },
        { kind: 'raw', why: '数字只落文本', run: assertText('10') },
        {
          kind: 'setProps',
          props: { to: 99 },
          expect: { parts: { root: { 'data-state': 'running' } } },
        },
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-state', value: 'idle' } } },
        { kind: 'raw', why: '数字只落文本', run: assertText('99') },
      ],
    },
  ],
}
