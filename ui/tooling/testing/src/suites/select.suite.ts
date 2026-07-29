import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { selectAnatomy, selectKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/listbox/'

const VALUES = ['apple', 'banana', 'cherry'] as const

const VALUE_TEXT = '[data-scope="select"][data-part="value-text"]'
const HIDDEN_SELECT = '[data-scope="select"][data-part="hidden-select"]'

/** 显示文字不进归一化快照（快照只采属性），只能直接读 DOM。 */
function assertValueText(doc: Document, expected: string): void {
  const actual = doc.querySelector<HTMLElement>(VALUE_TEXT)?.textContent?.trim() ?? null
  if (actual !== expected)
    throw new Error(`value-text 文本不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/** name/value 只落 DOM property，同样不进快照；表单出口只能直接读 DOM。 */
function assertHiddenSelect(doc: Document, name: string, value: string): void {
  const el = doc.querySelector<HTMLSelectElement>(HIDDEN_SELECT)
  const actual = el ? ([el.name, el.value] as const) : null
  const expected = [name, value] as const
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`隐藏 select 的 name/value 不符：期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}`)
}

/**
 * 三个条目：条目文本用拉丁字母，连打检索按首字母匹配得上。
 * item-indicator 由作者摆在条目内（勾选标记），它带 data-scope 却不入集合。
 * disabled 落在哪个条目由用例指定；禁用条目仍在 DOM 里，只是方向键与检索跳过它。
 */
function selectTree(disabled?: string): FixtureNode {
  const item = (value: string, text: string): FixtureNode => {
    const attrs: Record<string, string> = { value }
    if (value === disabled)
      attrs.disabled = ''
    return {
      part: 'item',
      attrs,
      children: [
        { part: 'item-text', text },
        { part: 'item-indicator' },
      ],
    }
  }
  return {
    part: 'root',
    children: [
      { part: 'label', text: '水果' },
      // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
      {
        part: 'trigger',
        tag: 'button',
        children: [
          { part: 'value-text' },
          { part: 'indicator' },
        ],
      },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              item(VALUES[0], 'Apple'),
              item(VALUES[1], 'Banana'),
              item(VALUES[2], 'Cherry'),
            ],
          },
        ],
      },
    ],
  }
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 隐藏 select 由根部件自行装配，不作为 fixture 节点；采集器仍会抓到它。
// 位置由引擎异步回填，快照不采集 style，因此这里只断言 data-placement 这类语义属性。
export const selectSuite: ConformanceSuite = {
  component: 'select',
  anatomy: selectAnatomy,
  keyboard: selectKeyboard,
  fixture: selectTree(),
  cases: [
    {
      name: '初始收起：无选中时 value-text 显示 placeholder，trigger aria-expanded=false，条目全部退出 Tab 序列',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { placeholder: '请选择', name: 'fruit' },
      initial: {
        order: [
          'root',
          'hidden-select',
          'label',
          'trigger',
          'value-text',
          'indicator',
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
        ],
        counts: {
          'root': 1,
          'label': 1,
          'trigger': 1,
          'value-text': 1,
          'indicator': 1,
          'positioner': 1,
          'content': 1,
          'hidden-select': 1,
          'item': 3,
          'item-text': 3,
          'item-indicator': 3,
        },
        parts: {
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            // 名字 = 标签 + 当前值：只指 label 的话读屏念不出用户选了什么
            'aria-labelledby': '@part(label) @part(value-text)',
            'data-state': 'closed',
            'data-placeholder': '',
            'disabled': null,
          },
          'value-text': { 'data-placeholder': '', 'data-disabled': null },
          'content': {
            'role': 'listbox',
            'tabindex': '-1',
            'aria-labelledby': '@part(label)',
            'hidden': '',
            'data-state': 'closed',
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom-start',
          },
          // 表单影子对键盘与读屏都不存在，交互全由 trigger 与条目承担
          'hidden-select': { 'tabindex': '-1', 'aria-hidden': 'true', 'disabled': null },
          // 收起态没有锚点：条目连同 content 一起 hidden
          'item': [
            {
              'role': 'option',
              'aria-selected': 'false',
              'aria-disabled': 'false',
              'data-value': 'apple',
              'data-state': 'unchecked',
              'data-highlighted': null,
              'data-disabled': null,
              'tabindex': '-1',
              // 集合条目绝不输出原生 disabled
              'disabled': null,
            },
            { 'aria-selected': 'false', 'data-value': 'banana', 'tabindex': '-1' },
            { 'aria-selected': 'false', 'data-value': 'cherry', 'tabindex': '-1' },
          ],
          'item-indicator': [
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
            { 'aria-hidden': 'true', 'data-state': 'unchecked' },
          ],
        },
        activeElement: null,
      },
      steps: [
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, '请选择')
            assertHiddenSelect(doc, 'fruit', '')
          },
        },
      ],
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，三处 ARIA 互指，高亮落到首个条目，派发 open-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              'trigger': {
                'aria-expanded': 'true',
                'aria-controls': '@part(content)',
                'data-state': 'open',
              },
              'content': {
                'role': 'listbox',
                'aria-labelledby': '@part(label)',
                'hidden': null,
                'data-state': 'open',
              },
              // roving tabindex：整组只有高亮条目留在 Tab 序列内
              'item[0]': { 'tabindex': '0', 'data-highlighted': '' },
              'item[1]': { 'tabindex': '-1', 'data-highlighted': null },
              'item[2]': { 'tabindex': '-1', 'data-highlighted': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[0]' },
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: 'Enter 从 trigger 展开：不被按钮默认激活合成的 click 反手关掉',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.open'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true' },
              content: { hidden: null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[0]' },
          expect: { activeElement: { part: 'item[0]', exact: true } },
        },
      ],
    },
    {
      name: 'ArrowUp 从 trigger 展开并把高亮落到末个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.open-prev'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true' },
              'item[0]': { tabindex: '-1' },
              'item[2]': { 'tabindex': '0', 'data-highlighted': '' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'item[2]' },
          expect: { activeElement: { part: 'item[2]', exact: true } },
        },
      ],
    },
    {
      name: '列表内方向键跳过禁用条目并在尽头回绕；禁用条目用 aria-disabled 而非原生 disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.open-next', 'select.kbd.next', 'select.kbd.prev'],
      fixture: () => selectTree('banana'),
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: {
              'item[1]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '', 'tabindex': '-1' },
              'item[2]': { 'tabindex': '0', 'data-highlighted': '' },
            },
            // 移高亮不改选中值，一个事件也不发
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'item[0]': { tabindex: '0' }, 'item[2]': { tabindex: '-1' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { tabindex: '0' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Home/End 跳到首尾条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.first', 'select.kbd.last'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { 'item[2]': { tabindex: '0' } },
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            activeElement: { part: 'item[0]', exact: true },
            parts: { 'item[0]': { tabindex: '0' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Enter 选中高亮条目：先发 value-change 后发 open-change，列表关闭且 value-text 换成选中项文本',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.select'],
      props: { placeholder: '请选择', name: 'fruit' },
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        { kind: 'key', key: 'ArrowDown' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed', 'data-placeholder': null },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'value-text': { 'data-placeholder': null },
              'item[1]': { 'aria-selected': 'true', 'data-state': 'checked' },
              'item-indicator[1]': { 'data-state': 'checked' },
            },
            // 先值后开合
            events: [
              { type: 'value-change', detail: { value: 'banana' } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, 'Banana')
            assertHiddenSelect(doc, 'fruit', 'banana')
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: '展开态连打字母只移高亮不改选中值',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.typeahead'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'c',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: {
              'item[0]': { 'data-highlighted': null, 'aria-selected': 'false' },
              'item[2]': { 'data-highlighted': '', 'tabindex': '0', 'aria-selected': 'false' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '收起态在 trigger 上连打字母直接改选中值，列表不展开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.trigger-typeahead'],
      props: { name: 'fruit' },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'c',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content': { hidden: '' },
              'item[2]': { 'aria-selected': 'true', 'data-state': 'checked' },
            },
            events: [{ type: 'value-change', detail: { value: 'cherry' } }],
          },
        },
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, 'Cherry')
            assertHiddenSelect(doc, 'fruit', 'cherry')
          },
        },
      ],
    },
    {
      // 这条守着两件事：Tab 不被吞（要让焦点按序列自然离开），以及关闭后不把焦点
      // 从用户刚 Tab 过去的控件上抢回 trigger（setReturnFocus 的 tab 分支）
      name: 'Tab 关闭：列表收起但焦点不归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.tab'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false' },
              content: { hidden: '' },
            },
          },
        },
        {
          kind: 'raw',
          why: '「焦点没被抢回」是个否定断言，只能直读 activeElement；且归还焦点排在关闭之后的微任务里，要等过那一拍才算数',
          run: async ({ doc }) => {
            await new Promise(r => setTimeout(r, 40))
            const trigger = doc.querySelector('[data-scope="select"][data-part="trigger"]')
            if (doc.activeElement === trigger)
              throw new Error('Tab 关闭后焦点被抢回了 trigger')
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 复位 hidden、选中值不变、焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['select.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content': { 'data-state': 'closed', 'hidden': '' },
              'item[0]': { 'aria-selected': 'false', 'tabindex': '-1' },
            },
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'trigger' },
          expect: { activeElement: 'trigger' },
        },
      ],
    },
    {
      name: '有选中值：只有选中项 aria-selected=true，value-text 显示它的文本，展开时高亮落在它身上',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { defaultValue: 'banana', placeholder: '请选择', name: 'fruit' },
      initial: {
        parts: {
          'trigger': { 'data-placeholder': null },
          'value-text': { 'data-placeholder': null },
          'item': [
            { 'aria-selected': 'false', 'data-state': 'unchecked' },
            { 'aria-selected': 'true', 'data-state': 'checked' },
            { 'aria-selected': 'false', 'data-state': 'unchecked' },
          ],
          'item-indicator': [
            { 'data-state': 'unchecked' },
            { 'data-state': 'checked' },
            { 'data-state': 'unchecked' },
          ],
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, 'Banana')
            assertHiddenSelect(doc, 'fruit', 'banana')
          },
        },
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'item[1]' },
          expect: {
            activeElement: { part: 'item[1]', exact: true },
            parts: {
              'item[0]': { tabindex: '-1' },
              'item[1]': { 'tabindex': '0', 'data-highlighted': '' },
            },
          },
        },
      ],
    },
    {
      name: '受控 value：点条目只发 value-change 不自改选中态，父写回 value 后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'apple', name: 'fruit' },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'item[0]' },
          // 高亮落在受控选中项上
          expect: { parts: { 'item[0]': { 'aria-selected': 'true', 'tabindex': '0' } } },
        },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'item[0]': { 'aria-selected': 'true', 'data-state': 'checked' },
              'item[2]': { 'aria-selected': 'false', 'data-state': 'unchecked' },
              'content': { hidden: '' },
            },
            events: [
              { type: 'value-change', detail: { value: 'cherry' } },
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
              'item[0]': { 'aria-selected': 'false', 'data-state': 'unchecked' },
              'item[2]': { 'aria-selected': 'true', 'data-state': 'checked' },
            },
            // 父写回不是新的用户意图，不再发一次
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '显示文字与表单值都不进属性快照，只能直接读 DOM',
          run: ({ doc }) => {
            assertValueText(doc, 'Cherry')
            assertHiddenSelect(doc, 'fruit', 'cherry')
          },
        },
      ],
    },
  ],
}
