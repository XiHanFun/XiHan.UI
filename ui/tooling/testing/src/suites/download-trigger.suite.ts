import type { ConformanceSuite } from '../conformance/types'
import { downloadTriggerAnatomy, downloadTriggerKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

/** 永不兑现的取数：把组件按在 preparing 上，好断言在途那一帧的属性表。 */
const pending = (): Promise<string> => new Promise<string>(() => {})

/**
 * 推到宏任务才失败的取数。
 *
 * 立刻拒绝的 promise 会在 click 之后那一轮冲刷（全是微任务）里就走完，
 * preparing 那一帧根本采不到；改用计时器推到宏任务，冲刷期间状态稳定在 preparing，
 * 随后的 settle 会让出宏任务，失败在那时落地。
 */
function failLater(): Promise<string> {
  return new Promise<string>((_resolve, reject) => {
    setTimeout(() => reject(new Error('取数失败')), 0)
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
      name: '闲置态：单一 root，type=button、data-state=idle、aria-busy=false，不输出禁用标记',
      spec: { apg: APG },
      props: { data: 'a,b\n1,2', fileName: 'report.csv' },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'type': 'button',
            'aria-busy': 'false',
            'data-state': 'idle',
            'data-disabled': null,
            'disabled': null,
            // 单体原生控件的禁用一律走原生 disabled，这个属性任何时候都不该出现
            'aria-disabled': null,
          },
        },
        activeElement: null,
        events: [],
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
                // 在途不禁用：禁用会把焦点从按钮上弹走，键盘用户等回来时不知道自己在哪
                'disabled': null,
                'aria-disabled': null,
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
            parts: { root: { 'data-state': 'idle', 'aria-busy': 'false' } },
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
            'aria-busy': 'false',
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
