import type { ConformanceSuite } from '../conformance/types'
import { popoverAnatomy, popoverKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载作者节点。
// 位置由引擎异步回填，快照不采集 style，因此这里只断言 data-placement 这类语义属性。
export const popoverSuite: ConformanceSuite = {
  component: 'popover',
  anatomy: popoverAnatomy,
  keyboard: popoverKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 必须是 button：Vue 侧组件自己渲染成 button，WC 侧由 fixture 的 tag 决定，
      // 渲染成 div 就不可聚焦，"关闭后焦点归还 trigger"在 WC 上永远等不到
      { part: 'trigger', tag: 'button', text: '打开' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'arrow' },
              { part: 'title', text: '标题' },
              { part: 'description', text: '描述' },
              { tag: 'button', text: '确认', attrs: { 'data-testid': 'confirm' } },
              { part: 'close-trigger', text: '关闭' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '初始收起：trigger aria-expanded=false，content 带 hidden 属性',
      spec: { apg: APG },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow', 'title', 'description', 'close-trigger'],
        counts: { trigger: 1, positioner: 1, content: 1, arrow: 1 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
          },
          content: {
            'role': 'dialog',
            'tabindex': '-1',
            'aria-modal': 'false',
            'hidden': '',
            'data-state': 'closed',
          },
          positioner: {
            'data-state': 'closed',
            'data-placement': 'bottom',
          },
        },
      },
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，四处 ARIA 互指，派发 open-change',
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
                'role': 'dialog',
                'hidden': null,
                'data-state': 'open',
                'aria-labelledby': '@part(title)',
                'aria-describedby': '@part(description)',
              },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: '展开后焦点进入 content（落在内部首个可聚焦元素）',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'content', exact: false } },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 复位 hidden 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popover.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'key', key: 'Escape' },
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
      name: '点击 close-trigger 关闭：content 复位 hidden，trigger 归位',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { attr: { part: 'content', name: 'hidden', value: null } } },
        { kind: 'click', part: 'close-trigger' },
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
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
          },
        },
      ],
    },
  ],
}
