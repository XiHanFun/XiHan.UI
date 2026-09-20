import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { questionFlowAnatomy, questionFlowKeyboard } from '@xihan-ui/headless'
import { heldPress, heldPressIgnored } from './shared/press-channel'

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

function itemNode(questionId: string, value: string, label: string): FixtureNode {
  const attrs = { 'question-id': questionId, 'option-value': value }
  return {
    part: 'item',
    tag: 'button',
    attrs,
    children: [
      { part: 'item-indicator', tag: 'span', attrs },
      { part: 'item-text', tag: 'span', attrs, text: label },
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
        part: 'group',
        attrs,
        children: question.options.map(option => itemNode(question.id, option.value, option.label)),
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
      { part: 'live-region' },
    ],
  },
  cases: [
    {
      name: '默认停在第一题：只有它对读屏与 Tab 序可达，没答之前提交键按不动',
      spec: { apg: APG },
      props: { questions: QUESTIONS },
      initial: {
        counts: { 'root': 1, 'question': 3, 'item': 7, 'submit-trigger': 1 },
        parts: {
          'root': { 'data-state': 'answering' },
          'question': [
            { 'data-current': '', 'aria-hidden': null, 'inert': null, 'role': 'group' },
            { 'data-current': null, 'aria-hidden': 'true', 'inert': '' },
            { 'data-current': null, 'aria-hidden': 'true', 'inert': '' },
          ],
          'group': [
            { role: 'radiogroup' },
            { role: 'group' },
            { role: 'radiogroup' },
          ],
          // 选项行接 Action Control row 档：ghost 形态、按下只换面，档位随 size 缺省 md
          'item': [
            { 'role': 'radio', 'aria-checked': 'false', 'tabindex': '0', 'disabled': null, 'data-xh-action-control': '', 'data-xh-action-profile': 'row', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md' },
            { 'role': 'radio', 'aria-checked': 'false', 'tabindex': '-1' },
            { role: 'radio', tabindex: '-1' },
            // 第二题不是当前题：它的选项一个 Tab 停靠点都不占
            { 'role': 'checkbox', 'aria-checked': 'false', 'tabindex': '-1' },
          ],
          // 计数只给眼睛看，进度由播报区念
          'counter': { 'aria-hidden': 'true' },
          'live-region': { 'aria-live': 'polite', 'aria-atomic': 'true' },
          // 两颗翻页钮接 icon 档 xs 位 ghost；跳过接 text 档 ghost；提交接 text 档 solid；
          // 单体控件用原生 disabled，家族按 data-disabled 给禁用面
          'prev-trigger': { 'disabled': '', 'data-disabled': '', 'data-xh-action-control': '', 'data-xh-action-profile': 'icon', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'xs' },
          'next-trigger': { 'disabled': null, 'data-disabled': null, 'data-xh-action-control': '', 'data-xh-action-profile': 'icon', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'xs' },
          'skip-trigger': { 'data-disabled': null, 'data-xh-action-control': '', 'data-xh-action-profile': 'text', 'data-xh-action-variant': 'ghost', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md', 'data-tone': null },
          'submit-trigger': { 'data-mode': 'continue', 'disabled': '', 'data-disabled': '', 'data-xh-action-control': '', 'data-xh-action-profile': 'text', 'data-xh-action-variant': 'solid', 'data-xh-action-display': 'always', 'data-xh-action-size': 'md', 'data-tone': null },
          'result': { 'aria-hidden': 'true', 'hidden': '' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      // 家族的深色 solid 规则只看触发器自身的 data-tone：语气除了落在根上，
      // 还与 Button 同构地投在提交钮自己身上，暗色下实心面才不会落回品牌色；ghost 形态的跳过钮不吃这条
      name: '语气落到根与提交钮上：提交钮实心面随语气，跳过钮不投',
      spec: { apg: APG },
      props: { questions: QUESTIONS, tone: 'warning' },
      initial: {
        parts: {
          'root': { 'data-tone': 'warning' },
          'submit-trigger': { 'data-tone': 'warning' },
          'skip-trigger': { 'data-tone': null },
        },
      },
    },
    {
      name: '单选选中后自动走下一题',
      spec: { apg: APG },
      props: { questions: QUESTIONS, autoAdvanceDelay: 30 },
      steps: [
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { item: [{ 'aria-checked': 'true' }] },
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
          part: 'item[3]',
          expect: {
            parts: { item: [{ 'aria-checked': 'false' }, {}, {}, { 'aria-checked': 'true' }] },
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
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              item: [{ 'aria-checked': 'false', 'tabindex': '-1' }, { 'aria-checked': 'true', 'tabindex': '0' }],
            },
            activeElement: 'item[1]',
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { item: [{ 'aria-checked': 'true', 'tabindex': '0' }, { 'aria-checked': 'false' }] },
            activeElement: 'item[0]',
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
        { kind: 'focus', part: 'item[0]' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            parts: { item: [{ 'aria-checked': 'false' }, { 'aria-checked': 'false' }, { 'aria-checked': 'true' }] },
            activeElement: 'item[2]',
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            parts: { item: [{ 'aria-checked': 'true' }, {}, { 'aria-checked': 'false' }] },
            activeElement: 'item[0]',
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
        { kind: 'focus', part: 'item[3]' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { 'item[3]': { 'aria-checked': 'true' } },
            events: [{ type: 'answers-change', detail: { answers: { checks: ['unit'] } } }],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { 'item[3]': { 'aria-checked': 'false' } },
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
          item: [
            { 'aria-disabled': 'false', 'tabindex': '0' },
            { 'aria-disabled': 'true', 'tabindex': '-1' },
            { 'aria-disabled': 'false', 'tabindex': '-1' },
          ],
        },
        events: [],
      },
      steps: [
        { kind: 'focus', part: 'item[1]' },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { 'item[1]': { 'aria-checked': 'false' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: { 'item[1]': { 'aria-checked': 'false' }, 'item[2]': { 'aria-checked': 'true' } },
            activeElement: 'item[2]',
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
        { kind: 'focus', part: 'item[5]' },
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
    {
      name: 'Space / Enter 按住与触屏按下：四颗钮各自投影 data-pressed，抬起、失焦或指针取消撤下',
      spec: { adr: 'press-channel' },
      covers: ['question-flow.kbd.press'],
      // 停在第二题且已作答：上一题、下一题、跳过、继续四颗都可按
      props: { questions: QUESTIONS, defaultIndex: 1, defaultAnswers: { checks: ['unit'] } },
      steps: [
        heldPress('question-flow', 'prev-trigger'),
        heldPress('question-flow', 'next-trigger'),
        heldPress('question-flow', 'skip-trigger'),
        heldPress('question-flow', 'submit-trigger'),
      ],
    },
    {
      name: '选项：Space 按住与触屏按下投影 data-pressed；Enter 不是选项的激活键，不进按压面',
      spec: { adr: 'press-channel' },
      covers: ['question-flow.kbd.item-press'],
      props: { questions: QUESTIONS, autoAdvance: false },
      steps: [
        heldPress('question-flow', 'item', { value: 'ui', keys: [' '] }),
        {
          kind: 'raw',
          why: 'Enter 归选项组的前进：焦点在选项上按住 Enter，选项自己不该投影按压面',
          run: async ({ doc, flush }: RawStepContext) => {
            const item = doc.querySelector<HTMLElement>('[data-scope="question-flow"][data-part="item"][data-value="db"]')
            if (!item)
              throw new Error('找不到 question-flow 的 item[db] 部件')
            item.focus()
            item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await flush()
            if (item.hasAttribute('data-pressed'))
              throw new Error('Enter 不是选项的激活键，按住不该投影 data-pressed')
            item.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true, cancelable: true }))
          },
        },
      ],
    },
    {
      name: '边界与禁用不进按压面：首题的上一题、没答之前的继续、数据里标成禁用的选项',
      spec: { adr: 'press-channel' },
      props: { questions: DISABLED_QUESTIONS, autoAdvance: false },
      steps: [
        heldPressIgnored('question-flow', 'prev-trigger', '首题上上一题钮原生 disabled，不接受按压'),
        heldPressIgnored('question-flow', 'submit-trigger', '没答之前继续钮原生 disabled，不接受按压'),
        heldPressIgnored('question-flow', 'item', '数据里标成禁用的选项 aria-disabled，不接受按压', { value: 'api' }),
      ],
    },
    {
      name: '按住途中换题：Enter 在 keydown 即前进，按压面随换题收起；交卷后一律不进',
      spec: { adr: 'press-channel' },
      props: { questions: QUESTIONS, defaultIndex: 1, defaultAnswers: { checks: ['unit'], branch: ['main'] } },
      steps: [
        {
          kind: 'raw',
          why: 'Enter 在 keydown 即 click 前进一题，随后换题的那一帧按压面得已经收起',
          run: async ({ doc, flush }: RawStepContext) => {
            const submit = doc.querySelector<HTMLElement>('[data-scope="question-flow"][data-part="submit-trigger"]')
            if (!submit)
              throw new Error('找不到 question-flow 的 submit-trigger 部件')
            submit.focus()
            submit.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }))
            await flush()
            if (!submit.hasAttribute('data-pressed'))
              throw new Error('按住 Enter 时 submit-trigger 应投影 data-pressed')
            submit.click()
          },
          expect: {
            parts: { 'question[2]': { 'data-current': '' }, 'submit-trigger': { 'data-mode': 'send', 'data-pressed': null } },
          },
        },
        {
          kind: 'click',
          part: 'submit-trigger',
          expect: { parts: { 'root': { 'data-state': 'submitted' }, 'submit-trigger': { disabled: '' } } },
        },
        heldPressIgnored('question-flow', 'submit-trigger', '交卷后继续钮原生 disabled，不接受按压'),
        heldPressIgnored('question-flow', 'item', '交卷后选项一律 aria-disabled，不接受按压', { value: 'main' }),
      ],
    },
  ],
}
