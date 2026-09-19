import type { ConformanceSuite } from '../conformance/types'
import { collapsibleAnatomy, collapsibleKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

// content 始终在 DOM，展开态靠 hidden 属性显隐，不卸载。
export const collapsibleSuite: ConformanceSuite = {
  component: 'collapsible',
  anatomy: collapsibleAnatomy,
  keyboard: collapsibleKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'trigger', tag: 'button', children: [{ tag: 'span', text: '切换' }, { part: 'indicator', tag: 'span' }] },
      { part: 'content', children: [{ text: '内容' }] },
    ],
  },
  cases: [
    {
      name: '初始收起：trigger aria-expanded=false，content 带 hidden 属性',
      spec: { apg: APG },
      initial: {
        order: ['root', 'trigger', 'indicator', 'content'],
        counts: { root: 1, trigger: 1, indicator: 1, content: 1 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-expanded': 'false',
            'data-state': 'closed',
            'data-disabled': null,
            // 触发器接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面，档位随 size 走
            'data-xh-action-control': '',
            'data-xh-action-profile': 'disclosure-trigger',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'md',
          },
          content: {
            'data-state': 'closed',
            'hidden': '',
          },
          // 开合已由 trigger 的 aria-expanded 念出来，标记只是图形版，对读屏隐身
          indicator: {
            'aria-hidden': 'true',
            'data-state': 'closed',
            'data-disabled': null,
          },
        },
      },
    },
    {
      name: '点击 trigger 展开：aria-expanded=true，content 去掉 hidden，指示符转向，派发 open-change',
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
              indicator: { 'data-state': 'open' },
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
            indicator: { 'data-disabled': '', 'data-state': 'closed' },
          },
          events: [],
        }),
        heldPressIgnored('collapsible', 'trigger', '禁用时 trigger 原生 disabled，不接受按压'),
      ],
    },
    {
      name: 'Space / Enter 按住与触屏按下：trigger 投影 data-pressed，抬起、失焦或指针取消撤下；展开后照常可按',
      spec: { adr: 'press-channel' },
      covers: ['collapsible.kbd.press'],
      steps: [
        heldPress('collapsible', 'trigger'),
        { kind: 'click', part: 'trigger', expect: { parts: { trigger: { 'aria-expanded': 'true', 'data-pressed': null } } } },
        heldPress('collapsible', 'trigger'),
      ],
    },
    {
      name: '按住途中转禁用：trigger 原生 disabled、不会再来 keyup，按压面由机器收',
      spec: { adr: 'press-channel' },
      steps: [
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见',
          run: async ({ doc, flush }) => {
            const trigger = doc.querySelector<HTMLElement>('[data-scope="collapsible"][data-part="trigger"]')!
            trigger.focus()
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (!trigger.hasAttribute('data-pressed'))
              throw new Error('按住 Space 时 trigger 应投影 data-pressed')
          },
        },
        { kind: 'setProps', props: { disabled: true }, expect: { parts: { trigger: { 'disabled': '', 'data-pressed': null } } } },
      ],
    },
  ],
}
