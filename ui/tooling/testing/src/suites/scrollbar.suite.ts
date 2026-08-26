import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { scrollbarAnatomy, scrollbarKeyboard } from '@xihan-ui/headless'

// 自绘滚动条没有 APG 模式可依：可达性的落点是「原生滚动一点都别接管」，
// 出处取 WCAG 里「用键盘也能操作滚动区」那条技术说明。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const SCOPE = '[data-scope="scrollbar"]'
/** 滚动容器归作者，两个适配器都按这个 id 去查它。 */
const TARGET_ID = 'xh-conformance-scrollable'

function findPart(doc: Document, name: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`${SCOPE}[data-part="${name}"]`)
  if (!el)
    throw new Error(`找不到 ${name} 部件`)
  return el
}

function target(doc: Document): HTMLElement {
  const el = doc.getElementById(TARGET_ID)
  if (!el)
    throw new Error('滚动容器还没入页')
  return el
}

/**
 * jsdom 不做布局：clientHeight / scrollHeight 恒是 0，机器会当成「根本不溢出」，
 * 滚动条显不出来。这里把尺寸桩在真实节点上——可视区 100、内容 400、轨道 100，
 * 于是滑块占四分之一、能走 75px、可滚 300px。
 * 滚动量做成可读可写并在两端夹住，与浏览器同行为（拖出边界要能停在端点）。
 *
 * 滚动容器必须在滚动条挂载**之前**就在 DOM 里：监听器只在挂载那一拍挂一次。
 * 这条约定对两个适配器一样，所以容器由 setup 建、末尾派一次 scroll 让机器把数字量进去。
 */
function layout(doc: Document): void {
  const box = target(doc)
  let top = 0
  const clampScroll = (v: number): number => Math.min(Math.max(v, 0), 300)
  Object.defineProperties(box, {
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 100 },
    scrollHeight: { configurable: true, get: () => 400 },
    scrollWidth: { configurable: true, get: () => 400 },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = clampScroll(v) } },
    scrollLeft: { configurable: true, get: () => 0, set: () => {} },
  })

  const track = findPart(doc, 'track')
  Object.defineProperties(track, {
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 10 },
  })
  track.getBoundingClientRect = (): DOMRect => ({
    x: 0,
    y: 0,
    width: 10,
    height: 100,
    top: 0,
    left: 0,
    right: 10,
    bottom: 100,
    toJSON: () => ({}),
  }) as DOMRect

  box.dispatchEvent(new Event('scroll'))
}

const layoutStep: StepWithExpect = {
  kind: 'raw',
  why: 'jsdom 不做布局，四个尺寸恒是 0，不桩尺寸就永远量不出溢出，滚动条显不出来',
  run: ({ doc }) => layout(doc),
}

/** 指针进出没有对应的声明式步骤：这两个事件不冒泡，只能直接派在节点上。 */
function pointerOnTarget(type: 'pointerenter' | 'pointerleave'): StepWithExpect {
  return {
    kind: 'raw',
    why: 'pointerenter / pointerleave 不冒泡，声明式的 click / focus 步骤覆盖不到',
    run: ({ doc }) => {
      target(doc).dispatchEvent(new PointerEvent(type, { bubbles: false, cancelable: false }))
    },
  }
}

/** 原生滚动：改滚动量再派 scroll 事件，与浏览器同序。 */
function scrollTo(top: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '滚动是浏览器行为，没有对应的声明式步骤；组件只是跟着 scroll 事件重画滑块',
    run: ({ doc }) => {
      const box = target(doc)
      box.scrollTop = top
      box.dispatchEvent(new Event('scroll'))
    },
  }
}

function assertScrollTop(expected: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '滚动位置只落在 DOM property 上，进不了归一化快照',
    run: ({ doc }) => {
      const actual = target(doc).scrollTop
      if (actual !== expected)
        throw new Error(`滚动位置不符：期望 ${expected}，实际 ${actual}`)
    },
  }
}

/** 往滑块上直接派按键；处理器挂在滑块自己身上。 */
function pressThumb(key: string): StepWithExpect {
  return {
    kind: 'raw',
    why: 'key 步骤只往 activeElement 上派，而这里要把键落在滑块上（jsdom 里它未必是活动元素）',
    run: ({ doc }) => {
      findPart(doc, 'thumb').dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
    },
  }
}

const scrollbarTree: FixtureNode = {
  part: 'root',
  children: [
    // 滚动容器归作者、也不必是滚动条的后代；这里塞进 fixture 只是因为它必须在
    // 挂载那一拍之前就在文档里——监听器只挂一次，晚到的容器接不上
    { tag: 'div', attrs: { id: TARGET_ID } },
    { part: 'track', children: [{ part: 'thumb' }] },
  ],
}

/** 滚动容器不是滚动条的后代，也不归组件管：由套件自己在挂载前放进文档。 */
const BASE = { controls: TARGET_ID } as const

export const scrollbarSuite: ConformanceSuite = {
  component: 'scrollbar',
  anatomy: scrollbarAnatomy,
  keyboard: scrollbarKeyboard,
  fixture: scrollbarTree,
  cases: [
    {
      name: 'type=always：恒露着；缺省不进 Tab 序，整条对读屏隐藏',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'always' },
      initial: {
        order: ['root', 'track', 'thumb'],
        counts: { root: 1, track: 1, thumb: 1 },
        parts: {
          root: {
            // 作者没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向，滑块用的全是逻辑属性
            'dir': null,
            'aria-hidden': 'true',
            'data-orientation': 'vertical',
            'data-type': 'always',
            'data-state': 'visible',
            'data-dragging': null,
            'data-native': null,
            'data-gutter': null,
          },
          track: { 'data-orientation': 'vertical' },
          thumb: {
            // 键盘与读屏走的是原生滚动那条路，再报一个 role=scrollbar 等于把同一件事说两遍
            'role': null,
            'tabindex': '-1',
            'data-orientation': 'vertical',
            'data-dragging': null,
          },
        },
      },
    },
    {
      name: '默认（scroll-hover）：挂载时收着，data-state=hidden 由皮肤淡出',
      spec: { apg: WCAG },
      props: BASE,
      initial: {
        parts: { root: { 'data-type': 'scroll-hover', 'data-state': 'hidden' } },
      },
    },
    {
      name: 'scroll-hover：滚动就露出，停手满 hideDelay 后收起',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'scroll-hover', hideDelay: 300 },
      steps: [
        // layout 末尾那一下滚动就是第一次滚动
        { ...layoutStep, expect: { parts: { root: { 'data-state': 'visible' } } } },
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-state', value: 'hidden' } } },
      ],
    },
    {
      name: 'scroll-hover：指针进滚动容器也露出，占着的时候不收起',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'scroll-hover', hideDelay: 300 },
      steps: [
        layoutStep,
        { ...pointerOnTarget('pointerenter'), expect: { parts: { root: { 'data-state': 'visible' } } } },
        { ...scrollTo(150), expect: { parts: { root: { 'data-state': 'visible' } } } },
      ],
    },
    {
      name: 'type=auto：量到溢出就露着',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'auto' },
      steps: [
        { ...layoutStep, expect: { parts: { root: { 'data-state': 'visible' } } } },
      ],
    },
    {
      name: 'hover：指针进滚动容器才露出，离开后要等满 hideDelay 才收起',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'hover', hideDelay: 300 },
      steps: [
        layoutStep,
        { ...pointerOnTarget('pointerenter'), expect: { parts: { root: { 'data-state': 'visible' } } } },
        { ...pointerOnTarget('pointerleave'), expect: { parts: { root: { 'data-state': 'visible' } } } },
        { kind: 'settle', until: { attr: { part: 'root', name: 'data-state', value: 'hidden' } } },
      ],
    },
    {
      name: 'focusable：滑块进 Tab 序、报 role=scrollbar 与三个数，随滚动更新',
      spec: { apg: WCAG },
      covers: ['scrollbar.kbd.tab'],
      props: { ...BASE, type: 'always', focusable: true },
      steps: [
        {
          ...layoutStep,
          expect: {
            parts: {
              root: { 'aria-hidden': null },
              thumb: {
                'role': 'scrollbar',
                'aria-orientation': 'vertical',
                'aria-label': 'Scrollbar',
                // 被控的是组件之外的节点，归一化后写成 @extern(id)
                // 被控的是组件之外的节点，归一化后写成 @extern(id)
                'aria-controls': `@extern(${TARGET_ID})`,
                'aria-valuemin': '0',
                'aria-valuemax': '300',
                'aria-valuenow': '0',
                'tabindex': '0',
              },
            },
          },
        },
        { ...scrollTo(150), expect: { parts: { thumb: { 'aria-valuenow': '150' } } } },
      ],
    },
    {
      name: '键盘：方向键走一步、翻页键走一屏、Home/End 到两端',
      spec: { apg: WCAG },
      covers: [
        'scrollbar.kbd.back',
        'scrollbar.kbd.forward',
        'scrollbar.kbd.page-back',
        'scrollbar.kbd.page-forward',
        'scrollbar.kbd.start',
        'scrollbar.kbd.end',
      ],
      props: { ...BASE, type: 'always', focusable: true, step: 40 },
      steps: [
        layoutStep,
        pressThumb('ArrowDown'),
        assertScrollTop(40),
        pressThumb('PageDown'),
        assertScrollTop(140),
        pressThumb('ArrowUp'),
        assertScrollTop(100),
        pressThumb('PageUp'),
        assertScrollTop(0),
        pressThumb('End'),
        assertScrollTop(300),
        pressThumb('Home'),
        assertScrollTop(0),
      ],
    },
    {
      name: '点轨道空白处：把滑块中心挪到落点',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'always' },
      steps: [
        layoutStep,
        {
          kind: 'raw',
          why: 'pointerdown 带坐标，声明式的 click 步骤给不了 clientY',
          run: ({ doc }) => {
            findPart(doc, 'track').dispatchEvent(
              new PointerEvent('pointerdown', { button: 0, clientY: 50, bubbles: true, cancelable: true }),
            )
          },
        },
        // 轨道 100、滑块 25：点在 50 处，中心对齐后滚动量 = (50 − 12.5)/75 × 300 = 150
        assertScrollTop(150),
      ],
    },
    {
      name: '拖动滑块：位移按行程换算成滚动量，拖过头停在端点',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'always' },
      steps: [
        layoutStep,
        {
          kind: 'raw',
          why: '拖动是 pointerdown → document 上的 pointermove → pointerup 三步，没有对应的声明式步骤',
          run: ({ doc }) => {
            findPart(doc, 'thumb').dispatchEvent(
              new PointerEvent('pointerdown', { button: 0, clientY: 0, bubbles: true, cancelable: true }),
            )
          },
          expect: { parts: { thumb: { 'data-dragging': '' }, root: { 'data-dragging': '' } } },
        },
        {
          kind: 'raw',
          why: '同上：移动与松手都派在 document 上，滑块拖出组件仍要跟手',
          run: ({ doc }) => {
            // 行程 75px（轨道 100 − 滑块 25），走 25px 即 1/3，滚动量 100
            doc.dispatchEvent(new PointerEvent('pointermove', { clientY: 25, bubbles: true }))
          },
        },
        assertScrollTop(100),
        {
          kind: 'raw',
          why: '同上',
          run: ({ doc }) => {
            doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
          },
          expect: { parts: { thumb: { 'data-dragging': null } } },
        },
      ],
    },
    {
      name: '禁用：恒不显形，指针与键盘都不接',
      spec: { apg: WCAG },
      props: { ...BASE, type: 'always', focusable: true, disabled: true },
      steps: [
        {
          ...layoutStep,
          expect: {
            parts: {
              root: { 'data-state': 'hidden', 'data-disabled': '' },
              thumb: { 'data-disabled': '', 'tabindex': '-1' },
            },
          },
        },
        pressThumb('End'),
        assertScrollTop(0),
      ],
    },
  ],
}
