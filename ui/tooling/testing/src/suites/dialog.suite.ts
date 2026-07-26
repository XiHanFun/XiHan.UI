import type { ConformanceSuite } from '../conformance/types'
import { dialogAnatomy, dialogKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

// backdrop / positioner 由 content 组件内部装配，不作为独立 fixture 节点；
// 采集器仍会从 document 抓到它们。
export const dialogSuite: ConformanceSuite = {
  component: 'dialog',
  anatomy: dialogAnatomy,
  keyboard: dialogKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'trigger', text: '打开' },
      {
        part: 'content',
        children: [
          { part: 'title', text: '标题' },
          { part: 'description', text: '描述' },
          { tag: 'button', text: '确认', attrs: { 'data-testid': 'confirm' } },
          { part: 'close-trigger', text: '关闭' },
        ],
      },
    ],
  },
  cases: [
    {
      name: '初始关闭：仅 trigger 在 DOM，content 不渲染',
      spec: { apg: APG, zag: 'dialog.machine#initialState' },
      initial: {
        order: ['trigger'],
        counts: { content: 0, backdrop: 0 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'data-state': 'closed',
          },
        },
      },
    },
    {
      name: '点击 trigger 打开：content 挂载，ARIA 接线完整',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        { kind: 'click', part: 'trigger' },
        {
          kind: 'settle',
          until: { present: 'content' },
          expect: {
            counts: { content: 1, backdrop: 1, positioner: 1 },
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
            },
          },
        },
      ],
    },
    {
      name: '点击 close-trigger 关闭：content 卸载，trigger 归位',
      spec: { apg: `${APG}#keyboardinteraction` },
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { present: 'content' } },
        { kind: 'click', part: 'close-trigger' },
        {
          kind: 'settle',
          until: { absent: 'content' },
          expect: {
            order: ['trigger'],
            counts: { content: 0 },
            parts: { trigger: { 'aria-expanded': 'false', 'data-state': 'closed' } },
          },
        },
      ],
    },
    {
      name: 'Escape 关闭：content 卸载',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['dialog.kbd.escape'],
      steps: [
        { kind: 'click', part: 'trigger' },
        { kind: 'settle', until: { present: 'content' } },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { absent: 'content' },
          expect: {
            counts: { content: 0 },
            parts: { trigger: { 'data-state': 'closed' } },
          },
        },
      ],
    },
  ],
}
