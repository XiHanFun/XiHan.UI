import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { anchorAnatomy, anchorKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/navigation.html'

const LINK = '[data-scope="anchor"][data-part="link"]'

const VALUES = ['intro', 'install', 'usage'] as const

/**
 * 三条目录 + 一根指示条；指示条与条目同为 list（ul）的 li 子节点。
 *
 * 目标区块（`<section id=...>`）不放进来：组件量不到区块，滚动观察不开口，
 * 激活项只由 defaultValue / value / 点击决定。
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

/** 派一个可取消的 click 事件，断言原生跳转是否被拦下。 */
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
          // 作者没给 dir 时不输出 dir
          'root': { 'aria-label': 'Anchor navigation', 'data-orientation': 'vertical', 'dir': null },
          'list': { 'data-orientation': 'vertical', 'role': null },
          'link[0]': {
            'data-value': 'intro',
            // 省略 aria-current 即非当前项
            'aria-current': null,
            'data-active': null,
          },
          'link[2]': { 'data-value': 'usage' },
          // 无激活项时指示条整条收起
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
          // 页内位置用 location，不用 page
          'link[1]': { 'aria-current': 'location', 'data-active': '' },
          'link[2]': { 'aria-current': null, 'data-active': null },
        },
      },
    },
    {
      // 指示条坐标写在内联 style 上，不进快照；这里只验它现身
      name: '有激活项时指示条现身（量测推迟到 DOM 落定之后才做）',
      spec: { apg: APG },
      props: { defaultValue: 'install' },
      steps: [
        // 量测推迟到 DOM 落定之后，等它落下来
        {
          kind: 'settle',
          until: { attr: { part: 'indicator', name: 'hidden', value: null } },
          expect: {
            parts: {
              // 指示条只是视觉，对读屏隐藏
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
              // 跟随链接由平台负责，必须是原生 <a>
              if (el.tagName !== 'A')
                throw new Error(`link 必须是原生 <a>（Enter 的跟随由平台负责），实际是 <${el.tagName.toLowerCase()}>`)
              // href 由 value 派生；href 不进快照，直接读 DOM 验
              const href = el.getAttribute('href')
              if (href !== `#${VALUES[i]}`)
                throw new Error(`link 的 href 应由 value 派生成 "#${VALUES[i]}"，实际 ${JSON.stringify(href)}`)
              // 出现 tabindex 即说明套了 roving tabindex
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
