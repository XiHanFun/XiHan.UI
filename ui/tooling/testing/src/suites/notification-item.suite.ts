import type { ConformanceSuite } from '../conformance/types'
import { notificationAnatomy, notificationKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="notification"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

function stateOf(doc: Document): string | null {
  return partEl(doc, 'item').getAttribute('data-state')
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

/** 卡片的部件都属于 notification 的解剖，挂载点却是单条卡片：Vue 与 React 按这个名字解析部件组件。 */
const C = 'notification'

// 单条卡片单独一份套件：WC 侧卡片是另一个自定义元素（<xh-notification-item>），
// 与队列不在同一个宿主里，队列那份夹具挂不进来。计时、暂停、按压与退场都在这里守
export const notificationItemSuite: ConformanceSuite = {
  component: 'notification-item',
  anatomy: notificationAnatomy,
  // 键盘表里卡片那几行归这份套件，叠摞里的 Escape 归队列那份
  keyboard: { ...notificationKeyboard, rows: notificationKeyboard.rows.filter(row => row.id !== 'notification.kbd.collapse') },
  fixture: {
    part: 'item',
    children: [
      { part: 'item-indicator', component: C, tag: 'span' },
      {
        part: 'item-content',
        component: C,
        children: [
          { part: 'item-title', component: C, text: '已保存' },
          { part: 'item-description', component: C, text: '操作已写入云端' },
        ],
      },
      { part: 'item-action-trigger', component: C, tag: 'button', text: '撤销' },
      { part: 'item-progress', component: C },
      { part: 'item-close-trigger', component: C, tag: 'button', text: '关闭' },
    ],
  },
  cases: [
    {
      name: '默认：卡片是 status + polite，整条一起念，名字接到位',
      spec: { apg: `${APG}#roles_states_properties` },
      // duration=0 即关掉自动消失：这条用例要的是一个不会自己走掉的稳定初始帧
      props: { duration: 0, description: '操作已写入云端' },
      initial: {
        order: ['item', 'item-indicator', 'item-content', 'item-title', 'item-description', 'item-action-trigger', 'item-progress', 'item-close-trigger'],
        counts: { 'item': 1, 'item-indicator': 1, 'item-content': 1, 'item-title': 1, 'item-description': 1, 'item-action-trigger': 1, 'item-progress': 1, 'item-close-trigger': 1 },
        parts: {
          'item': {
            'role': 'status',
            'aria-live': 'polite',
            // 只念变化的那一小块，用户会听到半截话
            'aria-atomic': 'true',
            'aria-labelledby': '@part(item-title)',
            'aria-describedby': '@part(item-description)',
            // 排版随预设，缺省是卡片
            'data-preset': 'card',
            // 配色走全库共用的语气层，tone 直接落上去；不在加载中就没有 data-loading
            'data-tone': 'info',
            'data-loading': null,
            'data-state': 'visible',
            'data-paused': null,
            'hidden': null,
          },
          'item-title': { id: '@self' },
          'item-description': { id: '@self' },
          // 带文案的离散动作钮：text outline 档，固定 sm
          'item-action-trigger': {
            'type': 'button',
            'data-xh-action-control': '',
            'data-xh-action-profile': 'text',
            'data-xh-action-variant': 'outline',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'sm',
          },
          'item-close-trigger': {
            'type': 'button',
            'aria-label': 'Close',
            'disabled': null,
            'data-disabled': null,
            'hidden': null,
            // 只有字形的离散动作钮：icon ghost 档；卡片的叉钉在角上，与浮层角落关闭钮同一档 sm
            'data-xh-action-control': '',
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'sm',
          },
        },
      },
    },
    {
      name: 'tone=danger：换成 alert + assertive，打断当前朗读',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { duration: 0, tone: 'danger' },
      initial: {
        parts: {
          item: {
            'role': 'alert',
            'aria-live': 'assertive',
            'data-tone': 'danger',
          },
        },
      },
    },
    {
      name: 'preset=toast：一行排版的轻提示，叉退到行级动作钮的 xs',
      spec: { adr: 'notification-preset' },
      props: { duration: 0, preset: 'toast' },
      initial: {
        parts: {
          'item': {
            'role': 'status',
            'data-preset': 'toast',
          },
          'item-close-trigger': {
            'data-xh-action-profile': 'icon',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-size': 'xs',
          },
          'item-action-trigger': { 'data-xh-action-size': 'sm' },
        },
      },
    },
    {
      name: 'Enter / Space：两个触发器都是原生 <button type="button">，激活交给平台',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['notification.kbd.close', 'notification.kbd.action'],
      props: { duration: 0 },
      steps: [
        nativeActivation('notification', 'item-close-trigger'),
        nativeActivation('notification', 'item-action-trigger'),
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：关闭钮与操作钮各自投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['notification.kbd.press'],
      props: { duration: 0 },
      steps: [
        heldPress('notification', 'item-close-trigger'),
        heldPress('notification', 'item-action-trigger'),
      ],
    },
    {
      name: 'loading：操作钮照常可点，按住同样有回执；退场后按住不进',
      spec: { adr: 'press-channel' },
      // id 显式给：status-change 的 detail 带 id，各家 scope 流水号不同
      props: { id: 't1', loading: true },
      steps: [
        heldPress('notification', 'item-action-trigger'),
        {
          kind: 'click',
          part: 'item-close-trigger',
          // 这里没有退场动画可等，进入退场后随即收起
          expect: {
            parts: { item: { 'data-state': 'unmounted' } },
            events: [
              { type: 'status-change', detail: { id: 't1', status: 'dismissing' } },
              { type: 'status-change', detail: { id: 't1', status: 'unmounted' } },
            ],
          },
        },
        heldPressIgnored('notification', 'item-action-trigger', '进入退场后机器不再接按压'),
      ],
    },
    {
      name: '到点自动退场：先报 dismissing，退场动画播完（这里没有可等的）转 unmounted，内容一个也不卸载',
      spec: { apg: APG },
      // duration 给足：太紧时事件断言会落到错的帧
      props: { id: 't1', duration: 100 },
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'item', name: 'data-state', value: 'unmounted' } },
          expect: {
            // 收起而不是卸载：作者写在里面的节点归作者
            counts: { 'item': 1, 'item-title': 1, 'item-action-trigger': 1, 'item-close-trigger': 1 },
            parts: { item: { 'data-state': 'unmounted', 'hidden': '' } },
            events: [
              { type: 'status-change', detail: { id: 't1', status: 'dismissing' } },
              { type: 'status-change', detail: { id: 't1', status: 'unmounted' } },
            ],
          },
        },
      ],
    },
    {
      name: '点关闭：立即进入退场并报出去，退场动画播完（这里没有可等的）走到 unmounted',
      spec: { apg: APG },
      props: { id: 't1', duration: 0 },
      steps: [
        {
          kind: 'click',
          part: 'item-close-trigger',
          expect: {
            parts: { item: { 'data-state': 'unmounted', 'hidden': '' } },
            events: [
              { type: 'status-change', detail: { id: 't1', status: 'dismissing' } },
              { type: 'status-change', detail: { id: 't1', status: 'unmounted' } },
            ],
          },
        },
      ],
    },
    {
      name: '点操作按钮：同样进入退场（先发 action 再走）',
      spec: { apg: APG },
      props: { id: 't1', duration: 0 },
      steps: [
        {
          kind: 'click',
          part: 'item-action-trigger',
          expect: {
            parts: { item: { 'data-state': 'unmounted' } },
            events: [
              { type: 'action', detail: { id: 't1' } },
              { type: 'status-change', detail: { id: 't1', status: 'dismissing' } },
              { type: 'status-change', detail: { id: 't1', status: 'unmounted' } },
            ],
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
          'item-close-trigger': {
            'disabled': '',
            'data-disabled': '',
            'hidden': '',
          },
        },
      },
      steps: [
        dispatchClickOnDisabled('notification', 'item-close-trigger', {
          parts: { item: { 'data-state': 'visible' } },
          events: [],
        }),
        heldPressIgnored('notification', 'item-close-trigger', '不可关闭时关闭按钮原生 disabled，不接受按压'),
      ],
    },
    {
      name: '指针停在卡片上：计时按住，移开后接着走剩下那一段而不是从头重来',
      spec: { apg: APG },
      props: { id: 't1', duration: 500 },
      steps: [
        {
          kind: 'raw',
          why: '悬停按住与剩余预算都是真时钟上的事，声明式步骤表达不了；hover 也没有对应的步骤类型',
          run: async ({ doc }) => {
            const root = partEl(doc, 'item')

            // 先跑掉 200ms（离 500 还有 300 的余量，不会提前退场）
            await sleep(200)
            expectState(doc, 'visible', '预算才跑掉一小半')

            root.dispatchEvent(new Event('pointerenter'))

            // 按住期间等 400ms，比剩下的 300ms 还长；属性要等适配器提交到 DOM 才看得见
            await sleep(400)
            expectState(doc, 'visible', '暂停期间不该消耗预算')
            if (root.getAttribute('data-paused') !== '')
              throw new Error('指针停在卡片上时应当标出 data-paused')

            root.dispatchEvent(new Event('pointerleave'))

            // 恢复后等 400ms：接着走的实现在剩余 300ms 处退场；从头重来的实现要等满 500ms，
            // 此刻还稳稳挂在台上。退场之后停在 dismissing 还是已经收起，看宿主有没有退场动画可播
            await sleep(400)
            const state = partEl(doc, 'item').getAttribute('data-state')
            if (state === 'visible')
              throw new Error('恢复后应当接着走完剩余时间：此刻还挂在台上，像是计时从头重来了')
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'item', name: 'data-state', value: 'unmounted' } },
          expect: { parts: { item: { 'data-state': 'unmounted', 'data-paused': null } } },
        },
      ],
    },
    {
      name: '焦点落进卡片内部也按住计时，焦点离场才放开',
      spec: { apg: APG },
      // duration=0 时没有计时器，但暂停来源照样记账
      props: { duration: 0 },
      steps: [
        {
          kind: 'focus',
          part: 'item-action-trigger',
          expect: { parts: { item: { 'data-paused': '' } } },
        },
        {
          kind: 'blur',
          expect: { parts: { item: { 'data-paused': null } } },
        },
      ],
    },
    {
      name: 'loading 不自动消失：事情还没完，不能替用户把进度抹掉',
      spec: { apg: APG },
      props: { loading: true, duration: 40 },
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
            // 加载中不是语气：语气位照默认落 info，转圈另由 data-loading 说
            parts: { 'item': { 'data-state': 'visible', 'data-loading': '', 'data-tone': 'info' }, 'item-indicator': { 'data-loading': '' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'loading 收尾成 success：预算重算并开始计时，不再挂着不走',
      spec: { apg: APG },
      props: { id: 't1', loading: true, duration: 150 },
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
        { kind: 'setProps', props: { loading: false, tone: 'success' } },
        {
          kind: 'settle',
          until: { attr: { part: 'item', name: 'data-state', value: 'unmounted' } },
          expect: {
            parts: { item: { 'data-tone': 'success', 'data-loading': null } },
            events: [
              { type: 'status-change', detail: { id: 't1', status: 'dismissing' } },
              { type: 'status-change', detail: { id: 't1', status: 'unmounted' } },
            ],
          },
        },
      ],
    },
    {
      name: '作者没写文案时由适配器填入 title',
      spec: { apg: APG },
      // 部件空着：队列里的条目是纯数据，文案来自那边
      fixture: () => ({
        part: 'item',
        children: [
          { part: 'item-content', component: C, children: [{ part: 'item-title', component: C }] },
        ],
      }),
      props: { duration: 0, title: '已保存' },
      steps: [
        {
          kind: 'raw',
          why: '文字不是属性，进不了归一化快照（快照只收结构与 aria-/data- 属性）',
          run: ({ doc }) => {
            const title = partEl(doc, 'item-title').textContent?.trim()
            if (title !== '已保存')
              throw new Error(`item-title 部件应填入标题文案，实际 "${title}"`)
          },
        },
      ],
    },
  ],
}
