import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { passwordInputAnatomy, passwordInputKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

// 密码框没有对应的 APG 模式页（光标、选区与遮蔽本来就归浏览器管），
// 可核对的规格是"控件必须有可及的名字"这条实践、HTML 的密码输入状态，
// 以及切换钮所遵循的按钮模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/'
const BUTTON = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/#keyboardinteraction'
const HTML_SPEC = 'https://html.spec.whatwg.org/multipage/input.html#password-state-(type=password)'

const INPUT = '[data-scope="password-input"][data-part="input"]'
const HINT = '[data-scope="password-input"][data-part="caps-lock-indicator"]'

function inputEl(doc: Document): HTMLInputElement {
  const el = doc.querySelector<HTMLInputElement>(INPUT)
  if (!el)
    throw new Error('找不到 input 部件')
  return el
}

/**
 * 直接改 DOM 值再派发 input：`type` 步骤只发按键，落不到输入框的 value 上。
 *
 * 派完必须 flush：两个适配器的重渲都是异步的，同一个 raw 步骤里紧接着读 DOM 会读到上一帧。
 */
async function typeInto(ctx: RawStepContext, text: string): Promise<void> {
  const input = inputEl(ctx.doc)
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await ctx.flush()
}

/** 往输入框上派一次带大写锁定状态的按键。 */
async function pressWithCapsLock(ctx: RawStepContext, on: boolean): Promise<void> {
  inputEl(ctx.doc).dispatchEvent(new KeyboardEvent('keydown', {
    key: 'a',
    bubbles: true,
    cancelable: true,
    modifierCapsLock: on,
  }))
  await ctx.flush()
}

function expectValue(doc: Document, want: string, why: string): void {
  const got = inputEl(doc).value
  if (got !== want)
    throw new Error(`${why}：期望 "${want}"，实际 "${got}"`)
}

/** 活区域播报的是区内文字，不是名字：这一段只能直接读文本内容，属性快照里没有它。 */
function expectText(doc: Document, sel: string, want: string, why: string): void {
  const el = doc.querySelector(sel)
  if (!el)
    throw new Error(`${why}：找不到 ${sel}`)
  const got = el.textContent ?? ''
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

export const passwordInputSuite: ConformanceSuite = {
  component: 'password-input',
  anatomy: passwordInputAnatomy,
  keyboard: passwordInputKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 标签与输入框都写成原生 label / input：for 指向不可标注的元素时关联当场作废
      { part: 'label', tag: 'label', text: '密码' },
      {
        part: 'control',
        children: [
          { part: 'input', tag: 'input' },
          // 提示节点写成空壳：区里的文字归组件写
          { part: 'caps-lock-indicator', tag: 'span' },
          { part: 'visibility-trigger', tag: 'button', text: '显示' },
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认：input 是 password，label 的 for 指向它，切换钮的名字说的是按下去会发生什么',
      spec: { apg: APG },
      props: { name: 'password', placeholder: '请输入密码' },
      initial: {
        order: ['root', 'label', 'control', 'input', 'caps-lock-indicator', 'visibility-trigger'],
        counts: { 'root': 1, 'label': 1, 'control': 1, 'input': 1, 'caps-lock-indicator': 1, 'visibility-trigger': 1 },
        parts: {
          'root': {
            'data-empty': '',
            'data-disabled': null,
            'data-readonly': null,
            'data-invalid': null,
          },
          'label': { for: '@part(input)' },
          'input': {
            'type': 'password',
            'name': 'password',
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            // 大写锁定没开着，描述里就不该指向那块提示
            'aria-describedby': null,
            'disabled': null,
            'readonly': null,
          },
          'visibility-trigger': {
            'type': 'button',
            'aria-label': 'Show password',
            'aria-controls': '@part(input)',
            // 名字已经说清了此刻是明是暗，就不再叠 aria-pressed
            'aria-pressed': null,
            'data-state': 'hidden',
            'disabled': null,
          },
          // 播报区恒在场：hidden 任何时候都不该出现在它身上，撤下去就不再是活区域
          'caps-lock-indicator': {
            'role': 'status',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            'hidden': null,
            'data-state': 'hidden',
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'placeholder / autocomplete / 三条输入辅助都不在快照的采集清单里（既不是 aria- 也不是 data-）',
          run: ({ doc }) => {
            expectAttr(doc, INPUT, 'placeholder', '请输入密码', '占位文案应落到 input 上')
            expectAttr(doc, INPUT, 'autocomplete', 'current-password', '缺省应落在填旧密码那一档')
            // 明文态下 input 就是普通文本框，这三件平台服务都不能碰到密码
            expectAttr(doc, INPUT, 'spellcheck', 'false', '拼写检查会把框里的内容发去远端')
            expectAttr(doc, INPUT, 'autocapitalize', 'off', '移动端会把首字母自动改成大写')
            expectAttr(doc, INPUT, 'autocorrect', 'off', '自动纠错会按词典改掉密码')
            expectText(doc, HINT, '', '大写锁定没开着，播报区里就该是空的')
          },
        },
      ],
    },
    {
      name: 'autoComplete：写什么落什么，注册表单靠它让密码管理器去存新密码',
      spec: { apg: HTML_SPEC },
      props: { autoComplete: 'new-password' },
      steps: [
        {
          kind: 'raw',
          why: 'autocomplete 不在快照的采集清单里',
          run: ({ doc }) => expectAttr(doc, INPUT, 'autocomplete', 'new-password', '作者写的那一档应原样落下去'),
        },
      ],
    },
    {
      name: '点切换钮：input 的 type 换成 text，钮的名字与状态跟着换',
      spec: { apg: BUTTON },
      steps: [
        {
          kind: 'click',
          part: 'visibility-trigger',
          expect: {
            parts: {
              'input': { type: 'text' },
              'visibility-trigger': { 'aria-label': 'Hide password', 'data-state': 'visible' },
            },
          },
        },
        {
          kind: 'click',
          part: 'visibility-trigger',
          expect: {
            parts: {
              'input': { type: 'password' },
              'visibility-trigger': { 'aria-label': 'Show password', 'data-state': 'hidden' },
            },
          },
        },
      ],
    },
    {
      name: 'Enter / Space 靠原生按钮的激活行为，切换钮必须是 <button type="button">',
      spec: { apg: BUTTON },
      covers: ['password-input.kbd.toggle'],
      steps: [nativeActivation('password-input', 'visibility-trigger')],
    },
    {
      name: '切换之后焦点留在钮上，框里的字一个不少',
      spec: { apg: BUTTON },
      props: { defaultValue: 'hunter2' },
      steps: [
        { kind: 'focus', part: 'visibility-trigger' },
        {
          kind: 'click',
          part: 'visibility-trigger',
          expect: {
            parts: { input: { type: 'text' } },
            activeElement: { part: 'visibility-trigger', exact: true },
          },
        },
        {
          kind: 'raw',
          why: 'value 是 property，进不了归一化快照',
          run: ({ doc }) => expectValue(doc, 'hunter2', '换 type 不该动框里的值'),
        },
      ],
    },
    {
      name: 'defaultVisible：只给初值，之后仍可自己翻',
      spec: { adr: 'controlled-uncontrolled' },
      props: { defaultVisible: true },
      initial: {
        parts: {
          'input': { type: 'text' },
          'visibility-trigger': { 'aria-label': 'Hide password', 'data-state': 'visible' },
        },
      },
      steps: [
        { kind: 'click', part: 'visibility-trigger', expect: { parts: { input: { type: 'password' } } } },
      ],
    },
    {
      name: '受控 visible：点击只发意图不自改 DOM，宿主写回后才切',
      spec: { adr: 'controlled-uncontrolled' },
      props: { visible: false },
      steps: [
        {
          kind: 'click',
          part: 'visibility-trigger',
          expect: {
            parts: {
              'input': { type: 'password' },
              'visibility-trigger': { 'data-state': 'hidden' },
            },
          },
        },
        { kind: 'setProps', props: { visible: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'input', name: 'type', value: 'text' } },
          expect: { parts: { 'visibility-trigger': { 'data-state': 'visible', 'aria-label': 'Hide password' } } },
        },
      ],
    },
    {
      name: '大写锁定：按键报回开着就把文案写进播报区，输入框的描述指向它；下一次报回关着即清空',
      spec: { apg: APG },
      covers: ['password-input.kbd.caps-lock'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '大写锁定只在按键事件的修饰键状态里，harness 的 key 步骤没有这个通道',
          run: async (ctx) => {
            await pressWithCapsLock(ctx, true)
            // 播报的是区内文字：文本内容不进属性快照，只能在这里读
            expectText(ctx.doc, HINT, 'Caps Lock is on', '开着时播报区里应有那句文案')
          },
          expect: {
            parts: {
              'input': { 'aria-describedby': '@part(caps-lock-indicator)' },
              'caps-lock-indicator': { 'hidden': null, 'data-state': 'visible' },
            },
          },
        },
        {
          kind: 'raw',
          why: '同上，熄灭那一路同样只能自己造事件',
          run: async (ctx) => {
            await pressWithCapsLock(ctx, false)
            expectText(ctx.doc, HINT, '', '关掉后播报区应清空，而不是把节点撤下去')
          },
          expect: {
            parts: {
              'input': { 'aria-describedby': null },
              // 恒在场：这里出现 hidden 就说明活区域被撤下去过，再回来读屏多半不念
              'caps-lock-indicator': { 'hidden': null, 'data-state': 'hidden' },
            },
          },
        },
      ],
    },
    {
      name: '大写锁定：焦点离开输入框即熄灭——没有按键就再也读不到状态',
      spec: { apg: APG },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '同上，开着那一步必须自己造事件',
          run: ctx => pressWithCapsLock(ctx, true),
          expect: { parts: { 'caps-lock-indicator': { 'data-state': 'visible' } } },
        },
        {
          kind: 'blur',
          expect: { parts: { 'caps-lock-indicator': { 'hidden': null, 'data-state': 'hidden' } } },
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
          run: ctx => typeInto(ctx, 'hunter2'),
          expect: {
            parts: { root: { 'data-empty': null } },
            events: [{ type: 'value-change', detail: { value: 'hunter2' } }],
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则状态纹丝不动，回调照发；写回后以宿主的为准',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: '' },
      initial: { parts: { root: { 'data-empty': '' } } },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: 'type 步骤落不到 value 上；受控下要的是"用户真敲了字"这一路',
          run: ctx => typeInto(ctx, 'hunter2'),
          // 受控值仍是空串，data-empty 不动；通知里带的是用户敲的那串。
          // 不比 input.value：宿主没写回时框里显示什么取决于适配器是否重渲
          expect: {
            parts: { root: { 'data-empty': '' } },
            events: [{ type: 'value-change', detail: { value: 'hunter2' } }],
          },
        },
        { kind: 'setProps', props: { value: 'from-host' }, expect: { parts: { root: { 'data-empty': null } } } },
        {
          kind: 'raw',
          why: 'value 是 property；写回后框里必须是宿主给的那串，而不是用户敲的',
          run: ({ doc }) => expectValue(doc, 'from-host', '宿主写回后应盖掉用户敲进去的字'),
        },
      ],
    },
    {
      name: 'disabled：输入框与切换钮都带原生 disabled，绕过 DOM 直接点也推不动',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: 'hunter2', disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'control': { 'data-disabled': '' },
          'input': { 'disabled': '', 'data-disabled': '' },
          'visibility-trigger': { 'disabled': '', 'data-disabled': '' },
        },
      },
      steps: [
        dispatchClickOnDisabled('password-input', 'visibility-trigger', {
          parts: { input: { type: 'password' } },
          events: [],
        }),
        {
          kind: 'raw',
          why: '禁用控件上焦点与点击都被浏览器短路，写值只能直接派 input 事件才碰得到守卫',
          run: ctx => typeInto(ctx, '换一个'),
          expect: { parts: { root: { 'data-empty': null } }, events: [] },
        },
      ],
    },
    {
      name: 'readOnly：值写不进，但明暗照切——改的是怎么显示，不是值',
      spec: { apg: HTML_SPEC },
      props: { defaultValue: 'hunter2', readOnly: true },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          'control': { 'data-readonly': '' },
          // 与 disabled 的差别就在这里：input 不带原生 disabled，因此仍可聚焦
          'input': { readonly: '', disabled: null },
          'visibility-trigger': { disabled: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '只读框上敲字要直接派 input 事件才碰得到守卫',
          run: ctx => typeInto(ctx, '换一个'),
          expect: { events: [] },
        },
        { kind: 'click', part: 'visibility-trigger', expect: { parts: { input: { type: 'text' } } } },
      ],
    },
    {
      name: 'invalid：input 的 aria-invalid 显式为 true，root 与 control 同步标注',
      spec: { apg: APG },
      props: { invalid: true, required: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          control: { 'data-invalid': '' },
          input: { 'aria-invalid': 'true', 'data-invalid': '' },
        },
      },
    },
    {
      name: 'translations：三句读屏文案都能被覆盖',
      spec: { apg: APG },
      props: {
        defaultVisible: true,
        translations: { visibilityTriggerHide: '隐藏密码', capsLockOn: '大写锁定已打开' },
      },
      initial: {
        parts: {
          'visibility-trigger': { 'aria-label': '隐藏密码' },
        },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'raw',
          why: '大写锁定那句是播报区的正文，不是名字，属性快照里没有它',
          run: async (ctx) => {
            await pressWithCapsLock(ctx, true)
            expectText(ctx.doc, HINT, '大写锁定已打开', '覆盖过的文案应原样写进播报区')
          },
        },
      ],
    },
  ],
}
