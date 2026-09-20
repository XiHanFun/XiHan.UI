import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { reasoningAnatomy, reasoningKeyboard } from '@xihan-ui/headless'
import { heldPress, heldPressIgnored } from './shared/press-channel'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/'

/** 思考过程的一致性套件：与工具调用共用一台机器，验的是它配在这套解剖上仍然对。 */
export const reasoningSuite: ConformanceSuite = {
  component: 'reasoning',
  anatomy: reasoningAnatomy,
  keyboard: reasoningKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'trigger',
        tag: 'button',
        children: [
          { part: 'indicator' },
          { part: 'label', text: '思考过程' },
          { part: 'duration' },
        ],
      },
      { part: 'content', text: '先看约束再看目标。' },
    ],
  },
  cases: [
    {
      name: '默认：没在想就收起，正文被挡在读屏与 Tab 序之外',
      spec: { apg: APG },
      initial: {
        counts: { root: 1, trigger: 1, content: 1 },
        parts: {
          root: { 'data-state': 'closed', 'data-streaming': null, 'aria-busy': null },
          trigger: {
            'type': 'button',
            'aria-expanded': 'false',
            // 开关接 Action Control 的 disclosure-trigger 档：ghost 形态、按下只换面，缺省档位 sm
            'data-xh-action-control': '',
            'data-xh-action-profile': 'disclosure-trigger',
            'data-xh-action-variant': 'ghost',
            'data-xh-action-display': 'always',
            'data-xh-action-size': 'sm',
          },
          content: { role: 'region', hidden: '', inert: '' },
          indicator: { 'aria-hidden': 'true' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '挂载那一刻已经在想：直接展开',
      spec: { apg: APG },
      props: { streaming: true },
      initial: {
        parts: {
          root: { 'data-state': 'open', 'data-streaming': '' },
          content: { hidden: null, inert: null },
        },
      },
    },
    {
      name: '想完自动收起',
      spec: { apg: APG },
      props: { streaming: true },
      steps: [
        {
          kind: 'setProps',
          props: { streaming: false },
          expect: {
            parts: { root: { 'data-state': 'closed', 'data-streaming': null } },
            events: [{ type: 'open-change', detail: { open: false, source: 'auto' } }],
          },
        },
      ],
    },
    {
      name: '用户动手过一次就永久锁存',
      spec: { apg: APG },
      covers: ['reasoning.kbd.toggle'],
      steps: [
        {
          kind: 'click',
          part: 'trigger',
          expect: {
            parts: { root: { 'data-state': 'open' } },
            events: [{ type: 'open-change', detail: { open: true, source: 'user' } }],
          },
        },
        { kind: 'setProps', props: { streaming: true }, expect: { parts: { root: { 'data-state': 'open' } }, events: [] } },
        { kind: 'setProps', props: { streaming: false }, expect: { parts: { root: { 'data-state': 'open' } }, events: [] } },
      ],
    },
    {
      name: '正文区由开关命名，不再另发 aria-label——另发会盖过节点里的文字',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: '两个 id 都由实例级 scope 派生，写不成固定期望',
          run: ({ doc }: RawStepContext) => {
            const trigger = doc.querySelector<HTMLElement>('[data-scope="reasoning"][data-part="trigger"]')
            const content = doc.querySelector<HTMLElement>('[data-scope="reasoning"][data-part="content"]')
            if (!trigger || !content)
              throw new Error('找不到 reasoning 的 trigger 或 content 部件')
            if (content.getAttribute('aria-labelledby') !== trigger.id)
              throw new Error('正文区应由开关命名')
            if (trigger.getAttribute('aria-controls') !== content.id)
              throw new Error('开关的 aria-controls 应指向正文区')
            if (trigger.hasAttribute('aria-label'))
              throw new Error('开关不该另发 aria-label：它会盖过里面的文字')
          },
        },
      ],
    },
    {
      name: '禁用：开关走原生 disabled',
      spec: { apg: APG },
      props: { disabled: true },
      initial: { parts: { trigger: { disabled: '' } } },
      steps: [heldPressIgnored('reasoning', 'trigger', '禁用时 trigger 原生 disabled，不接受按压')],
    },
    {
      name: 'Space / Enter 按住与触屏按下：trigger 投影 data-pressed，抬起、失焦或指针取消撤下；展开锁存后照常可按',
      spec: { adr: 'press-channel' },
      covers: ['reasoning.kbd.press'],
      steps: [
        heldPress('reasoning', 'trigger'),
        { kind: 'click', part: 'trigger', expect: { parts: { trigger: { 'aria-expanded': 'true', 'data-pressed': null } } } },
        heldPress('reasoning', 'trigger'),
      ],
    },
    {
      name: '思考中 trigger 照常可点、按压面照有；按住途中转禁用：trigger 原生 disabled、不会再来 keyup，按压面由机器收',
      spec: { adr: 'press-channel' },
      props: { streaming: true },
      steps: [
        heldPress('reasoning', 'trigger'),
        {
          kind: 'raw',
          why: '按住的中间帧要拆开派才看得见',
          run: async ({ doc, flush }) => {
            const trigger = doc.querySelector<HTMLElement>('[data-scope="reasoning"][data-part="trigger"]')!
            trigger.focus()
            trigger.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }))
            await flush()
            if (!trigger.hasAttribute('data-pressed'))
              throw new Error('按住 Space 时 trigger 应投影 data-pressed')
          },
        },
        { kind: 'setProps', props: { streaming: true, disabled: true }, expect: { parts: { trigger: { 'disabled': '', 'data-pressed': null } } } },
      ],
    },
  ],
}
