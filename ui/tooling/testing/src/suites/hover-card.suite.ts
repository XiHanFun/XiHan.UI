import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { hoverCardAnatomy, hoverCardKeyboard } from '@xihan-ui/headless'

// 无对应 APG 模式：卡片本体是非模态对话框，语义按 dialog 这一节对齐。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

const SCOPE = '[data-scope="hover-card"]'
const LINK_SELECTOR = '[data-testid="card-link"]'

/** apply-step 只有 click/key/focus，指针进出只能直接派发。 */
function hover(part: string, type: 'pointerenter' | 'pointerleave'): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const el = doc.querySelector(`${SCOPE}[data-part="${part}"]`)
    if (!el)
      throw new Error(`fixture 里没有 ${part}`)
    el.dispatchEvent(new Event(type))
  }
}

/** 纯等待：验「等过某个时长之后仍然如此」这类断言，别的步骤类型表达不了。 */
function wait(ms: number): () => Promise<void> {
  return () => new Promise<void>(resolve => setTimeout(resolve, ms))
}

/**
 * 卡片内容是可交互的（这正是它与 tooltip 的分界），所以 content 里放一个真链接：
 * 焦点走得进去、走进去之后卡片不该收起，都要有个可聚焦后代才验得到。
 * content 始终在 DOM，靠 hidden 显隐；positioner 留在原地不 portal。
 */
export const hoverCardSuite: ConformanceSuite = {
  component: 'hover-card',
  anatomy: hoverCardAnatomy,
  keyboard: hoverCardKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 必须是 button：Vue 侧组件自己渲染成 button，WC 侧由 fixture 的 tag 决定，
      // 渲染成 div 就不可聚焦，聚焦展开那一路在 WC 上永远演不出来
      { part: 'trigger', tag: 'button', text: '@xihan' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'arrow' },
              { text: '西涵 UI' },
              { tag: 'a', text: '主页', attrs: { 'href': '#profile', 'data-testid': 'card-link' } },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '初始收起：content 常挂但带 hidden，trigger aria-expanded=false',
      spec: { apg: APG, zag: 'hover-card.machine#initialState' },
      initial: {
        order: ['root', 'trigger', 'positioner', 'content', 'arrow'],
        counts: { root: 1, trigger: 1, positioner: 1, content: 1, arrow: 1 },
        parts: {
          root: {
            'data-state': 'closed',
            'data-disabled': null,
            // 作者没给 dir 就不写：写死会切断从 RTL 祖先继承来的方向
            'dir': null,
          },
          trigger: {
            'type': 'button',
            'aria-haspopup': 'dialog',
            'aria-expanded': 'false',
            'aria-controls': '@part(content)',
            'data-state': 'closed',
            'data-disabled': null,
          },
          positioner: {
            'data-state': 'closed',
            'data-placement': 'bottom',
          },
          content: {
            'role': 'dialog',
            'tabindex': '-1',
            'aria-modal': 'false',
            'aria-labelledby': '@part(trigger)',
            'hidden': '',
            'data-state': 'closed',
          },
          arrow: { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: '悬停 trigger：等到 openDelay 到点才展开',
      spec: { apg: APG, zag: 'hover-card.machine#opening' },
      props: { openDelay: 50 },
      steps: [
        {
          kind: 'raw',
          why: 'apply-step 无 hover 步骤类型，悬停延时只能直接派发指针事件',
          run: hover('trigger', 'pointerenter'),
          // 还在等待态：卡片没露面，对外也还没发生过任何事
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
            events: [],
          },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-state', value: 'open' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
      ],
    },
    {
      // 本组件的核心：trigger 与 content 之间隔着 offset，指针必须走得过去。
      // 途中两端都没有指针，全靠收起等待期把卡片留在屏幕上。
      name: '指针从 trigger 走到 content：中间隔着间隙也不收起',
      spec: { apg: APG, zag: 'hover-card.machine#visible.closing' },
      props: { openDelay: 20, closeDelay: 300 },
      steps: [
        {
          kind: 'raw',
          why: '悬停只能直接派发指针事件',
          run: hover('trigger', 'pointerenter'),
        },
        { kind: 'settle', until: { attr: { part: 'content', name: 'data-state', value: 'open' } } },
        {
          kind: 'raw',
          why: '离开 trigger 后在间隙里走一段（不足 closeDelay），此刻指针两端都不在',
          run: async (ctx) => {
            hover('trigger', 'pointerleave')(ctx)
            await wait(60)()
            await ctx.flush()
          },
          // 收起等待期内卡片仍然可见，且一条通知都没发
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '指针落到 content 上撤销收起，再等过一整个 closeDelay 才有判别力',
          run: async (ctx) => {
            hover('content', 'pointerenter')(ctx)
            await wait(400)()
            await ctx.flush()
          },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [],
          },
        },
      ],
    },
    {
      name: '指针离开后不再回来：满 closeDelay 收起并派发 open-change',
      spec: { apg: APG },
      props: { openDelay: 20, closeDelay: 50 },
      steps: [
        {
          kind: 'raw',
          why: '悬停只能直接派发指针事件',
          run: hover('trigger', 'pointerenter'),
        },
        { kind: 'settle', until: { attr: { part: 'content', name: 'data-state', value: 'open' } } },
        {
          kind: 'raw',
          why: '离开后不再回来',
          run: hover('trigger', 'pointerleave'),
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '聚焦 trigger 立即展开、焦点离开卡片立即收起，都不走延时',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['hover-card.kbd.focus-trigger'],
      // 两个延时都设得极大：任何一路误走延时，本用例都会当场停在原态上
      props: { openDelay: 5000, closeDelay: 5000 },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
            events: [{ type: 'open-change', detail: { open: true } }],
          },
        },
        {
          kind: 'blur',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      // 与 tooltip 的分界线：内容可聚焦、可交互。焦点从 trigger 走进 content
      // 不算离场——判据是焦点这一下落到了哪儿，落点仍在卡片内就当无事发生。
      name: '焦点走进 content：卡片留着，也不多派一条通知',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { closeDelay: 5000 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'raw',
          why: 'apply-step 的 focus 只认 part，卡片里的业务节点只能自己取',
          run: async ({ doc, flush }) => {
            const link = doc.querySelector<HTMLElement>(LINK_SELECTOR)
            if (!link)
              throw new Error('fixture 里没有可聚焦的卡片内容')
            link.focus()
            await flush()
          },
          expect: {
            parts: { content: { 'data-state': 'open', 'hidden': null } },
            activeElement: { part: 'content', exact: false },
            // 焦点若被判成离场，卡片会先收起再被 content 的 focusin 重开，
            // 终态照样是 open——破绽只在通知序列上
            events: [],
          },
        },
      ],
    },
    {
      name: 'Escape 立即收起：不等 closeDelay',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['hover-card.kbd.escape'],
      props: { closeDelay: 5000 },
      steps: [
        { kind: 'focus', part: 'trigger' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: {
              trigger: { 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: 'disabled：悬停与聚焦都不展开、不派发，trigger 自己仍可聚焦',
      spec: { apg: APG },
      props: { disabled: true, openDelay: 20 },
      steps: [
        {
          kind: 'focus',
          part: 'trigger',
          expect: {
            parts: {
              // 关掉的是卡片，不是 trigger：不输出原生 disabled，焦点照样落得上去
              trigger: { 'data-disabled': '', 'disabled': null, 'aria-expanded': 'false', 'data-state': 'closed' },
              content: { 'data-state': 'closed', 'hidden': '' },
            },
            activeElement: 'trigger',
            events: [],
          },
        },
        {
          kind: 'raw',
          why: '悬停只能直接派发指针事件；等过 openDelay 才验得出「到点也不展开」',
          run: async (ctx) => {
            hover('trigger', 'pointerenter')(ctx)
            await wait(60)()
            await ctx.flush()
          },
          expect: {
            parts: { content: { 'data-state': 'closed', 'hidden': '' } },
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
            parts: {
              trigger: { 'aria-expanded': 'true', 'data-state': 'open' },
              content: { 'data-state': 'open', 'hidden': null },
            },
          },
        },
      ],
    },
  ],
}
