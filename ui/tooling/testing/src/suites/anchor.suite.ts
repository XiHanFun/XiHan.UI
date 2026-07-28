import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { anchorAnatomy, anchorKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html'

const LINK = '[data-scope="anchor"][data-part="link"]'

const VALUES = ['intro', 'install', 'usage'] as const

/**
 * 三条目录 + 一根指示条。
 * 指示条是 li——它得住在 list（ul）里才能以 list 为定位参照系，而 ul 里只放得下 li。
 *
 * 目标区块（`<section id=...>`）刻意不放进来：它们是页面内容、不是组件的部件，
 * 组件在这套 fixture 下量不到任何区块，于是滚动观察不会开口，
 * 激活项完全由 defaultValue / value / 点击决定——正好把"滚动"这条不确定的路隔离掉。
 */
const anchorTree: FixtureNode = {
  part: 'root',
  tag: 'nav',
  children: [
    {
      part: 'list',
      tag: 'ul',
      children: [
        ...VALUES.map((v): FixtureNode => ({
          part: 'item',
          tag: 'li',
          children: [{ part: 'link', tag: 'a', text: `第 ${v} 节`, attrs: { value: v } }],
        })),
        { part: 'indicator', tag: 'li' },
      ],
    },
  ],
}

/**
 * 「smooth 开时拦下原生跳转」不能靠 click 步骤：它走的是 el.click()，
 * 而合成事件默认 cancelable=false 时 preventDefault 是空操作、defaultPrevented 恒为 false，
 * 断言会恒绿——删掉那道拦截照样全过。必须自己建可取消的事件再读 defaultPrevented。
 */
function clickIsPrevented(index: number, expected: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '合成事件默认 cancelable=false，在它身上 preventDefault 是空操作；断言要能咬只能自己建可取消事件',
    run: async ({ doc, flush }) => {
      const el = doc.querySelectorAll<HTMLElement>(LINK)[index]
      if (!el)
        throw new Error(`找不到第 ${index} 条 link`)
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      await flush()
      if (event.defaultPrevented !== expected) {
        throw new Error(
          expected
            ? 'smooth 开着却没拦下原生跳转：浏览器会先瞬间跳过去，平滑滚动等于白做'
            : 'smooth 关着还拦下了点击：原生片段跳转就此失效，不带 JS 的降级路径也断了',
        )
      }
    },
  }
}

export const anchorSuite: ConformanceSuite = {
  component: 'anchor',
  anatomy: anchorAnatomy,
  keyboard: anchorKeyboard,
  fixture: anchorTree,
  cases: [
    {
      name: '默认：nav 地标带名字，href 由 value 派生，无激活项时一条都不带 aria-current',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'list',
          'item[0]',
          'link[0]',
          'item[1]',
          'link[1]',
          'item[2]',
          'link[2]',
          'indicator',
        ],
        counts: { root: 1, list: 1, item: 3, link: 3, indicator: 1 },
        parts: {
          // 写死 ltr 会切断从 RTL 祖先继承来的方向，作者没给就不该出现 dir
          'root': { 'aria-label': 'Anchor navigation', 'data-orientation': 'vertical', 'dir': null },
          'list': { 'data-orientation': 'vertical', 'role': null },
          'link[0]': {
            'data-value': 'intro',
            // aria-current 的默认值就是 "false"，省略即"不是当前项"
            'aria-current': null,
            'data-active': null,
          },
          'link[2]': { 'data-value': 'usage' },
          // 一节都没越过判定线时指示条整条收起
          'indicator': { 'aria-hidden': 'true', 'hidden': '' },
        },
      },
    },
    {
      name: 'defaultValue：当前那条报 aria-current=location（不是 page），其余一条不写',
      spec: { apg: APG },
      props: { defaultValue: 'install' },
      initial: {
        parts: {
          'link[0]': { 'aria-current': null, 'data-active': null },
          // location 说的是"本页面里的这个位置"；page 是"这就是当前页面"，用在这儿不对
          'link[1]': { 'aria-current': 'location', 'data-active': '' },
          'link[2]': { 'aria-current': null, 'data-active': null },
        },
      },
    },
    {
      // 指示条量到的坐标写在内联 style 上，而 style 不进快照（它跨适配器不可比）；
      // 那一段的数值由 headless 单测逐条验，这里只验"量出来了、于是它现身了"这件事
      name: '有激活项时指示条现身（量测推迟到 DOM 落定之后才做）',
      spec: { apg: APG },
      props: { defaultValue: 'install' },
      steps: [
        // 量测是推迟到 DOM 落定之后才做的（连接期读不了 DOM），等它真的落下来
        {
          kind: 'settle',
          until: { attr: { part: 'indicator', name: 'hidden', value: null } },
          expect: {
            parts: {
              // 读屏那边"当前在哪一节"已由 aria-current 说清楚，指示条只是视觉
              indicator: { 'aria-hidden': 'true', 'data-value': 'install', 'hidden': null },
            },
          },
        },
      ],
    },
    {
      name: '点链接：当场把激活项切过去，不等观察器',
      spec: { apg: APG },
      props: { defaultValue: 'intro' },
      steps: [
        {
          kind: 'click',
          part: 'link[2]',
          expect: {
            parts: {
              'link[0]': { 'aria-current': null, 'data-active': null },
              'link[2]': { 'aria-current': 'location', 'data-active': '' },
            },
            events: [{ type: 'value-change', detail: { value: 'usage' } }],
          },
        },
      ],
    },
    {
      name: 'smooth 关：不拦原生跳转，不带 JS 的降级路径留着',
      spec: { apg: APG },
      steps: [clickIsPrevented(1, false)],
    },
    {
      name: 'smooth 开：拦下原生跳转，改由组件平滑滚过去',
      spec: { apg: APG },
      props: { smooth: true },
      steps: [clickIsPrevented(1, true)],
    },
    {
      name: '受控 value：点击只发意图不自改 DOM，宿主写回 value 后才切换',
      spec: { adr: 'controlled-uncontrolled' },
      props: { value: 'intro' },
      steps: [
        {
          kind: 'click',
          part: 'link[2]',
          expect: {
            parts: {
              'link[0]': { 'aria-current': 'location' },
              'link[2]': { 'aria-current': null },
            },
            events: [{ type: 'value-change', detail: { value: 'usage' } }],
          },
        },
        { kind: 'setProps', props: { value: 'usage' } },
        {
          kind: 'settle',
          until: { attr: { part: 'link[2]', name: 'aria-current', value: 'location' } },
          expect: {
            parts: { 'link[0]': { 'aria-current': null } },
            // 宿主写回 value 不再回弹事件
            events: [],
          },
        },
      ],
    },
    {
      name: 'dir=rtl 写到根节点上：整列的排版交给浏览器',
      spec: { apg: APG },
      props: { dir: 'rtl' },
      initial: { parts: { root: { dir: 'rtl' } } },
    },
    {
      name: 'orientation=horizontal：root / list / indicator 三处轴向一致',
      spec: { apg: APG },
      props: { orientation: 'horizontal', defaultValue: 'intro' },
      initial: {
        parts: {
          root: { 'data-orientation': 'horizontal' },
          list: { 'data-orientation': 'horizontal' },
          indicator: { 'data-orientation': 'horizontal' },
        },
      },
    },
    {
      name: 'Enter 跟随链接由原生 <a> 负责；每一条都是独立的 Tab 停靠点',
      spec: { apg: APG },
      covers: ['anchor.kbd.link', 'anchor.kbd.tab'],
      steps: [
        {
          kind: 'raw',
          why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；jsdom 也不会真的移动焦点',
          run: ({ doc }) => {
            const links = [...doc.querySelectorAll<HTMLElement>(LINK)]
            if (links.length !== 3)
              throw new Error(`预期 3 条 link，实际 ${links.length}`)
            links.forEach((el, i) => {
              // 跟随链接这件事我们一行代码都没写，全靠平台——那它就必须真的是个 <a>
              if (el.tagName !== 'A')
                throw new Error(`link 必须是原生 <a>（Enter 的跟随由平台负责），实际是 <${el.tagName.toLowerCase()}>`)
              // href 由目标 id 派生（作者只写了 value）。它不进快照（href 不是结构/状态属性），
              // 只能在这儿直接读 DOM 验
              const href = el.getAttribute('href')
              if (href !== `#${VALUES[i]}`)
                throw new Error(`link 的 href 应由 value 派生成 "#${VALUES[i]}"，实际 ${JSON.stringify(href)}`)
              // 出现 tabindex 就说明有人给目录套了 roving tabindex：
              // 那会让用户按一次 Tab 只能进组，再也没法直接 Tab 到某一节
              if (el.hasAttribute('tabindex'))
                throw new Error('link 不该有 tabindex：锚点导航不做 roving tabindex')
            })
          },
        },
      ],
    },
    {
      name: '指示条可以整个不渲染：其余部件照常，当前项仍由 aria-current 说清楚',
      spec: { apg: APG },
      props: { defaultValue: 'usage' },
      fixture: () => ({
        part: 'root',
        tag: 'nav',
        children: [
          {
            part: 'list',
            tag: 'ul',
            children: VALUES.map((v): FixtureNode => ({
              part: 'item',
              tag: 'li',
              children: [{ part: 'link', tag: 'a', text: `第 ${v} 节`, attrs: { value: v } }],
            })),
          },
        ],
      }),
      initial: {
        counts: { root: 1, list: 1, item: 3, link: 3 },
        parts: {
          'link[1]': { 'aria-current': null },
          'link[2]': { 'aria-current': 'location', 'data-active': '' },
        },
      },
    },
  ],
}
