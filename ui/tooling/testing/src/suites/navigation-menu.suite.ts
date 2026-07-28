import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { navigationMenuAnatomy, navigationMenuKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/'

const TRIGGER = '[data-scope="navigation-menu"][data-part="trigger"]'

const VALUES = ['products', 'docs', 'company'] as const

/**
 * 三项导航，每项一个 trigger + 一个面板，面板里各一条链接；末尾一根指示条与一个共享外壳。
 *
 * 面板刻意写在同一个 item 里、紧跟 trigger 之后：「Tab 从 trigger 走进展开的面板」
 * 靠的正是这个位置关系。指示条是 li——它得住在 list（ul）里才能以 list 为定位参照系。
 *
 * 禁用用 `disabled` 属性声明（Vue 侧它是组件 prop、不落 DOM）；
 * WC 侧接线时须经 authorDisabled 改写成 aria-disabled——集合条目绝不输出原生 disabled，
 * 原生禁用的按钮不可聚焦，"禁用项仍是方向键起点"这条规格在 WC 上会直接不成立。
 */
function menuTree(disabled?: string): FixtureNode {
  return {
    part: 'root',
    tag: 'nav',
    children: [
      {
        part: 'list',
        tag: 'ul',
        children: [
          ...VALUES.map((v): FixtureNode => {
            const attrs: Record<string, string> = { value: v }
            if (v === disabled)
              attrs.disabled = ''
            return {
              part: 'item',
              tag: 'li',
              children: [
                { part: 'trigger', tag: 'button', text: v, attrs },
                {
                  part: 'content',
                  attrs: { value: v },
                  children: [{ part: 'link', tag: 'a', text: `${v} 首页`, attrs: { href: `/${v}` } }],
                },
              ],
            }
          }),
          { part: 'indicator', tag: 'li' },
        ],
      },
      { part: 'viewport' },
    ],
  }
}

/** 悬停某个 trigger。Step 里没有"悬停"这一档，只能自己派事件。 */
function hover(index: number): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Step 没有悬停这一档；指针进入是本组件展开的主要入口，绕不过去',
    run: async ({ doc, flush }) => {
      const el = doc.querySelectorAll<HTMLElement>(TRIGGER)[index]
      if (!el)
        throw new Error(`找不到第 ${index} 个 trigger`)
      // 派裸事件而不是 PointerEvent：无头 DOM 里指针事件没有默认构造语义，
      // 连接层也只看事件类型
      el.dispatchEvent(new Event('pointerenter'))
      await flush()
    },
  }
}

export const navigationMenuSuite: ConformanceSuite = {
  component: 'navigation-menu',
  anatomy: navigationMenuAnatomy,
  keyboard: navigationMenuKeyboard,
  fixture: menuTree(),
  cases: [
    {
      name: '默认收起：面板常挂带 hidden，trigger 的 aria 显式为 false',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'list',
          'item[0]',
          'trigger[0]',
          'content[0]',
          'link[0]',
          'item[1]',
          'trigger[1]',
          'content[1]',
          'link[1]',
          'item[2]',
          'trigger[2]',
          'content[2]',
          'link[2]',
          'indicator',
          'viewport',
        ],
        counts: { root: 1, list: 1, item: 3, trigger: 3, content: 3, link: 3, indicator: 1, viewport: 1 },
        parts: {
          // 写死 ltr 会切断从 RTL 祖先继承来的方向，作者没给就不该出现 dir
          'root': { 'aria-label': 'Main navigation', 'data-orientation': 'horizontal', 'data-state': 'closed', 'dir': null },
          'list': { 'data-orientation': 'horizontal', 'aria-orientation': null, 'role': null },
          'trigger[0]': {
            'type': 'button',
            'aria-expanded': 'false',
            'aria-disabled': 'false',
            'data-state': 'closed',
            'data-value': 'products',
            'data-disabled': null,
            // 不做 roving tabindex：每个 trigger 都留在 Tab 序列里，面板才 Tab 得进去
            'tabindex': null,
          },
          'content[0]': { 'role': 'group', 'hidden': '', 'data-state': 'closed' },
          'content[2]': { hidden: '' },
          'link[0]': { 'aria-current': null, 'data-current': null },
          'indicator': { 'aria-hidden': 'true', 'hidden': '' },
          'viewport': { 'hidden': '', 'data-state': 'closed' },
        },
      },
    },
    {
      name: 'aria-controls / aria-labelledby 按 value 逐对互指',
      spec: { apg: APG },
      initial: {
        parts: {
          'trigger[0]': { 'id': '@self', 'aria-controls': '@part(content[0])' },
          'trigger[1]': { 'id': '@self', 'aria-controls': '@part(content[1])' },
          'trigger[2]': { 'id': '@self', 'aria-controls': '@part(content[2])' },
          'content[0]': { 'id': '@self', 'aria-labelledby': '@part(trigger[0])' },
          'content[2]': { 'id': '@self', 'aria-labelledby': '@part(trigger[2])' },
        },
      },
    },
    {
      name: 'defaultValue：只有那一项的面板露出来，viewport 跟着现身',
      spec: { apg: APG },
      props: { defaultValue: 'docs' },
      initial: {
        parts: {
          'root': { 'data-state': 'open' },
          'trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
          'trigger[1]': { 'aria-expanded': 'true', 'data-state': 'open' },
          'content[0]': { hidden: '' },
          'content[1]': { 'hidden': null, 'data-state': 'open' },
          'content[2]': { hidden: '' },
          'viewport': { 'hidden': null, 'data-state': 'open' },
        },
      },
    },
    {
      name: '点 trigger 立即展开，不走延时；再点一次收起',
      spec: { apg: APG },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[1]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'docs' } }],
          },
        },
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'false' },
              'content[1]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
      ],
    },
    {
      name: 'Enter 展开：吞掉按钮的默认激活，不会被随后合成的 click 当场关掉',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.toggle'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'products' } }],
          },
        },
      ],
    },
    {
      name: '悬停 trigger：等满 delayDuration 才展开',
      spec: { apg: APG },
      props: { delayDuration: 20 },
      steps: [
        hover(1),
        {
          // 展开是延时来的，得等它真的到点（settle 只等可观察的 DOM 事实，不裸睡）
          kind: 'settle',
          until: { attr: { part: 'content[1]', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: 'docs' } }],
          },
        },
      ],
    },
    {
      name: '已经展开着再悬停别处：当场换一项，不再等一遍延时',
      spec: { apg: APG },
      // 延时故意设得很长：真要重新计时的话，这一步之后面板绝不会已经换过去
      props: { defaultValue: 'products', delayDuration: 5000 },
      steps: [
        {
          ...hover(2),
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'trigger[2]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: '' },
              'content[2]': { hidden: null },
            },
            events: [{ type: 'value-change', detail: { value: 'company' } }],
          },
        },
      ],
    },
    {
      name: 'Escape：收起并把焦点归还对应 trigger（面板一 hidden，焦点不还就掉回文档根部）',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.escape'],
      props: { defaultValue: 'products' },
      steps: [
        { kind: 'focus', part: 'link[0]' },
        {
          kind: 'key',
          key: 'Escape',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'content[0]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
      ],
    },
    {
      name: 'ArrowRight / ArrowLeft 在 trigger 之间走，尽头回绕',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.next', 'navigation-menu.kbd.prev'],
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
      ],
    },
    {
      name: 'Home / End 跳到首尾 trigger',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.first', 'navigation-menu.kbd.last'],
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'trigger[2]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'trigger[0]', exact: true } } },
      ],
    },
    {
      name: '横排里的上下键不归导航管：焦点不动，放行给页面滚动与读屏',
      spec: { apg: `${APG}#kbd_label` },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'trigger[0]', exact: true }, events: [] } },
      ],
    },
    {
      name: 'orientation=vertical：轴向三处一致，ArrowDown 成为下一个',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.next'],
      props: { orientation: 'vertical' },
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'trigger[1]', exact: true },
            parts: {
              root: { 'data-orientation': 'vertical' },
              list: { 'data-orientation': 'vertical' },
              indicator: { 'data-orientation': 'vertical' },
            },
          },
        },
      ],
    },
    {
      // 水平轴按文字方向镜像：rtl 下视觉上的"右"就是序列上的"前一个"
      name: 'dir=rtl：ArrowRight 走上一个',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.prev'],
      props: { dir: 'rtl' },
      steps: [
        { kind: 'focus', part: 'trigger[1]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[0]', exact: true },
            parts: { root: { dir: 'rtl' } },
          },
        },
      ],
    },
    {
      name: '禁用条目用 aria-disabled 而非原生 disabled，方向键跳过它',
      spec: { apg: APG },
      covers: ['navigation-menu.kbd.next'],
      fixture: () => menuTree('docs'),
      steps: [
        { kind: 'focus', part: 'trigger[0]' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'trigger[2]', exact: true },
            parts: {
              'trigger[1]': { 'aria-disabled': 'true', 'disabled': null, 'data-disabled': '' },
            },
          },
        },
      ],
    },
    {
      name: '禁用条目点不开',
      spec: { apg: APG },
      fixture: () => menuTree('docs'),
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: { 'trigger[1]': { 'aria-expanded': 'false' }, 'content[1]': { hidden: '' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '面板里的链接被点：导航收起（跳走之后面板还开着会盖住新页面的顶部）',
      spec: { apg: APG },
      props: { defaultValue: 'products' },
      steps: [
        {
          kind: 'click',
          part: 'link[0]',
          expect: {
            parts: { 'content[0]': { hidden: '' }, 'trigger[0]': { 'aria-expanded': 'false' } },
            events: [{ type: 'value-change', detail: { value: null } }],
          },
        },
      ],
    },
    {
      name: '当前页那条链接报 aria-current=page（不是 location：那是页内目录用的）',
      spec: { apg: APG },
      props: { defaultValue: 'products' },
      fixture: (): FixtureNode => ({
        part: 'root',
        tag: 'nav',
        children: [
          {
            part: 'list',
            tag: 'ul',
            children: [{
              part: 'item',
              tag: 'li',
              children: [
                { part: 'trigger', tag: 'button', text: 'products', attrs: { value: 'products' } },
                {
                  part: 'content',
                  attrs: { value: 'products' },
                  children: [
                    { part: 'link', tag: 'a', text: '概览', attrs: { href: '/products', current: '' } },
                    { part: 'link', tag: 'a', text: '定价', attrs: { href: '/pricing' } },
                  ],
                },
              ],
            }],
          },
        ],
      }),
      initial: {
        parts: {
          'link[0]': { 'aria-current': 'page', 'data-current': '' },
          'link[1]': { 'aria-current': null, 'data-current': null },
        },
      },
    },
    {
      // 受控初值刻意给一个真实的项而不是 null：null 在 WC 那边表达不出来
      // （属性只有在/不在两态，harness 遇到 null 会整个跳过，元素就变回非受控了）
      name: '受控 value：点击只发意图不自改 DOM，宿主写回 value 后才换项',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'products' },
      steps: [
        {
          kind: 'click',
          part: 'trigger[1]',
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'true' },
              'trigger[1]': { 'aria-expanded': 'false' },
              'content[1]': { hidden: '' },
            },
            events: [{ type: 'value-change', detail: { value: 'docs' } }],
          },
        },
        { kind: 'setProps', props: { value: 'docs' } },
        {
          kind: 'settle',
          until: { attr: { part: 'content[1]', name: 'hidden', value: null } },
          expect: {
            parts: {
              'trigger[0]': { 'aria-expanded': 'false' },
              'trigger[1]': { 'aria-expanded': 'true' },
              'content[0]': { hidden: '' },
            },
            // 宿主写回 value 不再回弹事件
            events: [],
          },
        },
      ],
    },
    {
      name: 'Tab 进入展开的面板：收起的面板带 hidden，整个被跳过',
      spec: { apg: `${APG}#kbd_label` },
      covers: ['navigation-menu.kbd.tab'],
      props: { defaultValue: 'products' },
      steps: [
        {
          kind: 'raw',
          why: 'Tab 序列是跨节点的事实，逐个部件的属性期望表达不了；jsdom 也不会真的移动焦点',
          run: ({ doc }) => {
            const contents = [...doc.querySelectorAll<HTMLElement>('[data-scope="navigation-menu"][data-part="content"]')]
            if (contents.length !== 3)
              throw new Error(`预期 3 个面板，实际 ${contents.length}`)
            // 展开的那个必须真的没 hidden——否则里面的链接连 Tab 都够不着
            if (contents[0]!.hasAttribute('hidden'))
              throw new Error('展开的面板不该带 hidden：带着的话里面的链接根本进不了 Tab 序列')
            for (const el of contents.slice(1)) {
              if (!el.hasAttribute('hidden'))
                throw new Error('收起的面板必须带 hidden：不带的话 Tab 会走进看不见的链接里')
            }
            // 面板必须紧跟在自己那一项的 trigger 之后：Tab 从 trigger 直接走进面板靠的就是这个
            const trigger = doc.querySelectorAll<HTMLElement>(TRIGGER)[0]!
            if (trigger.nextElementSibling !== contents[0])
              throw new Error('面板须紧跟在同一项的 trigger 之后，否则 Tab 走不进去')
          },
        },
      ],
    },
  ],
}
