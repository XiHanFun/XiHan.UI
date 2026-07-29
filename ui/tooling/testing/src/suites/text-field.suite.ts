import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { textFieldAnatomy, textFieldKeyboard } from '@xihan-ui/headless'

// 单行文本框没有对应的 APG 模式页（光标、选区、撤销本来就归浏览器管），
// 可核对的规格是"控件必须有可及的名字"这条实践，以及 HTML 的文本输入状态。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'
const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

const INPUT = '[data-scope="text-field"][data-part="input"]'
const CLEAR = '[data-scope="text-field"][data-part="clear-trigger"]'

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
 * 会读到上一帧——组件明明截断了，断言却看见没截断的旧值。
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

function expectAttr(doc: Document, sel: string, name: string, want: string | null, why: string): void {
  const el = doc.querySelector(sel)
  if (!el)
    throw new Error(`${why}：找不到 ${sel}`)
  const got = el.getAttribute(name)
  if (got !== want)
    throw new Error(`${why}：${name} 期望 ${want == null ? '缺席' : `"${want}"`}，实际 ${got == null ? '缺席' : `"${got}"`}`)
}

/** 往 input 上派一次可取消的 Escape，回报"这一下有没有被组件吃掉"。 */
async function pressEscape(ctx: RawStepContext): Promise<{ consumed: boolean }> {
  const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
  // dispatchEvent 返回 false 即有人调过 preventDefault；合成事件必须显式 cancelable
  const notPrevented = inputEl(ctx.doc).dispatchEvent(event)
  await ctx.flush()
  return { consumed: !notPrevented }
}

export const textFieldSuite: ConformanceSuite = {
  component: 'text-field',
  anatomy: textFieldAnatomy,
  keyboard: textFieldKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 标签与输入框都写成原生 label / input：for 指向不可标注的元素时关联当场作废
      { part: 'label', tag: 'label', text: '昵称' },
      { part: 'input', tag: 'input' },
      { part: 'clear-trigger', tag: 'button', text: '×' },
    ],
  },
  cases: [
    {
      name: '默认：input 是 text，label 的 for 指向它，空值时 root 带 data-empty',
      spec: { apg: APG },
      props: { placeholder: '请输入昵称', name: 'nickname' },
      initial: {
        order: ['root', 'label', 'input', 'clear-trigger'],
        parts: {
          'root': {
            'data-empty': '',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            'data-at-limit': null,
          },
          'label': { for: '@part(input)' },
          'input': {
            'type': 'text',
            'name': 'nickname',
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            'disabled': null,
            'readonly': null,
            'data-at-limit': null,
          },
          // 没开 clearable：按钮收起而不是卸载，节点是作者写的
          'clear-trigger': { 'hidden': '', 'disabled': '', 'aria-hidden': 'true', 'tabindex': '-1', 'type': 'button' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'placeholder 不在快照的采集清单里（既不是 aria- 也不是 data-）',
          run: ({ doc }) => expectAttr(doc, INPUT, 'placeholder', '请输入昵称', '占位文案应落到 input 上'),
        },
      ],
    },
    {
      name: '敲字：值落进状态，root 的 data-empty 随之消失',
      spec: { apg: HTML_SPEC },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到 value 上；这里要的是真实输入',
          run: async ctx => typeInto(ctx, '阿旺'),
          expect: {
            parts: { root: { 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: '阿旺' } }],
          },
        },
        {
          kind: 'raw',
          why: '输入框的 value 是 property 不是属性，进不了归一化快照',
          run: ({ doc }) => expectValue(doc, '阿旺', '敲进去的字应留在框里'),
        },
      ],
    },
    {
      name: 'clearable + 有值：清空按钮显出且可用，点它清空并派 value-change',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', clearable: true },
      initial: {
        parts: {
          'root': { 'data-empty': null },
          'clear-trigger': { 'hidden': null, 'disabled': null, 'data-disabled': null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              // 清完值就空了，按钮当场转不可用：再点一次只会派一条没有变化的通知
              'root': { 'data-empty': '' },
              'clear-trigger': { 'disabled': '', 'data-disabled': '', 'hidden': null },
            },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
        { kind: 'raw', why: 'value 是 property', run: ({ doc }) => expectValue(doc, '', '点清空后框里应当没有字') },
        {
          // 已经空了再点：按钮是 disabled，浏览器根本不派 click，什么都不该发生
          kind: 'click',
          part: 'clear-trigger',
          expect: { events: [] },
        },
      ],
    },
    {
      name: 'Escape 清空（clearable 且有值）',
      spec: { apg: HTML_SPEC },
      covers: ['text-field.kbd.clear'],
      props: { defaultValue: '阿旺', clearable: true },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { root: { 'data-empty': '' } },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
        { kind: 'raw', why: 'value 是 property', run: ({ doc }) => expectValue(doc, '', 'Escape 后框里应当没有字') },
      ],
    },
    {
      name: 'Escape 只在真要清空时才拦默认行为，没活儿干就把键交回去',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺' },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          // 吞了键，套在浮层里的输入框会让 Escape 关不掉浮层。
          // 只能自己造事件：harness 的 key 步骤拿不到 preventDefault 的结果
          why: '"有没有吞掉这一下"要看 dispatchEvent 的返回值，快照里看不出来',
          run: async (ctx) => {
            const { doc } = ctx
            if ((await pressEscape(ctx)).consumed)
              throw new Error('未开 clearable 时 Escape 不该被拦下')
            expectValue(doc, '阿旺', '未开 clearable 时 Escape 不该改值')
          },
          expect: { events: [] },
        },
        { kind: 'setProps', props: { clearable: true } },
        {
          kind: 'raw',
          why: '同上，preventDefault 的结果只有派事件的人看得到',
          run: async (ctx) => {
            const { doc } = ctx
            if (!(await pressEscape(ctx)).consumed)
              throw new Error('可清空且有值时 Escape 应当被拦下')
            expectValue(doc, '', 'Escape 应当清空')
            // 已经空了，再按一下就没活儿干，键要交回给外层
            if ((await pressEscape(ctx)).consumed)
              throw new Error('值已为空时 Escape 不该被拦下')
          },
          expect: {
            parts: { root: { 'data-empty': '' } },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
      ],
    },
    {
      name: 'maxLength：原生 maxlength 落到 input 上，超长输入被截断并出 data-at-limit',
      spec: { apg: HTML_SPEC },
      props: { maxLength: 4 },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          // 原生 maxlength 只拦从键盘敲进来这一路，机器侧的截断是兜底那道
          why: 'maxlength 不在快照的采集清单里；且 jsdom 不对程序写入的 value 施加 maxlength',
          run: async (ctx) => {
            const { doc } = ctx
            expectAttr(doc, INPUT, 'maxlength', '4', '上限应落成原生属性')
            await typeInto(ctx, '一二三四五六')
            expectValue(doc, '一二三四', '超过上限的部分应被截掉')
          },
          expect: {
            parts: { root: { 'data-at-limit': '' }, input: { 'data-at-limit': '' } },
            events: [{ type: 'value-change', detail: { value: '一二三四' } }],
          },
        },
      ],
    },
    {
      name: 'maxLength：没顶到上限时不出 data-at-limit',
      spec: { apg: HTML_SPEC },
      props: { maxLength: 4, defaultValue: '一二' },
      initial: { parts: { root: { 'data-at-limit': null }, input: { 'data-at-limit': null } } },
    },
    {
      name: 'disabled：input 带原生 disabled，输入与清空都推不动',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', disabled: true, clearable: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '', 'data-empty': null },
          'input': { 'disabled': '', 'data-disabled': '' },
          'clear-trigger': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 焦点落不到禁用的 input 上、禁用按钮的 click 被短路，必须直接往节点上派事件
          why: '禁用控件上 focus/click 都被浏览器短路，只有直接派发才碰得到守卫',
          run: async (ctx) => {
            const { doc } = ctx
            await typeInto(ctx, '换个名字')
            if ((await pressEscape(ctx)).consumed)
              throw new Error('禁用时 Escape 不该被拦下')
            doc.querySelector(CLEAR)!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
          },
          // 判据是一条变更通知都没派出去；不比 input.value，上一句直接写过它
          expect: { parts: { root: { 'data-empty': null } }, events: [] },
        },
      ],
    },
    {
      name: 'readOnly：仍在 Tab 序列里、内容可选中复制，但写不进也清不掉',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: '阿旺', readOnly: true, clearable: true },
      initial: {
        parts: {
          // 与 disabled 的差别就在这里：input 不带原生 disabled，因此仍可聚焦
          'root': { 'data-readonly': '' },
          'input': { readonly: '', disabled: null },
          'clear-trigger': { disabled: '', hidden: null },
        },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'Escape 有没有被吞掉只能看 dispatchEvent 的返回值',
          run: async (ctx) => {
            await typeInto(ctx, '换个名字')
            if ((await pressEscape(ctx)).consumed)
              throw new Error('只读时 Escape 不该被拦下')
          },
          expect: { parts: { root: { 'data-empty': null } }, events: [] },
        },
      ],
    },
    {
      name: 'invalid：input 的 aria-invalid 显式为 true，root 同步标注',
      spec: { apg: APG },
      props: { invalid: true, required: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          input: { 'aria-invalid': 'true', 'data-invalid': '' },
        },
      },
    },
    {
      name: '受控 value：宿主不写回则状态纹丝不动，回调照发；写回后以宿主的为准',
      spec: { apg: HTML_SPEC },
      props: { value: '', clearable: true },
      initial: { parts: { 'root': { 'data-empty': '' }, 'clear-trigger': { disabled: '' } } },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤落不到 value 上；受控下要的是"用户真敲了字"这一路',
          run: async ctx => typeInto(ctx, '换个名字'),
          // 受控值仍是空串，data-empty 与清空按钮不动；
          // 通知里带的是用户敲的那串。
          // 不比 input.value：宿主没写回时框里显示什么取决于适配器是否重渲。
          expect: {
            parts: { 'root': { 'data-empty': '' }, 'clear-trigger': { disabled: '' } },
            events: [{ type: 'value-change', detail: { value: '换个名字' } }],
          },
        },
        {
          kind: 'setProps',
          props: { value: '小黑' },
          expect: { parts: { 'root': { 'data-empty': null }, 'clear-trigger': { disabled: null } } },
        },
        {
          kind: 'raw',
          why: 'value 是 property；写回后框里必须是宿主给的那串，而不是用户敲的',
          run: ({ doc }) => expectValue(doc, '小黑', '宿主写回后应盖掉用户敲进去的字'),
        },
      ],
    },
  ],
}
