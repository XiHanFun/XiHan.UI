import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { threadAnatomy, threadKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'
const LIVE = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

const VIEWPORT = '[data-scope="thread"][data-part="viewport"]'

/** 伪造的几何量：内容 1000px、可视 200px。 */
const SCROLL_HEIGHT = 1000
const CLIENT_HEIGHT = 200

/** 伪造视口的滚动几何与 scrollTo，把滚动位置放在离底很远处并派发 scroll。 */
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
  // 粘底原语只在 scroll 回调里读几何，改完须派发事件
  el.dispatchEvent(new Event('scroll'))
}

/** thread 的一致性套件：核对视口与 live-region 的 ARIA 接线，以及粘底与回到底部按钮。 */
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
            // 内容层需要真实子节点，锚点从中挑选
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
          'root': { 'data-state': 'idle' },
          'viewport': {
            'role': 'log',
            // role=log 隐含 aria-live=polite，这里显式关掉
            'aria-live': 'off',
            'aria-label': 'Conversation',
            // 让键盘用户能聚焦消息区
            'tabindex': '0',
            'data-state': 'idle',
          },
          'scroll-button': {
            'type': 'button',
            'aria-label': 'Scroll to bottom',
            'data-state': 'hidden',
            // 收起时只置 hidden，不卸载节点
            'hidden': '',
          },
          'live-region': {
            'role': 'status',
            'aria-live': 'polite',
            // 每次变动重念整块
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
      skipParity: 'jsdom 无布局，粘底状态由伪造几何驱动，两适配器的 RO 回调时机天然不同步',
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 无布局，滚动几何恒为 0、视口永远判成在底，粘底状态只能由伪造几何驱动',
          run: scrollAwayFromBottom,
          expect: {
            parts: { 'scroll-button': { 'hidden': null, 'data-state': 'visible' } },
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
