import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { composerAnatomy, composerKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

// APG 没有"聊天输入框"这个模式：键盘交互绝大部分归浏览器，组件只额外接一个 Enter。
// 出处因此指向模式总览页，而不是某一章。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

const INPUT = '[data-scope="composer"][data-part="input"]'

function inputEl(doc: Document): HTMLTextAreaElement {
  const el = doc.querySelector<HTMLTextAreaElement>(INPUT)
  if (!el)
    throw new Error('找不到 composer 的 input 部件')
  return el
}

/**
 * 直接改 DOM 值再派发 input：`type` 步骤只发按键，落不到输入框的 value 上。
 *
 * 派完必须 flush：两个适配器的重渲都是异步的，同一个 raw 步骤里紧接着读 DOM
 * 会读到上一帧，断言要么假红要么假绿。
 */
async function typeInto(ctx: RawStepContext, text: string): Promise<void> {
  const input = inputEl(ctx.doc)
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await ctx.flush()
}

function expectValue(doc: Document, want: string, why: string): void {
  const got = inputEl(doc).value
  if (got !== want)
    throw new Error(`${why}：期望 "${want}"，实际 "${got}"`)
}

/**
 * 输入框只有 root / input / submit-trigger 三个部件，没有独立的停止按钮——
 * 流式期间发送按钮**原位**换身份，只改 data-mode 与 aria-label。用例因此反复盯着
 * 同一个 submit-trigger：它换没换身份、该不该置灰、按下去发的是提交还是停止。
 *
 * 清空发生在提交回调之后，所以每次提交都会连带一条 value-change（值被清成空串）。
 * 那条不是噪音，正是"提交完输入框真的空了"的证据，事件断言里逐条写出来。
 */
export const composerSuite: ConformanceSuite = {
  component: 'composer',
  anatomy: composerAnatomy,
  keyboard: composerKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 必须是原生 <textarea>：Shift+Enter 的换行、光标位置与撤销栈全靠它自己
      { part: 'input', tag: 'textarea' },
      { part: 'submit-trigger', tag: 'button', text: '发送' },
    ],
  },
  cases: [
    {
      name: '空输入：发送按钮带原生 disabled，身份是"发送"',
      spec: { apg: APG },
      initial: {
        order: ['root', 'input', 'submit-trigger'],
        counts: { 'root': 1, 'input': 1, 'submit-trigger': 1 },
        parts: {
          'root': { 'data-status': 'ready', 'data-disabled': null },
          'input': {
            'disabled': null,
            // 输入框常常没有可见标签，名字只能从这里来
            'aria-label': 'Message',
            'data-state': 'empty',
          },
          'submit-trigger': {
            // 漏了 type 的话，落在 form 里它会变成 submit，Enter 直接提交整张表单
            'type': 'button',
            // 单体控件用原生 disabled：光有 data-disabled 只是样式，
            // 读屏照念"发送"、键盘照聚焦，按下去却什么都不发生
            'disabled': '',
            'data-mode': 'send',
            'aria-label': 'Send',
          },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '敲进字后可提交：状态转 editing，发送按钮放开',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤只发按键、落不到 value 上，要的是"用户真敲了字"这一路',
          run: ctx => typeInto(ctx, '你好'),
          expect: {
            parts: {
              'input': { 'data-state': 'editing' },
              'submit-trigger': { disabled: null },
            },
            events: [{ type: 'value-change', detail: { value: '你好' } }],
          },
        },
      ],
    },
    {
      name: 'Enter 提交：载荷是提交那一刻的原文，随后输入框清空回 empty',
      spec: { apg: APG },
      covers: ['composer.kbd.enter'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤只发按键、落不到 value 上，要的是"用户真敲了字"这一路',
          run: ctx => typeInto(ctx, '你好'),
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'input': { 'data-state': 'empty' },
              'submit-trigger': { 'disabled': '', 'data-mode': 'send' },
            },
            // 焦点不许被提交挪走：连着说两句话的人不该每句都重新点一次输入框
            activeElement: { part: 'input', exact: true },
            // 先报提交、再报清空：反过来的话宿主收到的就是被清掉的空串
            events: [
              { type: 'submit', detail: { value: '你好' } },
              { type: 'value-change', detail: { value: '' } },
            ],
          },
        },
      ],
    },
    {
      name: '流式中：同一个按钮原位变停止，按下去发 stop 而不是 submit',
      spec: { apg: APG },
      covers: ['composer.kbd.submit-press'],
      props: { runStatus: 'streaming' },
      initial: {
        parts: {
          'root': { 'data-status': 'streaming' },
          'submit-trigger': {
            'data-mode': 'stop',
            'aria-label': 'Stop generating',
            // 此刻它是"停止"，能不能按跟输入框里有没有字没关系
            'disabled': null,
          },
        },
      },
      steps: [
        nativeActivation('composer', 'submit-trigger'),
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            // 身份一动不动：正按着它的用户不会按空
            parts: { 'submit-trigger': { 'data-mode': 'stop', 'disabled': null } },
            events: [{ type: 'stop' }],
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则值纹丝不动，回调照发；写回后以宿主的为准',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'a' },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤落不到 value 上；受控下要的是"用户真敲了字"这一路',
          run: ctx => typeInto(ctx, '你好'),
          // 受控值仍是 'a'，所以状态与按钮一动不动；通知里带的是用户敲的那串，
          // 宿主拿它去决定要不要写回。
          // 这一帧刻意不比 input.value：受控且宿主没写回时，框里显示什么取决于
          // 宿主有没有因此重渲，那是适配器运行时的事，不是这份规格要定的
          expect: {
            parts: {
              'input': { 'data-state': 'editing' },
              'submit-trigger': { disabled: null },
            },
            events: [{ type: 'value-change', detail: { value: '你好' } }],
          },
        },
        { kind: 'setProps', props: { value: '你好' } },
        {
          kind: 'raw',
          why: 'value 是 property，快照采不到；写回后框里必须是宿主给的那串',
          run: ({ doc }) => expectValue(doc, '你好', '宿主写回后应盖掉用户敲进去的字'),
        },
      ],
    },
    {
      name: 'disabled：输入框与按钮都带原生 disabled，合成点击也提交不了',
      spec: { apg: APG },
      props: { disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'input': { 'disabled': '', 'data-state': 'disabled' },
          'submit-trigger': { disabled: '' },
        },
      },
      steps: [
        dispatchClickOnDisabled('composer', 'submit-trigger', {
          parts: {
            'input': { 'disabled': '', 'data-state': 'disabled' },
            'submit-trigger': { 'disabled': '', 'data-mode': 'send' },
          },
          events: [],
        }),
      ],
    },
  ],
}
