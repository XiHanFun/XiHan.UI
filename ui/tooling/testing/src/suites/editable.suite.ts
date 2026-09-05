import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { editableAnatomy, editableKeyboard } from '@xihan-ui/headless'

// 就地编辑没有对应的 APG 模式页（它是一段文字与一个文本框轮流上场）。
// 可核对的规格是"控件必须有可及的名字"这条实践，以及 HTML 的文本输入状态。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'
const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

const sel = (part: string): string => `[data-scope="editable"][data-part="${part}"]`
const INPUT = sel('input')
const PREVIEW = sel('preview')

function inputEl(doc: Document): HTMLInputElement {
  const el = doc.querySelector<HTMLInputElement>(INPUT)
  if (!el)
    throw new Error('找不到 input 部件')
  return el
}

/**
 * 直接改 DOM 值再派发 input：`type` 步骤只发按键，落不到输入框的 value 上。
 *
 * 派完必须 flush：两个适配器的重渲都是异步的，同一个 raw 步骤里紧接着读 DOM
 * 会读到上一帧——组件明明改了，断言却看见旧值。
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

/** 预览区显示的文字。作者没写内容时它由适配器填，两侧必须填出同一个东西。 */
function expectPreviewText(doc: Document, want: string, why: string): void {
  const el = doc.querySelector(PREVIEW)
  if (!el)
    throw new Error(`${why}：找不到 preview 部件`)
  const got = (el.textContent ?? '').trim()
  if (got !== want)
    throw new Error(`${why}：期望 "${want}"，实际 "${got}"`)
}

function expectAttr(doc: Document, part: string, name: string, want: string | null, why: string): void {
  const el = doc.querySelector(sel(part))
  if (!el)
    throw new Error(`${why}：找不到 ${part} 部件`)
  const got = el.getAttribute(name)
  if (got !== want)
    throw new Error(`${why}：${name} 期望 ${want == null ? '缺席' : `"${want}"`}，实际 ${got == null ? '缺席' : `"${got}"`}`)
}

/**
 * 按下一颗按钮，走真实浏览器那条顺序：pointerdown 再 click，且中途不搬焦点。
 *
 * 不能用 harness 的 click 步骤：它会先 focus 目标按钮，输入框随之派 blur，
 * 机器当场按 submitMode 把编辑收了尾，那一下 click 落到的已经是收起的按钮
 * ——测的就不再是"点这颗按钮会怎样"。真实浏览器里正是靠 pointerdown 上的
 * preventDefault 把焦点摁在输入框里，这里连同那条一起验。
 */
async function pressTrigger(ctx: RawStepContext, part: string): Promise<void> {
  const el = ctx.doc.querySelector(sel(part))
  if (!el)
    throw new Error(`找不到 ${part} 部件`)
  const down = new PointerEvent('pointerdown', { bubbles: true, cancelable: true })
  // dispatchEvent 返回 false 即有人调过 preventDefault；合成事件必须显式 cancelable
  if (el.dispatchEvent(down))
    throw new Error(`${part} 没在 pointerdown 上拦下焦点转移：按钮抢走焦点后这一下 click 会落空`)
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  await ctx.flush()
}

export const editableSuite: ConformanceSuite = {
  component: 'editable',
  anatomy: editableAnatomy,
  keyboard: editableKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 标签与输入框都写成原生标签：for 指向不可标注的元素时这条关联当场作废
      { part: 'label', tag: 'label', text: '昵称' },
      {
        part: 'control',
        children: [
          // preview 刻意不写内容：显示什么由适配器填，两侧必须填出同一个东西
          { part: 'preview', tag: 'span' },
          { part: 'input', tag: 'input' },
          { part: 'edit-trigger', tag: 'button', text: '编辑' },
          { part: 'submit-trigger', tag: 'button', text: '保存' },
          { part: 'cancel-trigger', tag: 'button', text: '取消' },
        ],
      },
    ],
  },
  cases: [
    {
      name: '预览态：显示值、输入框与提交/取消按钮收起，编辑钮露面',
      spec: { apg: APG },
      props: { defaultValue: '阿旺', placeholder: '未填写' },
      initial: {
        order: ['root', 'label', 'control', 'preview', 'input', 'edit-trigger', 'submit-trigger', 'cancel-trigger'],
        parts: {
          'root': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            'data-state': 'preview',
            'data-empty': null,
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'label': { for: '@part(input)' },
          'preview': {
            'hidden': null,
            // 键盘入口是编辑钮，预览区不占 Tab 位；但退出编辑态要把焦点还回来，所以仍需 -1
            'tabindex': '-1',
            'aria-disabled': 'false',
            'data-state': 'preview',
            'data-placeholder': null,
            'data-activation-mode': 'click',
          },
          'input': {
            'hidden': '',
            'type': 'text',
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            'disabled': null,
            'readonly': null,
            'data-state': 'preview',
          },
          'edit-trigger': { 'hidden': null, 'disabled': null, 'aria-controls': '@part(input)', 'type': 'button' },
          // 收起而不是卸载：节点是作者写的
          'submit-trigger': { hidden: '', disabled: '', type: 'button' },
          'cancel-trigger': { hidden: '', disabled: '', type: 'button' },
        },
        activeElement: null,
      },
      steps: [
        {
          kind: 'raw',
          why: '文本内容不进属性快照，但"预览区显示的是值"正是这个组件的本分',
          run: ({ doc }) => expectPreviewText(doc, '阿旺', '预览区应显示当前值'),
        },
      ],
    },
    {
      name: '值为空：预览区退回 placeholder 并标 data-placeholder',
      spec: { apg: APG },
      props: { placeholder: '未填写' },
      initial: {
        parts: {
          root: { 'data-empty': '' },
          preview: { 'data-placeholder': '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '占位文字不进属性快照',
          run: ({ doc }) => expectPreviewText(doc, '未填写', '空值时预览区应显示占位文字'),
        },
      ],
    },
    {
      name: '单击预览区进编辑态：两个形态对调，焦点搬进输入框并全选',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺' },
      steps: [
        {
          kind: 'click',
          part: 'preview',
          expect: {
            parts: {
              'root': { 'data-state': 'edit' },
              'preview': { hidden: '' },
              'input': { hidden: null },
              'edit-trigger': { hidden: '' },
              'submit-trigger': { hidden: null, disabled: null },
              'cancel-trigger': { hidden: null, disabled: null },
            },
            // 进编辑态时焦点搬进输入框
            activeElement: { part: 'input', exact: true },
          },
        },
        {
          kind: 'raw',
          why: 'value 与选区都是 property，进不了属性快照',
          run: ({ doc }) => {
            expectValue(doc, '阿旺', '编辑框里应当是当前值')
            const input = inputEl(doc)
            if (input.selectionStart !== 0 || input.selectionEnd !== 2)
              throw new Error(`selectOnFocus 默认应全选，实际选区 ${input.selectionStart}~${input.selectionEnd}`)
          },
        },
      ],
    },
    {
      name: '回车提交：值落定，回预览态，焦点还给预览区',
      spec: { apg: HTML_SPEC },
      covers: ['editable.kbd.submit'],
      props: { defaultValue: '阿旺' },
      steps: [
        { kind: 'click', part: 'preview' },
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到 value 上；这里要的是真实输入',
          run: async ctx => typeInto(ctx, '小黑'),
          expect: { events: [{ type: 'value-change', detail: { value: '小黑' } }] },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { root: { 'data-state': 'preview' }, preview: { hidden: null }, input: { hidden: '' } },
            // 输入框收起时焦点要有人接，不能掉进 body
            activeElement: { part: 'preview', exact: true },
            // 提交本身不改值，因此不该再冒出一条值变化
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '预览区显示的文字不进属性快照',
          run: ({ doc }) => expectPreviewText(doc, '小黑', '提交后预览区应显示新值'),
        },
      ],
    },
    {
      name: 'Escape 撤销：值回到上一次提交的那个',
      spec: { apg: HTML_SPEC },
      covers: ['editable.kbd.cancel'],
      props: { defaultValue: '阿旺' },
      steps: [
        { kind: 'click', part: 'preview' },
        {
          kind: 'raw',
          why: 'type 步骤落不到 value 上',
          run: async ctx => typeInto(ctx, '小黑'),
          expect: { events: [{ type: 'value-change', detail: { value: '小黑' } }] },
        },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { root: { 'data-state': 'preview' } },
            activeElement: { part: 'preview', exact: true },
            // 撤销把值拨了回去，这条变化同样要通知宿主
            events: [{ type: 'value-change', detail: { value: '阿旺' } }],
          },
        },
        {
          kind: 'raw',
          why: '值与预览文字一个是 property 一个是文本，都不进属性快照',
          run: ({ doc }) => {
            expectValue(doc, '阿旺', '撤销后框里应回到上一次提交的值')
            expectPreviewText(doc, '阿旺', '撤销后预览区应显示上一次提交的值')
          },
        },
      ],
    },
    {
      name: 'Tab 按 submitMode 收尾：both 提交，none 撤销',
      spec: { apg: HTML_SPEC },
      covers: ['editable.kbd.leave'],
      props: { defaultValue: '阿旺' },
      steps: [
        { kind: 'click', part: 'preview' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '小黑') },
        {
          kind: 'key',
          key: 'Tab',
          expect: { parts: { root: { 'data-state': 'preview' } }, events: [] },
        },
        {
          kind: 'raw',
          why: '值是 property',
          run: ({ doc }) => expectValue(doc, '小黑', 'submitMode=both 时 Tab 应当提交'),
        },
        { kind: 'setProps', props: { submitMode: 'none' } },
        { kind: 'click', part: 'preview' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '花花') },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: { root: { 'data-state': 'preview' } },
            // 没提交过的值不能留在界面上，撤销时值被拨回，宿主要收到这条变化
            events: [{ type: 'value-change', detail: { value: '小黑' } }],
          },
        },
        {
          kind: 'raw',
          why: '值是 property',
          run: ({ doc }) => expectValue(doc, '小黑', 'submitMode=none 时 Tab 应当撤销'),
        },
      ],
    },
    {
      name: '失焦收尾：submitMode=blur 提交，焦点不在输入框里就不抢回预览区',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', submitMode: 'blur' },
      steps: [
        { kind: 'click', part: 'preview' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '小黑') },
        {
          kind: 'blur',
          expect: {
            parts: { root: { 'data-state': 'preview' } },
            // 焦点已经离开输入框，不再抢回预览区
            activeElement: null,
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '值是 property',
          run: ({ doc }) => expectValue(doc, '小黑', '失焦提交后值应当落定'),
        },
      ],
    },
    {
      name: '提交按钮：按下时焦点被摁在输入框里，这一下点得中',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', submitMode: 'none' },
      steps: [
        { kind: 'click', part: 'preview' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '小黑') },
        {
          kind: 'raw',
          // submitMode=none 下按钮若抢走焦点，先到的 blur 会走撤销
          why: 'harness 的 click 步骤会先 focus 目标，恰好绕过了这里要验的那条路',
          run: async ctx => pressTrigger(ctx, 'submit-trigger'),
          expect: {
            parts: { root: { 'data-state': 'preview' } },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '值是 property',
          run: ({ doc }) => expectValue(doc, '小黑', '点提交按钮应当提交，而不是撤销'),
        },
      ],
    },
    {
      name: '取消按钮：撤销回上一次提交的值',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', submitMode: 'none' },
      steps: [
        { kind: 'click', part: 'preview' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '小黑') },
        {
          kind: 'raw',
          why: '同提交按钮：要走真实的 pointerdown → click 顺序',
          run: async ctx => pressTrigger(ctx, 'cancel-trigger'),
          expect: {
            parts: { root: { 'data-state': 'preview' } },
            events: [{ type: 'value-change', detail: { value: '阿旺' } }],
          },
        },
      ],
    },
    {
      name: '编辑按钮：预览区不认交互的模式下，它仍是进编辑态的正门',
      spec: { apg: APG },
      props: { defaultValue: '阿旺', activationMode: 'none' },
      initial: { parts: { preview: { 'data-activation-mode': 'none' } } },
      steps: [
        {
          kind: 'click',
          part: 'preview',
          expect: { parts: { root: { 'data-state': 'preview' } } },
        },
        {
          kind: 'click',
          part: 'edit-trigger',
          expect: {
            parts: { root: { 'data-state': 'edit' } },
            activeElement: { part: 'input', exact: true },
          },
        },
      ],
    },
    {
      name: 'activationMode=focus：预览区占 Tab 位，聚焦即进；提交后焦点还回来但不再被拽进去',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', activationMode: 'focus' },
      initial: { parts: { preview: { 'tabindex': '0', 'data-activation-mode': 'focus' } } },
      steps: [
        {
          kind: 'focus',
          part: 'preview',
          expect: {
            parts: { root: { 'data-state': 'edit' } },
            activeElement: { part: 'input', exact: true },
          },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            // 焦点还回预览区那一下若又被当成"用户聚焦进来了"，这个模式就永远退不出编辑态
            parts: { root: { 'data-state': 'preview' } },
            activeElement: { part: 'preview', exact: true },
          },
        },
      ],
    },
    {
      name: 'disabled：预览区、编辑钮都推不动，输入框带原生 disabled',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '', 'data-state': 'preview' },
          'preview': { 'tabindex': null, 'aria-disabled': 'true' },
          'input': { 'disabled': '', 'data-disabled': '' },
          'edit-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 禁用按钮上 el.click() 被激活行为短路不派事件，必须直接往节点上派才碰得到守卫
          why: '禁用控件上 click 被浏览器短路，只有直接派发才碰得到守卫',
          run: async (ctx) => {
            const { doc } = ctx
            doc.querySelector(PREVIEW)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            doc.querySelector(sel('edit-trigger'))!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
            await ctx.flush()
          },
          expect: { parts: { root: { 'data-state': 'preview' } }, events: [] },
        },
      ],
    },
    {
      name: 'readOnly：输入框只带 readonly，不顺手加 disabled；仍进不了编辑态',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          // 只读不是禁用，别对读屏说成禁用
          'preview': { 'aria-disabled': 'false', 'tabindex': null },
          'input': { readonly: '', disabled: null },
          'edit-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'preview',
          expect: { parts: { root: { 'data-state': 'preview' } }, events: [] },
        },
      ],
    },
    {
      name: 'invalid：aria-invalid 显式为 true，root 同步标注',
      spec: { apg: APG },
      props: { invalid: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          input: { 'aria-invalid': 'true', 'data-invalid': '' },
        },
      },
    },
    {
      name: '受控 edit：宿主不写回则状态纹丝不动，值的提交与撤销照常发生',
      spec: { apg: HTML_SPEC },
      // 受控且初始即编辑态：焦点当场搬进输入框，退出与否全归宿主说了算
      props: { defaultValue: '阿旺', edit: true },
      initial: {
        parts: { root: { 'data-state': 'edit' }, preview: { hidden: '' }, input: { hidden: null } },
        activeElement: { part: 'input', exact: true },
      },
      steps: [
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '小黑') },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            // 意图已发给宿主（edit-change），编辑态归宿主管，值仍照撤
            parts: { root: { 'data-state': 'edit' }, input: { hidden: null } },
            events: [{ type: 'value-change', detail: { value: '阿旺' } }],
          },
        },
        {
          kind: 'setProps',
          props: { edit: false },
          expect: {
            parts: { root: { 'data-state': 'preview' }, preview: { hidden: null }, input: { hidden: '' } },
            // 宿主收回编辑态时同样要把焦点还给预览区
            activeElement: { part: 'preview', exact: true },
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则值纹丝不动，回调照发；写回后以宿主的为准',
      spec: { apg: HTML_SPEC },
      props: { value: '阿旺' },
      steps: [
        { kind: 'click', part: 'preview' },
        {
          kind: 'raw',
          why: 'type 步骤落不到 value 上；受控下要的是"用户真敲了字"这一路',
          run: async ctx => typeInto(ctx, '小黑'),
          // 受控值没变，预览区仍显示宿主给的那串；通知里带用户敲的那串
          expect: { events: [{ type: 'value-change', detail: { value: '小黑' } }] },
        },
        {
          kind: 'raw',
          why: '预览文字不进属性快照',
          run: ({ doc }) => expectPreviewText(doc, '阿旺', '宿主没写回时预览区应仍是宿主给的值'),
        },
        { kind: 'setProps', props: { value: '花花' } },
        {
          kind: 'raw',
          why: '值是 property、预览是文本，都不进属性快照',
          run: ({ doc }) => {
            expectValue(doc, '花花', '宿主写回后框里应是宿主给的值')
            expectPreviewText(doc, '花花', '宿主写回后预览区应显示宿主给的值')
          },
        },
      ],
    },
    {
      name: 'maxLength：原生 maxlength 落到输入框上，超长输入被截断',
      spec: { apg: HTML_SPEC },
      props: { maxLength: 4 },
      steps: [
        { kind: 'click', part: 'preview' },
        {
          kind: 'raw',
          // 原生 maxlength 只拦从键盘敲进来这一路，机器侧的截断是兜底那道
          why: 'maxlength 不在快照的采集清单里；且 jsdom 不对程序写入的 value 施加 maxlength',
          run: async (ctx) => {
            const { doc } = ctx
            expectAttr(doc, 'input', 'maxlength', '4', '上限应落成原生属性')
            await typeInto(ctx, '一二三四五六')
            expectValue(doc, '一二三四', '超过上限的部分应被截掉')
          },
          expect: { events: [{ type: 'value-change', detail: { value: '一二三四' } }] },
        },
      ],
    },
    {
      name: 'autoResize：宽度跟着内容走，落成原生 size',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', autoResize: true },
      initial: { parts: { input: { 'data-auto-resize': '' } } },
      steps: [
        { kind: 'click', part: 'preview' },
        {
          kind: 'raw',
          why: 'size 不在快照的采集清单里',
          run: async (ctx) => {
            expectAttr(ctx.doc, 'input', 'size', '2', '初值两个字，size 应为 2')
            await typeInto(ctx, '阿旺旺旺')
            expectAttr(ctx.doc, 'input', 'size', '4', 'size 应跟着值一起长')
          },
        },
      ],
    },
    {
      name: 'defaultEdit：挂载即编辑态，焦点当场搬进输入框',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', defaultEdit: true },
      initial: {
        parts: {
          root: { 'data-state': 'edit' },
          preview: { hidden: '' },
          input: { hidden: null },
        },
        activeElement: { part: 'input', exact: true },
      },
    },
  ],
}
