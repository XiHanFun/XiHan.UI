import type { ConformanceSuite } from '../conformance/types'
import { paginationAnatomy, paginationKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

// APG 没有 pagination 模式：分页器是一组独立按钮放在 nav 地标里，
// 规格出处因此指向 button 模式与 aria-current 的属性定义。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'
const ARIA_CURRENT = 'https://w3c.github.io/aria/#aria-current'

function q(doc: Document, part: string): HTMLElement | null {
  return doc.querySelector<HTMLElement>(`[data-scope="pagination"][data-part="${part}"]`)
}

/**
 * 作者手写的页码节点：1 / 2 / 3 / … / 10。
 * 序列本身（哪几页该出、省略号落在哪）是纯函数的活，由 headless 单测按不变量守；
 * 这里固定成一组节点，验的是"给定页码，属性该长什么样"。
 */
export const paginationSuite: ConformanceSuite = {
  component: 'pagination',
  anatomy: paginationAnatomy,
  keyboard: paginationKeyboard,
  fixture: {
    part: 'root',
    tag: 'nav',
    children: [
      { part: 'prev-trigger', tag: 'button', text: '上一页' },
      { part: 'item', tag: 'button', attrs: { value: '1' }, text: '1' },
      { part: 'item', tag: 'button', attrs: { value: '2' }, text: '2' },
      { part: 'item', tag: 'button', attrs: { value: '3' }, text: '3' },
      { part: 'ellipsis', tag: 'span', text: '…' },
      { part: 'item', tag: 'button', attrs: { value: '10' }, text: '10' },
      { part: 'next-trigger', tag: 'button', text: '下一页' },
    ],
  },
  cases: [
    {
      name: '默认第 1 页：root 是带名字的地标，当前页 aria-current=page，prev 原生 disabled',
      spec: { apg: APG, adr: ARIA_CURRENT },
      props: { count: 100, pageSize: 10 },
      initial: {
        order: ['root', 'prev-trigger', 'item[0]', 'item[1]', 'item[2]', 'ellipsis', 'item[3]', 'next-trigger'],
        counts: { 'root': 1, 'prev-trigger': 1, 'item': 4, 'ellipsis': 1, 'next-trigger': 1 },
        parts: {
          'root': {
            'aria-label': 'Pagination',
            // dir 没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向
            'dir': null,
            'data-empty': null,
          },
          'prev-trigger': {
            'type': 'button',
            'aria-label': 'Previous page',
            'disabled': '',
            'data-disabled': '',
          },
          'next-trigger': {
            'type': 'button',
            'aria-label': 'Next page',
            'disabled': null,
            'data-disabled': null,
          },
          'item[0]': {
            'type': 'button',
            'aria-label': 'Page 1',
            'aria-current': 'page',
            'data-selected': '',
            'data-value': '1',
            // 分页不做 roving tabindex：每个页码都该是一个 Tab 停靠点
            'tabindex': null,
            // 集合条目从不输出原生 disabled
            'disabled': null,
          },
          'item[1]': { 'aria-current': null, 'data-selected': null, 'data-value': '2' },
          'item[3]': { 'aria-current': null, 'data-value': '10' },
          // 省略号是纯视觉占位，读屏念 "…" 只会念出标点噪音
          'ellipsis': { 'aria-hidden': 'true', 'role': null },
        },
      },
    },
    {
      name: 'root 必须是 nav：地标语义由标签给，元素只往上打 aria-label',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10 },
      steps: [
        {
          kind: 'raw',
          why: '标签名不进归一化快照，只能直接看节点',
          run: ({ doc }) => {
            const root = q(doc, 'root')
            if (root?.tagName !== 'NAV')
              throw new Error(`pagination.root 必须是 <nav>（aria-label 得挂在地标上才有意义），实际是 <${root?.tagName.toLowerCase()}>`)
          },
        },
      ],
    },
    {
      name: '点页码即跳页：aria-current 跟着搬家，prev 解除禁用',
      spec: { apg: APG, adr: ARIA_CURRENT },
      props: { count: 100, pageSize: 10 },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'item[0]': { 'aria-current': null, 'data-selected': null },
              'item[2]': { 'aria-current': 'page', 'data-selected': '' },
              'prev-trigger': { 'disabled': null, 'data-disabled': null },
            },
          },
        },
      ],
    },
    {
      name: '上一页 / 下一页各走一页',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10 },
      steps: [
        { kind: 'click', part: 'next-trigger', expect: { parts: { 'item[1]': { 'aria-current': 'page' } } } },
        {
          kind: 'click',
          part: 'next-trigger',
          expect: { parts: { 'item[1]': { 'aria-current': null }, 'item[2]': { 'aria-current': 'page' } } },
        },
        { kind: 'click', part: 'prev-trigger', expect: { parts: { 'item[1]': { 'aria-current': 'page' } } } },
      ],
    },
    {
      name: '末页：next 转原生 disabled，prev 恢复可用',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10, defaultPage: 10 },
      initial: {
        parts: {
          'item[3]': { 'aria-current': 'page', 'data-selected': '' },
          'item[0]': { 'aria-current': null },
          'next-trigger': { 'disabled': '', 'data-disabled': '' },
          'prev-trigger': { disabled: null },
        },
      },
    },
    {
      // 走 dispatchEvent 而不是 click：禁用按钮上 el.click() 被激活行为短路，事件不派发
      name: '首页时 prev 推不动：合成 click 也不会绕回末页',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10 },
      steps: [
        dispatchClickOnDisabled('pagination', 'prev-trigger', {
          parts: {
            'item[0]': { 'aria-current': 'page' },
            'item[3]': { 'aria-current': null },
          },
        }),
      ],
    },
    {
      name: '末页时 next 推不动：合成 click 也不会绕回首页',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10, defaultPage: 10 },
      steps: [
        dispatchClickOnDisabled('pagination', 'next-trigger', {
          parts: {
            'item[3]': { 'aria-current': 'page' },
            'item[0]': { 'aria-current': null },
          },
        }),
      ],
    },
    {
      name: '受控 page：宿主不写回则页码纹丝不动，写回后跟着走',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10, page: 2 },
      initial: { parts: { 'item[1]': { 'aria-current': 'page' } } },
      steps: [
        {
          kind: 'click',
          part: 'item[2]',
          expect: {
            parts: {
              'item[1]': { 'aria-current': 'page' },
              'item[2]': { 'aria-current': null },
            },
          },
        },
        {
          kind: 'setProps',
          props: { page: 3 },
          expect: {
            parts: {
              'item[1]': { 'aria-current': null },
              'item[2]': { 'aria-current': 'page' },
            },
          },
        },
      ],
    },
    {
      name: 'count 变小：当前页夹回末页，next 随之禁用',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10, defaultPage: 10 },
      initial: { parts: { 'item[3]': { 'aria-current': 'page' } } },
      steps: [
        {
          // 数据被筛掉一批后，停在第 10 页的分页器自己退回第 3 页
          kind: 'setProps',
          props: { count: 25 },
          expect: {
            parts: {
              'item[3]': { 'aria-current': null, 'data-selected': null },
              'item[2]': { 'aria-current': 'page' },
              'next-trigger': { disabled: '' },
              'prev-trigger': { disabled: null },
            },
          },
        },
      ],
    },
    {
      name: '无数据：两端都禁用，且没有页码自称当前项',
      spec: { apg: APG, adr: ARIA_CURRENT },
      props: { count: 0, pageSize: 10 },
      initial: {
        parts: {
          'root': { 'data-empty': '' },
          'prev-trigger': { disabled: '' },
          'next-trigger': { disabled: '' },
          // 一页都没有，"停在第 1 页"只是兜底读数，不该让某个页码冒充当前项
          'item[0]': { 'aria-current': null, 'data-selected': null },
        },
      },
    },
    {
      name: 'dir=rtl 写到根节点上：页码排版交给浏览器，前后翻页的语义不翻转',
      spec: { apg: APG },
      props: { count: 100, pageSize: 10, defaultPage: 2, dir: 'rtl' },
      initial: { parts: { root: { dir: 'rtl' } } },
      steps: [
        // "上一页"在 RTL 下依然是 page - 1
        { kind: 'click', part: 'prev-trigger', expect: { parts: { 'item[0]': { 'aria-current': 'page' } } } },
      ],
    },
    {
      name: 'Enter / Space 由原生按钮负责：三个可点部件都得是 <button type="button">',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['pagination.kbd.item', 'pagination.kbd.prev', 'pagination.kbd.next'],
      props: { count: 100, pageSize: 10, defaultPage: 2 },
      steps: [
        nativeActivation('pagination', 'item'),
        nativeActivation('pagination', 'prev-trigger'),
        nativeActivation('pagination', 'next-trigger'),
      ],
    },
    {
      name: 'Tab 序列：每个可用按钮各占一个停靠点，禁用的那个自动脱序',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['pagination.kbd.tab'],
      props: { count: 100, pageSize: 10 },
      steps: [
        {
          kind: 'raw',
          why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；jsdom 也不会真的移动焦点',
          run: ({ doc }) => {
            const nodes = [...doc.querySelectorAll<HTMLElement>(
              '[data-scope="pagination"][data-part="item"],'
              + '[data-scope="pagination"][data-part="prev-trigger"],'
              + '[data-scope="pagination"][data-part="next-trigger"]',
            )]
            if (nodes.length !== 6)
              throw new Error(`预期 6 个可点部件，实际 ${nodes.length}`)
            for (const el of nodes) {
              // 出现 tabindex 就说明有人给分页器套了 roving tabindex
              if (el.hasAttribute('tabindex'))
                throw new Error(`${el.dataset.part} 上出现了 tabindex="${el.getAttribute('tabindex')}"，分页器不做 roving tabindex`)
            }
            const prev = q(doc, 'prev-trigger')
            if (!prev?.hasAttribute('disabled'))
              throw new Error('首页时 prev-trigger 应带原生 disabled——只有原生禁用才会退出 Tab 序列')
          },
        },
      ],
    },
  ],
}
