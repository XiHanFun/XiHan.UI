import type { ConformanceSuite } from '../conformance/types'
import { tagAnatomy, tagKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

// 标签是内容流里的一块标记，摘掉靠 hidden 属性显隐，不卸载。
export const tagSuite: ConformanceSuite = {
  component: 'tag',
  anatomy: tagAnatomy,
  keyboard: tagKeyboard,
  fixture: {
    part: 'root',
    tag: 'span',
    children: [
      { part: 'label', tag: 'span', text: '前端' },
      { part: 'close-trigger', tag: 'button', text: '×' },
    ],
  },
  cases: [
    {
      name: '默认：纯展示无 role，三轴不写就不落 data-*，关闭钮禁用且收起',
      spec: { apg: APG },
      initial: {
        order: ['root', 'label', 'close-trigger'],
        counts: { 'root': 1, 'label': 1, 'close-trigger': 1 },
        parts: {
          'root': {
            'role': null,
            'data-state': 'open',
            'data-variant': null,
            'data-tone': null,
            'data-size': null,
            'data-disabled': null,
            'hidden': null,
          },
          'close-trigger': {
            'type': 'button',
            'aria-label': 'Remove',
            // closable 缺省为假：叉既按不动也不占位置
            'disabled': '',
            'data-disabled': '',
            'hidden': '',
          },
        },
      },
    },
    {
      name: '三轴：variant / tone / size 原样落到 root 的 data-*，子部件不重复标注',
      spec: { apg: APG },
      props: { variant: 'solid', tone: 'brand', size: 'lg' },
      initial: {
        parts: {
          root: { 'data-variant': 'solid', 'data-tone': 'brand', 'data-size': 'lg' },
          label: { 'data-variant': null, 'data-tone': null, 'data-size': null },
        },
      },
    },
    {
      name: 'closable：关闭钮解禁并露面，root 不受影响',
      spec: { apg: APG },
      props: { closable: true },
      initial: {
        parts: {
          'close-trigger': { 'disabled': null, 'data-disabled': null, 'hidden': null },
          'root': { 'data-state': 'open', 'hidden': null },
        },
      },
    },
    {
      name: '点击关闭：root 收起并派发 open-change',
      spec: { apg: APG },
      props: { closable: true },
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
      name: 'Enter / Space 靠原生按钮的激活行为，关闭钮必须是 <button type="button">',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tag.kbd.close'],
      props: { closable: true },
      steps: [nativeActivation('tag', 'close-trigger')],
    },
    {
      name: '受控 open：点击只发 open-change 不自改 DOM，父写回 open 后才收起',
      spec: { adr: 'controlled-uncontrolled' },
      props: { closable: true, open: true },
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
      name: 'disabled：root 打 data-disabled，关闭钮留在原位但禁用，直接派 click 也不收标签',
      spec: { apg: APG },
      props: { closable: true, disabled: true },
      steps: [
        dispatchClickOnDisabled('tag', 'close-trigger', {
          parts: {
            'root': { 'data-disabled': '', 'data-state': 'open', 'hidden': null },
            // 只是禁用而非不可关闭：叉仍占着位置，标签宽度不跳变
            'close-trigger': { 'disabled': '', 'data-disabled': '', 'hidden': null },
          },
          events: [],
        }),
      ],
    },
    {
      name: 'translations：关闭钮的可访问名可替换',
      spec: { apg: APG },
      props: { closable: true, translations: { close: '移除 前端' } },
      initial: {
        parts: { 'close-trigger': { 'aria-label': '移除 前端' } },
      },
    },
  ],
}
