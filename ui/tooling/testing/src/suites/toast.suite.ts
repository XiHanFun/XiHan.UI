import type { ConformanceSuite } from '../conformance/types'
import { toastAnatomy, toastKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="toast"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

function stateOf(doc: Document): string | null {
  return partEl(doc, 'root').getAttribute('data-state')
}

function expectState(doc: Document, want: string, why: string): void {
  const got = stateOf(doc)
  if (got !== want)
    throw new Error(`${why}：期望 data-state="${want}"，实际 "${got}"`)
}

/** 计时是真时钟上的事，只能真等。每处等待的余量都写在调用点的注释里。 */
function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

export const toastSuite: ConformanceSuite = {
  component: 'toast',
  anatomy: toastAnatomy,
  keyboard: toastKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'title', text: '已保存' },
      { part: 'action-trigger', tag: 'button', text: '撤销' },
      { part: 'close-trigger', tag: 'button', text: '关闭' },
    ],
  },
  cases: [
    {
      name: '默认：root 是 status + polite，整条一起念，名字接到位',
      spec: { apg: `${APG}#roles_states_properties` },
      // duration=0 即关掉自动消失：这条用例要的是一个不会自己走掉的稳定初始帧
      props: { duration: 0 },
      initial: {
        order: ['root', 'title', 'action-trigger', 'close-trigger'],
        parts: {
          'root': {
            'role': 'status',
            'aria-live': 'polite',
            // 只念变化的那一小块，用户会听到半截话
            'aria-atomic': 'true',
            'aria-labelledby': '@part(title)',
            'data-type': 'info',
            // 配色走全库共用的语气层，由 type 派生
            'data-tone': 'info',
            'data-state': 'visible',
            'data-paused': null,
            'hidden': null,
          },
          'title': { id: '@self' },
          'action-trigger': { type: 'button' },
          'close-trigger': {
            'type': 'button',
            'aria-label': 'Close',
            'disabled': null,
            'data-disabled': null,
            'hidden': null,
          },
        },
      },
    },
    {
      name: 'type=error：换成 alert + assertive，打断当前朗读',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { duration: 0, type: 'error' },
      initial: {
        parts: {
          root: {
            'role': 'alert',
            'aria-live': 'assertive',
            'data-type': 'error',
            // 词汇表里没有 error 这个语气，出错走 danger
            'data-tone': 'danger',
          },
        },
      },
    },
    {
      name: 'Enter / Space：两个触发器都是原生 <button type="button">，激活交给平台',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['toast.kbd.close', 'toast.kbd.action'],
      props: { duration: 0 },
      steps: [
        nativeActivation('toast', 'close-trigger'),
        nativeActivation('toast', 'action-trigger'),
      ],
    },
    {
      name: '到点自动退场：先转 dismissing，走完退场窗口转 unmounted，内容一个也不卸载',
      spec: { apg: APG },
      // duration 与 removeDelay 都给足：太紧时事件断言会落到错的帧，
      // 退场窗口太窄则轮询式等待会一步跨过 dismissing。
      props: { id: 't1', duration: 100, removeDelay: 300 },
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'dismissing' } },
          expect: {
            // 退场动画还要播，此刻不能收起
            parts: { root: { 'data-state': 'dismissing', 'hidden': null } },
            events: [{ type: 'status-change', detail: { id: 't1', status: 'dismissing' } }],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'unmounted' } },
          expect: {
            // 收起而不是卸载：作者写在里面的节点归作者
            counts: { 'root': 1, 'title': 1, 'action-trigger': 1, 'close-trigger': 1 },
            parts: { root: { 'data-state': 'unmounted', 'hidden': '' } },
            events: [{ type: 'status-change', detail: { id: 't1', status: 'unmounted' } }],
          },
        },
      ],
    },
    {
      name: '点关闭：立即进入退场并报出去，随后照常走到 unmounted',
      spec: { apg: APG },
      props: { id: 't1', duration: 0, removeDelay: 300 },
      steps: [
        {
          kind: 'click',
          part: 'close-trigger',
          expect: {
            parts: { root: { 'data-state': 'dismissing' } },
            events: [{ type: 'status-change', detail: { id: 't1', status: 'dismissing' } }],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'unmounted' } },
          expect: { parts: { root: { hidden: '' } } },
        },
      ],
    },
    {
      name: '点操作按钮：同样进入退场（先发 action 再走）',
      spec: { apg: APG },
      props: { id: 't1', duration: 0, removeDelay: 300 },
      steps: [
        {
          kind: 'click',
          part: 'action-trigger',
          expect: {
            parts: { root: { 'data-state': 'dismissing' } },
            events: [{ type: 'status-change', detail: { id: 't1', status: 'dismissing' } }],
          },
        },
      ],
    },
    {
      name: 'closable=false：关闭按钮 disabled 且收起，直接派 click 也退不了场',
      spec: { apg: APG },
      props: { duration: 0, closable: false },
      initial: {
        parts: {
          'close-trigger': {
            'disabled': '',
            'data-disabled': '',
            'hidden': '',
          },
        },
      },
      steps: [
        dispatchClickOnDisabled('toast', 'close-trigger', {
          parts: { root: { 'data-state': 'visible' } },
          events: [],
        }),
      ],
    },
    {
      name: '指针停在条子上：计时按住，移开后接着走剩下那一段而不是从头重来',
      spec: { apg: APG },
      // removeDelay 给得很大：退场后稳稳停在 dismissing，末帧不会随抖动在两个状态之间摇摆
      props: { id: 't1', duration: 500, removeDelay: 5000 },
      steps: [
        {
          kind: 'raw',
          why: '悬停按住与剩余预算都是真时钟上的事，声明式步骤表达不了；hover 也没有对应的步骤类型',
          run: async ({ doc }) => {
            const root = partEl(doc, 'root')

            // 先跑掉 200ms（离 500 还有 300 的余量，不会提前退场）
            await sleep(200)
            expectState(doc, 'visible', '预算才跑掉一小半')

            root.dispatchEvent(new Event('pointerenter'))

            // 按住期间等 400ms，比剩下的 300ms 还长；属性要等适配器提交到 DOM 才看得见
            await sleep(400)
            expectState(doc, 'visible', '暂停期间不该消耗预算')
            if (root.getAttribute('data-paused') !== '')
              throw new Error('指针停在条子上时应当标出 data-paused')

            root.dispatchEvent(new Event('pointerleave'))

            // 恢复后等 400ms：接着走的实现在剩余 300ms 处退场；
            // 从头重来的实现要等满 500ms，此刻还稳稳挂在台上
            await sleep(400)
            expectState(doc, 'dismissing', '恢复后应当接着走完剩余时间')
          },
          expect: {
            parts: { root: { 'data-state': 'dismissing', 'data-paused': null } },
            events: [{ type: 'status-change', detail: { id: 't1', status: 'dismissing' } }],
          },
        },
      ],
    },
    {
      name: '焦点落进条子内部也按住计时，焦点离场才放开',
      spec: { apg: APG },
      // duration=0 时没有计时器，但暂停来源照样记账
      props: { duration: 0 },
      steps: [
        {
          kind: 'focus',
          part: 'action-trigger',
          expect: { parts: { root: { 'data-paused': '' } } },
        },
        {
          kind: 'blur',
          expect: { parts: { root: { 'data-paused': null } } },
        },
      ],
    },
    {
      name: 'type=loading 不自动消失：事情还没完，不能替用户把进度抹掉',
      spec: { apg: APG },
      props: { type: 'loading', duration: 40 },
      steps: [
        {
          kind: 'raw',
          why: '"过了很久也没走掉"只能真等一段再看',
          run: async ({ doc }) => {
            // 等到 duration 的五倍开外，按 duration 起计时器的实现早该退场了
            await sleep(200)
            expectState(doc, 'visible', 'loading 不该到点自动消失')
          },
          expect: {
            // loading 既不是好消息也不是坏消息，语气走中性
            parts: { root: { 'data-state': 'visible', 'data-type': 'loading', 'data-tone': 'neutral' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'loading 转 success：预算重算并开始计时，不再挂着不走',
      spec: { apg: APG },
      props: { id: 't1', type: 'loading', duration: 150, removeDelay: 3000 },
      steps: [
        {
          kind: 'raw',
          why: '先确认它确实停在台上，后面那步才有判别力',
          run: async ({ doc }) => {
            // 等过整份 duration：按 duration 起计时器的实现在这里就已经退场了
            await sleep(250)
            expectState(doc, 'visible', 'loading 期间不该退场')
          },
        },
        { kind: 'setProps', props: { type: 'success' } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'dismissing' } },
          expect: {
            parts: { root: { 'data-type': 'success' } },
            events: [{ type: 'status-change', detail: { id: 't1', status: 'dismissing' } }],
          },
        },
      ],
    },
    {
      name: '作者没写文案时由适配器填入 title',
      spec: { apg: APG },
      // 部件空着：队列里的条目是纯数据，文案来自那边
      fixture: () => ({
        part: 'root',
        children: [
          { part: 'title' },
        ],
      }),
      props: { duration: 0, title: '已保存' },
      steps: [
        {
          kind: 'raw',
          why: '文字不是属性，进不了归一化快照（快照只收结构与 aria-/data- 属性）',
          run: ({ doc }) => {
            const title = partEl(doc, 'title').textContent?.trim()
            if (title !== '已保存')
              throw new Error(`title 部件应填入标题文案，实际 "${title}"`)
          },
        },
      ],
    },
  ],
}
