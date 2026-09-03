import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { toolCallAnatomy, toolCallKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

const TRIGGER = '[data-scope="tool-call"][data-part="trigger"]'

/** 工具卡的一致性套件：阶段投影、自动开合，以及用户动手之后的永久锁存。 */
export const toolCallSuite: ConformanceSuite = {
  component: 'tool-call',
  anatomy: toolCallAnatomy,
  keyboard: toolCallKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'trigger',
        tag: 'button',
        children: [
          { part: 'indicator' },
          { part: 'label', text: 'search' },
          { part: 'status' },
        ],
      },
      { part: 'approval' },
      {
        part: 'content',
        children: [
          { part: 'input' },
          { part: 'output' },
          { part: 'error' },
        ],
      },
    ],
  },
  cases: [
    {
      name: '默认：参数齐了、没在跑，收起且详情被挡在读屏与 Tab 序之外',
      spec: { apg: APG },
      initial: {
        counts: { root: 1, trigger: 1, content: 1 },
        parts: {
          root: { 'data-state': 'closed', 'data-loading': null, 'aria-busy': null },
          status: { 'data-state': 'input-available' },
          trigger: { 'type': 'button', 'aria-expanded': 'false', 'aria-describedby': null },
          content: { role: 'region', hidden: '', inert: '' },
          // 纯装饰，不进可访问名
          indicator: { 'aria-hidden': 'true' },
          // 只在等人批准时露面
          approval: { hidden: '' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '挂载那一刻已经在跑：直接展开，等「翻真」是等不到的',
      spec: { apg: APG },
      props: { phase: 'input-streaming' },
      initial: {
        parts: {
          root: { 'data-state': 'open', 'data-loading': '' },
          status: { 'data-state': 'input-streaming' },
          trigger: { 'aria-expanded': 'true' },
          content: { hidden: null, inert: null },
        },
      },
    },
    {
      name: '等人批准不是在跑：闸门露面，卡片不按运行中处理',
      spec: { apg: APG },
      props: { phase: 'awaiting-approval' },
      initial: {
        parts: {
          root: { 'data-loading': null },
          status: { 'data-state': 'awaiting-approval' },
          approval: { hidden: null },
        },
      },
    },
    {
      name: '跑完自动收起',
      spec: { apg: APG },
      props: { phase: 'input-streaming' },
      steps: [
        {
          kind: 'setProps',
          props: { phase: 'output-available' },
          expect: {
            parts: { root: { 'data-state': 'closed' }, status: { 'data-state': 'output-available' } },
            events: [{ type: 'open-change', detail: { open: false, source: 'auto' } }],
          },
        },
      ],
    },
    {
      name: '用户动手过一次就永久锁存：此后阶段怎么变都不再自动开合',
      spec: { apg: APG },
      covers: ['tool-call.kbd.toggle'],
      props: { phase: 'input-available' },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { root: { 'data-state': 'open' } },
            events: [{ type: 'open-change', detail: { open: true, source: 'user' } }],
          },
        },
        // 锁存靠转移的放置位置：进了 held 分支之后阶段变化在结构上就够不着任何转移
        {
          kind: 'setProps',
          props: { phase: 'input-streaming' },
          expect: { parts: { root: { 'data-state': 'open' } }, events: [] },
        },
        {
          kind: 'setProps',
          props: { phase: 'output-available' },
          expect: { parts: { root: { 'data-state': 'open' } }, events: [] },
        },
      ],
    },
    {
      name: '关掉自动开合：跑起来也不展开',
      spec: { apg: APG },
      props: { phase: 'input-available', autoDisclosure: false },
      steps: [
        {
          kind: 'setProps',
          props: { phase: 'input-streaming', autoDisclosure: false },
          expect: { parts: { root: { 'data-state': 'closed' } }, events: [] },
        },
      ],
    },
    {
      name: '受控：点开关只发意图，自己不落态',
      spec: { apg: APG },
      props: { open: false, phase: 'input-available' },
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { root: { 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: true, source: 'user' } }],
          },
        },
        {
          kind: 'setProps',
          props: { open: true, phase: 'input-available' },
          expect: { parts: { root: { 'data-state': 'open' } } },
        },
      ],
    },
    {
      name: '出错时开关才补描述链：无条件挂会指向一个作者根本没渲的节点',
      spec: { apg: APG },
      props: { phase: 'output-error' },
      steps: [
        {
          kind: 'raw',
          why: 'aria-describedby 指向的 error id 由实例级 scope 派生，写不成固定期望',
          run: ({ doc }: RawStepContext) => {
            const trigger = doc.querySelector<HTMLElement>(TRIGGER)
            const error = doc.querySelector<HTMLElement>('[data-scope="tool-call"][data-part="error"]')
            if (!trigger || !error)
              throw new Error('找不到 tool-call 的 trigger 或 error 部件')
            if (trigger.getAttribute('aria-describedby') !== error.id)
              throw new Error('出错时 trigger 的 aria-describedby 应指向 error')
          },
        },
      ],
    },
    {
      name: '禁用：开关走原生 disabled，点不动',
      spec: { apg: APG },
      props: { disabled: true },
      initial: { parts: { trigger: { disabled: '' } } },
    },
  ],
}
