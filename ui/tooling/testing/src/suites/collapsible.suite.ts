import type { ConformanceSuite } from '../conformance/types'
import { collapsibleAnatomy, collapsibleKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载。
export const collapsibleSuite: ConformanceSuite = {
  component: 'collapsible',
  anatomy: collapsibleAnatomy,
  keyboard: collapsibleKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'trigger', tag: 'button', text: '切换' },
      { part: 'content', children: [{ text: '内容' }] },
    ],
  },
  cases: [
    {
      name: '初始收起：trigger aria-expanded=false，content 带 hidden 属性',
      spec: { apg: APG },
      initial: {
        order: ['root', 'trigger', 'content'],
        counts: { root: 1, trigger: 1, content: 1 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-expanded': 'false',
            'data-state': 'closed',
            'data-disabled': null,
          },
          content: {
            'data-state': 'closed',
            'hidden': '',
          },
        },
      },
    },
    {
      name: '点击 trigger 展开：aria-expanded=true，content 去掉 hidden，派发 open-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['collapsible.kbd.toggle'],
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
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
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        { kind: 'setProps', props: { open: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: null } },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
          },
        },
      ],
    },
    {
      name: 'disabled：原生 disabled + data-disabled，点击不展开、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        { kind: 'click', part: 'trigger' },
        dispatchClickOnDisabled('collapsible', 'trigger', {
          parts: {
            // 披露按钮是单体控件：用原生 disabled，data-disabled 只是样式
            trigger: { 'disabled': '', 'data-disabled': '', 'aria-expanded': 'false', 'data-state': 'closed' },
            content: { 'data-state': 'closed', 'hidden': '' },
          },
          events: [],
        }),
      ],
    },
  ],
}
