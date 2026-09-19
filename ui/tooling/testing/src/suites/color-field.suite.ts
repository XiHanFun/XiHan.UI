import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { colorFieldAnatomy, colorFieldKeyboard } from '@xihan-ui/headless'
import { heldPress, heldPressIgnored } from './shared/press-channel'

// 手打颜色串的单行框没有对应的 APG 模式页，可核对的规格是"控件必须有可及的名字"这条实践，
// 以及 HTML 的文本输入状态。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'
const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

const INPUT = '[data-scope="color-field"][data-part="input"]'
const SWATCH = '[data-scope="color-field"][data-part="swatch"]'
const HIDDEN_INPUT = '[data-scope="color-field"][data-part="hidden-input"]'

function inputEl(doc: Document): HTMLInputElement {
  const el = doc.querySelector<HTMLInputElement>(INPUT)
  if (!el)
    throw new Error('找不到 input 部件')
  return el
}

/** 直接改 DOM 值再派发 input：`type` 步骤只发按键，落不到输入框的 value 上。派完必须 flush。 */
async function typeInto(ctx: RawStepContext, text: string): Promise<void> {
  const input = inputEl(ctx.doc)
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await ctx.flush()
}

/** 往 input 上派一次可取消的按键，回报"这一下有没有被组件吃掉"。 */
async function press(ctx: RawStepContext, key: string): Promise<{ consumed: boolean }> {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  const notPrevented = inputEl(ctx.doc).dispatchEvent(event)
  await ctx.flush()
  return { consumed: !notPrevented }
}

function expectValue(doc: Document, want: string, why: string): void {
  const got = inputEl(doc).value
  if (got !== want)
    throw new Error(`${why}：期望 "${want}"，实际 "${got}"`)
}

function expectSwatchColor(doc: Document, want: string, why: string): void {
  const el = doc.querySelector<HTMLElement>(SWATCH)
  if (!el)
    throw new Error(`${why}：找不到 swatch`)
  const got = el.style.getPropertyValue('--xh-_swatch-color')
  if (got !== want)
    throw new Error(`${why}：色块颜色期望 "${want}"，实际 "${got}"`)
}

function expectHiddenInput(doc: Document, expected: readonly [string, string, boolean], why: string): void {
  const el = doc.querySelector<HTMLInputElement>(HIDDEN_INPUT)
  const actual = el ? [el.name, el.value, el.disabled] : null
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`${why}：隐藏输入的 name/value/disabled 期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

export const colorFieldSuite: ConformanceSuite = {
  component: 'color-field',
  anatomy: colorFieldAnatomy,
  keyboard: colorFieldKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 标签与输入框都写成原生 label / input：for 指向不可标注的元素时关联当场作废
      { part: 'label', tag: 'label', text: '主题色' },
      {
        part: 'control',
        children: [
          { part: 'swatch', tag: 'span' },
          { part: 'input', tag: 'input' },
          { part: 'clear-trigger', tag: 'button', text: '×' },
        ],
      },
      { part: 'hidden-input', tag: 'input' },
    ],
  },
  cases: [
    {
      name: '默认：输入框是 text 且不带 name，label 的 for 指向它，色块经家族属性投影，表单影子带 name 与值',
      spec: { apg: APG },
      props: { defaultValue: '#3b82f6', name: 'accent', placeholder: '#rrggbb' },
      initial: {
        order: ['root', 'label', 'control', 'swatch', 'input', 'clear-trigger', 'hidden-input'],
        parts: {
          'root': {
            'data-empty': null,
            'data-editing': null,
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'label': { for: '@part(input)' },
          'swatch': { 'aria-hidden': 'true', 'data-xh-swatch': '', 'data-empty': null },
          'input': {
            'type': 'text',
            'name': null,
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            'data-xh-field-input': '',
            'data-xh-field-layout': 'single-line',
            'disabled': null,
            'readonly': null,
          },
          // 没开 clearable：按钮收起而不是卸载；不占 Tab 位但带名字、不对读屏隐藏
          'clear-trigger': { 'hidden': '', 'aria-label': 'Clear', 'tabindex': '-1', 'type': 'button' },
          'hidden-input': { type: 'hidden', name: 'accent', disabled: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'value 与内联样式都是 property，进不了归一化快照',
          run: ({ doc }) => {
            expectValue(doc, '#3b82f6', '框里显示当前值')
            expectSwatchColor(doc, 'rgba(59, 130, 246, 1)', '色块画当前值')
            expectHiddenInput(doc, ['accent', '#3b82f6', false], '表单影子提交收下的值')
          },
        },
      ],
    },
    {
      name: '打字只留草稿：root 带 data-editing、值与色块不动、不发事件；回车收下后按 format 重写',
      spec: { apg: HTML_SPEC },
      covers: ['color-field.kbd.commit'],
      props: { defaultValue: '#3b82f6' },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到 value 上；这里要的是真实输入',
          run: async ctx => typeInto(ctx, 'f00'),
          expect: { parts: { root: { 'data-editing': '' } }, events: [] },
        },
        {
          kind: 'raw',
          why: '草稿、值与色块都只能直接读 DOM',
          run: ({ doc }) => {
            expectValue(doc, 'f00', '框里是草稿')
            expectSwatchColor(doc, 'rgba(59, 130, 246, 1)', '色块还是旧值')
          },
        },
        {
          kind: 'raw',
          why: '回车是可取消的按键，要看它有没有被吃掉',
          run: async (ctx) => {
            const { consumed } = await press(ctx, 'Enter')
            if (!consumed)
              throw new Error('有草稿时回车应被组件接管')
          },
          expect: {
            parts: { root: { 'data-editing': null, 'data-invalid': null } },
            events: [{ type: 'value-change', detail: { value: '#ff0000' } }],
          },
        },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => {
            expectValue(doc, '#ff0000', '收下后按 hex 重写')
            expectSwatchColor(doc, 'rgba(255, 0, 0, 1)', '色块跟着换')
          },
        },
        {
          kind: 'raw',
          why: '没在编辑时回车不接管，表单该照常提交',
          run: async (ctx) => {
            const { consumed } = await press(ctx, 'Enter')
            if (consumed)
              throw new Error('没有草稿时回车不该被吃掉')
          },
        },
      ],
    },
    {
      name: '失焦也收下；收不下的草稿留在框里并标成无效，Escape 撤草稿回到规范文本',
      spec: { apg: HTML_SPEC },
      covers: ['color-field.kbd.cancel'],
      props: { defaultValue: '#3b82f6' },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, 'tomato') },
        {
          // 真 .blur()：React 的 onBlur 挂的是冒泡的 focusout，合成一个 blur 事件到不了它
          kind: 'blur',
          expect: {
            parts: {
              root: { 'data-editing': '', 'data-invalid': '' },
              input: { 'aria-invalid': 'true', 'data-invalid': '' },
              control: { 'data-invalid': '' },
            },
            events: [],
          },
        },
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '草稿留在框里',
          run: ({ doc }) => expectValue(doc, 'tomato', '收不下的草稿要留着让人看见'),
        },
        {
          kind: 'raw',
          why: 'Escape 是可取消的按键',
          run: async (ctx) => {
            const { consumed } = await press(ctx, 'Escape')
            if (!consumed)
              throw new Error('有草稿时 Escape 应被组件接管')
          },
          expect: { parts: { root: { 'data-editing': null, 'data-invalid': null }, input: { 'aria-invalid': 'false' } } },
        },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectValue(doc, '#3b82f6', '撤草稿后回到规范文本'),
        },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, 'rgb(0, 255, 0)') },
        {
          // 失焦收下合法草稿：rgb() 写法按 hex 重写
          kind: 'blur',
          expect: { parts: { root: { 'data-editing': null } }, events: [{ type: 'value-change', detail: { value: '#00ff00' } }] },
        },
      ],
    },
    {
      name: 'clearable：有值时清空按钮露面，Escape 在没有草稿时清空；空值 root 带 data-empty、色块不画颜色',
      spec: { apg: HTML_SPEC },
      covers: ['color-field.kbd.clear'],
      props: { defaultValue: '#3b82f6', clearable: true },
      initial: { parts: { 'clear-trigger': { hidden: null } } },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'Escape 是可取消的按键',
          run: async (ctx) => {
            const { consumed } = await press(ctx, 'Escape')
            if (!consumed)
              throw new Error('可清空且有值时 Escape 应被组件接管')
          },
          expect: {
            parts: { 'root': { 'data-empty': '' }, 'swatch': { 'data-empty': '' }, 'clear-trigger': { hidden: '' } },
            events: [{ type: 'value-change', detail: { value: '' } }],
          },
        },
        {
          kind: 'raw',
          why: 'value 与内联样式都是 property',
          run: ({ doc }) => {
            expectValue(doc, '', '清空后框里没有字')
            expectSwatchColor(doc, '', '空值不画颜色层')
          },
        },
        {
          kind: 'raw',
          why: '已经空了：Escape 不再接管',
          run: async (ctx) => {
            const { consumed } = await press(ctx, 'Escape')
            if (consumed)
              throw new Error('空值时 Escape 不该被吃掉')
          },
        },
      ],
    },
    {
      name: '受控：收下只发意图，宿主不写回就不动；写回后框里的字与色块跟着走',
      spec: { apg: HTML_SPEC },
      props: { value: '#3b82f6' },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '真实输入后回车',
          run: async (ctx) => {
            await typeInto(ctx, '#00ff00')
            await press(ctx, 'Enter')
          },
          expect: { events: [{ type: 'value-change', detail: { value: '#00ff00' } }] },
        },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectSwatchColor(doc, 'rgba(59, 130, 246, 1)', '宿主没写回，色块不动'),
        },
        { kind: 'setProps', props: { value: '#00ff00' } },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => {
            expectValue(doc, '#00ff00', '写回后框里跟着走')
            expectSwatchColor(doc, 'rgba(0, 255, 0, 1)', '写回后色块跟着走')
          },
        },
      ],
    },
    {
      name: 'disabled 与 readOnly：原生属性落到 input 上，表单影子随禁用停发；只读时草稿收不进',
      spec: { apg: APG },
      props: { defaultValue: '#3b82f6', disabled: true, name: 'accent' },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'input': { disabled: '' },
          'swatch': { 'data-disabled': '' },
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        {
          kind: 'setProps',
          props: { disabled: false, readOnly: true },
          expect: { parts: { root: { 'data-disabled': null, 'data-readonly': '' }, input: { 'disabled': null, 'readonly': '', 'aria-readonly': 'true' } } },
        },
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '只读时收下即丢草稿，值不动',
          run: async (ctx) => {
            await typeInto(ctx, '#00ff00')
            await press(ctx, 'Enter')
          },
          expect: { parts: { root: { 'data-editing': null } }, events: [] },
        },
        {
          kind: 'raw',
          why: 'value 是 property',
          run: ({ doc }) => expectValue(doc, '#3b82f6', '只读时值不动'),
        },
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：清空按钮投影 data-pressed，抬起、失焦或指针取消撤下；按住不清值',
      spec: { adr: 'press-channel' },
      covers: ['color-field.kbd.press'],
      // 清空按钮不占 Tab 位，键盘这一路只在焦点落到它身上时有面；共享步骤直接把焦点送过去
      props: { defaultValue: '#3b82f6', clearable: true },
      steps: [
        heldPress('color-field', 'clear-trigger'),
        { kind: 'settle', until: { attr: { part: 'clear-trigger', name: 'data-pressed', value: null } }, expect: { parts: { 'root': { 'data-empty': null }, 'clear-trigger': { hidden: null } }, events: [] } },
      ],
    },
    {
      name: '没开 clearable、禁用、只读或没有值时清空按钮藏着，按住不进入按压面',
      spec: { adr: 'press-channel' },
      props: { defaultValue: '#3b82f6' },
      steps: [
        heldPressIgnored('color-field', 'clear-trigger', '没开 clearable 时清空钮藏着，不接受按压'),
        { kind: 'setProps', props: { clearable: true, disabled: true } },
        heldPressIgnored('color-field', 'clear-trigger', '禁用时清空钮藏着，不接受按压'),
        { kind: 'setProps', props: { disabled: false, readOnly: true } },
        heldPressIgnored('color-field', 'clear-trigger', '只读时清空钮藏着，不接受按压'),
        { kind: 'setProps', props: { readOnly: false, value: '' } },
        heldPressIgnored('color-field', 'clear-trigger', '没有值可清时清空钮藏着，不接受按压'),
      ],
    },
  ],
}
