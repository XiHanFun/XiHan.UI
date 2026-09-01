import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { questionFlowAnatomy, questionFlowKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/#keyboardinteraction'

/** 三道题：单选、多选、单选。选项索引按文档序连排，第三道题的两项是 5 与 6。 */
const QUESTIONS = [
  {
    id: 'scope',
    prompt: '这次改动动到哪一层？',
    type: 'single' as const,
    options: [{ value: 'ui', label: '界面' }, { value: 'api', label: '接口' }, { value: 'db', label: '数据' }],
  },
  {
    id: 'checks',
    prompt: '要顺带补哪些检查？',
    type: 'multiple' as const,
    options: [{ value: 'unit', label: '单元测试' }, { value: 'e2e', label: '端到端' }],
  },
  {
    id: 'branch',
    prompt: '落到哪条分支？',
    type: 'single' as const,
    options: [{ value: 'main', label: '主干' }, { value: 'feature', label: '特性分支' }],
  },
]

/** 同一份标记，只把第一题的中间那项在数据里标成禁用。 */
const DISABLED_QUESTIONS = [
  {
    ...QUESTIONS[0]!,
    options: [
      { value: 'ui', label: '界面' },
      { value: 'api', label: '接口', disabled: true },
      { value: 'db', label: '数据' },
    ],
  },
  QUESTIONS[1]!,
  QUESTIONS[2]!,
]

function optionNode(questionId: string, value: string, label: string): FixtureNode {
  const attrs = { 'question-id': questionId, 'option-value': value }
  return {
    part: 'option',
    tag: 'button',
    attrs,
    children: [
      { part: 'option-indicator', tag: 'span', attrs },
      { part: 'option-label', tag: 'span', attrs, text: label },
    ],
  }
}

function questionNode(question: (typeof QUESTIONS)[number]): FixtureNode {
  const attrs = { 'question-id': question.id }
  return {
    part: 'question',
    attrs,
    children: [
      { part: 'prompt', tag: 'p', attrs, text: question.prompt },
      {
        part: 'option-group',
        attrs,
        children: question.options.map(option => optionNode(question.id, option.value, option.label)),
      },
      { part: 'note', tag: 'input', attrs },
    ],
  }
}

/** 题与选项的身份写在作者自己的节点上；两侧同一套 question-id / option-value 属性。 */
export const questionFlowSuite: ConformanceSuite = {
  component: 'question-flow',
  anatomy: questionFlowAnatomy,
  keyboard: questionFlowKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'viewport', children: [{ part: 'track', children: QUESTIONS.map(questionNode) }] },
      { part: 'result' },
      {
        part: 'footer',
        children: [
          { part: 'prev-trigger', tag: 'button' },
          { part: 'counter', tag: 'span' },
          { part: 'next-trigger', tag: 'button' },
          { part: 'skip-trigger', tag: 'button', text: '跳过' },
          { part: 'submit-trigger', tag: 'button', text: '继续' },
        ],
      },
      { part: 'announcement' },
    ],
  },
  cases: [
    {
      name: '默认停在第一题：只有它对读屏与 Tab 序可达，没答之前提交键按不动',
      spec: { apg: APG },
      props: { questions: QUESTIONS },
      initial: {
        counts: { 'root': 1, 'question': 3, 'option': 7, 'submit-trigger': 1 },
        parts: {
          'root': { 'data-state': 'answering' },
          'question': [
            { 'data-current': '', 'aria-hidden': null, 'inert': null, 'role': 'group' },
            { 'data-current': null, 'aria-hidden': 'true', 'inert': '' },
            { 'data-current': null, 'aria-hidden': 'true', 'inert': '' },
          ],
          'option-group': [
            { role: 'radiogroup' },
            { role: 'group' },
            { role: 'radiogroup' },
          ],
          'option': [
            { 'role': 'radio', 'aria-checked': 'false', 'tabindex': '0', 'disabled': null },
            { 'role': 'radio', 'aria-checked': 'false', 'tabindex': '-1' },
            { role: 'radio', tabindex: '-1' },
            // 第二题不是当前题：它的选项一个 Tab 停靠点都不占
            { 'role': 'checkbox', 'aria-checked': 'false', 'tabindex': '-1' },
          ],
          // 计数只给眼睛看，进度由播报区念
          'counter': { 'aria-hidden': 'true' },
          'announcement': { 'aria-live': 'polite', 'aria-atomic': 'true' },
          'prev-trigger': { disabled: '' },
          'next-trigger': { disabled: null },
          'submit-trigger': { 'data-mode': 'continue', 'disabled': '' },
          'result': { 'aria-hidden': 'true', 'hidden': '' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '单选选中后自动走下一题',
      spec: { apg: APG },
      props: { questions: QUESTIONS, autoAdvanceDelay: 30 },
      steps: [
        {
          kind: 'click',
          part: 'option[0]',
          expect: {
            parts: { option: [{ 'aria-checked': 'true' }] },
            events: [{ type: 'answers-change', detail: { answers: { scope: ['ui'] } } }],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'question[1]', name: 'data-current', value: '' } },
          timeoutMs: 2000,
          expect: {
            parts: {
              question: [{ 'data-current': null }, { 'data-current': '' }],
            },
          },
        },
      ],
    },
    {
      name: '多选选中之后停在原题，等人点继续',
      spec: { apg: APG },
      props: { questions: QUESTIONS, defaultIndex: 1, autoAdvanceDelay: 20 },
      steps: [
        {
          kind: 'click',
          part: 'option[3]',
          expect: {
            parts: { option: [{ 'aria-checked': 'false' }, {}, {}, { 'aria-checked': 'true' }] },
            events: [{ type: 'answers-change', detail: { answers: { checks: ['unit'] } } }],
          },
        },
        {
          kind: 'raw',
          why: '要核对的是「什么都没发生」：等过一整段自动前进的时长，再确认当前题没挪窝',
          run: async ({ doc, flush }: RawStepContext) => {
            await new Promise<void>(resolve => setTimeout(resolve, 80))
            await flush()
            const questions = doc.querySelectorAll('[data-scope="question-flow"][data-part="question"]')
            if (!questions[1]?.hasAttribute('data-current'))
              throw new Error('多选题不该自动前进')
          },
        },
      ],
    },
    {
      name: '单选组内方向键走一步就选一步',
      spec: { apg: APG },
      covers: ['question-flow.kbd.next-option', 'question-flow.kbd.prev-option'],
      props: { questions: QUESTIONS, autoAdvance: false },
      steps: [
        { kind: 'focus', part: 'option[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              option: [{ 'aria-checked': 'false', 'tabindex': '-1' }, { 'aria-checked': 'true', 'tabindex': '0' }],
            },
            activeElement: 'option[1]',
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { option: [{ 'aria-checked': 'true', 'tabindex': '0' }, { 'aria-checked': 'false' }] },
            activeElement: 'option[0]',
          },
        },
      ],
    },
    {
      name: '选项组内一步到头',
      spec: { apg: APG },
      covers: ['question-flow.kbd.first-option', 'question-flow.kbd.last-option'],
      props: { questions: QUESTIONS, autoAdvance: false },
      steps: [
        { kind: 'focus', part: 'option[0]' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            parts: { option: [{ 'aria-checked': 'false' }, { 'aria-checked': 'false' }, { 'aria-checked': 'true' }] },
            activeElement: 'option[2]',
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            parts: { option: [{ 'aria-checked': 'true' }, {}, { 'aria-checked': 'false' }] },
            activeElement: 'option[0]',
          },
        },
      ],
    },
    {
      name: 'Space 切换多选项，再按一次取消',
      spec: { apg: APG },
      covers: ['question-flow.kbd.toggle'],
      props: { questions: QUESTIONS, defaultIndex: 1 },
      steps: [
        { kind: 'focus', part: 'option[3]' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { 'option[3]': { 'aria-checked': 'true' } },
            events: [{ type: 'answers-change', detail: { answers: { checks: ['unit'] } } }],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { 'option[3]': { 'aria-checked': 'false' } },
            events: [{ type: 'answers-change', detail: { answers: { checks: [] } } }],
          },
        },
      ],
    },
    {
      name: '禁用项停得上去却按不动：Space 不选它，方向键从它身上迈过去',
      spec: { apg: APG },
      props: { questions: DISABLED_QUESTIONS, autoAdvance: false },
      initial: {
        parts: {
          // 用 aria-disabled 而非原生 disabled：禁用项照样能被点上去，因而 Space 那条路必须自己挡
          option: [
            { 'aria-disabled': 'false', 'tabindex': '0' },
            { 'aria-disabled': 'true', 'tabindex': '-1' },
            { 'aria-disabled': 'false', 'tabindex': '-1' },
          ],
        },
        events: [],
      },
      steps: [
        { kind: 'focus', part: 'option[1]' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { 'option[1]': { 'aria-checked': 'false' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { 'option[1]': { 'aria-checked': 'false' }, 'option[2]': { 'aria-checked': 'true' } },
            activeElement: 'option[2]',
          },
        },
      ],
    },
    {
      name: '末题上按 Enter 即交卷，载荷带着全部答案',
      spec: { apg: APG },
      covers: ['question-flow.kbd.advance'],
      props: { questions: QUESTIONS, defaultIndex: 2, defaultAnswers: { branch: ['main'] } },
      initial: {
        parts: { 'submit-trigger': { 'data-mode': 'send', 'disabled': null } },
      },
      steps: [
        { kind: 'focus', part: 'option[5]' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              root: { 'data-state': 'submitted' },
              result: { hidden: null },
            },
            events: [{ type: 'submit', detail: { answers: { branch: ['main'] }, notes: {} } }],
          },
        },
      ],
    },
    {
      name: '跳过：不作答也走得下去',
      spec: { apg: APG },
      props: { questions: QUESTIONS },
      steps: [
        {
          kind: 'click',
          part: 'skip-trigger',
          expect: {
            parts: { question: [{ 'data-current': null }, { 'data-current': '' }] },
            // 跳过那条回调的载荷由 headless 单测核对，一致性运行方只收跨适配器统一的事件
            events: [{ type: 'index-change', detail: { index: 1 } }],
          },
        },
      ],
    },
    {
      name: '关掉跳过就整颗收起，而不是留一颗按不动的按钮',
      spec: { apg: APG },
      props: { questions: QUESTIONS, allowSkip: false },
      initial: {
        parts: { 'skip-trigger': { hidden: '' } },
      },
    },
    {
      name: '自由文本与选项同等算数：写了一句就走得下去',
      spec: { apg: APG },
      props: { questions: QUESTIONS, defaultNotes: { scope: '别的' } },
      initial: {
        parts: { 'submit-trigger': { disabled: null } },
      },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            parts: { question: [{ 'data-current': null }, { 'data-current': '' }] },
            events: [{ type: 'index-change', detail: { index: 1 } }],
          },
        },
      ],
    },
    {
      name: '受控答题态：交卷只发意图，宿主写回之后才落定',
      spec: { apg: APG },
      props: {
        questions: QUESTIONS,
        status: 'answering',
        defaultIndex: 2,
        defaultAnswers: { branch: ['main'] },
      },
      steps: [
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: {
            parts: { root: { 'data-state': 'answering' } },
            events: [{ type: 'submit', detail: { answers: { branch: ['main'] }, notes: {} } }],
          },
        },
        {
          kind: 'setProps',
          props: { status: 'submitted' },
          expect: {
            parts: { root: { 'data-state': 'submitted' }, result: { hidden: null } },
          },
        },
      ],
    },
  ],
}
