import type { ExpressionCompletion, ExpressionInputIssue } from '@xihan-ui/core'
import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { expressionInputAnatomy, expressionInputKeyboard } from '@xihan-ui/headless'

// 表达式输入框没有独立的 APG 模式：单行是组合框那套「输入框 + aria-activedescendant」，
// 选中动作是替换光标处的名字，不是替换整个值。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'

const INPUT = '[data-scope="expression-input"][data-part="input"]'

const VARIABLES: readonly ExpressionCompletion[] = [
  { label: 'amount', kind: 'variable', detail: 'number' },
  { label: 'applicant', kind: 'variable' },
]

/** 打字：conformance 的 type 步骤改不动输入框的值，补全的入口正是原生 input 事件加那一刻的光标位置。 */
async function typeInto(doc: Document, text: string, flush: () => Promise<void>): Promise<void> {
  const input = doc.querySelector<HTMLInputElement>(INPUT)!
  input.focus()
  input.value = text
  input.setSelectionRange(text.length, text.length)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

/** 挪光标：光标位置只有 DOM 知道，挪完补一下方向键抬起，组件按新位置重取名字。 */
async function moveCaret(doc: Document, caret: number, flush: () => Promise<void>): Promise<void> {
  const input = doc.querySelector<HTMLInputElement>(INPUT)!
  input.setSelectionRange(caret, caret)
  input.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }))
  await flush()
}

function assertValue(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLInputElement>(INPUT)?.value ?? null
  if (actual !== expected)
    throw new Error(`值不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** 检查函数桩：值里每个 x 报一条 error。 */
function checkX(source: string): readonly ExpressionInputIssue[] {
  return [...source.matchAll(/x/g)].map(match => ({ start: match.index, end: match.index + 1, message: 'no x' }))
}

const ROOT: FixtureNode = { part: 'root', defaultStructure: true }

export const expressionInputSuite: ConformanceSuite = {
  component: 'expression-input',
  anatomy: expressionInputAnatomy,
  keyboard: expressionInputKeyboard,
  defaultProps: { label: '公式' },
  fixture: ROOT,
  cases: [
    {
      name: '作者只写 root：三端都照 expressionInputStructure 铺出标题、外框里的输入框与镜像层、补全浮层与问题列表',
      spec: { apg: APG },
      fixture: (): FixtureNode => ROOT,
      props: { label: '公式' },
      initial: {
        counts: { 'label': 1, 'control': 1, 'input': 1, 'highlight': 1, 'highlight-segment': 1, 'positioner': 1, 'content': 1, 'item': 0, 'empty': 1, 'issues': 1, 'issue': 0 },
        parts: {
          input: {
            'role': 'combobox',
            'type': 'text',
            'aria-expanded': 'false',
            'aria-autocomplete': 'list',
            'aria-haspopup': 'listbox',
            'aria-controls': '@part(content)',
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            'data-xh-field-input': '',
          },
          control: { 'data-xh-field-chrome': '' },
          highlight: { 'aria-hidden': 'true' },
          content: { hidden: '', role: 'listbox' },
          issues: { hidden: '', role: 'status' },
        },
      },
    },
    {
      name: '多行：输入框是 textarea，保持 textbox 角色，不写 combobox 与 aria-expanded',
      spec: { apg: APG },
      props: { label: '公式', multiline: true },
      initial: {
        parts: {
          input: { 'role': null, 'type': null, 'aria-expanded': null, 'aria-autocomplete': 'list', 'data-xh-field-layout': 'textarea' },
          highlight: { 'data-multiline': '' },
        },
      },
    },
    {
      name: '输入名字字符且有匹配才打开，高亮首条；aria-activedescendant 指向它',
      spec: { apg: APG },
      covers: ['expression-input.kbd.type'],
      props: { label: '公式', completions: VARIABLES },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤改不动输入框的值，补全的入口正是原生 input 事件加那一刻的光标位置',
          run: ({ doc, flush }) => typeInto(doc, 'a', flush),
          expect: {
            counts: { 'item': 4, 'item-prefix': 4, 'item-text': 4 },
            parts: {
              'input': { 'data-state': 'open', 'aria-expanded': 'true', 'aria-activedescendant': '@part(item[0])' },
              'content': { 'hidden': null, 'data-state': 'open' },
              'item[0]': { 'role': 'option', 'aria-selected': 'true', 'data-highlighted': '' },
            },
            events: [
              { type: 'value-change', detail: { value: 'a' } },
              { type: 'open-change', detail: { open: true } },
            ],
          },
        },
      ],
    },
    {
      name: '方向键移高亮，Enter 用高亮条目替换光标处的名字，补全收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['expression-input.kbd.next', 'expression-input.kbd.prev', 'expression-input.kbd.accept'],
      props: { label: '公式', completions: VARIABLES },
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, 'a', flush) },
        { kind: 'settle', until: { attr: { part: 'item[0]', name: 'data-highlighted', value: '' } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { 'input': { 'aria-activedescendant': '@part(item[1])' }, 'item[1]': { 'data-highlighted': '' }, 'item[0]': { 'data-highlighted': null } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: { parts: { input: { 'aria-activedescendant': '@part(item[0])' } }, events: [] },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { input: { 'data-state': 'closed', 'aria-expanded': 'false', 'aria-activedescendant': null } },
            events: [
              { type: 'value-change', detail: { value: 'amount' } },
              { type: 'completion-select', detail: { completion: { key: 'variable:amount', kind: 'variable', label: 'amount', detail: 'number', description: null, insert: 'amount', caretOffset: 6 } } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        { kind: 'raw', why: '值只落 DOM property，快照只采属性', run: ({ doc }) => assertValue(doc, 'amount') },
      ],
    },
    {
      name: 'Ctrl+Space 主动打开：光标前没有名字也列出全部，高亮首条',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['expression-input.kbd.force'],
      props: { label: '公式', completions: VARIABLES },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'Space',
          modifiers: ['Control'],
          expect: {
            parts: {
              'input': { 'data-state': 'open', 'aria-expanded': 'true', 'aria-activedescendant': '@part(item[0])' },
              'content': { hidden: null },
              'item[0]': { 'data-highlighted': '' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'Escape 收起且值不变；接着输入名字字符会再打开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['expression-input.kbd.escape'],
      props: { label: '公式', completions: VARIABLES },
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, 'a', flush) },
        // 消解层的监听器延后一拍注册（免得打开自己的那次交互立刻把自己关掉）
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { input: { 'data-state': 'closed', 'aria-expanded': 'false' }, content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        { kind: 'raw', why: '值只落 DOM property，快照只采属性', run: ({ doc }) => assertValue(doc, 'a') },
        {
          kind: 'raw',
          why: '打字只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, 'am', flush),
          expect: {
            parts: { content: { hidden: null } },
            events: [
              { type: 'value-change', detail: { value: 'am' } },
              { type: 'open-change', detail: { open: true } },
            ],
          },
        },
      ],
    },
    {
      name: '收起态回车不接管：值不变，也不派任何事件',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['expression-input.kbd.enter-pass'],
      props: { label: '公式', completions: VARIABLES },
      steps: [
        {
          kind: 'raw',
          why: '打字只能直接派 input 事件；光标落在数字里，不弹补全',
          run: ({ doc, flush }) => typeInto(doc, '1', flush),
          expect: { parts: { input: { 'data-state': 'closed' } } },
        },
        { kind: 'key', key: 'Enter', expect: { parts: { input: { 'data-state': 'closed' } }, events: [] } },
        { kind: 'raw', why: '值只落 DOM property，快照只采属性', run: ({ doc }) => assertValue(doc, '1') },
      ],
    },
    {
      name: '光标挪出名字即收起；只挪光标不会再打开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['expression-input.kbd.caret'],
      props: { label: '公式', completions: VARIABLES },
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '1 + a', flush) },
        {
          kind: 'raw',
          why: '光标位置只有 DOM 知道，conformance 没有移动光标的步骤',
          run: ({ doc, flush }) => moveCaret(doc, 1, flush),
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        {
          kind: 'raw',
          why: '同上；只挪光标不算输入，补全不因此打开',
          run: ({ doc, flush }) => moveCaret(doc, 5, flush),
          expect: { parts: { content: { hidden: '' } }, events: [] },
        },
      ],
    },
    {
      name: '失焦立即检查：问题列表逐行列出、进输入框的描述链，镜像层把区间单独成段，输入框 aria-invalid',
      spec: { apg: APG },
      // 去抖期拉得足够长，问题只能由失焦那一下立即检查带出来：各端计时器落在哪一拍不进快照
      props: { label: '公式', check: checkX, checkDelay: 60_000 },
      steps: [
        {
          kind: 'raw',
          why: '打字只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, 'ax', flush),
          expect: { counts: { issue: 0 }, parts: { input: { 'aria-invalid': 'false' }, issues: { hidden: '' } } },
        },
        {
          kind: 'blur',
          expect: {
            counts: { 'issue': 1, 'highlight-segment': 2 },
            parts: {
              'input': { 'aria-invalid': 'true', 'aria-describedby': '@part(issues)' },
              'issues': { 'hidden': null, 'data-invalid': '' },
              'highlight-segment[1]': { 'data-issue': '0', 'data-severity': 'error' },
              'issue[0]': { 'data-severity': 'error' },
            },
            events: [{ type: 'issues-change', detail: { issues: [{ start: 1, end: 2, message: 'no x' }] } }],
          },
        },
      ],
    },
    {
      name: 'disabled：输入框原生 disabled，根与外框带 data-disabled，输入不打开补全',
      spec: { apg: APG },
      props: { label: '公式', disabled: true, completions: VARIABLES },
      initial: {
        parts: {
          root: { 'data-disabled': '' },
          control: { 'data-disabled': '' },
          input: { 'disabled': '', 'data-disabled': '' },
        },
      },
    },
  ],
}
