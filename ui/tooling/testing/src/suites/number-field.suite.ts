import type { ConformanceSuite } from '../conformance/types'
import { numberFieldAnatomy, numberFieldKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/'

/** 直接改 DOM 值再派发 input：`type` 步骤只发按键，落不到输入框的 value 上。 */
function typeInto(doc: Document, text: string): void {
  const input = doc.querySelector<HTMLInputElement>('[data-scope="number-field"][data-part="input"]')
  if (!input)
    throw new Error('找不到 input 部件')
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
}

function readValue(doc: Document): string {
  return doc.querySelector<HTMLInputElement>('[data-scope="number-field"][data-part="input"]')?.value ?? ''
}

function expectValue(doc: Document, want: string, why: string): void {
  const got = readValue(doc)
  if (got !== want)
    throw new Error(`${why}：期望 "${want}"，实际 "${got}"`)
}

export const numberFieldSuite: ConformanceSuite = {
  component: 'number-field',
  anatomy: numberFieldAnatomy,
  keyboard: numberFieldKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'label', text: '数量' },
      {
        part: 'control',
        children: [
          { part: 'decrement-trigger', tag: 'button', text: '−' },
          { part: 'input', tag: 'input' },
          { part: 'increment-trigger', tag: 'button', text: '+' },
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认：input 是 spinbutton，label 的 for 指向它，空值时 root 带 data-empty',
      spec: { apg: APG },
      props: { min: 0, max: 10 },
      initial: {
        order: ['root', 'label', 'control', 'decrement-trigger', 'input', 'increment-trigger'],
        parts: {
          'root': {
            'data-empty': '',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'label': { for: '@part(input)' },
          'control': {
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'input': {
            'role': 'spinbutton',
            'type': 'text',
            'inputmode': 'decimal',
            'aria-labelledby': '@part(label)',
            'aria-valuemin': '0',
            'aria-valuemax': '10',
            // 空值时不给 aria-valuenow：给个 0 会让读屏念出一个用户没填过的数
            'aria-valuenow': null,
            'aria-invalid': 'false',
          },
          // 两个按钮对读屏隐藏：键盘操作全在 input 上，暴露出来等于把同一个控件报两遍
          'increment-trigger': { 'aria-hidden': 'true', 'tabindex': '-1', 'type': 'button' },
          'decrement-trigger': { 'aria-hidden': 'true', 'tabindex': '-1', 'type': 'button' },
        },
      },
    },
    {
      name: 'ArrowUp / ArrowDown 按 step 步进，aria-valuenow 跟着走',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['number-field.kbd.increment', 'number-field.kbd.decrement'],
      props: { defaultValue: '3', step: 2 },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { input: { 'aria-valuenow': '5' } } } },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { input: { 'aria-valuenow': '7' } } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { input: { 'aria-valuenow': '5' } } },
        },
        {
          kind: 'raw',
          why: '输入框的 value 是 property 不是属性，进不了归一化快照',
          run: ({ doc }) => expectValue(doc, '5', 'ArrowUp 两次再 ArrowDown 一次'),
        },
      ],
    },
    {
      name: 'PageUp / PageDown 走 largeStep，未指定时是 step 的 10 倍',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['number-field.kbd.large-increment', 'number-field.kbd.large-decrement'],
      props: { defaultValue: '0', step: 1 },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'PageUp', expect: { parts: { input: { 'aria-valuenow': '10' } } } },
        { kind: 'key', key: 'PageDown', expect: { parts: { input: { 'aria-valuenow': '0' } } } },
      ],
    },
    {
      name: 'Home / End 取端点；未指定 min/max 时这两个键不接管',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['number-field.kbd.min', 'number-field.kbd.max'],
      props: { defaultValue: '5', min: 1, max: 9 },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'End', expect: { parts: { input: { 'aria-valuenow': '9' } } } },
        { kind: 'key', key: 'Home', expect: { parts: { input: { 'aria-valuenow': '1' } } } },
      ],
    },
    {
      name: '没有 min/max 时 Home/End 不吞键：值不动，光标跳转留给输入框自己',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: '5' },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Home' },
        { kind: 'key', key: 'End' },
        {
          kind: 'raw',
          why: '"什么都没发生"只能直接比对值',
          run: ({ doc }) => expectValue(doc, '5', '无 min/max 时 Home/End 不该改值'),
        },
      ],
    },
    {
      name: '贴住边界：越界的那一步停在端点，对应按钮转 disabled',
      spec: { apg: APG },
      props: { defaultValue: '9', min: 0, max: 10 },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              'input': { 'aria-valuenow': '10' },
              'increment-trigger': { 'disabled': '', 'data-disabled': '' },
              'decrement-trigger': { disabled: null },
            },
          },
        },
        {
          // 已经贴着 max 还按：值不该越过去，也不该回绕到 min
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { input: { 'aria-valuenow': '10' } } },
        },
      ],
    },
    {
      name: '空值起步：落在 min 上而不是 min 加一格',
      spec: { apg: APG },
      props: { min: 5, max: 20 },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowUp', expect: { parts: { input: { 'aria-valuenow': '5' } } } },
      ],
    },
    {
      name: '失焦规范化：收掉多余的零并夹回区间，输入途中不打断',
      spec: { apg: APG },
      props: { min: 0, max: 100 },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到 value 上；这里要的是真实输入',
          run: ({ doc }) => {
            typeInto(doc, '12.50')
            expectValue(doc, '12.50', '输入途中不该被规范化')
          },
        },
        { kind: 'blur' },
        {
          kind: 'raw',
          why: '同上，value 是 property',
          run: ({ doc }) => expectValue(doc, '12.5', '失焦后应收掉尾零'),
        },
      ],
    },
    {
      name: '失焦夹回区间：越界输入不留在框里',
      spec: { apg: APG },
      props: { min: 0, max: 100 },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'raw', why: '真实输入需要写 value 并派发 input', run: ({ doc }) => typeInto(doc, '999') },
        { kind: 'blur' },
        { kind: 'raw', why: 'value 是 property', run: ({ doc }) => expectValue(doc, '100', '超过 max 的输入应夹回 max') },
      ],
    },
    {
      // 函数交不成 attribute，两个适配器都按 property 下发（harness 的 applyInputs 已按类型分流）
      name: '自定义换算：千位分隔符的串照样读得出数、走得动步进',
      spec: { apg: APG },
      props: {
        defaultValue: '1,234',
        step: 1,
        max: 2000,
        parse: (text: string) => Number(text.replace(/,/g, '')),
        format: (value: number) => value.toLocaleString('en-US'),
      },
      initial: {
        // 读屏念的是数，不是那串带逗号的显示文本
        parts: { input: { 'aria-valuenow': '1234', 'aria-valuemax': '2000' } },
      },
      steps: [
        {
          kind: 'click',
          part: 'increment-trigger',
          expect: { parts: { input: { 'aria-valuenow': '1235' } } },
        },
        {
          kind: 'raw',
          why: 'value 是 property；步进之后显示串该带回格式',
          run: ({ doc }) => expectValue(doc, '1,235', '步进后应按 format 写回'),
        },
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '真实输入要写 value 并派发 input',
          run: ({ doc }) => {
            typeInto(doc, '1500')
            expectValue(doc, '1500', '输入途中不该替用户补格式')
          },
        },
        { kind: 'blur' },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectValue(doc, '1,500', '失焦规范化同时是补格式的时机'),
        },
      ],
    },
    {
      name: '自定义换算：越界仍先夹回区间再补格式',
      spec: { apg: APG },
      props: {
        defaultValue: '1,234',
        max: 2000,
        parse: (text: string) => Number(text.replace(/,/g, '')),
        format: (value: number) => value.toLocaleString('en-US'),
      },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'raw', why: '真实输入需要写 value 并派发 input', run: ({ doc }) => typeInto(doc, '99999') },
        { kind: 'blur' },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectValue(doc, '2,000', '越界应先夹到 max 再按 format 写回'),
        },
      ],
    },
    {
      name: '点加减按钮各走一步',
      spec: { apg: APG },
      props: { defaultValue: '0', step: 1 },
      steps: [
        { kind: 'click', part: 'increment-trigger', expect: { parts: { input: { 'aria-valuenow': '1' } } } },
        { kind: 'click', part: 'increment-trigger', expect: { parts: { input: { 'aria-valuenow': '2' } } } },
        { kind: 'click', part: 'decrement-trigger', expect: { parts: { input: { 'aria-valuenow': '1' } } } },
      ],
    },
    {
      name: 'disabled：键盘与按钮都推不动值，两个按钮都是 disabled',
      spec: { apg: APG },
      props: { defaultValue: '3', disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'input': { 'disabled': '', 'data-disabled': '' },
          'increment-trigger': { disabled: '' },
          'decrement-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 焦点落不到禁用的 input 上、禁用按钮的 click 被短路，必须直接往节点上派事件
          why: '禁用控件上 focus/click 都被浏览器短路，只有直接派发才碰得到守卫',
          run: ({ doc }) => {
            const input = doc.querySelector<HTMLInputElement>('[data-scope="number-field"][data-part="input"]')!
            const inc = doc.querySelector<HTMLElement>('[data-scope="number-field"][data-part="increment-trigger"]')!
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }))
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true, cancelable: true }))
            inc.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            inc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))
            inc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
          },
        },
        { kind: 'raw', why: '"值没动"只能直接比对', run: ({ doc }) => expectValue(doc, '3', 'disabled 下值不该动') },
      ],
    },
    {
      // 指针点按钮走 pointerdown 那一支，键盘激活走 event.detail === 0 那一支
      name: '按住加号：先走一步，越过 changeDelay 才连发，松手即停',
      spec: { apg: APG },
      skipParity: '一次按住里跑几拍取决于当时的调度，两侧帧序对不齐',
      props: { defaultValue: '0', step: 1, min: 0, max: 1000, changeDelay: 60, changeInterval: 20 },
      steps: [
        {
          kind: 'raw',
          why: '"按下—等—松手"是时间相关的，harness 的步骤表达不了',
          run: async ({ doc }) => {
            const inc = doc.querySelector<HTMLElement>('[data-scope="number-field"][data-part="increment-trigger"]')!
            inc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))

            // 还没越过 changeDelay：只该走按下那一步（轻点一下也得有反应）
            await new Promise(r => setTimeout(r, 25))
            expectValue(doc, '1', '按下先走一步')

            await new Promise(r => setTimeout(r, 150))
            const during = readValue(doc)
            if (Number(during) <= 1)
              throw new Error(`按住不放应当连发，实际停在 "${during}"`)

            inc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
            const atRelease = readValue(doc)
            await new Promise(r => setTimeout(r, 120))
            const after = readValue(doc)
            if (after !== atRelease)
              throw new Error(`松手后仍在涨：松手时 "${atRelease}"，120ms 后 "${after}"`)
          },
        },
      ],
    },
    {
      name: '按住后指针移出：同样收尾，数字不会自己一直涨',
      spec: { apg: APG },
      skipParity: '同上，按住的拍数不确定',
      props: { defaultValue: '0', step: 1, changeDelay: 40, changeInterval: 20 },
      steps: [
        {
          kind: 'raw',
          why: '指针移出是三条收尾出口之一，少一条就会出现"手已经松了数字还在涨"',
          run: async ({ doc }) => {
            const inc = doc.querySelector<HTMLElement>('[data-scope="number-field"][data-part="increment-trigger"]')!
            inc.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }))
            await new Promise(r => setTimeout(r, 120))
            inc.dispatchEvent(new PointerEvent('pointerleave', { bubbles: false }))
            const atLeave = readValue(doc)
            await new Promise(r => setTimeout(r, 120))
            const after = readValue(doc)
            if (after !== atLeave)
              throw new Error(`指针移出后仍在涨：移出时 "${atLeave}"，120ms 后 "${after}"`)
          },
        },
      ],
    },
    {
      name: 'readOnly：值推不动，但控件仍在 Tab 序列里、内容可选中复制',
      spec: { apg: APG },
      props: { defaultValue: '3', readOnly: true },
      initial: {
        parts: {
          // 与 disabled 的差别就在这里：input 不带原生 disabled，因此仍可聚焦
          'root': { 'data-readonly': '' },
          'input': { readonly: '', disabled: null },
          'increment-trigger': { disabled: '' },
        },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowUp' },
        { kind: 'raw', why: '"值没动"只能直接比对', run: ({ doc }) => expectValue(doc, '3', 'readOnly 下值不该动') },
      ],
    },
    {
      name: '受控 value：宿主不写回则值纹丝不动，回调照发',
      spec: { apg: APG },
      props: { value: '2', step: 1 },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowUp' },
        {
          kind: 'raw',
          why: '受控下"界面没有自作主张"正是要验的东西',
          run: ({ doc }) => expectValue(doc, '2', '受控且宿主未写回时值不该变'),
        },
        {
          kind: 'setProps',
          props: { value: '7' },
          expect: { parts: { input: { 'aria-valuenow': '7' } } },
        },
      ],
    },
  ],
}
