import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { countdownAnatomy, countdownKeyboard } from '@xihan-ui/headless'

// status 是 ARIA 的角色定义，不是一种键盘模式，APG 那边没有与之对应的交互规格
const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#status'

// 只有一个部件，时间就写在它里面
const FIXTURE: FixtureNode = { part: 'root' }

/** 走动按真实时钟推进，两侧一次录制里走到第几帧天然对不齐。 */
const CLOCK_BOUND = '剩余量按真实时钟逐帧推进，两侧一次录制里走到第几帧天然对不齐'

const ONE_HOUR = 3_600_000

function rootEl(doc: Document): HTMLElement {
  const el = doc.querySelector<HTMLElement>('[data-scope="countdown"][data-part="root"]')
  if (!el)
    throw new Error('fixture 里没有 root 部件')
  return el
}

/** 时间只落文本，不进归一化快照，要验只能直接读节点。 */
function assertText(expected: string): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const actual = rootEl(doc).textContent
    if (actual !== expected)
      throw new Error(`时间期望 ${expected}，实际 ${actual || '(空)'}`)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/**
 * 倒计时。
 *
 * 静态用例一律把 active 关掉：走起来之后每一帧的剩余量都随真实时钟漂，
 * 逐帧断言与跨适配器比对都没法成立。真走起来的那几条单独写，并标 skipParity。
 */
export const countdownSuite: ConformanceSuite = {
  component: 'countdown',
  anatomy: countdownAnatomy,
  keyboard: countdownKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '缺省：root 是 status 但闭麦，没给剩余量就是已经到点',
      spec: { apg: SPEC },
      props: { active: false },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': 'status',
            // status 的隐含 aria-live 就是 polite，不写等于默认开着；
            // 一个每秒都在变的数字用 polite 会把读屏刷爆，所以缺省必须显式写成 off
            'aria-live': 'off',
            'data-state': 'idle',
            'data-finished': '',
            // 一段会变的文字，不可聚焦、不进 Tab 序列
            'tabindex': null,
          },
        },
        activeElement: null,
        events: [],
      },
      steps: [
        { kind: 'raw', why: '时间只落文本，不进归一化快照', run: assertText('00:00:00') },
      ],
    },
    {
      name: '按模板铺字：时分秒各自补零',
      spec: { apg: SPEC },
      props: { active: false, value: 3_723_000 },
      initial: {
        // 还有一个多小时，不是到点
        parts: { root: { 'data-finished': null } },
      },
      steps: [
        { kind: 'raw', why: '时间只落文本', run: assertText('01:02:03') },
      ],
    },
    {
      name: '小时不进位到天：100 小时就写成 100，不截成 00',
      spec: { apg: SPEC },
      props: { active: false, value: 100 * ONE_HOUR },
      steps: [
        // 截成 00 会把"还早着呢"说成"到点了"
        { kind: 'raw', why: '时间只落文本', run: assertText('100:00:00') },
      ],
    },
    {
      name: '模板里的非记号字符原样留下',
      spec: { apg: SPEC },
      props: { active: false, value: 3_723_000, format: 'H 时 m 分 s 秒' },
      steps: [
        { kind: 'raw', why: '时间只落文本', run: assertText('1 时 2 分 3 秒') },
      ],
    },
    {
      name: 'precision 管取值粒度：缺省取到整秒，SSS 也只能是 000',
      spec: { apg: SPEC },
      props: { active: false, value: 1500, format: 'ss.SSS' },
      steps: [
        // 往下取而不是四舍五入：1.5 秒显示 1 秒，那一秒才是真的还没走完
        { kind: 'raw', why: '时间只落文本', run: assertText('01.000') },
        { kind: 'setProps', props: { precision: 3 } },
        { kind: 'raw', why: '时间只落文本', run: assertText('01.500') },
      ],
    },
    {
      name: 'live 开到 polite 才播报，缺省闭麦',
      spec: { apg: SPEC },
      props: { active: false, value: 60_000, live: 'polite' },
      initial: {
        parts: { root: { 'aria-live': 'polite' } },
      },
    },
    {
      name: '改剩余量：当场落到新值，停着就不会自己走起来',
      spec: { apg: SPEC },
      props: { active: false, value: 60_000 },
      steps: [
        { kind: 'raw', why: '时间只落文本', run: assertText('00:01:00') },
        {
          kind: 'setProps',
          props: { value: 3_723_000 },
          expect: { parts: { root: { 'data-state': 'idle' } } },
        },
        { kind: 'raw', why: '时间只落文本', run: assertText('01:02:03') },
      ],
    },
    {
      name: '停着就一步都不走：过了几十帧还停在原处',
      spec: { apg: SPEC },
      props: { active: false, value: 5000, precision: 3, format: 'ss.SSS' },
      skipParity: CLOCK_BOUND,
      steps: [
        {
          kind: 'raw',
          why: '"什么都没发生"只能靠真等一段时间来验',
          run: async ({ doc, flush }) => {
            await sleep(300)
            await flush()
            const actual = rootEl(doc).textContent
            if (actual !== '05.000')
              throw new Error(`停着的剩余量不该动，期望 05.000，实际 ${actual || '(空)'}`)
            if (rootEl(doc).getAttribute('data-state') !== 'idle')
              throw new Error('active 为假时不该离开 idle')
          },
        },
      ],
    },
    {
      name: '走到 0：状态落回 idle 并挂上到点标记',
      spec: { apg: SPEC },
      props: { value: 40, precision: 3, format: 'ss.SSS' },
      skipParity: CLOCK_BOUND,
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-finished', value: '' } },
          expect: {
            // 到点与暂停是两回事，两个钩子各说各的
            parts: { root: { 'data-finished': '', 'data-state': 'idle' } },
          },
        },
        { kind: 'raw', why: '时间只落文本', run: assertText('00.000') },
      ],
    },
    {
      name: '到点之后改剩余量照样重新走起来，不必再拨 active',
      spec: { apg: SPEC },
      props: { value: 40, precision: 3, format: 'ss.SSS' },
      skipParity: CLOCK_BOUND,
      steps: [
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-finished', value: '' } } },
        {
          kind: 'setProps',
          props: { value: 5000 },
          // 到点标记当场撤掉，状态也回到 running：新的一轮从新剩余量重新计时
          expect: { parts: { root: { 'data-state': 'running', 'data-finished': null } } },
        },
      ],
    },
  ],
}
