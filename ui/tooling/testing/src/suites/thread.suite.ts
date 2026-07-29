import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { threadAnatomy, threadKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'
const LIVE = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

const VIEWPORT = '[data-scope="thread"][data-part="viewport"]'

/** 假几何：内容 1000px、可视 200px，滚动位置在顶。 */
const SCROLL_HEIGHT = 1000
const CLIENT_HEIGHT = 200

/**
 * 把视口滚到"离底很远"的位置。
 *
 * jsdom 没有布局，scrollHeight / clientHeight / scrollTop 恒为 0，粘底判据
 * `scrollHeight - scrollTop - clientHeight <= threshold` 因此恒成立——视口永远"在底"，
 * 回到底部按钮永远不露头，这条规格在真机之外只能靠伪造几何演。三个量换成可写的假值，
 * 再补一个 scrollTo（jsdom 的元素没有真的滚动实现），归位那一路才走得通。
 */
function scrollAwayFromBottom({ doc }: RawStepContext): void {
  const el = doc.querySelector<HTMLElement>(VIEWPORT)
  if (!el)
    throw new Error('找不到 thread 的 viewport 部件')
  let scrollTop = 0
  Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => SCROLL_HEIGHT })
  Object.defineProperty(el, 'clientHeight', { configurable: true, get: () => CLIENT_HEIGHT })
  Object.defineProperty(el, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (next: number) => {
      scrollTop = next
    },
  })
  Object.defineProperty(el, 'scrollTo', {
    configurable: true,
    value: (options: { top: number }) => {
      scrollTop = Math.min(options.top, SCROLL_HEIGHT - CLIENT_HEIGHT)
    },
  })
  // 粘底原语只在 scroll 回调里现量几何，改完不派事件等于什么都没发生
  el.dispatchEvent(new Event('scroll'))
}

/**
 * 消息区的规格几乎全在两块 ARIA 上：视口恒不播报，播报只发生在 live-region 一处。
 * 这两条一旦破了，流式吐字会被读屏逐 token 念成碎片——屏幕上看不出任何异常，
 * 所以必须由用例守着。
 *
 * 滚动本身不接管：方向键、PageUp/PageDown 全走浏览器原生通路，组件只多做一件事——
 * 内容长高时把位置补回底部，用户一上滚就撒手。
 */
export const threadSuite: ConformanceSuite = {
  component: 'thread',
  anatomy: threadAnatomy,
  keyboard: threadKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'viewport',
        children: [
          {
            part: 'content',
            // 内容层要有真实子节点：脱锚后的锚点就是从这些子节点里挑的
            children: [{ text: '第一条' }, { text: '第二条' }, { text: '第三条' }],
          },
        ],
      },
      { part: 'scroll-button', tag: 'button', text: '回到底部' },
      { part: 'live-region' },
    ],
  },
  cases: [
    {
      name: 'ARIA 骨架：视口是恒不播报的 log，播报只在 live-region，初始在底故按钮收起',
      spec: { apg: LIVE },
      initial: {
        order: ['root', 'viewport', 'content', 'scroll-button', 'live-region'],
        counts: { 'root': 1, 'viewport': 1, 'content': 1, 'scroll-button': 1, 'live-region': 1 },
        parts: {
          'root': { 'data-status': 'idle' },
          'viewport': {
            'role': 'log',
            // role=log 隐含 aria-live=polite，逐 token 追加会被念成碎片，必须显式关掉
            'aria-live': 'off',
            'aria-label': 'Conversation',
            // 消息区里常常一个可聚焦元素都没有，落不进来就按不动方向键
            'tabindex': '0',
            'data-status': 'idle',
          },
          'scroll-button': {
            'type': 'button',
            'aria-label': 'Scroll to bottom',
            'data-state': 'hidden',
            // 收起只隐藏、不卸载：作者常在按钮里放自己的图标与过渡
            'hidden': '',
          },
          'live-region': {
            'role': 'status',
            'aria-live': 'polite',
            // 每次变动重念整块，所以宿主只在一轮流结束时写一次
            'aria-atomic': 'true',
          },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '视口自身可聚焦：键盘用户落得进消息区',
      spec: { apg: APG },
      covers: ['thread.kbd.viewport-tab'],
      steps: [
        {
          kind: 'focus',
          part: 'viewport',
          expect: { activeElement: { part: 'viewport', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '离底后按钮露头，按下去归位到底并重新粘附',
      spec: { apg: APG },
      covers: ['thread.kbd.scroll-button'],
      // 这一路靠伪造几何驱动：两侧的滚动/尺寸回调时机天然不同步，逐帧比对没有意义。
      // 规格本身仍由两个适配器各自跑这份用例来保证。
      skipParity: 'jsdom 无布局，粘底状态由伪造几何驱动，两适配器的 RO 回调时机天然不同步',
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 无布局，滚动几何恒为 0、视口永远判成在底，粘底状态只能由伪造几何驱动',
          run: scrollAwayFromBottom,
          expect: {
            parts: { 'scroll-button': { 'hidden': null, 'data-state': 'visible' } },
            // 只报几何事实变了：用户没上滚，粘附意图不动
            events: [{ type: 'stick-change', detail: { atBottom: false, sticking: true } }],
          },
        },
        {
          kind: 'click',
          part: 'scroll-button',
          expect: {
            parts: { 'scroll-button': { 'hidden': '', 'data-state': 'hidden' } },
            events: [{ type: 'stick-change', detail: { atBottom: true, sticking: true } }],
          },
        },
      ],
    },
  ],
}
