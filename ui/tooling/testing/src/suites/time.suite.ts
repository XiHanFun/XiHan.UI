import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { timeAnatomy, timeKeyboard } from '@xihan-ui/headless'

// 出处：<time> 的机器可读值写在 datetime 上。
const HTML = 'https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-time-element'

const ROOT = '[data-scope="time"][data-part="root"]'

function root({ doc }: RawStepContext): HTMLElement {
  const el = doc.querySelector<HTMLElement>(ROOT)
  if (!el)
    throw new Error('找不到 time 的 root 部件')
  return el
}

/** 核对给机器读的那个戳；null 表示断言这个属性缺席。 */
function expectStamp(expected: string | null) {
  return (ctx: RawStepContext): void => {
    const got = root(ctx).getAttribute('datetime')
    if (got !== expected)
      throw new Error(`datetime 是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
  }
}

/** 核对给人看的那段文本。 */
function expectText(expected: string) {
  return (ctx: RawStepContext): void => {
    const got = root(ctx).textContent
    if (got !== expected)
      throw new Error(`显示文本是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
  }
}

// 归一化快照只收 role / aria-* / data-* 那几类属性，datetime 与文本都不在里面，
// 而这两样恰是本组件的全部产出，故逐条用 raw 直接读 DOM。
const WHY = '归一化快照不收 datetime 与文本，而这两样正是本组件要断言的东西'

// 时刻一律写成带时分秒、不带偏移量的串：这种写法按本地时间解读，
// 换一台时区不同的机器跑出来的年月日时分秒仍是同一组数。
const AT = '2026-08-11T09:30:05'

/** time 的一致性套件：锁「戳与文本取自同一个墙钟」「认不出的时刻不编戳」。 */
export const timeSuite: ConformanceSuite = {
  component: 'time',
  anatomy: timeAnatomy,
  keyboard: timeKeyboard,
  fixture: { part: 'root', tag: 'time' },
  cases: [
    {
      name: '没给时刻：落 empty，不写 datetime，一个字都不显示',
      spec: { apg: HTML },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': null,
            'data-type': 'datetime',
            'data-state': 'empty',
            'data-relative': null,
          },
        },
        activeElement: null,
        events: [],
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp(null) },
        { kind: 'raw', why: WHY, run: expectText('') },
      ],
    },
    {
      name: '缺省 datetime 型：戳到秒，显示的也是同一个墙钟',
      spec: { apg: HTML },
      props: { value: AT },
      initial: {
        parts: { root: { 'data-type': 'datetime', 'data-state': 'ready' } },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp('2026-08-11T09:30:05') },
        { kind: 'raw', why: WHY, run: expectText('2026-08-11 09:30:05') },
      ],
    },
    {
      name: 'date 型：戳跟着收到日期精度，不留一个显示不出来的时分秒',
      spec: { apg: HTML },
      props: { value: AT, type: 'date' },
      initial: {
        parts: { root: { 'data-type': 'date', 'data-state': 'ready' } },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp('2026-08-11') },
        { kind: 'raw', why: WHY, run: expectText('2026-08-11') },
      ],
    },
    {
      name: '自定义格式串只改给人看的那段，戳不跟着变',
      spec: { apg: HTML },
      props: { value: AT, format: 'YYYY 年 M 月 D 日 H 时' },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp('2026-08-11T09:30:05') },
        { kind: 'raw', why: WHY, run: expectText('2026 年 8 月 11 日 9 时') },
      ],
    },
    {
      name: '相对说法落在档位里：立 data-relative，戳仍是那个确切时刻',
      spec: { apg: HTML },
      props: { value: '2026-08-11T09:00:00', type: 'relative', now: '2026-08-11T09:30:00' },
      initial: {
        parts: { root: { 'data-type': 'relative', 'data-state': 'ready', 'data-relative': '' } },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp('2026-08-11T09:00:00') },
        { kind: 'raw', why: WHY, run: expectText('30 分钟前') },
      ],
    },
    {
      name: '相对说法超出档位：退回绝对日期，data-relative 不写',
      spec: { apg: HTML },
      props: { value: '2026-01-01T00:00:00', type: 'relative', now: '2026-08-11T09:30:00' },
      initial: {
        parts: { root: { 'data-type': 'relative', 'data-state': 'ready', 'data-relative': null } },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp('2026-01-01T00:00:00') },
        { kind: 'raw', why: WHY, run: expectText('2026-01-01') },
      ],
    },
    {
      name: 'locale 只换用词，戳恒是同一种写法',
      spec: { apg: HTML },
      props: { value: '2026-08-11T09:00:00', type: 'relative', now: '2026-08-11T09:30:00', locale: 'en' },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp('2026-08-11T09:00:00') },
        { kind: 'raw', why: WHY, run: expectText('30 minutes ago') },
      ],
    },
    {
      name: '认不出的时刻：落 invalid 且不写 datetime，不给机器一个瞎编的戳',
      spec: { apg: HTML },
      props: { value: '下周三下午' },
      initial: {
        parts: { root: { 'data-type': 'datetime', 'data-state': 'invalid' } },
      },
      steps: [
        { kind: 'raw', why: WHY, run: expectStamp(null) },
        { kind: 'raw', why: WHY, run: expectText('') },
      ],
    },
  ],
}
