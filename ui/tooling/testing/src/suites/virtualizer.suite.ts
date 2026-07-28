import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { virtualizerAnatomy, virtualizerKeyboard } from '@xihan-ui/headless'

// 虚拟滚动没有 APG 模式可依：可达性的落点是"原生滚动一点都别接管"，
// 出处取 WCAG 里"用键盘也能操作滚动区"那条技术说明。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const SCOPE = '[data-scope="virtualizer"]'

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

/**
 * jsdom 不做布局：offsetHeight / offsetWidth 恒是 0，计算内核会判定"视口一条都排不下"，
 * 一条也不会渲。这里把视口桩成 100×100（一屏正好排得下四条 30px 的），
 * 滚动量做成可读可写，与浏览器一样在两端夹住。
 *
 * 桩打在真实节点上、对两个适配器一视同仁。桩完还要再推一次重排（见 loadData）：
 * 内核只在接上滚动容器那一刻量一次视口，此后靠 ResizeObserver 跟，
 * 而 jsdom 里没有 ResizeObserver。
 */
function stubLayout(doc: Document): void {
  const viewport = findPart(doc, 'viewport')
  let top = 0
  let left = 0
  const clampScroll = (v: number): number => Math.min(Math.max(v, 0), 260)
  Object.defineProperties(viewport, {
    offsetHeight: { configurable: true, get: () => 100 },
    offsetWidth: { configurable: true, get: () => 100 },
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 100 },
    scrollHeight: { configurable: true, get: () => 360 },
    scrollWidth: { configurable: true, get: () => 360 },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = clampScroll(v) } },
    scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = clampScroll(v) } },
  })
}

const layoutStep: StepWithExpect = {
  kind: 'raw',
  why: 'jsdom 不做布局，视口尺寸恒是 0，不桩就永远算不出可视区间，一条也渲不出来',
  run: ({ doc }) => stubLayout(doc),
}

/**
 * 数据到位。这一步同时把桩好的视口尺寸读进内核——
 * 任何 prop 变化都会顺带重量一次视口，这是没有 ResizeObserver 时唯一的尺寸刷新路径。
 */
const loadData: StepWithExpect = { kind: 'setProps', props: { count: 12 } }

/** 原生滚动：改滚动量再派 scroll 事件，与浏览器同序。 */
function scrollTo(offset: number, horizontal = false): StepWithExpect {
  return {
    kind: 'raw',
    why: '滚动是浏览器行为，没有对应的声明式步骤；组件只是跟着 scroll 事件换一批该渲的下标',
    run: ({ doc }) => {
      const viewport = findPart(doc, 'viewport')
      if (horizontal)
        viewport.scrollLeft = offset
      else
        viewport.scrollTop = offset
      viewport.dispatchEvent(new Event('scroll'))
    },
  }
}

/** 内联样式不进归一化快照，只能直接读节点。 */
function assertStyle(part: string, index: number, expected: Record<string, string>): StepWithExpect {
  return {
    kind: 'raw',
    why: '位移与总长写在内联样式里，归一化快照不收 style',
    run: ({ doc }) => {
      const el = findPart(doc, part, index)
      for (const [key, value] of Object.entries(expected)) {
        const actual = el.style.getPropertyValue(key)
        if (actual !== value)
          throw new Error(`${part}[${index}] 的 ${key} 不符：期望 "${value}"，实际 "${actual}"`)
      }
    },
  }
}

// 十二条的池子：作者按 change 事件给出的 virtualItems 渲节点，每条用 value 写明自己是第几条。
// 这里一次写满十二条，方便断言"窗口外的那些被收起来了"——真实用法里作者只渲窗口里那几条。
const items: FixtureNode[] = Array.from({ length: 12 }, (_, i) => ({
  part: 'item',
  attrs: { value: String(i) },
  text: `第 ${i} 条`,
}))

const virtualizerTree: FixtureNode = {
  part: 'root',
  children: [
    { part: 'viewport', children: [{ part: 'content', children: items }] },
  ],
}

/** 每条 30px、视口 100px：一屏排得下 0..3（第 4 条起点 120 已在视口外）。 */
const BASE = { estimateSize: 30, overscan: 0 }

/** 收起态与显形态的属性期望，逐条写太长，用它拼。 */
function itemStates(visible: readonly number[]): Record<string, Record<string, string | null>> {
  const out: Record<string, Record<string, string | null>> = {}
  for (let i = 0; i < 12; i++) {
    out[`item[${i}]`] = visible.includes(i)
      ? { 'data-index': String(i), 'hidden': null }
      : { 'data-index': String(i), 'hidden': '' }
  }
  return out
}

export const virtualizerSuite: ConformanceSuite = {
  component: 'virtualizer',
  anatomy: virtualizerAnatomy,
  keyboard: virtualizerKeyboard,
  fixture: virtualizerTree,
  cases: [
    {
      name: '空列表：总长为零，十二条节点一条都不显形；结构与方向标记就位',
      spec: { apg: WCAG },
      props: BASE,
      initial: {
        order: ['root', 'viewport', 'content', ...Array.from({ length: 12 }, (_, i) => `item[${i}]`)],
        counts: { root: 1, viewport: 1, content: 1, item: 12 },
        parts: {
          'root': { 'data-orientation': 'vertical', 'data-scrolling': null, 'role': null },
          // 长列表里可能一个可聚焦元素都没有，不给 Tab 位键盘用户就落不进来
          'viewport': { 'tabindex': '0', 'data-orientation': 'vertical', 'role': null },
          'content': { 'data-orientation': 'vertical' },
          // 不在窗口里的条目只是收起来，不卸载作者节点；身份标记照旧带着
          'item[0]': { 'data-index': '0', 'hidden': '', 'data-lane': null },
          'item[11]': { 'data-index': '11', 'hidden': '' },
        },
      },
      steps: [assertStyle('content', 0, { 'block-size': '0px' })],
    },
    {
      name: '数据到位：只有窗口里那几条显形，其余收起；总长按整份列表算',
      spec: { apg: WCAG },
      props: BASE,
      steps: [
        layoutStep,
        {
          ...loadData,
          expect: { parts: itemStates([0, 1, 2, 3]) },
        },
        // 十二条 × 30px；第 2 条落在 60px 处
        assertStyle('content', 0, { 'block-size': '360px' }),
        assertStyle('item', 2, { 'inset-block-start': '60px' }),
        // 收起的那条不留残余位移：节点被复用时不该带着上一轮的位置停在半空
        assertStyle('item', 7, { 'inset-block-start': '' }),
      ],
    },
    {
      name: '滚动后窗口跟着挪：换一批下标显形，滚动期间根节点带 data-scrolling',
      spec: { apg: WCAG },
      props: BASE,
      steps: [
        layoutStep,
        loadData,
        {
          ...scrollTo(150),
          expect: {
            parts: {
              ...itemStates([5, 6, 7, 8]),
              root: { 'data-scrolling': '' },
            },
          },
        },
        assertStyle('item', 5, { 'inset-block-start': '150px' }),
        // 手停下后标记要撤掉：内核自带停手判定
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-scrolling', value: null } },
        },
      ],
      expect: { parts: { root: { 'data-scrolling': null } } },
    },
    {
      name: '过扫描：可视区前后各多渲几条，边缘不会在滚动时露白',
      spec: { apg: WCAG },
      props: { estimateSize: 30, overscan: 2 },
      steps: [
        layoutStep,
        {
          ...loadData,
          // 可视区 0..3，往后多两条到 5；往前不够就贴到 0
          expect: { parts: itemStates([0, 1, 2, 3, 4, 5]) },
        },
      ],
    },
    {
      name: '横向列表：方向标记翻过来，位移落在行内轴',
      spec: { apg: WCAG },
      props: { ...BASE, horizontal: true },
      steps: [
        layoutStep,
        {
          ...loadData,
          expect: {
            parts: {
              'root': { 'data-orientation': 'horizontal' },
              'viewport': { 'data-orientation': 'horizontal' },
              'content': { 'data-orientation': 'horizontal' },
              'item[0]': { 'data-orientation': 'horizontal', 'hidden': null },
            },
          },
        },
        assertStyle('content', 0, { 'inline-size': '360px', 'block-size': '' }),
        assertStyle('item', 2, { 'inset-inline-start': '60px', 'inset-block-start': '' }),
        {
          ...scrollTo(150, true),
          expect: { parts: itemStates([5, 6, 7, 8]) },
        },
      ],
    },
    {
      name: '多列网格：条目轮流落到各道上，交叉轴位置由连接层给出',
      spec: { apg: WCAG },
      props: { ...BASE, lanes: 2 },
      steps: [
        layoutStep,
        {
          ...loadData,
          // 条目按下标轮流落到两道上；末尾几条排到视口外，照旧收起
          expect: {
            parts: {
              'item[0]': { 'data-lane': '0', 'hidden': null },
              'item[1]': { 'data-lane': '1', 'hidden': null },
              'item[2]': { 'data-lane': '0', 'hidden': null },
              'item[11]': { 'data-lane': null, 'hidden': '' },
            },
          },
        },
        // 同一行的两条起点相同，交叉轴各占一半
        assertStyle('item', 0, { 'inset-block-start': '0px', 'inset-inline-start': '0%', 'inline-size': '50%' }),
        assertStyle('item', 1, { 'inset-block-start': '0px', 'inset-inline-start': '50%' }),
        assertStyle('item', 2, { 'inset-block-start': '30px' }),
        // 十二条铺成六行
        assertStyle('content', 0, { 'block-size': '180px' }),
      ],
    },
    {
      name: '前后内边距与间距计进位移和总长',
      spec: { apg: WCAG },
      props: { ...BASE, paddingStart: 8, paddingEnd: 16, gap: 10 },
      steps: [
        layoutStep,
        loadData,
        // 8 + 12×30 + 11×10 + 16
        assertStyle('content', 0, { 'block-size': '494px' }),
        assertStyle('item', 0, { 'inset-block-start': '8px' }),
        assertStyle('item', 1, { 'inset-block-start': '48px' }),
      ],
    },
    {
      name: '原生滚动照常：视口不接管任何按键，且占一个 Tab 位',
      spec: { apg: WCAG },
      steps: [
        {
          kind: 'raw',
          why: '「没被接管」这件事只有读 defaultPrevented 才咬得住：jsdom 不会真的滚，'
            + '而声明式的 key 步骤不上报事件有没有被拦下',
          run: ({ doc }) => {
            const viewport = findPart(doc, 'viewport')
            if (viewport.getAttribute('tabindex') !== '0')
              throw new Error('视口必须带 tabindex="0"：长列表里没有可聚焦元素时键盘用户根本落不进来')
            viewport.focus()
            for (const key of ['PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', ' ']) {
              const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
              viewport.dispatchEvent(event)
              if (event.defaultPrevented)
                throw new Error(`${key} 被组件拦下了：滚动本身归浏览器，组件一个按键都不该接管`)
            }
          },
        },
      ],
    },
    {
      name: 'count 收缩：越界的下标不再显形',
      spec: { apg: WCAG },
      props: BASE,
      steps: [
        layoutStep,
        loadData,
        {
          kind: 'setProps',
          props: { count: 2 },
          expect: { parts: itemStates([0, 1]) },
        },
        assertStyle('content', 0, { 'block-size': '60px' }),
      ],
    },
  ],
}
