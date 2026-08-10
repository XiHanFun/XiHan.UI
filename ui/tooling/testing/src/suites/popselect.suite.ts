import type { AttrExpectation, ConformanceSuite, FixtureNode } from '../conformance/types'
import { popselectAnatomy, popselectKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/'

/**
 * 三个条目都可选：禁用条目的规格归 listbox 那份套件，本套件只锁 popselect 自己的承诺——
 * 浮层开合、焦点进出列表、以及「单选落值即收起 / 多选保持展开」。
 * 条目文本用拉丁字母，连打检索按首字母匹配得上。
 */
function item(value: string, text: string): FixtureNode {
  return {
    part: 'item',
    attrs: { value },
    children: [
      { part: 'item-text', tag: 'span', text },
      { part: 'item-indicator', tag: 'span' },
    ],
  }
}

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
    { part: 'trigger', tag: 'button', text: '选择' },
    {
      part: 'positioner',
      children: [
        {
          part: 'content',
          children: [item('apple', 'Apple'), item('banana', 'Banana'), item('cherry', 'Cherry')],
        },
      ],
    },
  ],
}

/** 三个条目的选中态期望，逐个写全——只写关心的那个会漏掉「另一个也被选中了」。 */
function selected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['apple', 'banana', 'cherry'].map(v => ({
    'aria-selected': values.includes(v) ? 'true' : 'false',
    'data-state': values.includes(v) ? 'checked' : 'unchecked',
  }))
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此只在收起帧断言 data-placement。
export const popselectSuite: ConformanceSuite = {
  component: 'popselect',
  anatomy: popselectAnatomy,
  keyboard: popselectKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，组件不自己接这两个键
      name: 'Enter / Space 开合：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      steps: [nativeActivation('popselect', 'trigger')],
    },
    {
      name: '初始收起：三轴不输出，content 是 listbox 且带 hidden',
      spec: { apg: `${APG}#roles_states_properties` },
      initial: {
        order: [
          'root',
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
        ],
        counts: {
          'root': 1,
          'trigger': 1,
          'positioner': 1,
          'content': 1,
          'item': 3,
          'item-text': 3,
          'item-indicator': 3,
        },
        parts: {
          'root': {
            'data-state': 'closed',
            'data-variant': null,
            'data-tone': null,
            'data-size': null,
            'data-disabled': null,
          },
          'trigger': {
            'type': 'button',
            'id': '@self',
            // 弹出的是列表不是对话框，读屏据此播报「折叠列表框」
            'aria-haspopup': 'listbox',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
            'data-placeholder': '',
            'disabled': null,
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom',
          },
          'content': {
            'id': '@self',
            'role': 'listbox',
            // 浮层的名字取自触发器上的文字
            'aria-labelledby': '@part(trigger)',
            // 省略与显式 false 不是一回事：前者是「没说」，后者是「明确说了不是多选」
            'aria-multiselectable': 'false',
            'aria-disabled': 'false',
            'hidden': '',
            'tabindex': '-1',
            'data-state': 'closed',
          },
          'item[0]': {
            'role': 'option',
            'aria-selected': 'false',
            'aria-disabled': 'false',
            'data-value': 'apple',
            'data-state': 'unchecked',
            'data-highlighted': null,
            'tabindex': '-1',
            // 集合条目绝不输出原生 disabled：那样就不可聚焦、也不派 click
            'disabled': null,
          },
          'item-indicator[0]': { 'aria-hidden': 'true', 'data-state': 'unchecked' },
        },
      },
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，两端 ARIA 互指，派发 open-change',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: {
                'aria-expanded': 'true',
                'aria-controls': '@part(content)',
                'data-state': 'open',
              },
              content: {
                'role': 'listbox',
                'aria-labelledby': '@part(trigger)',
                'hidden': null,
                'data-state': 'open',
              },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '展开后焦点进入列表，落在选中项上而不是首项',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { defaultValue: 'banana' },
      initial: {
        // 收起态锚点条目已认领 Tab 位，等浮层一开就是焦点落点
        parts: { 'item[1]': { tabindex: '0' }, 'item[0]': { tabindex: '-1' } },
      },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'item[1]', exact: true } },
        },
      ],
    },
    {
      name: '收起态在 trigger 上按方向键即展开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popselect.kbd.open'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'item[0]', exact: true } },
        },
      ],
    },
    {
      name: '方向键在列表内搬焦点：尽头回绕，Home / End 到端点，一路不落值',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popselect.kbd.next', 'popselect.kbd.prev', 'popselect.kbd.first', 'popselect.kbd.last'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'item[1]', exact: true },
            parts: {
              'item[1]': { 'tabindex': '0', 'data-highlighted': '' },
              'item[0]': { 'tabindex': '-1', 'data-highlighted': null },
            },
            events: [],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[2]', exact: true } } },
        // 尽头回绕
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'item[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'item[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'item[0]', exact: true } } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            // 方向键只搬焦点：走了这么一圈，一个条目都不该被选中，浮层也还开着
            parts: { item: selected(), content: { 'data-state': 'open', 'hidden': null } },
            events: [],
          },
        },
      ],
    },
    {
      name: '单选：Enter 落值即收起，焦点归还触发器',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popselect.kbd.select'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              item: selected('apple'),
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed', 'data-placeholder': null },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            // 先落值再收起：两件事各发各的意图回调
            events: [
              { type: 'value-change', detail: { value: ['apple'] } },
              { type: 'open-change', detail: { open: false } },
            ],
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
      name: '多选：Space 是切换不是替换，浮层保持展开继续挑',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popselect.kbd.toggle'],
      props: { multiple: true },
      initial: { parts: { content: { 'aria-multiselectable': 'true' } } },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('apple'), content: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
        { kind: 'key', key: 'ArrowDown', expect: { events: [] } },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('apple', 'banana'), content: { 'data-state': 'open' } },
            events: [{ type: 'value-change', detail: { value: ['apple', 'banana'] } }],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { item: selected('apple') },
            events: [{ type: 'value-change', detail: { value: ['apple'] } }],
          },
        },
      ],
    },
    {
      name: '连打检索：按首字母搬焦点，不落值也不收起',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popselect.kbd.typeahead'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'type',
          text: 'c',
          expect: {
            activeElement: { part: 'item[2]', exact: true },
            parts: { item: selected(), content: { 'data-state': 'open', 'hidden': null } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Tab 收起浮层：焦点让开列表，且不被抢回触发器',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popselect.kbd.tab'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        // Tab 是「焦点已经去别处了」，收起后不该把它拽回触发器；
        // 落到哪一个由页面的 Tab 序列决定，不归本组件管。
        // 用 raw 是因为 settle 的条件只表达得了「焦点落在某个部件上」，表达不了「不落在某个部件上」
        {
          kind: 'raw',
          why: 'settle 只判定焦点落在哪个部件，判定不了「焦点没被抢回去」；等两帧让焦点域走完撤销再看。焦点仍在条目上是对的：jsdom 不实现 Tab 的原生焦点移动，组件这边只要不去动它，真实浏览器就会把焦点接着送去下一个可聚焦元素',
          run: async ({ flush }) => {
            await flush()
            await flush()
          },
          expect: { activeElement: 'item' },
        },
      ],
    },
    {
      name: '点击条目：单选落值即收起',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              item: selected('cherry'),
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [
              { type: 'value-change', detail: { value: ['cherry'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
      ],
    },
    {
      name: '受控 value：宿主不写回则选中纹丝不动，回调照发',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'apple' },
      initial: { parts: { item: selected('apple') } },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: { item: selected('apple') },
            events: [
              { type: 'value-change', detail: { value: ['cherry'] } },
              { type: 'open-change', detail: { open: false } },
            ],
          },
        },
        {
          kind: 'setProps',
          props: { value: 'cherry' },
          expect: { parts: { item: selected('cherry') } },
        },
      ],
    },
  ],
}
