import type { ConformanceSuite } from '@xihan-ui/testing'
import { dialogAnatomy, dialogKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from '@xihan-ui/testing'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

// WC 专属 dialog 规格：Light DOM 下 content 常驻（不像 Vue 卸载），关闭态用 positioner.hidden 隐藏、
// data-state=closed 标记。证明 dialog 机器 + connect + 焦点 + 受控在 WC 上跑通。
export const wcDialogSuite: ConformanceSuite = {
  component: 'dialog',
  anatomy: dialogAnatomy,
  keyboard: dialogKeyboard,
  fixture: {
    tag: 'div',
    children: [
      { part: 'trigger', tag: 'button', text: '打开' },
      { part: 'backdrop', tag: 'div' },
      {
        part: 'positioner',
        tag: 'div',
        children: [
          {
            part: 'content',
            tag: 'div',
            children: [
              { part: 'title', tag: 'h2', text: '标题' },
              { part: 'description', tag: 'p', text: '描述' },
              { tag: 'button', text: '确认', attrs: { 'data-testid': 'confirm' } },
              { part: 'close-trigger', tag: 'button', text: '关闭' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键；
      // "click 后打开并把焦点移入 content"由本套件其它用例验
      name: 'Enter / Space 打开：trigger 是原生 <button type="button">，激活交给平台',
      spec: { apg: APG },
      covers: ['dialog.kbd.open-on-trigger'],
      steps: [nativeActivation('dialog', 'trigger')],
    },
    {
      name: '初始关闭：content 常驻、data-state=closed、positioner 隐藏',
      spec: { apg: APG },
      initial: {
        counts: { content: 1, trigger: 1 },
        parts: {
          trigger: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'data-state': 'closed', 'aria-controls': '@part(content)' },
          content: { 'data-state': 'closed', 'role': 'dialog' },
          positioner: { 'data-state': 'closed' },
        },
      },
    },
    {
      name: '点击 trigger 打开：ARIA 接线完整、positioner 显示',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: {
                'role': 'dialog',
                'aria-modal': 'true',
                'tabindex': '-1',
                'data-state': 'open',
                'aria-labelledby': '@part(title)',
                'aria-describedby': '@part(description)',
              },
              positioner: { 'data-state': 'open' },
            },
          },
        },
      ],
    },
    {
      name: '打开后焦点移入 content 内首个可聚焦元素',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' }, expect: { activeElement: { part: 'content', exact: false } } },
      ],
    },
    {
      name: 'Escape 关闭：data-state 回 closed 且焦点归还 trigger',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['dialog.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'closed' } },
          expect: { parts: { trigger: { 'data-state': 'closed' }, positioner: { 'data-state': 'closed' } } },
        },
        { kind: 'settle', until: { activeElement: 'trigger' }, expect: { activeElement: 'trigger' } },
      ],
    },
    {
      name: 'alertdialog 打开：焦点落在 content 容器本身',
      spec: { apg: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/' },
      props: { role: 'alertdialog' },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'content', exact: true }, parts: { content: { role: 'alertdialog' } } },
        },
      ],
    },
  ],
}
