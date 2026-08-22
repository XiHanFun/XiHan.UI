import type { SideNavNode } from '@xihan-ui/headless'
import type { AttrExpectation, ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { sideNavAnatomy, sideNavKeyboard } from '@xihan-ui/headless'
import { nativeActivation } from './shared/native-activation'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/'

/**
 * 树数据是层级与 href 的唯一事实源，作者标记只管长相，两者必须同源。
 * 一条顶层链接加两个分支：上下键要跨过收起的子层、展开后子行才入序列，
 * 两个分支才分得出手风琴与换枝弹出。
 */
const COLLECTION: SideNavNode[] = [
  { value: 'home', label: 'Home', href: '#home' },
  {
    value: 'user',
    label: 'User',
    children: [
      { value: 'user-list', label: 'User list', href: '#user-list' },
      { value: 'user-role', label: 'User role', href: '#user-role' },
    ],
  },
  {
    value: 'order',
    label: 'Order',
    children: [{ value: 'order-list', label: 'Order list', href: '#order-list' }],
  },
]

/** 每个用例都得带上同一份 collection：没有它，标记里的节点报不出 href 与层级。 */
function props(extra: Readonly<Record<string, unknown>> = {}): Readonly<Record<string, unknown>> {
  return { collection: COLLECTION, ...extra }
}

function link(value: string, text: string): FixtureNode {
  return {
    part: 'link',
    tag: 'a',
    attrs: { value },
    children: [{ part: 'link-text', tag: 'span', text }],
  }
}

function branch(value: string, text: string, children: readonly FixtureNode[]): FixtureNode {
  return {
    part: 'branch',
    tag: 'li',
    attrs: { value },
    children: [
      {
        part: 'branch-trigger',
        tag: 'button',
        children: [
          { part: 'branch-text', tag: 'span', text },
          { part: 'branch-indicator', tag: 'span' },
        ],
      },
      { part: 'branch-content', tag: 'ul', children },
    ],
  }
}

// 文档序下标：branch = [user, order]，link = [home, user-list, user-role, order-list]
const FIXTURE: FixtureNode = {
  part: 'root',
  tag: 'nav',
  children: [
    {
      part: 'list',
      tag: 'ul',
      children: [
        link('home', 'Home'),
        branch('user', 'User', [link('user-list', 'User list'), link('user-role', 'User role')]),
        branch('order', 'Order', [link('order-list', 'Order list')]),
      ],
    },
  ],
}

/** 两个分支的展开期望，逐个写全——只写关心的那个会漏掉"另一个也开了"。 */
function triggersExpanded(...values: readonly string[]): readonly AttrExpectation[] {
  return ['user', 'order'].map(v => ({
    'aria-expanded': values.includes(v) ? 'true' : 'false',
    'data-state': values.includes(v) ? 'open' : 'closed',
  }))
}

function branchesExpanded(...values: readonly string[]): readonly AttrExpectation[] {
  return ['user', 'order'].map(v => ({ 'data-state': values.includes(v) ? 'open' : 'closed' }))
}

/** 子层容器的 hidden 与展开态逐一对应，一起写才拦得住"标了开却没露出来"。 */
function contentsShown(...values: readonly string[]): readonly AttrExpectation[] {
  return ['user', 'order'].map(v => ({
    'data-state': values.includes(v) ? 'open' : 'closed',
    'hidden': values.includes(v) ? null : '',
  }))
}

/** 四条链接的选中期望，逐个写全。 */
function linksSelected(...values: readonly string[]): readonly AttrExpectation[] {
  return ['home', 'user-list', 'user-role', 'order-list'].map(v => ({
    'aria-current': values.includes(v) ? 'page' : null,
    'data-current': values.includes(v) ? '' : null,
  }))
}

/** 选中项的祖先分支点亮 data-in-path。 */
function triggersActive(...values: readonly string[]): readonly AttrExpectation[] {
  return ['user', 'order'].map(v => ({ 'data-in-path': values.includes(v) ? '' : null }))
}

/** 折叠态弹出面板的开合期望：定位层、面板与触发按钮三处同步。 */
function popoutOpen(index: number, open: boolean): NonNullable<StepWithExpect['expect']> {
  return {
    parts: {
      [`positioner[${index}]`]: { 'data-state': open ? 'open' : 'closed', 'hidden': open ? null : '' },
      [`branch-content[${index}]`]: { 'data-popout': '', 'data-state': open ? 'open' : 'closed', 'hidden': open ? null : '' },
      [`branch-trigger[${index}]`]: { 'aria-expanded': open ? 'true' : 'false', 'data-state': open ? 'open' : 'closed' },
    },
  }
}

/** 链接是原生 <a href>：Enter 的激活由平台完成，jsdom 不翻译按键，该守的是"它确实是带 href 的链接"。 */
function nativeLink(): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Enter 激活链接靠原生 <a href>，jsdom 不翻译按键；该守的是"它确实是带 href 的链接"',
    run: ({ doc }) => {
      const links = [...doc.querySelectorAll<HTMLElement>('[data-scope="side-nav"][data-part="link"]')]
      if (!links.length)
        throw new Error('找不到 side-nav 的 link 部件')
      for (const el of links) {
        if (el.tagName !== 'A')
          throw new Error(`side-nav.link 必须是原生 <a>（Enter 的激活由平台负责），实际是 <${el.tagName.toLowerCase()}>`)
        if (!el.getAttribute('href'))
          throw new Error(`side-nav.link[data-value="${el.dataset.value}"] 缺 href：没有去处的链接按 Enter 什么都不发生`)
      }
    },
  }
}

/**
 * roving tabindex：整个侧栏只留一个 Tab 停靠点。
 * 共用助手只数一种 part，而侧栏的停靠点可能落在 link 也可能落在 branch-trigger，就地写一个。
 */
function singleSideNavTabStop(): StepWithExpect {
  return {
    kind: 'raw',
    why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；侧栏的锚点在 link 与 branch-trigger 两种 part 上都可能出现',
    run: ({ doc }) => {
      const rows = [...doc.querySelectorAll<HTMLElement>(
        '[data-scope="side-nav"][data-part="link"],[data-scope="side-nav"][data-part="branch-trigger"]',
      )]
      const stops = rows.filter(el => el.getAttribute('tabindex') === '0')
      if (stops.length !== 1)
        throw new Error(`side-nav 内有 ${stops.length} 个 Tab 停靠点，应当恰好一个`)
    },
  }
}

/** 原生的 getComputedStyle，伪造退场动画期间暂存，结束后放回。 */
let nativeComputedStyle: Window['getComputedStyle'] | null = null

/**
 * 给收起态的定位层伪造一支退场动画：无头 DOM 不把样式表里的 animation 算进
 * getComputedStyle，退场闸门那条路走不到；这里让它读到 xh-pop-out 并申领租约。
 */
function fakePopOutAnimation(on: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '无头 DOM 里 animationName 恒为空串，退场闸门申领不了租约；换枝时旧面板留位的事实只能靠伪造的退场动画验',
    run: ({ doc }) => {
      const win = doc.defaultView!
      if (!on) {
        if (nativeComputedStyle)
          win.getComputedStyle = nativeComputedStyle
        nativeComputedStyle = null
        return
      }
      const native = win.getComputedStyle
      nativeComputedStyle = native
      win.getComputedStyle = (el: Element, pseudo?: string | null): CSSStyleDeclaration => {
        const style = native.call(win, el, pseudo)
        const exiting = el.getAttribute('data-scope') === 'side-nav'
          && el.getAttribute('data-part') === 'positioner'
          && el.getAttribute('data-state') === 'closed'
        if (!exiting)
          return style
        return new Proxy(style, {
          get(target, key) {
            if (key === 'animationName')
              return 'xh-pop-out'
            if (key === 'display')
              return 'block'
            const value = Reflect.get(target, key)
            return typeof value === 'function' ? value.bind(target) : value
          },
        })
      }
    },
  }
}

/** 让第 index 个定位层的伪造退场动画结束：派一次自己的 animationend。 */
function finishPopOutAnimation(index: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '退场动画的结束信号由平台派发，无头 DOM 里只能手工派 animationend',
    run: async ({ doc, flush }) => {
      const el = doc.querySelectorAll<HTMLElement>('[data-scope="side-nav"][data-part="positioner"]')[index]
      if (!el)
        throw new Error(`找不到第 ${index} 个 positioner`)
      const event = new Event('animationend', { bubbles: true })
      Object.defineProperty(event, 'animationName', { value: 'xh-pop-out' })
      el.dispatchEvent(event)
      await flush()
    },
  }
}

export const sideNavSuite: ConformanceSuite = {
  component: 'side-nav',
  anatomy: sideNavAnatomy,
  keyboard: sideNavKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      // Enter / Space 由平台的按钮激活行为翻成 click，我们不自己接这两个键；
      // 点击后的展开收起由后续步骤验
      name: 'Enter / Space 展开收起：branch-trigger 是原生 <button type="button">，点击切换展开态',
      spec: { apg: APG },
      props: props(),
      covers: ['side-nav.kbd.activate'],
      steps: [
        nativeActivation('side-nav', 'branch-trigger'),
        {
          kind: 'click',
          part: 'branch-trigger[0]',
          expect: {
            activeElement: { part: 'branch-trigger[0]', exact: true },
            parts: { 'branch-trigger': triggersExpanded('user'), 'branch': branchesExpanded('user'), 'branch-content': contentsShown('user') },
          },
        },
        {
          kind: 'click',
          part: 'branch-trigger[0]',
          expect: {
            parts: { 'branch-trigger': triggersExpanded(), 'branch': branchesExpanded(), 'branch-content': contentsShown() },
          },
        },
      ],
    },
    {
      name: 'Enter 激活链接：link 是原生 <a href>；激活后落选中，祖先分支点亮',
      spec: { apg: APG },
      props: props({ defaultExpandedValue: ['user'] }),
      covers: ['side-nav.kbd.link'],
      steps: [
        nativeLink(),
        {
          kind: 'click',
          part: 'link[1]',
          expect: {
            parts: {
              'link': linksSelected('user-list'),
              'branch-trigger': triggersActive('user'),
              'branch': triggersActive('user'),
            },
            events: [{ type: 'value-change', detail: { value: 'user-list' } }],
          },
        },
        {
          kind: 'click',
          part: 'link[0]',
          expect: {
            parts: { 'link': linksSelected('home'), 'branch-trigger': triggersActive(), 'branch': triggersActive() },
            events: [{ type: 'value-change', detail: { value: 'home' } }],
          },
        },
      ],
    },
    {
      name: '初始：nav 地标、分支按钮与子层 aria-controls 配对、子层收起、首行认领 Tab 位',
      spec: { apg: APG },
      props: props(),
      initial: {
        order: [
          'root',
          'list',
          'link[0]',
          'link-text[0]',
          'branch[0]',
          'branch-trigger[0]',
          'branch-text[0]',
          'branch-indicator[0]',
          'branch-content[0]',
          'link[1]',
          'link-text[1]',
          'link[2]',
          'link-text[2]',
          'branch[1]',
          'branch-trigger[1]',
          'branch-text[1]',
          'branch-indicator[1]',
          'branch-content[1]',
          'link[3]',
          'link-text[3]',
        ],
        counts: {
          'root': 1,
          'list': 1,
          'branch': 2,
          'branch-trigger': 2,
          'branch-text': 2,
          'branch-indicator': 2,
          'branch-content': 2,
          'positioner': 0,
          'link': 4,
          'link-text': 4,
        },
        parts: {
          'root': { 'role': 'navigation', 'aria-label': 'Sidebar', 'data-collapsed': null, 'data-disabled': null, 'dir': null },
          'list': { 'data-collapsed': null },
          'branch[0]': { 'data-state': 'closed', 'data-in-path': null, 'data-disabled': null },
          'branch-trigger[0]': {
            'type': 'button',
            'id': '@self',
            'data-value': 'user',
            'aria-expanded': 'false',
            'aria-controls': '@part(branch-content[0])',
            'data-state': 'closed',
            'data-in-path': null,
            'data-disabled': null,
            'disabled': null,
            'tabindex': '-1',
          },
          'branch-trigger[1]': { 'data-value': 'order', 'aria-controls': '@part(branch-content[1])', 'tabindex': '-1' },
          'branch-indicator[0]': { 'aria-hidden': 'true', 'data-state': 'closed' },
          'branch-content[0]': { 'id': '@self', 'data-state': 'closed', 'hidden': '', 'data-popout': null },
          'link[0]': {
            'data-value': 'home',
            'aria-current': null,
            'data-current': null,
            'data-disabled': null,
            'aria-disabled': null,
            'tabindex': '0',
          },
          'link[1]': { 'data-value': 'user-list', 'tabindex': '-1' },
          'link[3]': { 'data-value': 'order-list', 'tabindex': '-1' },
        },
      },
      steps: [singleSideNavTabStop()],
    },
    {
      name: '焦点进入侧栏落在选中项上，不是落在首行；选中项的祖先分支点亮',
      spec: { apg: APG },
      props: props({ defaultValue: 'user-role', defaultExpandedValue: ['user'] }),
      initial: {
        parts: {
          'link': linksSelected('user-role'),
          'link[0]': { tabindex: '-1' },
          'link[2]': { tabindex: '0' },
          'branch-trigger': triggersActive('user'),
        },
      },
      steps: [singleSideNavTabStop()],
    },
    {
      name: '上下键走可见行：收起的子层一行不算，loop 默认关所以首尾不回绕；Home / End 到两端',
      spec: { apg: APG },
      props: props(),
      covers: ['side-nav.kbd.down', 'side-nav.kbd.up', 'side-nav.kbd.home', 'side-nav.kbd.end'],
      steps: [
        { kind: 'focus', part: 'link[0]', expect: { activeElement: { part: 'link[0]', exact: true } } },
        // user 收着：下一行是 user 的按钮，再下一行跨过它的子链接直接到 order
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            activeElement: { part: 'branch-trigger[0]', exact: true },
            parts: { 'branch-trigger[0]': { tabindex: '0' }, 'link[0]': { tabindex: '-1' } },
          },
        },
        singleSideNavTabStop(),
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch-trigger[1]', exact: true } } },
        // 末行不回绕
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch-trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'link[0]', exact: true } } },
        // 首行不回绕
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'link[0]', exact: true } } },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'branch-trigger[1]', exact: true },
            // 走了这么一圈，展开与选中都不该动
            parts: { 'branch-trigger': triggersExpanded(), 'link': linksSelected() },
          },
        },
      ],
    },
    {
      name: 'loop=true：首尾回绕',
      spec: { apg: APG },
      props: props({ loop: true }),
      covers: ['side-nav.kbd.down', 'side-nav.kbd.up'],
      steps: [
        { kind: 'focus', part: 'link[0]' },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'branch-trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[0]', exact: true } } },
      ],
    },
    {
      name: '展开之后子行进入序列，End 落到最后一个可见子行',
      spec: { apg: APG },
      props: props({ defaultExpandedValue: ['user', 'order'] }),
      covers: ['side-nav.kbd.down', 'side-nav.kbd.end'],
      initial: {
        parts: { 'branch-trigger': triggersExpanded('user', 'order'), 'branch-content': contentsShown('user', 'order') },
      },
      steps: [
        { kind: 'focus', part: 'link[0]' },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[2]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'branch-trigger[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[3]', exact: true } } },
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'link[0]', exact: true } } },
        { kind: 'key', key: 'End', expect: { activeElement: { part: 'link[3]', exact: true } } },
      ],
    },
    {
      name: '右键展开、再右键进第一个子行；左键回父分支、再左键收起；顶层与叶子上不越界',
      spec: { apg: APG },
      props: props(),
      covers: ['side-nav.kbd.expand', 'side-nav.kbd.collapse'],
      steps: [
        { kind: 'focus', part: 'branch-trigger[0]', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            // 展开只改展开态，焦点留在分支按钮上
            activeElement: { part: 'branch-trigger[0]', exact: true },
            parts: {
              'branch-trigger': triggersExpanded('user'),
              'branch': branchesExpanded('user'),
              'branch-content': contentsShown('user'),
              'branch-indicator[0]': { 'data-state': 'open' },
            },
          },
        },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'link[1]', exact: true } } },
        // 叶子上的右键什么都不做
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'link[1]', exact: true } } },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[2]', exact: true } } },
        // 叶子上的左键回父分支
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            activeElement: { part: 'branch-trigger[0]', exact: true },
            parts: {
              'branch-trigger': triggersExpanded(),
              'branch': branchesExpanded(),
              'branch-content': contentsShown(),
              'branch-indicator[0]': { 'data-state': 'closed' },
            },
          },
        },
        // 顶层收起的分支没有父，左键什么也不做
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        // 顶层链接上左右键都不做事
        { kind: 'key', key: 'Home', expect: { activeElement: { part: 'link[0]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'link[0]', exact: true }, parts: { 'branch-trigger': triggersExpanded() } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'link[0]', exact: true } } },
      ],
    },
    {
      name: 'dir=rtl 把左右键的展开/收起对调',
      spec: { apg: APG },
      props: props({ dir: 'rtl' }),
      covers: ['side-nav.kbd.expand', 'side-nav.kbd.collapse'],
      initial: { parts: { root: { dir: 'rtl' } } },
      steps: [
        { kind: 'focus', part: 'branch-trigger[0]' },
        { kind: 'key', key: 'ArrowLeft', expect: { parts: { 'branch-trigger': triggersExpanded('user') } } },
        { kind: 'key', key: 'ArrowLeft', expect: { activeElement: { part: 'link[1]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowRight', expect: { parts: { 'branch-trigger': triggersExpanded() } } },
      ],
    },
    {
      name: 'accordion：展开一枝收起同层其余',
      spec: { apg: APG },
      props: props({ accordion: true }),
      steps: [
        { kind: 'click', part: 'branch-trigger[0]', expect: { parts: { 'branch-trigger': triggersExpanded('user') } } },
        {
          kind: 'click',
          part: 'branch-trigger[1]',
          expect: { parts: { 'branch-trigger': triggersExpanded('order'), 'branch-content': contentsShown('order') } },
        },
      ],
    },
    {
      name: '受控 expandedValue / value：宿主不写回则纹丝不动',
      spec: { adr: 'controlled-uncontrolled' },
      props: props({ expandedValue: [], value: 'home' }),
      initial: { parts: { link: linksSelected('home') } },
      steps: [
        {
          kind: 'click',
          part: 'branch-trigger[0]',
          expect: { parts: { 'branch-trigger': triggersExpanded(), 'branch-content': contentsShown() } },
        },
        {
          kind: 'click',
          part: 'link[1]',
          expect: {
            parts: { link: linksSelected('home') },
            events: [{ type: 'value-change', detail: { value: 'user-list' } }],
          },
        },
        {
          kind: 'setProps',
          props: { expandedValue: ['user'], value: 'user-role' },
          expect: {
            parts: {
              'branch-trigger': triggersExpanded('user'),
              'branch-content': contentsShown('user'),
              'link': linksSelected('user-role'),
            },
          },
        },
      ],
    },
    {
      name: '整个侧栏禁用：分支按钮原生禁用、链接 aria-disabled，点击改不了展开与选中',
      spec: { apg: APG },
      props: props({ defaultExpandedValue: ['user'], disabled: true }),
      initial: {
        parts: {
          'root': { 'data-disabled': '' },
          'branch[0]': { 'data-disabled': '' },
          'branch-trigger[0]': { 'disabled': '', 'data-disabled': '' },
          'link[0]': { 'aria-disabled': 'true', 'data-disabled': '' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'branch-trigger[1]',
          expect: { parts: { 'branch-trigger': triggersExpanded('user'), 'branch-content': contentsShown('user') } },
        },
        { kind: 'click', part: 'link[1]', expect: { parts: { link: linksSelected() }, events: [] } },
      ],
    },
    {
      name: '折叠态初始：根与列表带 data-collapsed，内嵌展开整体收起，顶层子层换装弹出面板',
      spec: { apg: APG },
      props: props({ collapsed: true, defaultExpandedValue: ['user'] }),
      initial: {
        counts: { 'positioner': 2, 'branch-content': 2 },
        parts: {
          'root': { 'data-collapsed': '' },
          'list': { 'data-collapsed': '' },
          'branch-trigger': triggersExpanded(),
          'branch-content[0]': { 'id': '@self', 'data-popout': '', 'data-state': 'closed', 'hidden': '' },
          'branch-content[1]': { 'data-popout': '', 'data-state': 'closed', 'hidden': '' },
          'positioner[0]': { 'id': '@self', 'data-state': 'closed', 'hidden': '' },
          'positioner[1]': { 'data-state': 'closed', 'hidden': '' },
          'branch-trigger[0]': { 'aria-controls': '@part(branch-content[0])' },
          'link[0]': { tabindex: '0' },
        },
      },
      steps: [singleSideNavTabStop()],
    },
    {
      name: '折叠态：右键弹出面板并落焦第一行，面板内上下键走面板序列，左键收回并把焦点还给触发按钮',
      spec: { apg: APG },
      props: props({ collapsed: true }),
      covers: ['side-nav.kbd.popout-open', 'side-nav.kbd.popout-close'],
      steps: [
        { kind: 'focus', part: 'branch-trigger[0]', expect: { activeElement: { part: 'branch-trigger[0]', exact: true } } },
        { kind: 'key', key: 'ArrowRight' },
        {
          kind: 'settle',
          until: { activeElement: 'link[1]' },
          expect: { ...popoutOpen(0, true), activeElement: { part: 'link[1]', exact: true } },
        },
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[2]', exact: true } } },
        // 面板内不回绕
        { kind: 'key', key: 'ArrowDown', expect: { activeElement: { part: 'link[2]', exact: true } } },
        { kind: 'key', key: 'ArrowUp', expect: { activeElement: { part: 'link[1]', exact: true } } },
        { kind: 'key', key: 'ArrowLeft' },
        {
          kind: 'settle',
          until: { activeElement: 'branch-trigger[0]' },
          expect: { ...popoutOpen(0, false), activeElement: { part: 'branch-trigger[0]', exact: true } },
        },
      ],
    },
    {
      name: '折叠态：Enter / Space 弹出面板并落焦第一行，Escape 收回并把焦点还给触发按钮',
      spec: { apg: APG },
      props: props({ collapsed: true }),
      covers: ['side-nav.kbd.popout-open', 'side-nav.kbd.popout-close'],
      steps: [
        { kind: 'focus', part: 'branch-trigger[1]' },
        { kind: 'key', key: 'Enter' },
        {
          kind: 'settle',
          until: { activeElement: 'link[3]' },
          expect: { ...popoutOpen(1, true), activeElement: { part: 'link[3]', exact: true } },
        },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { activeElement: 'branch-trigger[1]' },
          expect: { ...popoutOpen(1, false), activeElement: { part: 'branch-trigger[1]', exact: true } },
        },
        { kind: 'key', key: 'Space' },
        {
          kind: 'settle',
          until: { activeElement: 'link[3]' },
          expect: { ...popoutOpen(1, true), activeElement: { part: 'link[3]', exact: true } },
        },
        { kind: 'key', key: 'Escape' },
        {
          kind: 'settle',
          until: { activeElement: 'branch-trigger[1]' },
          expect: popoutOpen(1, false),
        },
      ],
    },
    {
      name: '折叠态 dir=rtl：左键弹出、右键收回',
      spec: { apg: APG },
      props: props({ collapsed: true, dir: 'rtl' }),
      covers: ['side-nav.kbd.popout-open', 'side-nav.kbd.popout-close'],
      steps: [
        { kind: 'focus', part: 'branch-trigger[0]' },
        { kind: 'key', key: 'ArrowLeft' },
        {
          kind: 'settle',
          until: { activeElement: 'link[1]' },
          expect: { ...popoutOpen(0, true), activeElement: { part: 'link[1]', exact: true } },
        },
        { kind: 'key', key: 'ArrowRight' },
        {
          kind: 'settle',
          until: { activeElement: 'branch-trigger[0]' },
          expect: popoutOpen(0, false),
        },
      ],
    },
    {
      name: '折叠态点按：开合与换枝，面板内点链接落选中并收面板',
      spec: { apg: APG },
      props: props({ collapsed: true }),
      steps: [
        { kind: 'click', part: 'branch-trigger[0]', expect: popoutOpen(0, true) },
        // 换枝：先关旧的再开新的；收起押后到退场结束，等定位层真的藏起
        { kind: 'click', part: 'branch-trigger[1]', expect: popoutOpen(1, true) },
        {
          kind: 'settle',
          until: { attr: { part: 'positioner[0]', name: 'hidden', value: '' } },
          expect: { parts: { ...popoutOpen(0, false).parts, ...popoutOpen(1, true).parts } },
        },
        {
          kind: 'click',
          part: 'link[3]',
          expect: { events: [{ type: 'value-change', detail: { value: 'order-list' } }] },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'positioner[1]', name: 'hidden', value: '' } },
          expect: popoutOpen(1, false),
        },
        {
          kind: 'settle',
          until: { activeElement: 'branch-trigger[1]' },
          expect: {
            activeElement: { part: 'branch-trigger[1]', exact: true },
            parts: { 'link': linksSelected('order-list'), 'branch-trigger': triggersActive('order') },
          },
        },
        // 再点一次收回
        { kind: 'click', part: 'branch-trigger[1]', expect: popoutOpen(1, true) },
        { kind: 'click', part: 'branch-trigger[1]' },
        {
          kind: 'settle',
          until: { attr: { part: 'positioner[1]', name: 'hidden', value: '' } },
          expect: popoutOpen(1, false),
        },
      ],
    },
    {
      name: '折叠态换枝：旧面板 data-state=closed 且留在原位直到退场播完，新面板同时 open',
      spec: { apg: APG },
      props: props({ collapsed: true }),
      steps: [
        fakePopOutAnimation(true),
        { kind: 'click', part: 'branch-trigger[0]', expect: popoutOpen(0, true) },
        {
          kind: 'click',
          part: 'branch-trigger[1]',
          expect: {
            parts: {
              // 旧面板：已是收起态但还没藏，坐标仍是它自己名下那份
              'positioner[0]': { 'data-state': 'closed', 'hidden': null, 'data-positioned': '' },
              'branch-content[0]': { 'data-popout': '', 'data-state': 'closed', 'hidden': null },
              'branch-trigger[0]': { 'aria-expanded': 'false', 'data-state': 'closed' },
              ...popoutOpen(1, true).parts,
            },
          },
        },
        finishPopOutAnimation(0),
        fakePopOutAnimation(false),
        {
          kind: 'settle',
          until: { attr: { part: 'positioner[0]', name: 'hidden', value: '' } },
          expect: { parts: { ...popoutOpen(0, false).parts, ...popoutOpen(1, true).parts } },
        },
      ],
    },
    {
      name: 'collapsedPopout=false：纯图标栏，点按与方向键都不弹面板',
      spec: { apg: APG },
      props: props({ collapsed: true, collapsedPopout: false }),
      initial: {
        counts: { positioner: 0 },
        parts: { 'branch-content[0]': { 'data-popout': null, 'hidden': '' } },
      },
      steps: [
        {
          kind: 'click',
          part: 'branch-trigger[0]',
          expect: { parts: { 'branch-trigger': triggersExpanded(), 'branch-content': contentsShown() } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'branch-trigger[0]', exact: true },
            parts: { 'branch-trigger': triggersExpanded(), 'branch-content': contentsShown() },
          },
        },
      ],
    },
  ],
}
