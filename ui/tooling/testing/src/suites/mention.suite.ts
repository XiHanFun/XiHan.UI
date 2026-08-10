import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { mentionAnatomy, mentionKeyboard } from '@xihan-ui/headless'

// 提及没有独立的 APG 模式：它是组合框那套「输入框 + aria-activedescendant」用在正文里，
// 差别在于宿主是多行的（因此不写 role=combobox 与 aria-expanded），
// 而选中动作是把光标处那段查询串换掉，不是替换整个值。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'

const INPUT = '[data-scope="mention"][data-part="input"]'

/**
 * 正文只落 DOM property（value 属性表达的是默认值，用户敲过字之后就失效了），
 * 快照只采属性，因此这一路只能直接读 DOM。
 */
function assertText(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLTextAreaElement>(INPUT)?.value ?? null
  if (actual !== expected)
    throw new Error(`正文不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

function assertCaret(doc: Document, expected: number): void {
  const actual = doc.querySelector<HTMLTextAreaElement>(INPUT)?.selectionStart ?? null
  if (actual !== expected)
    throw new Error(`光标位置不符：期望 ${expected}，实际 ${actual}`)
}

/**
 * 打字。conformance 的 type 步骤只派按键、改不动输入框的值，
 * 而提及的入口正是「原生 input 事件 + 那一刻的光标位置」，只能直接写值再派事件。
 */
async function typeInto(doc: Document, text: string, flush: () => Promise<void>, caret = text.length): Promise<void> {
  const input = doc.querySelector<HTMLTextAreaElement>(INPUT)!
  input.focus()
  input.value = text
  input.setSelectionRange(caret, caret)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

/** 只挪光标、不改正文：keyup 里那几个纯移动键才会让机器重算触发。 */
async function moveCaret(doc: Document, caret: number, flush: () => Promise<void>): Promise<void> {
  const input = doc.querySelector<HTMLTextAreaElement>(INPUT)!
  input.setSelectionRange(caret, caret)
  input.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }))
  await flush()
}

/**
 * 三个候选，ghost 禁用（方向键跳过它，点击也不认）。
 * 禁用在这里写成 disabled 属性（Vue 的 Boolean prop 语义）；WC 侧要改写成 aria-disabled 声明，
 * 与其它集合类组件同因——集合条目一律 aria-disabled，原生 disabled 不派 click。
 */
function itemNode(value: string, text: string, disabled = false): FixtureNode {
  const attrs: Record<string, string> = { value }
  if (disabled)
    attrs.disabled = ''
  return {
    part: 'item',
    attrs,
    children: [{ part: 'item-text', tag: 'span', text }],
  }
}

const ITEMS: readonly FixtureNode[] = [
  itemNode('lilei', 'Lilei'),
  itemNode('ghost', 'Ghost', true),
  itemNode('poly', 'Poly'),
]

/** 输入宿主必须是 textarea：WC 侧由 fixture 的 tag 决定，div 既不可聚焦也没有 value。 */
function tree(items: readonly FixtureNode[] = ITEMS): FixtureNode {
  return {
    part: 'root',
    children: [
      // 可及名字归作者：这里没有 label 部件，输入框自己带一句
      { part: 'input', tag: 'textarea', attrs: { 'aria-label': '正文' } },
      {
        part: 'positioner',
        children: [{ part: 'content', children: items }],
      },
    ],
  }
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只断言 data-placement 这类语义属性。
export const mentionSuite: ConformanceSuite = {
  component: 'mention',
  anatomy: mentionAnatomy,
  keyboard: mentionKeyboard,
  fixture: tree(),
  cases: [
    {
      name: '初始收起：多行宿主不写 role 与 aria-expanded，其余组合框属性互指',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
          'input',
          'positioner',
          'content',
          'item[0]',
          'item-text[0]',
          'item[1]',
          'item-text[1]',
          'item[2]',
          'item-text[2]',
        ],
        counts: {
          'root': 1,
          'input': 1,
          'positioner': 1,
          'content': 1,
          'item': 3,
          'item-text': 3,
        },
        parts: {
          root: { 'data-state': 'closed', 'data-disabled': null },
          input: {
            // textarea 的允许角色只有它自带的 textbox，改角色是文档一致性违规
            'role': null,
            // aria-expanded 不在 textbox 的支持属性里
            'aria-expanded': null,
            // textarea 没有 type 属性
            'type': null,
            // 「有候选浮层」改由这四条表达，它们 textbox 都支持
            'aria-haspopup': 'listbox',
            'aria-autocomplete': 'list',
            'aria-controls': '@part(content)',
            'aria-activedescendant': null,
            'data-state': 'closed',
            // 整个组件只占一个 Tab 位，就是它自己：不写 tabindex 即用元素本身的默认序
            'tabindex': null,
            'disabled': null,
          },
          positioner: { 'data-state': 'closed', 'data-placement': 'bottom-start' },
          content: {
            'role': 'listbox',
            // role=listbox 必须有可及名字，而这里没有可指的标题部件
            'aria-label': 'Mentions',
            'tabindex': '-1',
            'hidden': '',
            'data-state': 'closed',
          },
          item: [
            {
              'role': 'option',
              'aria-selected': 'false',
              'aria-disabled': 'false',
              'id': '@self',
              'data-value': 'lilei',
              'data-highlighted': null,
              'data-disabled': null,
              // 焦点恒在输入框：候选既不进 Tab 序列，也不承载焦点
              'tabindex': null,
              // 集合条目绝不输出原生 disabled：那样连 click 都不派了
              'disabled': null,
            },
            { 'aria-disabled': 'true', 'data-value': 'ghost', 'data-disabled': '', 'disabled': null, 'tabindex': null },
            { 'aria-disabled': 'false', 'data-value': 'poly', 'tabindex': null },
          ],
        },
        activeElement: null,
      },
    },
    {
      name: '敲下前缀即开，浮层让开并把高亮落到首条',
      spec: { apg: APG },
      covers: ['mention.kbd.trigger', 'mention.kbd.type'],
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤改不动输入框的值，而提及的入口正是原生 input 事件加那一刻的光标位置',
          run: ({ doc, flush }) => typeInto(doc, '你好 @li', flush),
          expect: {
            parts: {
              input: { 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
            },
            // 先落正文再开浮层：正文是打字的直接结果，开合是从光标算出来的
            events: [
              { type: 'value-change', detail: { value: '你好 @li' } },
              { type: 'open-change', detail: { open: true } },
            ],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'item[0]', name: 'data-highlighted', value: '' } },
          expect: {
            parts: { input: { 'aria-activedescendant': '@part(item[0])' } },
            // 焦点不搬到候选上，这是提及与列表框的分水岭
            activeElement: { part: 'input', exact: true },
          },
        },
      ],
    },
    {
      name: '前缀前面不是行首也不是空白就不开：邮箱地址不误触发',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: '这条用例的全部意义就在那串字上，只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, '写信给 foo@bar', flush),
          expect: {
            parts: { content: { hidden: '' } },
            // 正文照收，但一次开合也没发生
            events: [{ type: 'value-change', detail: { value: '写信给 foo@bar' } }],
          },
        },
      ],
    },
    {
      name: '查询串里出现空白即收起：提及不跨词',
      spec: { apg: APG },
      steps: [
        { kind: 'raw', why: '同上，打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '@li', flush) },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc, flush }) => typeInto(doc, '@li ', flush),
          expect: {
            parts: { content: { hidden: '' } },
            events: [
              { type: 'value-change', detail: { value: '@li ' } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '正文没变、光标挪出查询串也收起；挪回去又开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['mention.kbd.caret'],
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '你好 @li', flush) },
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
          why: '同上',
          run: ({ doc, flush }) => moveCaret(doc, 6, flush),
          expect: {
            parts: { content: { hidden: null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '方向键移高亮：焦点不动，跳过禁用候选',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['mention.kbd.next', 'mention.kbd.prev'],
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '@', flush) },
        { kind: 'settle', until: { attr: { part: 'item[0]', name: 'data-highlighted', value: '' } } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            // ghost 禁用，直接跨过去
            parts: {
              'input': { 'aria-activedescendant': '@part(item[2])' },
              'item[0]': { 'data-highlighted': null, 'aria-selected': 'false' },
              'item[2]': { 'data-highlighted': '', 'aria-selected': 'true' },
            },
            activeElement: { part: 'input', exact: true },
            // 移高亮不改正文，一个事件也不发
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { 'input': { 'aria-activedescendant': '@part(item[0])' }, 'item[0]': { 'data-highlighted': '' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '回车把候选插到光标处：只换掉查询串，前后文一字不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['mention.kbd.commit'],
      steps: [
        {
          kind: 'raw',
          why: '打字只能直接派 input 事件；光标停在 li 之后、后面那段之前',
          run: ({ doc, flush }) => typeInto(doc, '请 @li 看一下', flush, 5),
        },
        { kind: 'settle', until: { attr: { part: 'item[0]', name: 'data-highlighted', value: '' } } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              input: { 'data-state': 'closed', 'aria-activedescendant': null },
              content: { 'hidden': '', 'data-state': 'closed' },
            },
            // 先正文、再是哪一条、最后开合
            events: [
              { type: 'value-change', detail: { value: '请 @Lilei  看一下' } },
              { type: 'select', detail: { value: 'lilei', label: 'Lilei', prefix: '@' } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        {
          kind: 'raw',
          why: '正文与光标都只落 DOM property，不进属性快照',
          run: async ({ doc, flush }) => {
            await flush()
            assertText(doc, '请 @Lilei  看一下')
            // 光标落在插入内容之后：'请 ' 2 字 + '@Lilei ' 7 字
            assertCaret(doc, 9)
          },
        },
      ],
    },
    {
      name: '点候选与回车走同一条路；禁用候选点不动',
      spec: { apg: APG },
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '@', flush) },
        {
          // 候选用 aria-disabled 表达禁用，click 不被短路，事件派得出去才碰得到 connect 的守卫
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: { content: { hidden: null } },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { content: { hidden: '' } },
            events: [
              { type: 'value-change', detail: { value: '@Poly ' } },
              { type: 'select', detail: { value: 'poly', label: 'Poly', prefix: '@' } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: 'Escape 收起且正文不变；同一处不再自动展开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['mention.kbd.escape'],
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '@li', flush) },
        // 消解层的监听器延后一拍注册（免得展开自己的那次交互立刻把自己关掉）
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        {
          kind: 'raw',
          why: '同一处接着打字也不该弹回来，而打字只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, '@lil', flush),
          expect: {
            parts: { content: { hidden: '' } },
            // 正文照收，浮层没再开过
            events: [{ type: 'value-change', detail: { value: '@lil' } }],
          },
        },
      ],
    },
    {
      name: 'Tab 收起且不抢按键：焦点按 Tab 序列自然离开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['mention.kbd.tab'],
      steps: [
        { kind: 'raw', why: '打字只能直接派 input 事件', run: ({ doc, flush }) => typeInto(doc, '@', flush) },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '没有可提交的候选时回车不被吞：只把浮层收起来',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['mention.kbd.newline'],
      fixture: () => tree([]),
      steps: [
        {
          kind: 'raw',
          why: '打字只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, '@zzz', flush),
          expect: { counts: { item: 0 }, parts: { content: { hidden: null } } },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { content: { hidden: '' } },
            // 正文没被改过，只发开合
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '禁用：输入框用原生 disabled，正文与浮层都一动不动',
      spec: { apg: APG },
      props: { disabled: true },
      initial: {
        parts: {
          root: { 'data-disabled': '' },
          input: { 'disabled': '', 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'raw',
          // 真实浏览器里禁用控件根本不派 input 事件，这一步是直接派给机器看它守不守得住
          why: '打字只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, '@li', flush),
          expect: { parts: { content: { hidden: '' } }, events: [] },
        },
      ],
    },
    {
      name: '三个视觉轴如实落到根上，子部件不重复标注',
      spec: { apg: APG },
      props: { variant: 'subtle', tone: 'brand', size: 'lg' },
      initial: {
        parts: {
          root: {
            'data-variant': 'subtle',
            'data-tone': 'brand',
            'data-size': 'lg',
          },
          input: { 'data-variant': null, 'data-tone': null, 'data-size': null },
        },
      },
    },
    {
      name: '换前缀：@ 不再触发，改用 # 才开',
      spec: { apg: APG },
      props: { prefix: '#' },
      steps: [
        {
          kind: 'raw',
          why: '打字只能直接派 input 事件',
          run: ({ doc, flush }) => typeInto(doc, '@li', flush),
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'value-change', detail: { value: '@li' } }],
          },
        },
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc, flush }) => typeInto(doc, '#li', flush),
          expect: {
            parts: { content: { hidden: null } },
            events: [
              { type: 'value-change', detail: { value: '#li' } },
              { type: 'open-change', detail: { open: true } },
            ],
          },
        },
      ],
    },
  ],
}
