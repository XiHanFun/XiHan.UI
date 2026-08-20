import type { TimerSegments } from '@xihan-ui/headless'
import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { timerAnatomy, timerKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#timer'
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'

/** 一旦跑起来，两侧一次录制里走到第几拍随真实时钟漂，逐帧比对拿不到同一个数。 */
const CLOCK_BOUND = '起跑后各段数字与时间区的名字随真实时钟走，两侧录到的不是同一刻'

/**
 * 时、分、秒三段配两个冒号，外加一个起停按钮。
 * 每段用 unit 声明自己是哪一段：Vue 侧它是组件 prop，WC 侧是作者写在节点上的属性，
 * 两端都不落进快照采集的属性表，比对的是机器写回的 data-unit。
 */
const timerTree: FixtureNode = {
  part: 'root',
  children: [
    {
      part: 'area',
      children: [
        { part: 'item', tag: 'span', attrs: { unit: 'hours' } },
        { part: 'separator', tag: 'span', text: ':' },
        { part: 'item', tag: 'span', attrs: { unit: 'minutes' } },
        { part: 'separator', tag: 'span', text: ':' },
        { part: 'item', tag: 'span', attrs: { unit: 'seconds' } },
      ],
    },
    { part: 'control', tag: 'button', text: '起停' },
  ],
}

/** 每段条目里先写上作者自己的字，用来验这段文本归不归组件管。 */
function itemsWithText(base: FixtureNode): FixtureNode {
  const area = base.children?.[0]
  return {
    ...base,
    children: base.children?.map(node => node === area
      ? { ...node, children: node.children?.map(c => (c.part === 'item' ? { ...c, text: '作者写的' } : c)) }
      : node),
  }
}

/** 数字只落文本，不进归一化快照，要验只能直接读节点。 */
function assertSegmentTexts(expected: readonly string[]): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const actual = [...doc.querySelectorAll<HTMLElement>('[data-scope="timer"][data-part="item"]')]
      .map(el => el.textContent ?? '')
    if (actual.join(':') !== expected.join(':'))
      throw new Error(`各段期望 ${expected.join(':')}，实际 ${actual.join(':') || '(空)'}`)
  }
}

export const timerSuite: ConformanceSuite = {
  component: 'timer',
  anatomy: timerAnatomy,
  keyboard: timerKeyboard,
  fixture: timerTree,
  cases: [
    {
      name: '默认没起步：时间区是 timer 角色且播报关着，数字与记号对读屏隐藏',
      spec: { apg: SPEC },
      initial: {
        order: ['root', 'area', 'item[0]', 'separator[0]', 'item[1]', 'separator[1]', 'item[2]', 'control'],
        counts: { root: 1, area: 1, item: 3, separator: 2, control: 1 },
        parts: {
          root: {
            'role': null,
            'data-state': 'idle',
            // 正着走不留这个属性；三轴没写也一个都不输出
            'data-countdown': null,
            'data-size': null,
          },
          area: {
            'role': 'timer',
            'aria-live': 'off',
            // 屏幕上只有数字与冒号，名字得把每段说清楚
            'aria-label': '0 hours 0 minutes 0 seconds',
            'data-state': 'idle',
          },
          item: [
            { 'aria-hidden': 'true', 'data-unit': 'hours' },
            { 'aria-hidden': 'true', 'data-unit': 'minutes' },
            { 'aria-hidden': 'true', 'data-unit': 'seconds' },
          ],
          separator: [{ 'aria-hidden': 'true' }, { 'aria-hidden': 'true' }],
          control: {
            'type': 'button',
            'aria-label': 'Start',
            'data-action': 'start',
            // 起停按钮不是集合条目，不上 aria-disabled
            'aria-disabled': null,
          },
        },
        activeElement: null,
      },
    },
    {
      name: '倒着走：data-countdown 立起来，显示的是起点而不是 0',
      spec: { apg: SPEC },
      props: { countdown: true, startMs: 90_000 },
      initial: {
        parts: {
          root: { 'data-countdown': '', 'data-state': 'idle' },
          // 内建名字按数量分单复数
          area: { 'aria-label': '0 hours 1 minute 30 seconds' },
        },
      },
    },
    {
      name: '尺寸档原样落到 root 上，子部件不重复标注',
      spec: { apg: SPEC },
      props: { size: 'lg' },
      initial: {
        parts: {
          root: { 'data-size': 'lg' },
          area: { 'data-size': null },
          item: [{ 'data-size': null }, { 'data-size': null }, { 'data-size': null }],
        },
      },
    },
    {
      name: '按一下起停按钮就开跑：状态换到 running，按钮的语义与名字跟着换成暂停',
      spec: { apg: APG },
      skipParity: CLOCK_BOUND,
      steps: [
        {
          kind: 'click',
          part: 'control',
          expect: {
            parts: {
              root: { 'data-state': 'running' },
              area: { 'data-state': 'running' },
              control: { 'data-action': 'pause', 'aria-label': 'Pause' },
            },
          },
        },
        {
          kind: 'click',
          part: 'control',
          expect: {
            parts: {
              root: { 'data-state': 'paused' },
              control: { 'data-action': 'resume', 'aria-label': 'Resume' },
            },
          },
        },
      ],
    },
    {
      name: '文案整条可换：时间区与按钮的名字都走 translations',
      spec: { apg: SPEC },
      props: {
        startMs: 65_000,
        translations: {
          // 只摆了分和秒时，内建那句「几时几分几秒」会多念一段，名字要作者自己给
          time: (s: TimerSegments) => `${s.minutes} 分 ${s.seconds} 秒`,
          start: '开始',
        },
      },
      initial: {
        parts: {
          area: { 'aria-label': '1 分 5 秒' },
          control: { 'aria-label': '开始' },
        },
      },
    },
    {
      name: '走到终点：时间区与 root 都换到 completed，按钮的语义与名字换成归零',
      spec: { apg: SPEC },
      // 倒计 60 毫秒：一拍都跳不到就走完，两侧不必等真实时钟
      props: { countdown: true, startMs: 60 },
      steps: [
        {
          kind: 'click',
          part: 'control',
          expect: {
            parts: { root: { 'data-state': 'running' } },
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'completed' } },
          expect: {
            parts: {
              root: { 'data-state': 'completed' },
              area: { 'data-state': 'completed', 'aria-label': '0 hours 0 minutes 0 seconds' },
              control: { 'data-action': 'reset', 'aria-label': 'Reset' },
            },
          },
        },
      ],
    },
    {
      name: '每一段的数字由组件写进条目里，作者只声明这一段是什么',
      spec: { apg: SPEC },
      props: { startMs: 3_661_000 },
      steps: [
        {
          kind: 'raw',
          why: '数字落在文本节点上，归一化快照只采属性，看不到它',
          run: assertSegmentTexts(['01', '01', '01']),
        },
      ],
    },
    {
      name: '条目里的文本恒归组件写：作者先写进去的字被这一段的数字盖掉',
      spec: { apg: SPEC },
      fixture: itemsWithText,
      props: { startMs: 3_661_000 },
      steps: [
        {
          kind: 'raw',
          why: '数字落在文本节点上，归一化快照只采属性，看不到它',
          run: assertSegmentTexts(['01', '01', '01']),
        },
      ],
    },
    {
      name: 'Enter / Space 靠原生按钮的激活行为，control 必须是 <button type="button">',
      spec: { apg: APG },
      covers: ['timer.kbd.control'],
      steps: [nativeActivation('timer', 'control')],
    },
  ],
}
