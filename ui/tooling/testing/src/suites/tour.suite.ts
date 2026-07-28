import type { ConformanceSuite, StepWithExpect } from '../conformance/types'
import { tourAnatomy, tourKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/'

/**
 * 三步：两步锚定到页面元素，末步（收尾页）不锚定。
 * 目标节点写在 fixture 里而不是另外注入——它们本来就该是页面上的真实元素，
 * 引导指的就是它们；两个适配器拿到的是同一棵树，选择器在两边查到的也是同一个节点。
 */
const STEPS = [
  { id: 'search', target: '#tour-target-a', title: '搜索', description: '在这里搜' },
  { id: 'list', target: '#tour-target-b', title: '列表', description: '结果在这里', placement: 'right' },
  { id: 'done', target: null, title: '结束', description: '就这些' },
]

const PROPS = { steps: STEPS }

/**
 * 焦点陷阱：jsdom 按 Tab 不移动焦点，只能把焦点硬塞到浮层外面，看它会不会被拉回来。
 * 这也不是逐个部件的属性表达得了的事实——它跨了一个组件之外的节点。
 *
 * 用前须先把焦点落在浮层内的某个按钮上：焦点域记的是"上一个落在域内的节点"，
 * 而挂载时那次自动聚焦发生在它装监听器之前，域内还没有被它见过的落点。
 */
const focusTrap: StepWithExpect = {
  kind: 'raw',
  why: 'jsdom 按 Tab 不移动焦点；焦点陷阱只能用「把焦点塞到浮层外」来演，且判据跨了组件之外的节点',
  run: async ({ doc, flush }) => {
    const outside = doc.createElement('button')
    outside.textContent = '页面上别的按钮'
    doc.body.appendChild(outside)
    try {
      outside.focus()
      await flush()
      const content = doc.querySelector<HTMLElement>('[data-scope="tour"][data-part="content"]')
      const active = doc.activeElement
      if (!content)
        throw new Error('content 不在文档里，焦点陷阱无从谈起')
      if (!active || !(content === active || content.contains(active)))
        throw new Error('焦点跑出了引导浮层：aria-modal 声明了页面其余部分不该被误触，焦点就不该出得去')
    }
    finally {
      outside.remove()
    }
  },
}

export const tourSuite: ConformanceSuite = {
  component: 'tour',
  anatomy: tourAnatomy,
  keyboard: tourKeyboard,
  fixture: {
    part: 'root',
    children: [
      // 引导要指的页面元素。带 id 才被步骤里的选择器查得到
      { tag: 'div', attrs: { 'id': 'tour-target-a', 'data-testid': 'target-a' }, text: '搜索框' },
      { tag: 'div', attrs: { 'id': 'tour-target-b', 'data-testid': 'target-b' }, text: '结果列表' },
      { part: 'backdrop' },
      { part: 'spotlight' },
      {
        part: 'positioner',
        children: [
          {
            part: 'content',
            children: [
              { part: 'arrow' },
              { part: 'title' },
              { part: 'description' },
              { part: 'progress-text' },
              // 必须是 button：Vue 侧组件自己渲染成 button，WC 侧由 fixture 的 tag 决定，
              // 渲染成 div 就不可聚焦、原生 disabled 也拦不住点击
              { part: 'prev-trigger', tag: 'button', text: '上一步' },
              { part: 'next-trigger', tag: 'button', text: '下一步' },
              { part: 'skip-trigger', tag: 'button', text: '跳过' },
              { part: 'close-trigger', tag: 'button', text: '关闭' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: '初始收起：四个浮层角色全带 hidden，首步的上一步已是禁用态',
      spec: { apg: APG },
      props: { ...PROPS },
      initial: {
        order: [
          'root',
          'backdrop',
          'spotlight',
          'positioner',
          'content',
          'arrow',
          'title',
          'description',
          'progress-text',
          'prev-trigger',
          'next-trigger',
          'skip-trigger',
          'close-trigger',
        ],
        counts: { root: 1, backdrop: 1, spotlight: 1, positioner: 1, content: 1, arrow: 1 },
        parts: {
          'root': { 'data-state': 'closed', 'data-step': '0' },
          'backdrop': { 'aria-hidden': 'true', 'hidden': '', 'data-state': 'closed' },
          'spotlight': { 'aria-hidden': 'true', 'hidden': '', 'data-state': 'closed' },
          'positioner': { 'hidden': '', 'data-state': 'closed', 'data-position': 'anchored' },
          'content': {
            'role': 'dialog',
            'tabindex': '-1',
            'aria-modal': 'true',
            'hidden': '',
            'data-state': 'closed',
            'data-step': '0',
          },
          'arrow': { 'aria-hidden': 'true', 'hidden': '' },
          'prev-trigger': { type: 'button', disabled: '' },
          'next-trigger': { type: 'button', disabled: null },
          'progress-text': { 'aria-live': 'polite', 'data-step': '0' },
        },
      },
    },
    {
      name: 'defaultOpen 展开：ARIA 互指完整，高亮框与箭头随锚定步显形',
      spec: { apg: `${APG}#roles_states_properties` },
      props: { ...PROPS, defaultOpen: true },
      initial: {
        parts: {
          root: { 'data-state': 'open', 'data-step': '0' },
          content: {
            'role': 'dialog',
            'aria-modal': 'true',
            'hidden': null,
            'data-state': 'open',
            'data-step': '0',
            'aria-labelledby': '@part(title)',
            'aria-describedby': '@part(description)',
          },
          backdrop: { hidden: null },
          spotlight: { hidden: null },
          arrow: { hidden: null },
          positioner: { 'hidden': null, 'data-position': 'anchored' },
        },
      },
    },
    {
      name: '展开后焦点落在 content 本身：Enter/Space 才归"下一步"管',
      spec: { apg: `${APG}#keyboardinteraction` },
      props: { ...PROPS, defaultOpen: true },
      steps: [
        {
          kind: 'settle',
          until: { activeElement: 'content' },
          expect: { activeElement: { part: 'content', exact: true } },
        },
      ],
    },
    {
      name: 'enter / Space 走下一步',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tour.kbd.next'],
      props: { ...PROPS, defaultOpen: true },
      steps: [
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: {
              root: { 'data-step': '1' },
              content: { 'data-step': '1' },
            },
            // 走步不是开合：这一下不该有 open-change
            events: [],
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: {
              // 末步（收尾页）不锚定：高亮框与箭头一并收起，浮层交给样式表居中
              'root': { 'data-step': '2' },
              'spotlight': { hidden: '' },
              'arrow': { hidden: '' },
              'positioner': { 'data-position': 'center' },
              'next-trigger': { 'data-last': '' },
              'progress-text': { 'data-step': '2' },
            },
          },
        },
      ],
    },
    {
      name: '末步再走一步 = 完成：浮层收起并派发 open-change',
      spec: { zag: 'tour.machine#STEP.NEXT' },
      props: { ...PROPS, defaultOpen: true, defaultStep: 2 },
      steps: [
        {
          kind: 'click',
          part: 'next-trigger',
          expect: {
            parts: {
              content: { 'hidden': '', 'data-state': 'closed' },
              backdrop: { hidden: '' },
              spotlight: { hidden: '' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: 'escape 放弃引导并关闭',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tour.kbd.escape'],
      props: { ...PROPS, defaultOpen: true },
      steps: [
        { kind: 'settle', until: { activeElement: 'content' } },
        // 事件按帧结算：Escape 那一下就已经派发，断言必须落在同一帧上，
        // 挂到后面的 settle 上会因为事件早被取走而永远读到空
        {
          kind: 'key',
          key: 'Escape',
          expect: { events: [{ type: 'open-change', detail: { open: false } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: { parts: { content: { 'hidden': '', 'data-state': 'closed' } } },
        },
      ],
    },
    {
      name: 'closeOnEscape=false：Escape 不再关闭',
      spec: { zag: 'tour.machine#trackLayer' },
      props: { ...PROPS, defaultOpen: true, closeOnEscape: false },
      steps: [
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            parts: { content: { 'hidden': null, 'data-state': 'open' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '方向键一概不接管：步序不动，也不派事件',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tour.kbd.arrows'],
      props: { ...PROPS, defaultOpen: true },
      steps: [
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'key', key: 'ArrowDown' },
        { kind: 'key', key: 'ArrowUp' },
        { kind: 'key', key: 'ArrowLeft' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            parts: { content: { 'data-step': '0', 'data-state': 'open' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '焦点陷在浮层里：塞到外面也会被拉回来',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['tour.kbd.trap'],
      props: { ...PROPS, defaultOpen: true },
      steps: [
        { kind: 'settle', until: { activeElement: 'content' } },
        { kind: 'focus', part: 'next-trigger' },
        focusTrap,
      ],
    },
    {
      name: '点击上一步 / 下一步各走一格，首步的上一步是原生禁用',
      spec: { zag: 'tour.machine#STEP.PREV' },
      props: { ...PROPS, defaultOpen: true },
      steps: [
        {
          kind: 'click',
          part: 'next-trigger',
          expect: {
            parts: {
              'content': { 'data-step': '1' },
              'prev-trigger': { disabled: null },
              // 第二步声明了 placement=right，避让后的实际位仍写在 data-placement 上
              'positioner': { 'data-position': 'anchored' },
            },
          },
        },
        {
          kind: 'click',
          part: 'prev-trigger',
          expect: {
            parts: {
              'content': { 'data-step': '0' },
              'prev-trigger': { disabled: '' },
            },
          },
        },
      ],
    },
    {
      name: '点击跳过：浮层收起并派发 open-change',
      spec: { zag: 'tour.machine#SKIP' },
      props: { ...PROPS, defaultOpen: true },
      steps: [
        {
          kind: 'click',
          part: 'skip-trigger',
          expect: {
            parts: { content: { 'hidden': '', 'data-state': 'closed' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '点击关闭：同样收起，名字取自 translations 的缺省值',
      spec: { zag: 'tour.machine#CLOSE' },
      props: { ...PROPS, defaultOpen: true },
      steps: [
        {
          kind: 'click',
          part: 'close-trigger',
          expect: {
            parts: {
              'content': { hidden: '' },
              'close-trigger': { 'aria-label': 'Close' },
            },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
      ],
    },
    {
      name: '层外交互默认不关：点一下页面别处，引导原样停在那一步',
      spec: { zag: 'tour.types#closeOnInteractOutside' },
      props: { ...PROPS, defaultOpen: true },
      steps: [
        { kind: 'settle', until: { activeElement: 'content' } },
        {
          kind: 'outside',
          action: 'click',
          expect: {
            parts: { content: { 'hidden': null, 'data-state': 'open', 'data-step': '0' } },
            events: [],
          },
        },
      ],
    },
    {
      name: 'showBackdrop=false：展开也不画遮罩，其余照常',
      spec: { zag: 'tour.types#showBackdrop' },
      props: { ...PROPS, defaultOpen: true, showBackdrop: false },
      initial: {
        parts: {
          backdrop: { hidden: '' },
          content: { hidden: null },
          spotlight: { hidden: null },
        },
      },
    },
    {
      name: '受控 open：点跳过只发 open-change 不自改 DOM，父写回 open 后才收起',
      spec: { adr: 'controlled-uncontrolled' },
      props: { ...PROPS, open: true },
      steps: [
        {
          kind: 'click',
          part: 'skip-trigger',
          expect: {
            parts: { content: { 'hidden': null, 'data-state': 'open' } },
            events: [{ type: 'open-change', detail: { open: false } }],
          },
        },
        { kind: 'setProps', props: { open: false } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'hidden', value: '' } },
          expect: { parts: { content: { 'hidden': '', 'data-state': 'closed' } } },
        },
      ],
    },
    {
      name: '受控 step：点下一步不自改步序，父写回 step 后才走',
      spec: { adr: 'controlled-uncontrolled' },
      props: { ...PROPS, defaultOpen: true, step: 0 },
      steps: [
        {
          kind: 'click',
          part: 'next-trigger',
          expect: { parts: { content: { 'data-step': '0' } } },
        },
        { kind: 'setProps', props: { step: 1 } },
        {
          kind: 'settle',
          until: { attr: { part: 'content', name: 'data-step', value: '1' } },
          expect: {
            parts: {
              'content': { 'data-step': '1' },
              'prev-trigger': { disabled: null },
            },
          },
        },
      ],
    },
  ],
}
