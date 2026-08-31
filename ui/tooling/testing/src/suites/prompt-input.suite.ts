import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { promptInputAnatomy, promptInputKeyboard } from '@xihan-ui/headless'

// 组件只额外接管 Enter，其余按键交给浏览器，故出处指向 APG 模式总览页。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/'

const INPUT = '[data-scope="prompt-input"][data-part="input"]'

function inputEl(doc: Document): HTMLTextAreaElement {
  const el = doc.querySelector<HTMLTextAreaElement>(INPUT)
  if (!el)
    throw new Error('找不到 prompt-input 的 input 部件')
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
 * prompt-input 的一致性套件：三个部件全必需，生成期间 submit-trigger 原位换
 * data-mode 与 aria-label。清空发生在提交回调之后，故每次提交都连带一条值为空串的 value-change。
 */
export const promptInputSuite: ConformanceSuite = {
  component: 'prompt-input',
  anatomy: promptInputAnatomy,
  keyboard: promptInputKeyboard,
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
      name: '默认：空值不可提交，按钮是发送身份且置灰；输入框不发 aria-label',
      spec: { apg: APG },
      initial: {
        counts: { 'root': 1, 'input': 1, 'submit-trigger': 1 },
        parts: {
          'root': { 'data-disabled': null, 'data-busy': null },
          // 不给 translations.input 就整条不输出，作者的 <label for> 与自写的 aria-label 才留得住
          'input': { 'aria-label': null, 'data-state': 'empty' },
          'submit-trigger': { 'type': 'button', 'data-mode': 'send', 'aria-label': 'Send', 'disabled': '' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '给了文案才发输入框的可访问名',
      spec: { apg: APG },
      props: { translations: { input: '给助手写点什么' } },
      initial: {
        parts: { input: { 'aria-label': '给助手写点什么' } },
      },
    },
    {
      name: '打字：状态转 editing，按钮解除置灰',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤只发按键，写不进 textarea 的 value',
          run: ctx => typeInto(ctx, '你好'),
        },
        {
          kind: 'raw',
          why: '要断言的是 value 与按钮可用性这两件，属性快照够不到 value',
          run: ({ doc }: RawStepContext) => {
            expectValue(doc, '你好', '打字后值应写进输入框')
            const button = doc.querySelector<HTMLButtonElement>('[data-scope="prompt-input"][data-part="submit-trigger"]')
            if (button?.disabled)
              throw new Error('有内容时发送按钮不该置灰')
          },
        },
      ],
      expect: { parts: { input: { 'data-state': 'editing' } } },
    },
    {
      name: 'Enter 提交并清空；清空排在提交之后，先读走待清空的值',
      spec: { apg: APG },
      covers: ['prompt-input.kbd.enter'],
      steps: [
        { kind: 'raw', why: '先把值写进去', run: ctx => typeInto(ctx, '发这句') },
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            events: [
              { type: 'submit', detail: { value: '发这句' } },
              { type: 'value-change', detail: { value: '' } },
            ],
            parts: { input: { 'data-state': 'empty' } },
          },
        },
      ],
    },
    {
      name: 'Shift+Enter 不提交：那一下是换行，交给浏览器',
      spec: { apg: APG },
      covers: ['prompt-input.kbd.shift-enter'],
      steps: [
        { kind: 'raw', why: '先把值写进去', run: ctx => typeInto(ctx, '还没写完') },
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Enter', modifiers: ['Shift'], expect: { events: [] } },
      ],
    },
    {
      name: '输入法组合中的 Enter 不提交：那一下是在确认候选词',
      spec: { apg: APG },
      covers: ['prompt-input.kbd.ime-enter'],
      steps: [
        { kind: 'raw', why: '先把值写进去', run: ctx => typeInto(ctx, 'ni hao') },
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Enter', composing: true, expect: { events: [] } },
      ],
    },
    {
      name: 'mod-enter 档：裸 Enter 换行，Mod+Enter 才提交',
      spec: { apg: APG },
      covers: ['prompt-input.kbd.mod-enter'],
      props: { submitKey: 'mod-enter' },
      steps: [
        { kind: 'raw', why: '先把值写进去', run: ctx => typeInto(ctx, '两档都要验') },
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Enter', expect: { events: [] } },
        {
          kind: 'key',
          key: 'Enter',
          modifiers: ['Control'],
          expect: {
            events: [
              { type: 'submit', detail: { value: '两档都要验' } },
              { type: 'value-change', detail: { value: '' } },
            ],
          },
        },
      ],
    },
    {
      name: '生成中：按钮原位变停止且恒可用，提交路径全部挡下',
      spec: { apg: APG },
      covers: ['prompt-input.kbd.submit-press'],
      props: { busy: true, defaultValue: '这句还没发' },
      initial: {
        parts: {
          'root': { 'data-busy': '' },
          // 同一个节点换身份：正在按它的用户不会按空
          'submit-trigger': { 'data-mode': 'stop', 'aria-label': 'Stop generating', 'disabled': null },
        },
      },
      steps: [
        { kind: 'click', part: 'submit-trigger', expect: { events: [{ type: 'stop' }] } },
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Enter', expect: { events: [] } },
      ],
    },
    {
      name: '有附件时允许空值提交：这是唯一为附件留的钩子',
      spec: { apg: APG },
      props: { allowEmptySubmit: true },
      steps: [
        { kind: 'click', part: 'submit-trigger', expect: { events: [{ type: 'submit', detail: { value: '' } }] } },
      ],
    },
    {
      name: '关掉清空：提交后值原样留着',
      spec: { apg: APG },
      props: { clearOnSubmit: false, defaultValue: '留着' },
      steps: [
        { kind: 'click', part: 'submit-trigger', expect: { events: [{ type: 'submit', detail: { value: '留着' } }] } },
        {
          kind: 'raw',
          why: 'value 不是属性，快照看不到',
          run: ({ doc }: RawStepContext) => expectValue(doc, '留着', '关掉 clearOnSubmit 后组件不该动值'),
        },
      ],
    },
    {
      name: '禁用：输入框带原生 disabled，提交与停止一并吃掉',
      spec: { apg: APG },
      props: { disabled: true, defaultValue: '发不出去' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'input': { 'disabled': '', 'data-state': 'disabled' },
          'submit-trigger': { disabled: '' },
        },
      },
    },
    {
      name: 'Escape 不接管：留给叠在输入框上的浮层与页面',
      spec: { apg: APG },
      covers: ['prompt-input.kbd.escape', 'prompt-input.kbd.yield'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '要断言的是「没有 preventDefault」，只有拿到事件对象本身才看得见',
          run: ({ doc }: RawStepContext) => {
            const input = inputEl(doc)
            const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
            input.dispatchEvent(escape)
            if (escape.defaultPrevented)
              throw new Error('prompt-input 把 Escape 吞掉了：叠在它上面的浮层再也关不掉')

            // 别人已经处理过这一下，组件让位
            const taken = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
            taken.preventDefault()
            input.dispatchEvent(taken)
          },
        },
        // 让位那一下不该提交
        { kind: 'raw', why: '事件断言在下一帧统一比对', run: () => {} },
      ],
      expect: { events: [] },
    },
  ],
}
