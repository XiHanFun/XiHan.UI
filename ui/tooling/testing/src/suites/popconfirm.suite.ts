import type { ConformanceSuite } from '../conformance/types'
import { popconfirmAnatomy, popconfirmKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/'

// 气泡确认跑 popover 机器，浮层那套（content 常驻 DOM、靠 hidden 显隐；位置由引擎异步回填、
// 快照不采集 style）与 popover 一致；这里额外锁住确认/取消两颗按钮的答复语义。
export const popconfirmSuite: ConformanceSuite = {
  component: 'popconfirm',
  anatomy: popconfirmAnatomy,
  keyboard: popconfirmKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 必须是 button：WC 侧由 fixture 的 tag 决定，div 不可聚焦
      { part: 'trigger', tag: 'button', text: '删除这条记录' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'title', text: '删除后不可恢复' },
              { part: 'description', text: '这条记录连同它的附件一起清掉。' },
              // 取消写在前面：它是文档序里第一个可聚焦元素，展开时焦点先落在退路上
              { part: 'cancel-trigger', tag: 'button', text: '取消' },
              { part: 'confirm-trigger', tag: 'button', text: '删除' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，三颗按钮都不自己接这两个键
      name: 'Enter / Space：三颗按钮都是原生 <button type="button">，激活交给平台',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popconfirm.kbd.toggle-on-trigger', 'popconfirm.kbd.confirm', 'popconfirm.kbd.cancel'],
      steps: [
        nativeActivation('popconfirm', 'trigger'),
        nativeActivation('popconfirm', 'confirm-trigger'),
        nativeActivation('popconfirm', 'cancel-trigger'),
      ],
    },
    {
      name: '初始收起：trigger aria-expanded=false，content 是带 hidden 的 alertdialog',
      spec: { apg: APG },
      initial: {
        order: ['root', 'trigger', 'positioner', 'content', 'title', 'description', 'cancel-trigger', 'confirm-trigger'],
        counts: {
          'root': 1,
          'trigger': 1,
          'positioner': 1,
          'content': 1,
          'title': 1,
          'description': 1,
          'cancel-trigger': 1,
          'confirm-trigger': 1,
        },
        parts: {
          'root': { 'data-state': 'closed' },
          'trigger': {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
          },
          'content': {
            'role': 'alertdialog',
            'tabindex': '-1',
            'hidden': '',
            'data-state': 'closed',
            'aria-labelledby': '@part(title)',
            'aria-describedby': '@part(description)',
          },
          'positioner': {
            'data-state': 'closed',
            'data-placement': 'bottom',
          },
          'confirm-trigger': { type: 'button' },
          'cancel-trigger': { type: 'button' },
        },
      },
    },
    {
      name: '点击 trigger 展开：content 去掉 hidden，根与触发器同步翻到 open，派发 open-change',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              root: { 'data-state': 'open' },
              trigger: {
                'aria-expanded': 'true',
                'aria-controls': '@part(content)',
                'data-state': 'open',
              },
              content: {
                'role': 'alertdialog',
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
      name: '展开后焦点落在取消按钮：文档序第一个可聚焦元素就是那条退路',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'cancel-trigger' },
          expect: { activeElement: 'cancel-trigger' },
        },
      ],
    },
    {
      name: '点确认：收起浮层，焦点归还 trigger',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        // 等焦点真进了浮层再点，否则后面的「归还」是从没离开过的假阳性
        { kind: 'settle', until: { activeElement: 'cancel-trigger' } },
        {
          kind: 'click',
          part: 'confirm-trigger',
          // confirm 事件不入跨适配器事件流；收起这件事经 open-change 如实上报
          expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'close-trigger' } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              root: { 'data-state': 'closed' },
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
      name: '点取消：同样收起浮层，焦点归还 trigger',
      spec: { apg: APG },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'cancel-trigger' } },
        {
          kind: 'click',
          part: 'cancel-trigger',
          expect: { events: [{ type: 'open-change', detail: { open: false, reason: 'close-trigger' } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              root: { 'data-state': 'closed' },
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
      name: 'Escape 收起：焦点归还 trigger，只发 open-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['popconfirm.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'cancel-trigger' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              root: { 'data-state': 'closed' },
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
      name: '尺寸只落在 content 上：root 与 positioner 都不带这一轴',
      spec: { apg: APG },
      props: { size: 'sm' },
      initial: {
        parts: {
          content: { 'data-size': 'sm' },
          root: { 'data-size': null },
          positioner: { 'data-size': null },
        },
      },
    },
    {
      name: '受控 open：触发器与确认按钮都只发意图，父写回 open 后 DOM 才动',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: {
              root: { 'data-state': 'closed' },
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
              root: { 'data-state': 'open' },
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
          },
        },
        { kind: 'settle', until: { activeElement: 'cancel-trigger' } },
        {
          kind: 'click',
          part: 'confirm-trigger',
          expect: {
            parts: {
              root: { 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: false, reason: 'close-trigger' } }],
          },
        },
      ],
    },
  ],
}
