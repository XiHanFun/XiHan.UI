import type { ConformanceSuite } from '../conformance/types'
import { downloadTriggerAnatomy, downloadTriggerKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

/** 永不兑现的取数：把组件按在 preparing 上，好断言在途那一帧的属性表。 */
const pending = (): Promise<string> => new Promise<string>(() => {})

/**
 * 推到宏任务才失败的取数。
 *
 * 立刻拒绝的 promise 会在 click 之后那一轮冲刷里就走完，preparing 那一帧根本采不到；
 * 改用计时器推到宏任务，冲刷期间状态稳定在 preparing，随后的 settle 会等到失败落地。
 *
 * 延时刻意留出余量，不用 0：冲刷是不是只走微任务，各家宿主给不出同一个答案——
 * Vue 的 nextTick 只排微任务，而 React 的 act 在有排队工作时会让出一个宏任务，
 * 0ms 的计时器于是可能在 click 那一拍里就烧掉，preparing 与 idle 两帧一起采空。
 * settle 每 10ms 让一次、最多等 1000ms，这个量级绰绰有余。
 */
function failLater(): Promise<string> {
  return new Promise<string>((_resolve, reject) => {
    setTimeout(() => reject(new Error('取数失败')), 50)
  })
}

export const downloadTriggerSuite: ConformanceSuite = {
  component: 'download-trigger',
  anatomy: downloadTriggerAnatomy,
  keyboard: downloadTriggerKeyboard,
  fixture: { part: 'root', tag: 'button', children: [{ text: '导出 CSV' }] },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，组件不自己接这两个键；这里守它确实是原生 button[type=button]
      name: 'Enter / Space 发起下载：角色节点是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['download-trigger.kbd.activate'],
      steps: [nativeActivation('download-trigger', 'root')],
    },
    {
      name: '闲置态：单一 root，type=button、data-state=idle、不报 aria-busy，不输出禁用标记',
      spec: { apg: APG },
      props: { data: 'a,b\n1,2', fileName: 'report.csv' },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'type': 'button',
            'aria-busy': null,
            'data-state': 'idle',
            'data-disabled': null,
            'disabled': null,
            // 单体原生控件的禁用一律走原生 disabled，这个属性任何时候都不该出现
            'aria-disabled': null,
            'data-pressed': null,
            // 定尺的独立动作按钮：形态缺省显式落 subtle（缺省中性，solid 才品牌实心）
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'subtle',
            'data-variant': 'subtle',
          },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: 'Space / Enter 按住与触屏按下：root 投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['download-trigger.kbd.press'],
      props: { data: 'a,b\n1,2', fileName: 'report.csv' },
      steps: [heldPress('download-trigger', 'root')],
    },
    {
      name: 'disabled：按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { data: 'a,b\n1,2', fileName: 'report.csv', disabled: true },
      steps: [heldPressIgnored('download-trigger', 'root', '禁用时不接受按压')],
    },
    {
      name: 'variant 原样投影：data-variant 与 data-xh-action-variant 同源',
      spec: { adr: 'action-control-family' },
      props: { data: 'a,b\n1,2', fileName: 'report.csv', variant: 'solid' },
      initial: {
        parts: { root: { 'data-variant': 'solid', 'data-xh-action-variant': 'solid' } },
      },
    },
    {
      name: '取数在途：data-state=preparing 且 aria-busy=true，按钮不变禁用，未提前报完成',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { data: pending, fileName: 'report.csv' },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: {
              root: {
                'data-state': 'preparing',
                'aria-busy': 'true',
                // 在途不走原生 disabled：那会把焦点从按钮上弹走，键盘用户等回来时不知道自己在哪；
                // 「现在按不动」由 aria-disabled 如实报出，与 aria-busy 是两件事（同 button 的 loading）
                'disabled': null,
                'aria-disabled': 'true',
              },
            },
            // 数据还没到手，这一帧不该有任何对外事件
            events: [],
          },
        },
      ],
    },
    {
      name: '取数失败：先进 preparing，再退回 idle 并派一次 download-error',
      spec: { apg: APG },
      props: { data: failLater, fileName: 'report.csv' },
      steps: [
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'data-state': 'preparing', 'aria-busy': 'true' } },
            events: [],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'idle' } },
          expect: {
            parts: { root: { 'data-state': 'idle', 'aria-busy': null } },
            // 失败必须说出来：这两个事件是本组件对外的全部产出
            events: [{ type: 'download-error' }],
          },
        },
      ],
    },
    {
      name: '整体禁用：原生 disabled 加 data-disabled，守卫挡住这一次下载且不派事件',
      spec: { apg: APG },
      props: { data: 'x', fileName: 'report.csv', disabled: true },
      initial: {
        parts: {
          root: {
            'disabled': '',
            'data-disabled': '',
            'data-state': 'idle',
            'aria-busy': null,
            'aria-disabled': null,
          },
        },
        events: [],
      },
      steps: [
        dispatchClickOnDisabled('download-trigger', 'root', {
          parts: { root: { 'data-state': 'idle' } },
          events: [],
        }),
      ],
    },
  ],
}
