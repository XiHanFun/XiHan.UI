import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { composerAnatomy, composerKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

// 组件只额外接管 Enter，其余按键交给浏览器，故出处指向 APG 模式总览页。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

const INPUT = '[data-scope="composer"][data-part="input"]'

function inputEl(doc: Document): HTMLTextAreaElement {
  const el = doc.querySelector<HTMLTextAreaElement>(INPUT)
  if (!el)
    throw new Error('找不到 composer 的 input 部件')
  return el
}

/** 直接改 DOM 值再派发 input（`type` 步骤只发按键，写不进 value），随后 flush 等待重渲。 */
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
 * composer 的一致性套件：只有 root / input / submit-trigger 三个部件，
 * 流式期间 submit-trigger 原位换 data-mode 与 aria-label。
 * 清空发生在提交回调之后，故每次提交都连带一条值为空串的 value-change。
 */
export const composerSuite: ConformanceSuite = {
  component: 'composer',
  anatomy: composerAnatomy,
  keyboard: composerKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 输入框须是原生 <textarea>
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
          'root': { 'data-state': 'ready', 'data-status': 'ready', 'data-disabled': null },
          'input': {
            'disabled': null,
            // 输入框的无障碍名由 connect 给出
            'aria-label': 'Message',
            'data-state': 'empty',
          },
          'submit-trigger': {
            // 显式 type=button，避免落在 form 里被当成提交按钮
            'type': 'button',
            // 单体控件用原生 disabled，而非只给 data-disabled
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
            // 提交后焦点仍留在输入框
            activeElement: { part: 'input', exact: true },
            // 先派 submit 再派值为空串的 value-change
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
          'root': { 'data-state': 'streaming', 'data-status': 'streaming' },
          'submit-trigger': {
            'data-mode': 'stop',
            'aria-label': 'Stop generating',
            // 停止模式下按钮恒可用，与输入框是否有值无关
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
            // data-mode 与 aria-label 保持不变
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
          // 受控值仍是 a；不断言 input.value，宿主未写回时它取决于适配器是否重渲
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
