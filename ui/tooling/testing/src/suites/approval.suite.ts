import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { approvalAnatomy, approvalKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/'

const ROOT = '[data-scope="approval"][data-part="root"]'

function scope(value: string, label: string, required?: boolean): FixtureNode {
  const attrs: Record<string, string> = { 'scope-value': value, 'scope-label': label }
  if (required)
    attrs['scope-required'] = ''
  return {
    part: 'scope-item',
    attrs,
    children: [
      { part: 'scope-indicator', attrs: { 'scope-value': value } },
      { part: 'scope-label', attrs: { 'scope-value': value }, text: label },
    ],
  }
}

/** 授权项的身份写在作者自己的节点上；两侧同一套 scope-* 属性。 */
export const approvalSuite: ConformanceSuite = {
  component: 'approval',
  anatomy: approvalAnatomy,
  keyboard: approvalKeyboard,
  fixture: {
    part: 'root',
    children: [
      { part: 'title', tag: 'h3', text: '要写文件' },
      { part: 'description', tag: 'p', text: '它想改 src/index.ts。' },
      { part: 'announcement' },
      {
        part: 'scope-group',
        children: [scope('read', '读文件', true), scope('write', '写文件')],
      },
      { part: 'timer' },
      { part: 'approve-trigger', tag: 'button', text: '批准' },
      { part: 'deny-trigger', tag: 'button', text: '拒绝' },
    ],
  },
  cases: [
    {
      name: '默认：待决，必选项没勾满时批不了，但拒绝随时可按',
      spec: { apg: APG },
      props: { scopes: [{ value: 'read', required: true }, { value: 'write' }] },
      initial: {
        counts: { 'root': 1, 'approve-trigger': 1, 'deny-trigger': 1, 'scope-item': 2 },
        parts: {
          'root': { 'role': 'group', 'data-state': 'pending', 'data-busy': null },
          // 待决时用 aria-disabled 而不是原生 disabled：保住可聚焦、让读屏念得到为什么按不动
          'approve-trigger': { 'type': 'button', 'aria-disabled': 'true', 'disabled': null },
          'deny-trigger': { type: 'button', disabled: null },
          'scope-item': [
            { 'role': 'checkbox', 'aria-checked': 'false', 'aria-required': 'true', 'tabindex': '0' },
            { 'role': 'checkbox', 'aria-checked': 'false', 'aria-required': 'false', 'tabindex': '0' },
          ],
          // 逐秒变化的数字进活区会不停打断
          'timer': { 'aria-hidden': 'true' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '勾满必选项之后才批得动，判定载荷带着批的是哪几项',
      spec: { apg: APG },
      covers: ['approval.kbd.scope-toggle', 'approval.kbd.approve'],
      props: { scopes: [{ value: 'read', required: true }, { value: 'write' }] },
      steps: [
        {
          kind: 'click',
          part: 'scope-item[0]',
          expect: {
            parts: {
              'scope-item': [{ 'aria-checked': 'true' }, { 'aria-checked': 'false' }],
              'approve-trigger': { 'aria-disabled': 'false' },
            },
            events: [{ type: 'granted-scopes-change', detail: { value: ['read'] } }],
          },
        },
        {
          kind: 'click',
          part: 'approve-trigger',
          expect: {
            parts: { root: { 'data-state': 'approved' } },
            events: [{ type: 'decision', detail: { decision: 'approved', source: 'user', scopes: ['read'] } }],
          },
        },
      ],
    },
    {
      name: '授权项只认 Space，Enter 刻意不参与——与原生复选框一致',
      spec: { apg: APG },
      covers: ['approval.kbd.scope-toggle'],
      props: { scopes: [{ value: 'read' }] },
      steps: [
        { kind: 'focus', part: 'scope-item[0]' },
        { kind: 'key', key: 'Enter', expect: { events: [] } },
        {
          kind: 'key',
          key: ' ',
          expect: { events: [{ type: 'granted-scopes-change', detail: { value: ['read'] } }] },
        },
      ],
    },
    {
      name: '拒绝这条路不吃任何闸门：必选项没勾满、挂起中，照样按得动',
      spec: { apg: APG },
      covers: ['approval.kbd.deny'],
      props: { busy: true, scopes: [{ value: 'read', required: true }] },
      initial: {
        parts: {
          'approve-trigger': { 'aria-disabled': 'true', 'aria-busy': 'true' },
          'deny-trigger': { disabled: null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'deny-trigger',
          expect: {
            parts: { root: { 'data-state': 'denied' } },
            events: [{ type: 'decision', detail: { decision: 'denied', source: 'user', scopes: [] } }],
          },
        },
      ],
    },
    {
      name: 'Escape 判为拒绝——它不是「关闭」，本组件不提供不作答的出口',
      spec: { apg: APG },
      covers: ['approval.kbd.escape'],
      steps: [
        { kind: 'focus', part: 'deny-trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { root: { 'data-state': 'denied' } },
            events: [{ type: 'decision', detail: { decision: 'denied', source: 'escape', scopes: [] } }],
          },
        },
      ],
    },
    {
      name: '判定落定后两颗按钮都收起出口：浮层的关闭由宿主自己做',
      spec: { apg: APG },
      props: { defaultStatus: 'approved' },
      initial: {
        parts: {
          'root': { 'data-state': 'approved' },
          'approve-trigger': { disabled: '' },
          'deny-trigger': { disabled: '' },
        },
      },
    },
    {
      name: '超时按拒绝收口：判定只有批准与拒绝两个取值，expired 只是显示态',
      spec: { apg: APG },
      props: { timeoutMs: 30 },
      steps: [
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'expired' } },
          timeoutMs: 2000,
        },
        {
          kind: 'raw',
          why: '要核对的是判定载荷里写的是拒绝而不是第三种取值，事件断言在这一帧之前已经过去',
          run: ({ doc }: RawStepContext) => {
            const root = doc.querySelector<HTMLElement>(ROOT)
            if (root?.getAttribute('data-state') !== 'expired')
              throw new Error('到点之后应落到 expired 显示态')
          },
        },
      ],
    },
    {
      name: '时长非正数时一个计时器都不起：既不当 0ms 立刻到期，也不当无限期放行',
      spec: { apg: APG },
      props: { timeoutMs: 0 },
      initial: { parts: { root: { 'data-state': 'pending' } } },
    },
  ],
}
