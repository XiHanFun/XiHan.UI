import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { scrollAreaAnatomy, scrollAreaKeyboard } from '@xihan-ui/headless'

// 自绘滚动条没有 APG 模式可依：可达性的落点是"原生滚动一点都别接管"，
// 出处取 WCAG 里"用键盘也能操作滚动区"那条技术说明。
const WCAG = 'https://www.w3.org/WAI/WCAG21/Techniques/general/G202'

const SCOPE = '[data-scope="scroll-area"]'
/** 轨道、滑块与交叉口是 scrollbar 那套解剖的部件，戴它的 scope；快照只收本 scope，它们用裸查询验。 */
const BAR = '[data-scope="scrollbar"]'

function findPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${SCOPE}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 ${name}[${index}] 部件`)
  return el
}

function findBarPart(doc: Document, name: string, index = 0): HTMLElement {
  const el = doc.querySelectorAll<HTMLElement>(`${BAR}[data-part="${name}"]`)[index]
  if (!el)
    throw new Error(`找不到 scrollbar 的 ${name}[${index}] 部件`)
  return el
}

/**
 * jsdom 不做布局：clientHeight / scrollHeight 恒是 0，机器会当成"根本不溢出"，
 * 滚动条一条也显不出来。这里把尺寸桩在真实节点上——视口 100、内容 400、轨道 100，
 * 于是滑块占四分之一、能走 75px、可滚 300px。
 * 滚动量做成可读可写并在两端夹住，与浏览器同行为（拖出边界要能停在端点）。
 *
 * 桩打在真实节点上、对两个适配器一视同仁；末尾派一次 scroll 让两台机器把数字量进去
 * （挂载时那一次量到的还是全 0）。
 */
function layout(doc: Document): void {
  const viewport = findPart(doc, 'viewport')
  let top = 0
  let left = 0
  const clampScroll = (v: number): number => Math.min(Math.max(v, 0), 300)
  Object.defineProperties(viewport, {
    clientHeight: { configurable: true, get: () => 100 },
    clientWidth: { configurable: true, get: () => 100 },
    scrollHeight: { configurable: true, get: () => 400 },
    scrollWidth: { configurable: true, get: () => 400 },
    scrollTop: { configurable: true, get: () => top, set: (v: number) => { top = clampScroll(v) } },
    scrollLeft: { configurable: true, get: () => left, set: (v: number) => { left = clampScroll(v) } },
  })

  const axes = ['vertical', 'horizontal'] as const
  axes.forEach((axis, index) => {
    const track = findBarPart(doc, 'track', index)
    const vertical = axis === 'vertical'
    Object.defineProperties(track, {
      clientHeight: { configurable: true, get: () => (vertical ? 100 : 10) },
      clientWidth: { configurable: true, get: () => (vertical ? 10 : 100) },
    })
    track.getBoundingClientRect = (): DOMRect => ({
      x: 0,
      y: 0,
      width: vertical ? 10 : 100,
      height: vertical ? 100 : 10,
      top: 0,
      left: 0,
      right: vertical ? 10 : 100,
      bottom: vertical ? 100 : 10,
      toJSON: () => ({}),
    }) as DOMRect
  })

  viewport.dispatchEvent(new Event('scroll'))
}

const layoutStep: StepWithExpect = {
  kind: 'raw',
  why: 'jsdom 不做布局，四个尺寸恒是 0，不桩尺寸就永远量不出溢出，滚动条一条也显不出来',
  run: ({ doc }) => layout(doc),
}

/** 指针进出没有对应的声明式步骤：这两个事件不冒泡，机器把它们挂在视口与挂载点上。 */
function pointerOnViewport(type: 'pointerenter' | 'pointerleave'): StepWithExpect {
  return {
    kind: 'raw',
    why: 'pointerenter / pointerleave 不冒泡，声明式的 click / focus 步骤覆盖不到',
    run: ({ doc }) => {
      findPart(doc, 'viewport').dispatchEvent(new PointerEvent(type, { bubbles: false, cancelable: false }))
    },
  }
}

/** 原生滚动：改滚动量再派 scroll 事件，与浏览器同序。 */
function scrollTo(top: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '滚动是浏览器行为，没有对应的声明式步骤；组件只是跟着 scroll 事件重画滑块',
    run: ({ doc }) => {
      const viewport = findPart(doc, 'viewport')
      viewport.scrollTop = top
      viewport.dispatchEvent(new Event('scroll'))
    },
  }
}

function assertScrollTop(expected: number): StepWithExpect {
  return {
    kind: 'raw',
    why: '滚动位置只落在 DOM property 上，进不了归一化快照',
    run: ({ doc }) => {
      const actual = findPart(doc, 'viewport').scrollTop
      if (actual !== expected)
        throw new Error(`视口滚动位置不符：期望 ${expected}，实际 ${actual}`)
    },
  }
}

/** 轨道、滑块与交叉口戴 scrollbar 的 scope，不进快照，这里逐条读属性。 */
function assertBarParts(checks: Record<string, Record<string, string | null>>): StepWithExpect {
  return {
    kind: 'raw',
    why: '挂载点里的轨道、滑块与交叉口归 scrollbar 那套解剖（data-scope="scrollbar"），本 scope 的快照收不到它们',
    run: ({ doc }) => {
      for (const [key, attrs] of Object.entries(checks)) {
        const m = key.match(/^([a-z-]+)(?:\[(\d+)\])?$/)
        if (!m)
          throw new Error(`部件键写法不对：${key}`)
        const el = findBarPart(doc, m[1]!, Number(m[2] ?? 0))
        for (const [name, want] of Object.entries(attrs)) {
          const got = el.getAttribute(name)
          if (got !== want)
            throw new Error(`${key} 的 ${name} 期望 ${JSON.stringify(want)}，实际 ${JSON.stringify(got)}`)
        }
      }
    },
  }
}

/** 交叉口写在竖条的挂载点里，跟着两条都在场才显形。 */
const scrollAreaTree: FixtureNode = {
  part: 'root',
  children: [
    { part: 'viewport', children: [{ part: 'content', text: '一段很长的内容' }] },
    {
      part: 'scrollbar',
      attrs: { orientation: 'vertical' },
      children: [{ part: 'track', children: [{ part: 'thumb' }] }, { part: 'corner' }],
    },
    {
      part: 'scrollbar',
      attrs: { orientation: 'horizontal' },
      children: [{ part: 'track', children: [{ part: 'thumb' }] }],
    },
  ],
}

export const scrollAreaSuite: ConformanceSuite = {
  component: 'scroll-area',
  anatomy: scrollAreaAnatomy,
  keyboard: scrollAreaKeyboard,
  fixture: scrollAreaTree,
  cases: [
    {
      name: 'type=always：两条滚动条恒露着；挂载点戴本组件的 scope，轨道与滑块戴 scrollbar 的；滚动条对读屏隐藏',
      spec: { apg: WCAG },
      props: { type: 'always' },
      initial: {
        order: ['root', 'viewport', 'content', 'scrollbar[0]', 'scrollbar[1]'],
        counts: { root: 1, viewport: 1, content: 1, scrollbar: 2 },
        parts: {
          'root': {
            // 作者没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向，滑块用的全是逻辑属性
            'dir': null,
            'data-orientation': 'both',
            'data-type': 'always',
            'data-dragging': null,
          },
          // 滚动区里可能一个可聚焦元素都没有，不给 Tab 位键盘用户就落不进来；
          // always 恒占道，两条轴都让出一条道
          'viewport': { 'tabindex': '0', 'data-orientation': 'both', 'role': null, 'data-lane-vertical': '', 'data-lane-horizontal': '' },
          'scrollbar[0]': {
            // 键盘与读屏走的是原生滚动那条路，再报一个 role=scrollbar 等于把同一件事说两遍
            'aria-hidden': 'true',
            'role': null,
            'data-orientation': 'vertical',
            'data-type': 'always',
            'data-state': 'visible',
            'data-dragging': null,
            // 两条都显形：各自让出交叉口
            'data-gutter': '',
            'hidden': null,
          },
          'scrollbar[1]': { 'data-orientation': 'horizontal', 'data-state': 'visible', 'data-gutter': '' },
        },
      },
      steps: [
        assertBarParts({
          'track[0]': { 'data-orientation': 'vertical' },
          'track[1]': { 'data-orientation': 'horizontal' },
          'thumb[0]': { 'data-orientation': 'vertical', 'role': null, 'tabindex': '-1' },
          'thumb[1]': { 'data-orientation': 'horizontal' },
          'corner': { 'data-orientation': 'vertical', 'data-state': 'visible', 'hidden': null },
        }),
      ],
    },
    {
      name: '默认（hover）：挂载时收着，两条滚动条 data-state=hidden 由皮肤淡出，交叉口带 hidden',
      spec: { apg: WCAG },
      initial: {
        parts: {
          'root': { 'data-type': 'hover' },
          'viewport': { 'data-lane-vertical': null, 'data-lane-horizontal': null },
          'scrollbar[0]': { 'data-state': 'hidden', 'data-gutter': null },
          'scrollbar[1]': { 'data-state': 'hidden' },
        },
      },
      steps: [assertBarParts({ corner: { 'data-state': 'hidden', 'hidden': '' } })],
    },
    {
      name: 'type=auto：量到溢出就露着并占道，之后一直露着',
      spec: { apg: WCAG },
      props: { type: 'auto' },
      steps: [
        {
          ...layoutStep,
          expect: {
            parts: {
              'viewport': { 'data-lane-vertical': '', 'data-lane-horizontal': '' },
              'scrollbar[0]': { 'data-state': 'visible', 'data-gutter': '' },
              'scrollbar[1]': { 'data-state': 'visible', 'data-gutter': '' },
            },
          },
        },
        assertBarParts({ corner: { 'data-state': 'visible', 'hidden': null } }),
      ],
    },
    {
      name: 'type=auto：内容不溢出（jsdom 里尺寸全空）时一条也不露、也不占道',
      spec: { apg: WCAG },
      props: { type: 'auto' },
      initial: {
        parts: {
          'viewport': { 'data-lane-vertical': null, 'data-lane-horizontal': null },
          'scrollbar[0]': { 'data-state': 'hidden' },
        },
      },
      steps: [assertBarParts({ corner: { 'data-state': 'hidden', 'hidden': '' } })],
    },
    {
      name: 'hover：指针进入视口才露出，离开后要等满 hideDelay 才收起',
      spec: { apg: WCAG },
      props: { type: 'hover', hideDelay: 300 },
      steps: [
        {
          // 两条都溢出：让位按溢出算，收着时就已经让出，露面时不会跳长度
          ...layoutStep,
          expect: { parts: { 'scrollbar[0]': { 'data-state': 'hidden', 'data-gutter': '' } } },
        },
        {
          ...pointerOnViewport('pointerenter'),
          expect: { parts: { 'scrollbar[0]': { 'data-state': 'visible', 'data-gutter': '' } } },
        },
        {
          // 离开的那一刻滑块必须还露着
          ...pointerOnViewport('pointerleave'),
          expect: { parts: { 'scrollbar[0]': { 'data-state': 'visible' } } },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'scrollbar[0]', name: 'data-state', value: 'hidden' } },
        },
      ],
      expect: { parts: { 'scrollbar[0]': { 'data-state': 'hidden', 'data-gutter': '' } } },
    },
    {
      name: 'hover：只有指针进出算数，光滚动不会让滚动条露面',
      spec: { apg: WCAG },
      props: { type: 'hover' },
      steps: [
        {
          // layout 末尾那次 scroll 就是第一下滚动：成段标记打上了，但不露面
          ...layoutStep,
          expect: { parts: { 'scrollbar[0]': { 'data-state': 'hidden', 'data-scrolling': '' } } },
        },
      ],
    },
    {
      name: 'scroll：滚动时露出，停手满 hideDelay 后收起',
      spec: { apg: WCAG },
      props: { type: 'scroll', hideDelay: 300 },
      steps: [
        {
          ...layoutStep,
          expect: { parts: { 'scrollbar[0]': { 'data-state': 'visible' } } },
        },
        {
          kind: 'settle',
          until: { attr: { part: 'scrollbar[0]', name: 'data-state', value: 'hidden' } },
        },
      ],
    },
    {
      name: 'orientation 关掉的那条轴恒不显形，另一条不必让位，交叉口也就没了位置',
      spec: { apg: WCAG },
      props: { type: 'always', orientation: 'vertical' },
      initial: {
        parts: {
          'root': { 'data-orientation': 'vertical' },
          'viewport': { 'data-orientation': 'vertical', 'data-lane-vertical': '', 'data-lane-horizontal': null },
          'scrollbar[0]': { 'data-state': 'visible', 'data-gutter': null },
          'scrollbar[1]': { 'data-state': 'hidden' },
        },
      },
      steps: [assertBarParts({ corner: { 'data-state': 'hidden', 'hidden': '' } })],
    },
    {
      name: '拖动滑块：按下带上 data-dragging，移动把滚动位置写回视口，松手收尾',
      spec: { apg: WCAG },
      props: { type: 'always' },
      steps: [
        layoutStep,
        {
          kind: 'raw',
          why: '拖动只能直接派指针事件；按下要落在滑块上，移动挂在文档上（手可以拖出滚动条）',
          run: ({ doc }) => {
            findBarPart(doc, 'thumb').dispatchEvent(
              new PointerEvent('pointerdown', { button: 0, clientX: 5, clientY: 10, bubbles: true, cancelable: true }),
            )
          },
          expect: {
            parts: {
              'root': { 'data-dragging': '' },
              'scrollbar[0]': { 'data-dragging': '' },
              // 手按在竖向滑块上，横向那条不该跟着变
              'scrollbar[1]': { 'data-dragging': null },
            },
          },
        },
        assertBarParts({ 'thumb[0]': { 'data-dragging': '' }, 'thumb[1]': { 'data-dragging': null } }),
        {
          kind: 'raw',
          why: '拖动途中的指针事件挂在文档上，手可以拖出滚动条甚至拖出窗口',
          run: ({ doc }) => {
            doc.dispatchEvent(new PointerEvent('pointermove', { clientX: 5, clientY: 40, bubbles: true }))
          },
        },
        // 轨道 100、滑块 25 → 能走 75；手走 30px 即滚过 30/75 = 40% 的可滚量
        assertScrollTop(120),
        {
          kind: 'raw',
          why: '松手同样只能直接派事件',
          run: ({ doc }) => {
            doc.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }))
          },
          expect: {
            parts: {
              'root': { 'data-dragging': null },
              'scrollbar[0]': { 'data-dragging': null },
            },
          },
        },
        {
          kind: 'raw',
          why: '松手后监听器要真的摘干净：再动指针不该继续滚',
          run: ({ doc }) => {
            doc.dispatchEvent(new PointerEvent('pointermove', { clientX: 5, clientY: 90, bubbles: true }))
          },
        },
        assertScrollTop(120),
      ],
    },
    {
      name: '点轨道空白处：滑块中心跳到落点',
      spec: { apg: WCAG },
      props: { type: 'always' },
      steps: [
        layoutStep,
        {
          kind: 'raw',
          why: '轨道跳转认的是 pointerdown 的坐标，click 步骤带不了坐标',
          run: ({ doc }) => {
            findBarPart(doc, 'track').dispatchEvent(
              new PointerEvent('pointerdown', { button: 0, clientX: 5, clientY: 50, bubbles: true, cancelable: true }),
            )
          },
        },
        // 轨道 100、滑块 25：点正中，滑块中心对齐后正好滚到一半
        assertScrollTop(150),
      ],
    },
    {
      name: '原生滚动照常：视口不接管任何按键，且占一个 Tab 位',
      spec: { apg: WCAG },
      covers: [
        'scroll-area.kbd.tab',
        'scroll-area.kbd.page',
        'scroll-area.kbd.arrow',
        'scroll-area.kbd.edge',
        'scroll-area.kbd.space',
      ],
      steps: [
        {
          kind: 'raw',
          why: '「没被接管」这件事只有读 defaultPrevented 才咬得住：jsdom 不会真的滚，'
            + '而声明式的 key 步骤不上报事件有没有被拦下',
          run: ({ doc }) => {
            const viewport = findPart(doc, 'viewport')
            if (viewport.getAttribute('tabindex') !== '0')
              throw new Error('视口必须带 tabindex="0"：滚动区里没有可聚焦元素时键盘用户根本落不进来')
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
      name: '滚动后滑块跟着走：位置来自量到的尺寸，不来自渲染期读 DOM；视口带自绘滚动条的标记',
      spec: { apg: WCAG },
      props: { type: 'always' },
      steps: [
        layoutStep,
        scrollTo(150),
        {
          kind: 'raw',
          why: '滑块位置写在内联样式里，归一化快照不收 style；容器标记是机器挂监听时打的属性',
          run: ({ doc }) => {
            const thumb = findBarPart(doc, 'thumb')
            // 可滚 300、已滚 150 → 走过一半；滑块自己占 25%，起点因此停在 37.5%
            if (thumb.style.insetBlockStart !== '37.5%' || thumb.style.blockSize !== '25%')
              throw new Error(`竖向滑块几何不符：inset-block-start=${thumb.style.insetBlockStart}、block-size=${thumb.style.blockSize}`)
            // 用不上的那条轴每帧都要清空，否则换轴时滑块会被两轴同时钉住
            if (thumb.style.insetInlineStart !== '' || thumb.style.inlineSize !== '')
              throw new Error('竖向滑块不该留下横轴的内联尺寸')
            if (findPart(doc, 'viewport').getAttribute('data-xh-scrollbar') !== '2')
              throw new Error('两条滚动条都挂在视口上，视口该带 data-xh-scrollbar="2"，皮肤据此藏原生滚动条')
          },
        },
      ],
    },
    {
      name: 'size 落到根与两条挂载点上：皮肤按同一个数换厚度与让道',
      spec: { apg: WCAG },
      props: { type: 'always', size: 'lg' },
      initial: {
        parts: {
          'root': { 'data-size': 'lg' },
          'scrollbar[0]': { 'data-size': 'lg' },
          'scrollbar[1]': { 'data-size': 'lg' },
        },
      },
    },
    {
      name: 'dir=rtl 写到根节点上：滑块用的全是逻辑属性，方向由它决定',
      spec: { apg: WCAG },
      props: { type: 'always', dir: 'rtl' },
      initial: { parts: { root: { dir: 'rtl' } } },
    },
  ],
}
