import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { tooltipAnatomy, tooltipKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/'

const TRIGGER_SELECTOR = '[data-scope="tooltip"][data-part="trigger"]'

/** apply-step 只有 click/key/focus，指针进出与按下只能直接派发。 */
function dispatchOnTrigger(type: string): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const trigger = doc.querySelector(TRIGGER_SELECTOR)
    if (!trigger)
      throw new Error('fixture 里没有 trigger')
    trigger.dispatchEvent(new Event(type))
  }
}

// content 始终在 DOM，靠 hidden 显隐；positioner 留在原地不 portal。
export const tooltipSuite: ConformanceSuite = {
  component: 'tooltip',
  anatomy: tooltipAnatomy,
  keyboard: tooltipKeyboard,
  fixture: {
    children: [
      { part: 'trigger', tag: 'button', text: '保存' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { text: '保存当前草稿' },
              { part: 'arrow' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '初始收起：content 常挂但带 hidden，trigger 不指向隐藏节点',
      spec: { apg: APG, zag: 'tooltip.machine#initialState' },
      initial: {
        order: ['trigger', 'positioner', 'content', 'arrow'],
        counts: { trigger: 1, positioner: 1, content: 1, arrow: 1 },
        parts: {
          trigger: {
            'type': 'button',
            'aria-describedby': null,
            'data-state': 'closed',
            'data-disabled': null,
          },
          content: {
            'role': 'tooltip',
            'data-state': 'closed',
            'hidden': '',
          },
          arrow: { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: '聚焦 trigger 立即展开：不等 openDelay，并派发 open-change',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tooltip.kbd.tab'],
      // 延时若被误用在聚焦路径上，本用例会因 content 仍 hidden 而失败
      props: { openDelay: 5000 },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'aria-describedby 指向 content：tooltip 是描述不是名字',
      spec: { apg: `${APG}#roles_states_properties` },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: {
              trigger: { 'aria-describedby': '@part(content)', 'aria-labelledby': null },
              content: { id: '@self', role: 'tooltip' },
            },
          },
        },
      ],
    },
    {
      name: '悬停进入：等到 openDelay 到点才展开',
      spec: { apg: APG, zag: 'tooltip.machine#opening' },
      props: { openDelay: 50 },
      steps: [
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，悬停延时只能直接派发指针事件',
          run: dispatchOnTrigger('pointerenter'),
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'Escape 立即收起：不等 closeDelay',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tooltip.kbd.escape'],
      props: { closeDelay: 5000 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              trigger: { 'aria-describedby': null, 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '指针按下：立即收起给真正的操作让位',
      spec: { apg: APG },
      props: { closeDelay: 5000 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: 'apply-step 的 click 不派发 pointerdown，按下路径只能直接派发',
          run: dispatchOnTrigger('pointerdown'),
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      // 焦点停在 trigger 上时，鼠标路过再移开不收走描述，收起由 BLUR 负责
      name: '聚焦打开后，指针移出不收起（收起归 BLUR 管）',
      spec: { apg: APG },
      props: { closeDelay: 20 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，指针进出只能直接派发',
          run: dispatchOnTrigger('pointerleave'),
        },
        {
          kind: 'raw',
          // 必须等过 closeDelay 才有判别力：收起等待期内 content 仍是 data-state=open
          why: '等过 closeDelay，越过收起等待期再断言',
          run: () => new Promise<void>(resolve => setTimeout(resolve, 80)),
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [],
          },
        },
      ],
    },
    {
      // 守的是悬停等待期内的命令式展开（opening 态收 OPEN）
      name: '悬停等待期内命令式展开：立即展开，不等 openDelay',
      spec: { apg: APG },
      props: { openDelay: 5000 },
      steps: [
        {
          kind: 'raw',
          why: '先进入 opening 等待态',
          run: dispatchOnTrigger('pointerenter'),
          expect: { parts: { content: { 'data-state': 'closed' } }, events: [] },
        },
        {
          kind: 'raw',
          why: '命令式展开走 api.setOpen，apply-step 没有对应步骤类型',
          run: ({ doc }) => {
            const trigger = doc.querySelector(TRIGGER_SELECTOR)
            trigger?.dispatchEvent(new Event('focus'))
          },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      name: 'disabled：聚焦不展开、不派发',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'data-disabled': '', 'aria-describedby': null, 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '受控 open：聚焦只发 open-change 不自改 DOM，父写回 open 后才展开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { open: false },
      steps: [
        {
          kind: 'focus',
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
  ],
}
