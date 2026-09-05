import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { comboboxAnatomy, comboboxKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'

/** 表单影子由作者写在 root 里，只有需要提交的用例才声明它。 */
function withHiddenInput(base: FixtureNode): FixtureNode {
  return { ...base, children: [...(base.children ?? []), { part: 'hidden-input', tag: 'input' }] }
}

/** value 只落 DOM property、进不了归一化快照，表单出口只能直接读 DOM。 */
function assertHiddenInput(doc: Document, expected: readonly [string, string, boolean]): void {
  const el = doc.querySelector<HTMLInputElement>('[data-scope="combobox"][data-part="hidden-input"]')
  if (!el)
    throw new Error('找不到 hidden-input 部件')
  const actual = [el.name, el.value, el.disabled] as const
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`表单影子期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

const INPUT = '[data-scope="combobox"][data-part="input"]'

/**
 * 输入框里的文字只落 DOM property（value 属性表达的是默认值，用户敲过字之后就失效了），
 * 快照只采属性，因此这一路只能直接读 DOM。
 */
function assertInputValue(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLInputElement>(INPUT)?.value ?? null
  if (actual !== expected)
    throw new Error(`输入框文字不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/**
 * 打字。conformance 的 type 步骤只派按键、改不动输入框的值，
 * 而组合框的入口正是原生 input 事件，只能直接写值再派事件。
 */
async function typeInto(doc: Document, text: string, flush: () => Promise<void>): Promise<void> {
  const input = doc.querySelector<HTMLInputElement>(INPUT)!
  input.focus()
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await flush()
}

/**
 * 三个候选：文本用拉丁字母，banana 禁用（方向键跳过它，点击也不认）。
 * item-indicator 由作者摆在候选内（勾选标记），它带 data-scope 却不入集合。
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
    children: [
      { part: 'item-text', tag: 'span', text },
      { part: 'item-indicator', tag: 'span' },
    ],
  }
}

const ITEMS: readonly FixtureNode[] = [
  itemNode('apple', 'Apple'),
  itemNode('banana', 'Banana', true),
  itemNode('cherry', 'Cherry'),
]

/**
 * empty 摆在 positioner 里当 content 的兄弟，不进列表：
 * role=listbox 内只允许 option 与 group，空态提示挤进去会把无障碍树弄坏。
 */
function tree(items: readonly FixtureNode[] = ITEMS, grouped = false): FixtureNode {
  const listChildren: readonly FixtureNode[] = grouped
    ? [{
        part: 'group',
        attrs: { value: 'common' },
        children: [{ part: 'group-label', tag: 'span', text: '常见' }, ...items],
      }]
    : items
  return {
    part: 'root',
    children: [
      // 必须是 label：connect 给的 for 只在原生 label 上生效
      { part: 'label', tag: 'label', text: '水果' },
      {
        part: 'control',
        children: [
          // 必须是 input：WC 侧由 fixture 的 tag 决定，div 既不可聚焦也没有 value
          { part: 'input', tag: 'input' },
          { part: 'clear-trigger', tag: 'button' },
          { part: 'trigger', tag: 'button', text: '▾' },
        ],
      },
      {
        part: 'positioner',
        children: [
          { part: 'content', children: listChildren },
          { part: 'empty', text: '无匹配项' },
        ],
      },
    ],
  }
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只断言 data-placement 这类语义属性。
// 不用 defaultOpen：WC 侧首帧候选还没被 wire 打上身份标记，帧序与 Vue 对不齐。
export const comboboxSuite: ConformanceSuite = {
  component: 'combobox',
  anatomy: comboboxAnatomy,
  keyboard: comboboxKeyboard,
  fixture: tree(),
  cases: [
    {
      name: '初始收起：输入框是 combobox 且三处 ARIA 互指，候选全部退出 Tab 序列，空态节点让位',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { placeholder: '搜水果' },
      initial: {
        order: [
          'root',
          'label',
          'control',
          'input',
          'clear-trigger',
          'trigger',
          'positioner',
          'content',
          'item[0]',
          'item-text[0]',
          'item-indicator[0]',
          'item[1]',
          'item-text[1]',
          'item-indicator[1]',
          'item[2]',
          'item-text[2]',
          'item-indicator[2]',
          'empty',
        ],
        counts: {
          'root': 1,
          'label': 1,
          'control': 1,
          'input': 1,
          'trigger': 1,
          'clear-trigger': 1,
          'positioner': 1,
          'content': 1,
          'empty': 1,
          'item': 3,
          'item-text': 3,
          'item-indicator': 3,
        },
        parts: {
          'root': { 'data-state': 'closed', 'data-disabled': null, 'data-invalid': null },
          'label': { id: '@self', for: '@part(input)' },
          'input': {
            'id': '@self',
            'role': 'combobox',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'aria-autocomplete': 'list',
            'aria-labelledby': '@part(label)',
            'aria-invalid': 'false',
            'data-state': 'closed',
            // 收起态没有高亮可指，属性整个缺席
            'aria-activedescendant': null,
            // 整个组合框只占一个 Tab 位，就是它自己：不写 tabindex 即用元素本身的默认序
            'tabindex': null,
            'disabled': null,
            'readonly': null,
          },
          // 两个按钮都退出 Tab 序列：能力在输入框上都够得着
          'trigger': { 'type': 'button', 'tabindex': '-1', 'aria-controls': '@part(content)', 'data-state': 'closed' },
          // 清空钮没值只收起，不灰留位；对读屏不隐藏，靠 aria-label 报名
          'clear-trigger': { 'type': 'button', 'tabindex': '-1', 'aria-label': 'Clear', 'aria-hidden': null, 'hidden': '', 'disabled': null, 'data-disabled': null },
          'positioner': { 'data-state': 'closed', 'data-placement': 'bottom-start' },
          'content': {
            'role': 'listbox',
            'aria-labelledby': '@part(label)',
            'aria-multiselectable': 'false',
            'tabindex': '-1',
            'hidden': '',
            'data-state': 'closed',
          },
          'item': [
            {
              'role': 'option',
              'aria-selected': 'false',
              'aria-disabled': 'false',
              'id': '@self',
              'data-value': 'apple',
              'data-state': 'unchecked',
              'data-highlighted': null,
              'data-disabled': null,
              // 焦点恒在输入框：候选既不进 Tab 序列，也不承载焦点
              'tabindex': null,
              // 集合条目绝不输出原生 disabled：那样连 click 都不派了
              'disabled': null,
            },
            { 'aria-selected': 'false', 'aria-disabled': 'true', 'data-value': 'banana', 'data-disabled': '', 'disabled': null, 'tabindex': null },
            { 'aria-selected': 'false', 'aria-disabled': 'false', 'data-value': 'cherry', 'tabindex': null },
          ],
          'empty': { 'role': 'status', 'hidden': '', 'data-state': 'closed' },
        },
        activeElement: null,
      },
    },
    {
      name: '点触发按钮展开：列表去掉 hidden，焦点被送回输入框，派发 open-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              input: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
              trigger: { 'data-state': 'open' },
            },
            // 焦点恒在输入框：按钮抢到焦点后要还回去
            activeElement: { part: 'input', exact: true },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: 'ArrowDown 展开并高亮首个候选：焦点仍在输入框，高亮经 aria-activedescendant 上报',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.open-first', 'combobox.kbd.next'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              'input': { 'aria-expanded': 'true', 'aria-activedescendant': '@part(item[0])' },
              'item[0]': { 'data-highlighted': '', 'aria-selected': 'false' },
              'item[1]': { 'data-highlighted': null },
            },
            // 这是 combobox 与 listbox 的分水岭：焦点不搬到候选上
            activeElement: { part: 'input', exact: true },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            // banana 禁用，直接跨过去
            parts: {
              'input': { 'aria-activedescendant': '@part(item[2])' },
              'item[0]': { 'data-highlighted': null },
              'item[2]': { 'data-highlighted': '' },
            },
            activeElement: { part: 'input', exact: true },
            // 移高亮不改选中值，一个事件也不发
            events: [],
          },
        },
      ],
    },
    {
      name: 'ArrowUp 从收起态展开并高亮末个候选，展开态再按即回绕',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.open-last', 'combobox.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: { input: { 'aria-expanded': 'true', 'aria-activedescendant': '@part(item[2])' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          // banana 禁用，跳到 apple
          expect: { parts: { input: { 'aria-activedescendant': '@part(item[0])' } }, events: [] },
        },
      ],
    },
    {
      name: 'Alt+ArrowDown 展开但不预选，Alt+ArrowUp 收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.open-quiet', 'combobox.kbd.close-alt'],
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowDown',
          modifiers: ['Alt'],
          expect: {
            parts: {
              'input': { 'aria-expanded': 'true', 'aria-activedescendant': null },
              'item[0]': { 'data-highlighted': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          modifiers: ['Alt'],
          expect: {
            parts: { input: { 'aria-expanded': 'false' }, content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: 'Home/End 在展开态跳到首尾候选',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.first', 'combobox.kbd.last'],
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: 'End',
          expect: { parts: { input: { 'aria-activedescendant': '@part(item[2])' } }, events: [] },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: { parts: { input: { 'aria-activedescendant': '@part(item[0])' } }, events: [] },
        },
      ],
    },
    {
      name: 'Enter 选中高亮候选：先发 value-change 后发 open-change，输入框换成它的文本',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.select'],
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'input': { 'aria-expanded': 'false', 'aria-activedescendant': null },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'item[2]': { 'aria-selected': 'true', 'data-state': 'checked' },
              'item-indicator[2]': { 'data-state': 'checked' },
              // 有东西可清了，清空按钮跟着亮起来
              'clear-trigger': { hidden: null },
            },
            // 先值后开合
            events: [
              { type: 'value-change', detail: { value: ['cherry'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        {
          kind: 'raw',
          why: '输入框文字只落 DOM property，不进属性快照',
          run: ({ doc }) => assertInputValue(doc, 'Cherry'),
        },
      ],
    },
    {
      name: '点候选即选中；禁用候选点不动',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          // 候选用 aria-disabled 表达禁用，click 不被短路，事件派得出去才碰得到 connect 的守卫
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: { 'item[1]': { 'aria-selected': 'false' }, 'content': { hidden: null } },
            events: [],
          },
        },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              'item[0]': { 'aria-selected': 'true', 'data-state': 'checked' },
              'content': { hidden: '' },
            },
            events: [
              { type: 'value-change', detail: { value: ['apple'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: 'Escape 分两拍：先摘高亮，高亮已空才收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowDown' },
        // 消解层的监听器延后一拍注册（免得展开自己的那次交互立刻把自己关掉）
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              'input': { 'aria-expanded': 'true', 'aria-activedescendant': null },
              'item[0]': { 'data-highlighted': null },
              'content': { hidden: null },
            },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { input: { 'aria-expanded': 'false' }, content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: 'Tab 收起且不抢按键：焦点按 Tab 序列自然离开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.tab'],
      steps: [
        { kind: 'focus', part: 'input' },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: { input: { 'aria-expanded': 'false' }, content: { hidden: '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '打字即展开，且候选一个不少：过滤是调用方的活儿，组件只管高亮与展开',
      spec: { apg: APG },
      covers: ['combobox.kbd.type'],
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤只派按键、改不动输入框的值，而组合框的入口正是原生 input 事件',
          run: ({ doc, flush }) => typeInto(doc, 'ch', flush),
          expect: {
            parts: {
              // 不预选：inputBehavior 缺省是 none
              'input': { 'aria-expanded': 'true', 'aria-activedescendant': null },
              'content': { hidden: null },
              'item[1]': { 'aria-disabled': 'true' },
            },
            counts: { item: 3 },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'inputBehavior=autohighlight：打完字把高亮落到首个可选候选，回车即提交它',
      spec: { apg: APG },
      props: { inputBehavior: 'autohighlight' },
      initial: { parts: { input: { 'aria-autocomplete': 'list' } } },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤改不动输入框的值；自动高亮要等调用方过滤完那一拍，故直接派 input 事件再等静默',
          run: ({ doc, flush }) => typeInto(doc, 'a', flush),
        },
        {
          kind: 'settle',
          until: { attr: { part: 'item[0]', name: 'data-highlighted', value: '' } },
          expect: { parts: { input: { 'aria-activedescendant': '@part(item[0])' } } },
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { 'item[0]': { 'aria-selected': 'true' } },
            events: [
              { type: 'value-change', detail: { value: ['apple'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: 'allowCustomValue：回车把候选里没有的输入串收成选中值',
      spec: { apg: APG },
      covers: ['combobox.kbd.custom'],
      props: { allowCustomValue: true },
      steps: [
        {
          kind: 'raw',
          why: 'type 步骤改不动输入框的值，而这条用例的全部意义就在那串字上',
          run: ({ doc, flush }) => typeInto(doc, 'kiwi', flush),
        },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            // 三个候选一个都没被选中：收进去的是输入串本身
            parts: {
              'input': { 'aria-expanded': 'false' },
              'item[0]': { 'aria-selected': 'false' },
              'item[2]': { 'aria-selected': 'false' },
            },
            events: [
              { type: 'value-change', detail: { value: ['kiwi'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '多选：选中后列表不收起、输入串清空，content 报 aria-multiselectable',
      spec: { apg: APG },
      props: { multiple: true },
      initial: { parts: { content: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: {
              'item[0]': { 'aria-selected': 'true' },
              // 接着筛下一个：列表留在展开态
              'content': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { 'item[0]': { 'aria-selected': 'true' }, 'item[2]': { 'aria-selected': 'true' } },
            events: [{ type: 'value-change', detail: { value: ['apple', 'cherry'] } }],
          },
        },
        {
          kind: 'click',
          part: 'item[0]',
          expect: {
            parts: { 'item[0]': { 'aria-selected': 'false' } },
            events: [{ type: 'value-change', detail: { value: ['cherry'] } }],
          },
        },
      ],
    },
    {
      name: '多选且输入串为空时退格删掉最后一个已选项',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['combobox.kbd.remove-last'],
      props: { multiple: true, defaultValue: ['apple', 'cherry'] },
      initial: {
        parts: {
          'item[0]': { 'aria-selected': 'true' },
          'item[2]': { 'aria-selected': 'true' },
        },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'Backspace',
          expect: {
            parts: { 'item[0]': { 'aria-selected': 'true' }, 'item[2]': { 'aria-selected': 'false' } },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
      ],
    },
    {
      name: '受控 value：点候选只发 value-change 不自改选中态，父写回后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'apple' },
      initial: { parts: { 'item[0]': { 'aria-selected': 'true' } } },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'item[0]': { 'aria-selected': 'true' },
              'item[2]': { 'aria-selected': 'false' },
            },
            events: [
              { type: 'value-change', detail: { value: ['cherry'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        { kind: 'setProps', props: { value: 'cherry' } },
        {
          kind: 'settle',
          until: { attr: { part: 'item[2]', name: 'aria-selected', value: 'true' } },
          expect: {
            parts: {
              'item[0]': { 'aria-selected': 'false' },
              'item[2]': { 'aria-selected': 'true' },
            },
            // 父写回不是新的用户意图，不再发一次
            events: [],
          },
        },
      ],
    },
    {
      name: '有选中值时挂载即把输入框填成它的文本',
      spec: { apg: APG },
      props: { defaultValue: 'cherry' },
      initial: {
        parts: {
          'item[2]': { 'aria-selected': 'true', 'data-state': 'checked' },
          'clear-trigger': { hidden: null },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '输入框文字只落 DOM property，不进属性快照；显示文本要等候选挂上身份标记才查得到',
          run: async ({ doc, flush }) => {
            await flush()
            assertInputValue(doc, 'Cherry')
          },
        },
      ],
    },
    {
      name: '清空按钮：清掉选中值与输入串，焦点回到输入框',
      spec: { apg: APG },
      props: { defaultValue: 'apple' },
      steps: [
        {
          kind: 'click',
          part: 'clear-trigger',
          expect: {
            parts: {
              'item[0]': { 'aria-selected': 'false', 'data-state': 'unchecked' },
              'clear-trigger': { 'hidden': '', 'disabled': null, 'data-disabled': null },
            },
            activeElement: { part: 'input', exact: true },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
        {
          kind: 'raw',
          why: '输入框文字只落 DOM property，不进属性快照',
          run: ({ doc }) => assertInputValue(doc, ''),
        },
      ],
    },
    {
      name: '清空按钮的无障碍名走 translations.clearTrigger',
      spec: { apg: APG },
      props: { defaultValue: 'apple', translations: { clearTrigger: '清空' } },
      initial: {
        parts: {
          'clear-trigger': { 'aria-label': '清空', 'hidden': null },
        },
      },
    },
    {
      name: '候选为空时 empty 节点显形',
      spec: { apg: APG },
      fixture: () => tree([]),
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              content: { hidden: null },
              empty: { 'role': 'status', 'hidden': null, 'data-state': 'open' },
            },
            counts: { item: 0 },
          },
        },
        {
          kind: 'click',
          part: 'trigger',
          // 收起就一并让位：空态是列表的一部分，不该在列表关掉后还杵着
          expect: { parts: { empty: { hidden: '' } } },
        },
      ],
    },
    {
      name: '分组：group 认领本组标题，组里的候选照样进导航',
      spec: { apg: APG },
      fixture: () => tree(ITEMS, true),
      initial: {
        parts: {
          'group': { 'role': 'group', 'aria-labelledby': '@part(group-label)' },
          'group-label': { id: '@self' },
        },
        counts: { 'group': 1, 'group-label': 1, 'item': 3 },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowDown',
          // 候选与 content 之间隔着 group，集合查询的归属判据写歪就一个也查不到
          expect: { parts: { input: { 'aria-activedescendant': '@part(item[0])' } } },
        },
      ],
    },
    {
      name: '禁用：输入框与下拉钮用原生 disabled、清空钮收起，键盘展不开列表',
      spec: { apg: APG },
      props: { disabled: true },
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'input': { 'disabled': '', 'data-disabled': '' },
          'trigger': { 'disabled': '', 'data-disabled': '' },
          'clear-trigger': { hidden: '', disabled: null },
        },
      },
      steps: [
        // 禁用的表单控件上 click 被激活行为短路、事件压根不派发，所以这里走键盘那一路
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { input: { 'aria-expanded': 'false' }, content: { hidden: '' } }, events: [] },
        },
      ],
    },
    {
      name: '只读：输入框仍可聚焦可复制，但展开与选中都不发生',
      spec: { apg: APG },
      props: { readOnly: true, defaultValue: 'apple' },
      initial: {
        parts: {
          'root': { 'data-readonly': '' },
          'input': { 'readonly': '', 'disabled': null, 'data-readonly': '' },
          // 只读时没东西可清
          'clear-trigger': { hidden: '', disabled: null },
        },
      },
      steps: [
        { kind: 'focus', part: 'input' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { content: { hidden: '' } }, events: [] },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: { parts: { 'item[0]': { 'aria-selected': 'true' }, 'item[2]': { 'aria-selected': 'false' } }, events: [] },
        },
      ],
    },
    {
      name: 'invalid 一路打到输入框与根节点',
      spec: { apg: APG },
      props: { invalid: true },
      initial: {
        parts: {
          root: { 'data-invalid': '' },
          input: { 'aria-invalid': 'true', 'data-invalid': '' },
          control: { 'data-invalid': '' },
        },
      },
    },
    {
      // 影子只在本用例的 fixture 里出现：作者不写这个部件就不该有它，
      // 其余用例的 order / counts 因此一条都不用改
      name: '表单影子：给了 name 才带 name，多选按逗号拼成一串，禁用时不提交',
      spec: { apg: APG },
      fixture: withHiddenInput,
      props: { name: 'fruit', defaultValue: 'apple' },
      initial: {
        parts: {
          'hidden-input': { type: 'hidden', name: 'fruit' },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: 'value 只落 DOM property，进不了归一化快照',
          run: ({ doc }) => assertHiddenInput(doc, ['fruit', 'apple', false]),
        },
        {
          kind: 'setProps',
          props: { multiple: true, value: ['apple', 'banana'] },
        },
        {
          kind: 'raw',
          why: '多选拼成一串，与 tree-select 同法',
          run: ({ doc }) => assertHiddenInput(doc, ['fruit', 'apple,banana', false]),
        },
        {
          kind: 'setProps',
          props: { disabled: true },
          expect: { parts: { 'hidden-input': { disabled: '' } } },
        },
      ],
    },
    {
      name: '表单影子：没给 name 就不带 name，这份输入不参与提交',
      spec: { apg: APG },
      fixture: withHiddenInput,
      props: { defaultValue: 'apple' },
      initial: {
        parts: {
          'hidden-input': { type: 'hidden', name: null },
        },
      },
    },
  ],
}
