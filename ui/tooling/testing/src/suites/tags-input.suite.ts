import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { tagsInputAnatomy, tagsInputKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

// APG 没有"标签输入"这个模式：它是文本框加一串可删条目的组合件。
// 可核对的规格是"每个控件都要有可及的名字"这条实践，以及 HTML 的文本输入状态。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'
const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)'

const SEL = (part: string): string => `[data-scope="tags-input"][data-part="${part}"]`

function inputEl(doc: Document): HTMLInputElement {
  const el = doc.querySelector<HTMLInputElement>(SEL('input'))
  if (!el)
    throw new Error('找不到 input 部件')
  return el
}

/**
 * 直接改 DOM 值再派发 input：`type` 步骤只发按键，落不到输入框的 value 上。
 *
 * 派完必须 flush：两个适配器的重渲都是异步的，同一个 raw 步骤里紧接着读 DOM
 * 会读到上一帧——组件明明断词了，断言却看见没断词的旧值。
 */
async function typeInto(ctx: RawStepContext, text: string): Promise<void> {
  const el = inputEl(ctx.doc)
  el.focus()
  el.value = text
  el.setSelectionRange?.(text.length, text.length)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  await ctx.flush()
}

function expectInputValue(doc: Document, want: string, why: string): void {
  const got = inputEl(doc).value
  if (got !== want)
    throw new Error(`${why}：期望 "${want}"，实际 "${got}"`)
}

/** 隐藏输入的 value 是 property 不是属性，进不了归一化快照，只能这样验。 */
function expectSubmitValue(doc: Document, want: string, why: string): void {
  const el = doc.querySelector<HTMLInputElement>(SEL('hidden-input'))
  if (!el)
    throw new Error(`${why}：找不到 hidden-input 部件`)
  if (el.value !== want)
    throw new Error(`${why}：期望提交 "${want}"，实际 "${el.value}"`)
}

/** 往输入框上派一次可取消的按键，回报"这一下有没有被组件吃掉"。 */
function pressOnInput(ctx: RawStepContext, key: string): boolean {
  // 合成事件必须显式 cancelable，否则 preventDefault 是空操作、这条断言永远为真
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  return !inputEl(ctx.doc).dispatchEvent(event)
}

function expectConsumed(consumed: boolean, want: boolean, why: string): void {
  if (consumed !== want)
    throw new Error(`${why}：期望${want ? '吞掉' : '放行'}这个键，实际${consumed ? '吞掉了' : '放行了'}`)
}

/**
 * 粘贴：jsdom 没有 ClipboardEvent 构造器，自己补一份 clipboardData。
 * 回报有没有被接管——顶到上限时组件必须放行，否则用户粘的内容会凭空消失。
 */
function pasteInto(doc: Document, text: string): boolean {
  const event = new Event('paste', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } })
  inputEl(doc).dispatchEvent(event)
  return event.defaultPrevented
}

/** 把光标放到输入框最左端：方向键接管与否正是按这个判的。 */
function caretToStart(doc: Document): void {
  const el = inputEl(doc)
  el.focus()
  el.setSelectionRange?.(0, 0)
}

// 一个标签一套节点：预览（文本 + 删除按钮）与就地编辑框互斥收起，两者都常挂不卸载。
function tag(value: string): FixtureNode {
  return {
    part: 'item',
    attrs: { value },
    children: [
      {
        part: 'item-preview',
        tag: 'span',
        children: [
          { part: 'item-text', tag: 'span', text: value },
          { part: 'item-delete-trigger', tag: 'button', text: '×' },
        ],
      },
      { part: 'item-input', tag: 'input' },
    ],
  }
}

/**
 * 标签节点是作者按当前值渲染出来的，不是组件生成的：
 * 用例要几个标签就往 control 里插几个，与该用例的 defaultValue / value 一一对应。
 * 基础 fixture 一个标签都不带——空集合是这个组件的真实初态。
 */
function withTags(...values: readonly string[]) {
  return (base: FixtureNode): FixtureNode => ({
    ...base,
    children: base.children?.map(child =>
      child.part === 'control'
        ? { ...child, children: [...values.map(tag), ...(child.children ?? [])] }
        : child),
  })
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'label', tag: 'label', text: '技术栈' },
    {
      part: 'control',
      children: [
        { part: 'input', tag: 'input' },
        { part: 'clear-trigger', tag: 'button', text: '⨯' },
      ],
    },
    { part: 'hidden-input', tag: 'input' },
  ],
}

/** 两个标签的高亮期望，逐个写全——只写关心的那个会漏掉"另一个也亮着"。 */
function highlighted(value: string | null): StepWithExpect['expect'] {
  return {
    parts: {
      item: ['vue', 'react'].map(v => ({ 'data-highlighted': v === value ? '' : null })),
    },
  }
}

export const tagsInputSuite: ConformanceSuite = {
  component: 'tags-input',
  anatomy: tagsInputAnatomy,
  keyboard: tagsInputKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始：control 是 group 并由 label 命名，输入框可及名与校验态都显式给出',
      spec: { apg: APG },
      initial: {
        order: ['root', 'label', 'control', 'input', 'clear-trigger', 'hidden-input'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'input': 1, 'clear-trigger': 1, 'hidden-input': 1 },
        parts: {
          'root': {
            'data-empty': '',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
            'data-at-max': null,
            'data-overflow': null,
          },
          // for 指向真正的输入框：指到别处点标题不聚焦、读屏也拿不到控件的名字
          'label': { id: '@self', for: '@part(input)' },
          'control': {
            'role': 'group',
            'aria-labelledby': '@part(label)',
            // 省略与显式 false 不是一回事：前者是"没说"，后者是"明确说了不是"
            'aria-disabled': 'false',
            'data-empty': '',
          },
          'input': {
            'id': '@self',
            'type': 'text',
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            'disabled': null,
            'readonly': null,
            // 表单出口是 hidden-input：主输入框带 name 会把半截文本一并提交出去
            'name': null,
          },
          // 没东西可清时按钮置灰而不是收起：位置留着，加进第一个标签就亮
          'clear-trigger': { 'type': 'button', 'tabindex': '-1', 'disabled': '', 'data-disabled': '', 'hidden': '' },
          'hidden-input': { type: 'hidden', name: null, disabled: null },
        },
      },
      steps: [
        nativeActivation('tags-input', 'clear-trigger'),
      ],
    },
    {
      name: '带标签：每个标签自报 data-value，删除按钮不占 Tab 位且自带名字，编辑框收起',
      spec: { apg: APG },
      fixture: withTags('vue', 'react'),
      props: { defaultValue: ['vue', 'react'], name: 'stack' },
      initial: {
        counts: { 'item': 2, 'item-preview': 2, 'item-text': 2, 'item-delete-trigger': 2, 'item-input': 2 },
        parts: {
          'root': { 'data-empty': null },
          'item[0]': { 'data-value': 'vue', 'data-highlighted': null, 'data-editing': null },
          'item[1]': { 'data-value': 'react' },
          // 标签不各占 Tab 停靠点；键盘那一路走方向键 + 退格
          'item-delete-trigger[0]': { 'type': 'button', 'tabindex': '-1', 'aria-label': 'Delete vue', 'disabled': null },
          'item-delete-trigger[1]': { 'aria-label': 'Delete react' },
          // 不编辑时编辑框收起（不卸载），预览露出
          'item-input[0]': { 'hidden': '', 'aria-label': 'Edit vue', 'id': '@self' },
          'item-preview[0]': { hidden: null },
          'hidden-input': { name: 'stack' },
        },
      },
      steps: [
        nativeActivation('tags-input', 'item-delete-trigger'),
        {
          kind: 'raw',
          why: 'hidden-input 的 value 是 property 不是属性，进不了归一化快照',
          run: ({ doc }) => expectSubmitValue(doc, 'vue,react', '整份标签按分隔符拼成一串提交'),
        },
      ],
    },
    {
      name: 'enter 把输入文本变成标签，且拦下默认行为（表单不该被顺手提交掉）',
      spec: { apg: HTML_SPEC },
      covers: ['tags-input.kbd.commit'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到 value 上；这里要的是真实输入',
          run: async ctx => typeInto(ctx, 'vue'),
          expect: { events: [] },
        },
        {
          kind: 'raw',
          why: '要同时验"这个键被吞掉了"与"标签进去了"，得拿得到 defaultPrevented',
          run: async (ctx) => {
            expectConsumed(pressOnInput(ctx, 'Enter'), true, '有内容可提交时 Enter 必须被接管')
            await ctx.flush()
          },
          expect: {
            parts: { root: { 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: ['vue'] } }],
          },
        },
        {
          kind: 'raw',
          why: '输入框的 value 是 property 不是属性，进不了归一化快照',
          run: ({ doc }) => expectInputValue(doc, '', '提交后框里应当清空'),
        },
      ],
    },
    {
      name: '框里只有空白时 Enter 不接管：表单的提交键要还给表单',
      spec: { apg: HTML_SPEC },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, '   ') },
        {
          kind: 'raw',
          why: '"没吞这个键"只能从 defaultPrevented 读出来',
          run: async (ctx) => {
            expectConsumed(pressOnInput(ctx, 'Enter'), false, '没有内容可提交时不该吞掉 Enter')
            await ctx.flush()
          },
          expect: { parts: { root: { 'data-empty': '' } }, events: [] },
        },
      ],
    },
    {
      name: '打出分隔符即断词：前面的段落成标签，最后一段留在框里接着打',
      spec: { apg: HTML_SPEC },
      covers: ['tags-input.kbd.delimiter'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '断词发生在 input 事件里，必须真的改 value 再派发',
          run: async ctx => typeInto(ctx, 'vue,react,sol'),
          expect: { events: [{ type: 'value-change', detail: { value: ['vue', 'react'] } }] },
        },
        {
          kind: 'raw',
          why: '框里剩下什么是 property，快照读不到',
          run: ({ doc }) => expectInputValue(doc, 'sol', '断词后只该剩没打完的那一段'),
        },
      ],
    },
    {
      name: '退格两步删：头一下只高亮最后一个，再按一下才删',
      spec: { apg: APG },
      covers: ['tags-input.kbd.backspace-highlight', 'tags-input.kbd.backspace-delete'],
      fixture: withTags('vue', 'react'),
      props: { defaultValue: ['vue', 'react'] },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'Backspace',
          // 头一下什么都不该删
          expect: { ...highlighted('react'), events: [] },
        },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            // 光标落到前一个上，接着按可以一路往回删
            ...highlighted('vue'),
            events: [{ type: 'value-change', detail: { value: ['vue'] } }],
          },
        },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            ...highlighted(null),
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: '框里还有字时退格就是退格：不吞这个键，也不动标签',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'] },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, 'x') },
        {
          kind: 'raw',
          why: '"没吞这个键"只能从 defaultPrevented 读出来',
          run: async (ctx) => {
            expectConsumed(pressOnInput(ctx, 'Backspace'), false, '框里还有字时退格不该被接管')
            await ctx.flush()
          },
          expect: { parts: { item: [{ 'data-highlighted': null }] }, events: [] },
        },
      ],
    },
    {
      name: '方向键在标签之间走：左键从最后一个起步、到头停住，右键走出末尾即回输入框',
      spec: { apg: APG },
      covers: ['tags-input.kbd.prev', 'tags-input.kbd.next', 'tags-input.kbd.first', 'tags-input.kbd.last'],
      fixture: withTags('vue', 'react'),
      props: { defaultValue: ['vue', 'react'] },
      steps: [
        {
          kind: 'raw',
          why: '左键是否接管取决于光标位置，focus 步骤表达不了选区',
          run: ({ doc }) => caretToStart(doc),
        },
        { kind: 'key', key: 'ArrowLeft', expect: highlighted('react') },
        { kind: 'key', key: 'ArrowLeft', expect: highlighted('vue') },
        // 到头停住，不回绕
        { kind: 'key', key: 'ArrowLeft', expect: highlighted('vue') },
        { kind: 'key', key: 'End', expect: highlighted(null) },
        { kind: 'key', key: 'ArrowLeft', expect: highlighted('react') },
        { kind: 'key', key: 'Home', expect: highlighted('vue') },
        { kind: 'key', key: 'ArrowRight', expect: highlighted('react') },
        // 走出末尾：光标交回输入框，一个标签都不该亮着
        { kind: 'key', key: 'ArrowRight', expect: { ...highlighted(null), events: [] } },
      ],
    },
    {
      name: 'escape 只在走进标签后才吞：外层浮层还等着这个键',
      spec: { apg: APG },
      covers: ['tags-input.kbd.escape-navigating'],
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'] },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '"没吞这个键"只能从 defaultPrevented 读出来',
          run: async (ctx) => {
            expectConsumed(pressOnInput(ctx, 'Escape'), false, '没走进标签时不该吞掉 Escape')
            await ctx.flush()
          },
        },
        { kind: 'key', key: 'Backspace', expect: { parts: { item: [{ 'data-highlighted': '' }] } } },
        {
          kind: 'raw',
          why: '同上，要同时看"吞掉了"与"高亮撤了"',
          run: async (ctx) => {
            expectConsumed(pressOnInput(ctx, 'Escape'), true, '走进标签后 Escape 必须被接管')
            await ctx.flush()
          },
          expect: { parts: { item: [{ 'data-highlighted': null }] }, events: [] },
        },
      ],
    },
    {
      name: 'delete 删掉高亮的标签',
      spec: { apg: APG },
      covers: ['tags-input.kbd.delete'],
      fixture: withTags('vue', 'react'),
      props: { defaultValue: ['vue', 'react'] },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Backspace', expect: highlighted('react') },
        {
          kind: 'key',
          key: 'Delete',
          expect: { events: [{ type: 'value-change', detail: { value: ['vue'] } }] },
        },
      ],
    },
    {
      name: '删除按钮：删掉这个标签，并把焦点交回输入框',
      spec: { apg: APG },
      fixture: withTags('vue', 'react'),
      props: { defaultValue: ['vue', 'react'] },
      steps: [
        {
          // click 步骤会先 focus 再 click：按钮持有过焦点，删完必须把焦点交回去
          kind: 'click',
          part: 'item-delete-trigger[1]',
          expect: {
            activeElement: { part: 'input', exact: true },
            events: [{ type: 'value-change', detail: { value: ['vue'] } }],
          },
        },
      ],
    },
    {
      name: '清空按钮：标签与输入文本一起清掉，随后转为置灰',
      spec: { apg: APG },
      fixture: withTags('vue', 'react'),
      props: { defaultValue: ['vue', 'react'] },
      initial: { parts: { 'clear-trigger': { 'hidden': null, 'disabled': null, 'data-disabled': null } } },
      steps: [
        { kind: 'raw', why: 'type 步骤落不到 value 上', run: async ctx => typeInto(ctx, 'sol') },
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            activeElement: { part: 'input', exact: true },
            parts: {
              'root': { 'data-empty': '' },
              'clear-trigger': { 'hidden': '', 'disabled': '', 'data-disabled': '' },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
        {
          kind: 'raw',
          why: '输入框的 value 是 property 不是属性',
          run: ({ doc }) => expectInputValue(doc, '', '清空应当把没提交的文本一并清掉'),
        },
      ],
    },
    {
      name: '就地编辑：双击换成编辑框并拿到焦点，Escape 撤销后焦点回输入框',
      spec: { apg: APG },
      covers: ['tags-input.kbd.edit-cancel'],
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], editable: true },
      steps: [
        {
          kind: 'dblclick',
          part: 'item-preview',
          expect: {
            parts: {
              'item': [{ 'data-editing': '' }],
              // 预览与编辑框互斥收起，两者都留在文档里
              'item-preview': [{ hidden: '' }],
              'item-input': [{ hidden: null }],
            },
          },
        },
        // 聚焦推迟到宿主把这一帧渲染完之后（编辑框那时才不再是 hidden）
        { kind: 'settle', until: { activeElement: 'item-input' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            activeElement: { part: 'input', exact: true },
            parts: {
              'item': [{ 'data-editing': null }],
              'item-preview': [{ hidden: null }],
              'item-input': [{ hidden: '' }],
            },
            // 撤销这一路一个字都不该改
            events: [],
          },
        },
      ],
    },
    {
      name: '高亮着标签时 Enter 走的是"改这一个"；改完提交并把焦点交回输入框',
      spec: { apg: APG },
      covers: ['tags-input.kbd.edit', 'tags-input.kbd.edit-submit'],
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], editable: true, name: 'stack' },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Backspace', expect: { parts: { item: [{ 'data-highlighted': '' }] } } },
        {
          // 开了就地编辑时，高亮着标签按 Enter 是"改这一个"，不是"把框里的文本再加一个"
          kind: 'key',
          key: 'Enter',
          expect: { parts: { item: [{ 'data-editing': '' }] }, events: [] },
        },
        { kind: 'settle', until: { activeElement: 'item-input' } },
        {
          kind: 'raw',
          why: 'type 步骤只发按键，落不到编辑框的 value 上',
          run: async (ctx) => {
            const el = ctx.doc.querySelector<HTMLInputElement>(SEL('item-input'))
            if (!el)
              throw new Error('找不到 item-input 部件')
            el.value = 'nuxt'
            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await ctx.flush()
          },
          expect: {
            activeElement: { part: 'input', exact: true },
            parts: { item: [{ 'data-editing': null }] },
            events: [{ type: 'value-change', detail: { value: ['nuxt'] } }],
          },
        },
        {
          kind: 'raw',
          why: 'hidden-input 的 value 是 property 不是属性',
          run: ({ doc }) => expectSubmitValue(doc, 'nuxt', '改写后的标签才是要提交的那一份'),
        },
      ],
    },
    {
      name: '未开 editable 时双击不进编辑态',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'] },
      steps: [
        {
          kind: 'dblclick',
          part: 'item-preview',
          expect: {
            parts: { 'item': [{ 'data-editing': null }], 'item-input': [{ hidden: '' }] },
            events: [],
          },
        },
      ],
    },
    {
      name: 'max：顶到上限即报 data-at-max，这一次输入整体不生效、文本原样留着',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], max: 1 },
      initial: { parts: { root: { 'data-at-max': '', 'data-overflow': null } } },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '断词与上限判定都发生在 input 事件里',
          run: async ctx => typeInto(ctx, 'react,'),
          expect: { events: [] },
        },
        {
          kind: 'raw',
          why: '"文本没被吞掉"是 property 上的事实',
          run: ({ doc }) => expectInputValue(doc, 'react,', '顶到上限时不许悄悄吃掉用户打的字'),
        },
      ],
    },
    {
      name: 'allowOverflow：照加不误，只把 data-overflow 打出来',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], max: 1, allowOverflow: true },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '断词发生在 input 事件里',
          run: async ctx => typeInto(ctx, 'react,'),
          expect: {
            parts: {
              root: { 'data-at-max': '', 'data-overflow': '' },
              control: { 'data-overflow': '' },
            },
            events: [{ type: 'value-change', detail: { value: ['vue', 'react'] } }],
          },
        },
      ],
    },
    {
      name: '粘贴：addOnPaste 开着才接管；顶到上限时放行，不许把内容凭空吃掉',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], addOnPaste: true, max: 2 },
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 没有 ClipboardEvent 构造器，粘贴只能自己派；还要读 defaultPrevented',
          run: async (ctx) => {
            if (!pasteInto(ctx.doc, 'react'))
              throw new Error('还加得进去时粘贴必须被接管')
            await ctx.flush()
          },
          expect: { events: [{ type: 'value-change', detail: { value: ['vue', 'react'] } }] },
        },
        {
          kind: 'raw',
          why: '同上；这一次要验的是"没接管"',
          run: async (ctx) => {
            if (pasteInto(ctx.doc, 'svelte'))
              throw new Error('顶到上限时不该接管粘贴——拦下来又加不进去，等于把内容吃掉')
            await ctx.flush()
          },
          expect: { events: [] },
        },
      ],
    },
    {
      name: '禁用：输入框与各按钮都落成原生 disabled，直接派事件也改不了值',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'aria-disabled': 'true', 'data-disabled': '' },
          'input': { disabled: '' },
          'item-delete-trigger': [{ disabled: '' }],
          'clear-trigger': { hidden: '', disabled: '' },
          // 禁用的控件不该提交出值
          'hidden-input': { disabled: '' },
        },
      },
      steps: [
        // 禁用按钮上 el.click() 被激活行为短路不派事件，直接派发才碰得到 connect 的守卫
        dispatchClickOnDisabled('tags-input', 'item-delete-trigger', { events: [] }),
        dispatchClickOnDisabled('tags-input', 'clear-trigger', { events: [] }),
      ],
    },
    {
      name: '只读：仍可聚焦与复制，但加删改都走不通',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          'input': { readonly: '', disabled: null },
          'item-delete-trigger': [{ disabled: '' }],
        },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'Backspace', expect: { parts: { item: [{ 'data-highlighted': null }] }, events: [] } },
      ],
    },
    {
      name: '受控 value：宿主不写回则标签纹丝不动，回调照发',
      spec: { apg: APG },
      fixture: withTags('vue', 'react'),
      props: { value: ['vue', 'react'] },
      steps: [
        {
          kind: 'click',
          part: 'item-delete-trigger[0]',
          expect: {
            parts: { root: { 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: ['react'] } }],
          },
        },
        {
          kind: 'raw',
          why: 'hidden-input 的 value 是 property：受控没写回时它必须还是原来那份',
          run: ({ doc }) => expectSubmitValue(doc, 'vue,react', '宿主没写回，提交值不该自己变'),
        },
        {
          kind: 'setProps',
          props: { value: ['react'] },
        },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => expectSubmitValue(doc, 'react', '宿主写回后提交值才跟着走'),
        },
      ],
    },
    {
      name: '自定义分隔符：断词与提交串都跟着它走',
      spec: { apg: APG },
      fixture: withTags('vue'),
      props: { defaultValue: ['vue'], delimiter: ';', name: 'stack' },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '断词发生在 input 事件里',
          run: async ctx => typeInto(ctx, 'react;'),
          expect: { events: [{ type: 'value-change', detail: { value: ['vue', 'react'] } }] },
        },
        {
          kind: 'raw',
          why: 'hidden-input 的 value 是 property',
          run: ({ doc }) => expectSubmitValue(doc, 'vue;react', '提交串用的是同一个分隔符'),
        },
      ],
    },
    {
      name: 'invalid：校验态落在输入框上，root 与 control 一并标注',
      spec: { apg: APG },
      props: { invalid: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          control: { 'data-invalid': '' },
          input: { 'aria-invalid': 'true' },
        },
      },
    },
  ],
}
