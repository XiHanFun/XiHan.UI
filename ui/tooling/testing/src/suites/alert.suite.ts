import type { ConformanceSuite } from '../conformance/types'
import { alertAnatomy, alertKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/'

// 提示常驻页面流，收起靠 hidden 属性显隐，不卸载。
export const alertSuite: ConformanceSuite = {
  component: 'alert',
  anatomy: alertAnatomy,
  keyboard: alertKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'icon', tag: 'span', text: 'i' },
      { part: 'title', text: '连接已断开' },
      { part: 'description', text: '正在尝试重连' },
      { part: 'close-trigger', tag: 'button', text: '×' },
    ],
  },
  cases: [
    {
      name: '默认 info：role=status + polite，标题与说明关联到 root，初始展开',
      spec: { apg: APG },
      initial: {
        order: ['root', 'icon', 'title', 'description', 'close-trigger'],
        counts: { 'root': 1, 'icon': 1, 'title': 1, 'description': 1, 'close-trigger': 1 },
        parts: {
          'root': {
            'role': 'status',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            'aria-labelledby': '@part(title)',
            'aria-describedby': '@part(description)',
            'data-tone': 'info',
            'data-state': 'open',
            'hidden': null,
          },
          'icon': { 'aria-hidden': 'true' },
          'close-trigger': {
            'type': 'button',
            'aria-label': 'Close',
            'disabled': null,
            'data-disabled': null,
            'hidden': null,
          },
        },
      },
    },
    {
      name: 'danger：role=alert + assertive，打断当前朗读',
      spec: { apg: APG },
      props: { tone: 'danger' },
      initial: {
        parts: {
          root: { 'role': 'alert', 'aria-live': 'assertive', 'data-tone': 'danger' },
        },
      },
    },
    {
      name: 'warning：与 danger 同级，也走 alert + assertive',
      spec: { apg: APG },
      props: { tone: 'warning' },
      initial: {
        parts: { root: { 'role': 'alert', 'aria-live': 'assertive', 'data-tone': 'warning' } },
      },
    },
    {
      name: 'success：与 info 同级，走 status + polite',
      spec: { apg: APG },
      props: { tone: 'success' },
      initial: {
        parts: { root: { 'role': 'status', 'aria-live': 'polite', 'data-tone': 'success' } },
      },
    },
    {
      name: '点击关闭：root 收起并派发 open-change',
      spec: { apg: APG },
      covers: ['alert.kbd.close'],
      steps: [
        {
          kind: 'click',
          part: 'close-trigger',
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '受控 open：点击只发 open-change 不自改 DOM，父写回 open 后才收起',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: true },
      steps: [
        {
          kind: 'click',
          part: 'close-trigger',
          expect: {
            parts: { root: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        { kind: 'setProps', props: { open: false } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'hidden', value: '' } },
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': '' } },
          },
        },
      ],
    },
    {
      name: 'defaultOpen=false：非受控起步即收起',
      spec: { adr: 'controlled-uncontrolled' },
      props: { defaultOpen: false },
      initial: {
        parts: { root: { 'data-state': 'closed', 'hidden': '' } },
      },
    },
    {
      name: 'closable=false：关闭按钮原生 disabled 且收起，点击不收提示、不派发',
      spec: { apg: APG },
      props: { closable: false },
      steps: [
        { kind: 'click', part: 'close-trigger' },
        dispatchClickOnDisabled('alert', 'close-trigger', {
          parts: {
            'close-trigger': { 'disabled': '', 'data-disabled': '', 'hidden': '' },
            'root': { 'data-state': 'open', 'hidden': null },
          },
          events: [],
        }),
      ],
    },
    {
      name: 'translations：关闭按钮的可访问名可替换',
      spec: { apg: APG },
      props: { translations: { close: '关闭提示' } },
      initial: {
        parts: { 'close-trigger': { 'aria-label': '关闭提示' } },
      },
    },
  ],
}
