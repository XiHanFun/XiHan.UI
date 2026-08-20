import type { ConformanceSuite, FixtureNode } from '../conformance/types'
import { menuAnatomy, menuKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/'

const VALUES = ['copy', 'paste', 'delete'] as const

/**
 * 三个条目 + 一条分隔线：content 常挂，靠 hidden 显隐。
 * 分隔线夹在末两个条目之间——它带 data-scope 却不入集合，End 落到它后面的条目即为证。
 * disabled 落在哪个条目由用例指定；禁用条目仍在 DOM 里，只是方向键跳过它。
 */
function menuTree(disabled?: string): FixtureNode {
  const item = (value: string, text: string): FixtureNode => {
    const attrs: Record<string, string> = { value }
    if (value === disabled)
      attrs.disabled = ''
    return { part: 'item', text, attrs }
  }
  return {
    children: [
      // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
      { part: 'trigger', tag: 'button', text: '操作' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'arrow' },
              item(VALUES[0], '复制'),
              item(VALUES[1], '粘贴'),
              { part: 'separator' },
              item(VALUES[2], '删除'),
            ],
          },
        ],
      },
    ],
  }
}

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只在收起态断言 data-placement 这类语义属性。
export const menuSuite: ConformanceSuite = {
  component: 'menu',
  anatomy: menuAnatomy,
  keyboard: menuKeyboard,
  fixture: menuTree(),
  cases: [
    {
      name: '初始收起：trigger aria-expanded=false，content 带 hidden，条目全部退出 Tab 序列',
      spec: { apg: APG },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow', 'item[0]', 'item[1]', 'separator', 'item[2]'],
        counts: { trigger: 1, positioner: 1, content: 1, arrow: 1, item: 3, separator: 1 },
        parts: {
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'menu',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
          },
          'content': {
            'role': 'menu',
            'tabindex': '-1',
            'aria-labelledby': '@part(trigger)',
            'hidden': '',
            'data-state': 'closed',
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom-start',
          },
          // 收起态没有锚点：条目连同 content 一起 hidden
          'item[0]': {
            'role': 'menuitem',
            'aria-disabled': 'false',
            'disabled': null,
            'data-disabled': null,
            'data-value': 'copy',
            'tabindex': '-1',
          },
          'item[2]': { 'data-value': 'delete', 'tabindex': '-1' },
          'separator': { 'role': 'separator', 'aria-orientation': 'horizontal' },
        },
      },
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，三处 ARIA 互指，锚点落到首个条目，派发 open-change',
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
                'role': 'menu',
                'aria-labelledby': '@part(trigger)',
                'hidden': null,
                'data-state': 'open',
              },
              // roving tabindex：整组只有锚点条目留在 Tab 序列内
              'item[0]': { tabindex: '0' },
              'item[1]': { tabindex: '-1' },
              'item[2]': { tabindex: '-1' },
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
      name: 'ArrowDown 从 trigger 展开并把焦点落到首个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.open-first'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content': { hidden: null },
              'item[0]': { tabindex: '0' },
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
      name: 'Enter 从 trigger 展开：不被按钮默认激活合成的 click 反手关掉',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.open-first'],
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
      name: 'ArrowUp 从 trigger 展开并把焦点落到末个条目',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.open-last'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'ArrowUp',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true' },
              'item[0]': { tabindex: '-1' },
              'item[2]': { tabindex: '0' },
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
      name: '菜单内方向键跳过禁用条目并在尽头回绕；禁用条目用 aria-disabled 而非原生 disabled',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.next', 'menu.kbd.prev'],
      fixture: () => menuTree('paste'),
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
              'item[2]': { tabindex: '0' },
            },
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
      name: 'Home/End 跳到首尾条目：End 越过分隔线落在其后的条目，分隔线不入集合',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.first', 'menu.kbd.last'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
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
      name: '点击条目：派发 select 后关闭，锚点清空，焦点归还 trigger',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'false', 'data-state': 'closed' },
              'content': { 'hidden': '', 'data-state': 'closed' },
              'item[1]': { tabindex: '-1' },
            },
            // 先选中详情、后开合意图
            events: [
              { type: 'select', detail: { value: 'paste' } },
              { type: 'open-change', detail: { open: false, reason: 'selection' } },
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
      name: 'Enter 选中焦点所在条目：与点击同一条出口',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.select'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false' },
              content: { 'hidden': '', 'data-state': 'closed' },
            },
            events: [
              { type: 'select', detail: { value: 'copy' } },
              { type: 'open-change', detail: { open: false, reason: 'selection' } },
            ],
          },
        },
      ],
    },
    {
      name: '点击禁用条目：不选中、不关闭、一个事件也不发',
      spec: { apg: APG },
      fixture: () => menuTree('paste'),
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        {
          kind: 'click',
          part: 'item[1]',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'hidden': null, 'data-state': 'open' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 复位 hidden 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'esc' } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
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
      name: 'Tab 关闭：焦点不被抢回 trigger，按 Tab 序列自然离开',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['menu.kbd.tab'],
      steps: [
        { kind: 'focus', part: 'trigger' },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'settle', until: { activeElement: 'item[0]' } },
        {
          kind: 'key',
          key: 'Tab',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false, reason: 'tab' } }],
          },
        },
        {
          kind: 'raw',
          why: '焦点归还排在焦点域拆除后的下一帧；等过这两帧才证得了 Tab 关闭没把焦点抢回 trigger',
          run: () => new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          }),
          expect: { activeElement: { part: 'item[0]', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '受控 open：点击只发 open-change 不自改 DOM，父写回 open 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger': { 'aria-expanded': 'true', 'data-state': 'open' },
              'content': { 'data-state': 'open', 'hidden': null },
              // 受控回写走影子事件，落焦端仍取自当初那次点击
              'item[0]': { tabindex: '0' },
            },
          },
        },
      ],
    },
  ],
}
