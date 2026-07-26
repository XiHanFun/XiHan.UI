import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { accordionAnatomy, accordionKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/'

function item(value: string, label: string): FixtureNode {
  return {
    part: 'item',
    attrs: { value },
    children: [
      { part: 'header', children: [{ part: 'trigger', tag: 'button', text: label }] },
      { part: 'content', children: [{ text: `${label}的内容` }] },
    ],
  }
}

// 三个条目：单实例 part 用裸名寻址，集合 part 一律 item[i]/trigger[i] 下标寻址。
const ORDER = [
  'root',
  'item[0]',
  'header[0]',
  'trigger[0]',
  'content[0]',
  'item[1]',
  'header[1]',
  'trigger[1]',
  'content[1]',
  'item[2]',
  'header[2]',
  'trigger[2]',
  'content[2]',
]

export const accordionSuite: ConformanceSuite = {
  component: 'accordion',
  anatomy: accordionAnatomy,
  keyboard: accordionKeyboard,
  fixture: {
    part: 'root',
    children: [item('one', '第一项'), item('two', '第二项'), item('three', '第三项')],
  },
  cases: [
    {
      name: '初始展开集合来自 defaultValue：命中条目 aria-expanded=true 且 content 无 hidden，其余相反',
      spec: { apg: APG },
      props: { defaultValue: ['two'] },
      initial: {
        order: ORDER,
        counts: { root: 1, item: 3, header: 3, trigger: 3, content: 3 },
        parts: {
          'root': { 'data-orientation': 'vertical' },
          'header[0]': { 'role': 'heading', 'aria-level': '3' },
          'trigger[0]': {
            'type': 'button',
            'data-value': 'one',
            'aria-controls': '@part(content[0])',
            'aria-expanded': 'false',
            'aria-disabled': 'false',
            'data-state': 'closed',
            'data-disabled': null,
          },
          'trigger[1]': { 'data-value': 'two', 'aria-expanded': 'true', 'data-state': 'open' },
          'content[0]': {
            'role': 'region',
            'aria-labelledby': '@part(trigger[0])',
            'data-state': 'closed',
            'hidden': '',
          },
          'content[1]': { 'aria-labelledby': '@part(trigger[1])', 'data-state': 'open', 'hidden': null },
        },
      },
    },
    {
      name: '每个 trigger 都不输出 tabindex 属性：无 roving，整组条目都是独立 Tab 停靠点',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['accordion.kbd.tab'],
      initial: {
        counts: { trigger: 3 },
        parts: {
          // 不是 tabindex=0，是根本不输出，让作者的 <button> 保持原生行为
          trigger: [{ tabindex: null }, { tabindex: null }, { tabindex: null }],
          // 没有锚点概念，容器也不兜底接管 Tab
          root: { tabindex: null },
        },
      },
    },
    {
      name: '点击 trigger 展开、再点收起（collapsible=true），并派发 value-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['accordion.kbd.toggle'],
      props: { collapsible: true },
      steps: [
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content[0]': { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'value-change', detail: { value: ['one'] } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content[0]': { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'value-change', detail: { value: [] } }],
          },
        },
      ],
    },
    {
      name: 'multiple=false：展开一项即收起其余，选中集合恒为长度 1',
      spec: { apg: APG },
      props: { defaultValue: ['one'] },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'trigger[1]': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content[0]': { hidden: '' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: ['two'] } }],
          },
        },
      ],
    },
    {
      name: 'multiple=true：两项可同时展开，选中集合按点击顺序追加',
      spec: { apg: APG },
      props: { multiple: true, defaultValue: ['one'] },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: null },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: ['one', 'two'] } }],
          },
        },
      ],
    },
    {
      name: 'collapsible=false（默认）：点击唯一展开项不收起、不派发',
      spec: { apg: APG },
      props: { defaultValue: ['one'] },
      steps: [
        {
          kind: 'click',
          part: 'trigger[0]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content[0]': { 'data-state': 'open', 'hidden': null },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '方向键只在 header 之间搬焦点：上下键逐条、首末不回绕，Home/End 到首末，且不改展开集合',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['accordion.kbd.next', 'accordion.kbd.prev', 'accordion.kbd.first', 'accordion.kbd.last'],
      steps: [
        { kind: 'focus', part: 'trigger[0]', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        // loop=false：末条再按下键原地不动
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              'content[0]': { hidden: '' },
              'content[1]': { hidden: '' },
              'content[2]': { hidden: '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '受控 value：点击只发 value-change 不自改 DOM，父写回 value 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: ['one'] },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'trigger[1]': { 'aria-expanded': 'false' },
              'content[1]': { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'value-change', detail: { value: ['two'] } }],
          },
        },
        { kind: 'setProps', props: { value: ['two'] } },
        {
          kind: 'settle',
          until: { attr: { part: 'content[1]', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: '' },
            },
          },
        },
      ],
    },
    {
      name: '禁用条目只出 aria-disabled 不出原生 disabled：点击无效，方向键跳过它',
      spec: { apg: APG },
      fixture: base => ({
        ...base,
        children: base.children?.map((node, i) => (i === 2 ? { ...node, attrs: { ...node.attrs, disabled: '' } } : node)),
      }),
      props: { collapsible: true },
      steps: [
        {
          kind: 'click',
          part: 'trigger[2]',
          expect: {
            parts: {
              'trigger[2]': {
                // 原生 disabled 会让条目脱离 Tab 序，集合条目一律不用它
                'disabled': null,
                'tabindex': null,
                'aria-disabled': 'true',
                'aria-expanded': 'false',
                'data-disabled': '',
                'data-state': 'closed',
              },
              'content[2]': { hidden: '' },
            },
            events: [],
          },
        },
        { kind: 'focus', part: 'trigger[1]', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
        // 末条被禁用且不回绕，焦点无处可去，原地不动
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
      ],
    },
  ],
}
