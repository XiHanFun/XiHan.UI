import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { breadcrumbAnatomy, breadcrumbKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/'

const LINK = '[data-scope="breadcrumb"][data-part="link"]'

/**
 * 一条四层的路径，中间折叠掉一层：
 * 首页 / … / 文档 / 面包屑（末条是当前页）。
 * separator 与 ellipsis 都是 ol 的直接子 li——ol 里只放得下 li。
 */
const breadcrumbTree: FixtureNode = {
  part: 'root',
  tag: 'nav',
  children: [
    {
      part: 'list',
      tag: 'ol',
      children: [
        { part: 'item', tag: 'li', children: [{ part: 'link', tag: 'a', text: '首页', attrs: { href: '/' } }] },
        { part: 'separator', tag: 'li', text: '/' },
        { part: 'ellipsis', tag: 'li', text: '…' },
        { part: 'separator', tag: 'li', text: '/' },
        { part: 'item', tag: 'li', children: [{ part: 'link', tag: 'a', text: '文档', attrs: { href: '/docs' } }] },
        { part: 'separator', tag: 'li', text: '/' },
        {
          part: 'item',
          tag: 'li',
          children: [{ part: 'link', tag: 'a', text: '面包屑', attrs: { href: '/docs/breadcrumb', current: '' } }],
        },
      ],
    },
  ],
}

/**
 * 「当前页那条点不动」不能靠 click 步骤：它走的是 el.click()，
 * 而合成事件默认 cancelable=false 时 preventDefault 是空操作、defaultPrevented 恒为 false，
 * 断言会恒绿——删掉那道守卫照样全过。必须自己建可取消的事件再读 defaultPrevented。
 */
function clickIsPrevented(index: number, expected: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '合成事件默认 cancelable=false，在它身上 preventDefault 是空操作；断言要能咬只能自己建可取消事件',
    run: ({ doc }) => {
      const el = doc.querySelectorAll<HTMLElement>(LINK)[index]
      if (!el)
        throw new Error(`找不到第 ${index} 条 link`)
      const event = new MouseEvent('click', { bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      if (event.defaultPrevented !== expected) {
        throw new Error(
          expected
            ? '当前页那条的点击没有被拦下：作者写在上面的 href 会把页面重新跳一遍（白闪一次、滚动位置全丢）'
            : '非当前页的点击被拦下了：链接就此彻底跳不动',
        )
      }
    },
  }
}

export const breadcrumbSuite: ConformanceSuite = {
  component: 'breadcrumb',
  anatomy: breadcrumbAnatomy,
  keyboard: breadcrumbKeyboard,
  fixture: breadcrumbTree,
  cases: [
    {
      name: '默认：nav 地标带名字，分隔符与省略号对读屏隐藏，dir 不写',
      spec: { apg: APG },
      initial: {
        order: [
          'root',
          'list',
          'item[0]',
          'link[0]',
          'separator[0]',
          'ellipsis',
          'separator[1]',
          'item[1]',
          'link[1]',
          'separator[2]',
          'item[2]',
          'link[2]',
        ],
        counts: { root: 1, list: 1, item: 3, link: 3, separator: 3, ellipsis: 1 },
        parts: {
          // 写死 ltr 会切断从 RTL 祖先继承来的方向，作者没给就不该出现 dir
          'root': { 'aria-label': 'Breadcrumb', 'dir': null },
          'list': { role: null },
          'item[0]': { role: null },
          'separator[0]': { 'aria-hidden': 'true' },
          'ellipsis': { 'aria-hidden': 'true' },
        },
      },
    },
    {
      name: '非当前页那条：不写 aria-current、不写 tabindex，aria-disabled 显式 false',
      spec: { apg: `${APG}#wai-ariaroles,statesandproperties` },
      initial: {
        parts: {
          'link[0]': {
            // aria-current 的默认值就是 "false"，省略即"不是当前项"
            'aria-current': null,
            // 这个是布尔 aria：省略是"没说"，显式 false 是"明确说了不是"
            'aria-disabled': 'false',
            // <a href> 本来就在 Tab 序列里，补 tabindex 只会无谓地多一层
            'tabindex': null,
            'data-current': null,
          },
          'link[1]': { 'aria-current': null, 'aria-disabled': 'false' },
        },
      },
    },
    {
      name: '当前页那条：aria-current=page + aria-disabled=true + 脱出 Tab 序列',
      spec: { apg: `${APG}#wai-ariaroles,statesandproperties` },
      initial: {
        parts: {
          'link[2]': {
            'aria-current': 'page',
            'aria-disabled': 'true',
            'tabindex': '-1',
            'data-current': '',
          },
        },
      },
    },
    {
      name: '当前页那条点不动，其余照常放行',
      spec: { apg: APG },
      steps: [
        clickIsPrevented(2, true),
        clickIsPrevented(0, false),
      ],
    },
    {
      name: 'Enter 跟随链接由原生 <a> 负责；Tab 序列里只有当前页那条脱序',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['breadcrumb.kbd.link', 'breadcrumb.kbd.tab'],
      steps: [
        {
          kind: 'raw',
          why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；jsdom 也不会真的移动焦点',
          run: ({ doc }) => {
            const links = [...doc.querySelectorAll<HTMLElement>(LINK)]
            if (links.length !== 3)
              throw new Error(`预期 3 条 link，实际 ${links.length}`)
            for (const el of links) {
              // 跟随链接这件事我们一行代码都没写，全靠平台——那它就必须真的是个 <a>
              if (el.tagName !== 'A')
                throw new Error(`link 必须是原生 <a>（Enter 的跟随由平台负责），实际是 <${el.tagName.toLowerCase()}>`)
              const current = el.getAttribute('aria-current') === 'page'
              const tabindex = el.getAttribute('tabindex')
              if (current && tabindex !== '-1')
                throw new Error(`当前页那条应带 tabindex="-1" 脱出 Tab 序列，实际 ${JSON.stringify(tabindex)}`)
              // 出现 tabindex 就说明有人给面包屑套了 roving tabindex：
              // 那会让用户按一次 Tab 只能进组，再也没法直接 Tab 到某一层
              if (!current && tabindex !== null)
                throw new Error(`非当前页那条不该有 tabindex（实际 ${JSON.stringify(tabindex)}）：面包屑不做 roving tabindex`)
            }
          },
        },
      ],
    },
    {
      name: 'translations 覆盖地标名字',
      spec: { apg: APG },
      props: { translations: { root: '面包屑导航' } },
      initial: { parts: { root: { 'aria-label': '面包屑导航' } } },
    },
    {
      name: 'dir=rtl 写到根节点上：整条路径的排版交给浏览器',
      spec: { apg: APG },
      props: { dir: 'rtl' },
      initial: { parts: { root: { dir: 'rtl' } } },
    },
    {
      name: '一层都不折叠时省略号可以整个不渲染，其余部件照常',
      spec: { apg: APG },
      fixture: () => ({
        part: 'root',
        tag: 'nav',
        children: [
          {
            part: 'list',
            tag: 'ol',
            children: [
              { part: 'item', tag: 'li', children: [{ part: 'link', tag: 'a', text: '首页', attrs: { href: '/' } }] },
              { part: 'separator', tag: 'li', text: '/' },
              { part: 'item', tag: 'li', children: [{ part: 'link', tag: 'a', text: '文档', attrs: { href: '/docs', current: '' } }] },
            ],
          },
        ],
      }),
      initial: {
        order: ['root', 'list', 'item[0]', 'link[0]', 'separator', 'item[1]', 'link[1]'],
        counts: { root: 1, list: 1, item: 2, link: 2, separator: 1 },
        parts: {
          'link[0]': { 'aria-current': null, 'tabindex': null },
          'link[1]': { 'aria-current': 'page', 'tabindex': '-1' },
        },
      },
    },
  ],
}
