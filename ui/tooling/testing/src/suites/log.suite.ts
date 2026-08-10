import type { ConformanceSuite, RawStepContext } from '../conformance/types'
import { logAnatomy, logKeyboard } from '@xihan-ui/headless'

const APG = 'https://www.w3.org/WAI/ARIA/apg/practices/structural-roles/'
const LIVE = 'https://www.w3.org/WAI/ARIA/apg/practices/live-regions/'

const VIEWPORT = '[data-scope="log"][data-part="viewport"]'

/** 伪造的几何量：内容 1000px、可视 200px。 */
const SCROLL_HEIGHT = 1000
const CLIENT_HEIGHT = 200

function queryViewport({ doc }: RawStepContext): HTMLElement {
  const el = doc.querySelector<HTMLElement>(VIEWPORT)
  if (!el)
    throw new Error('找不到 log 的 viewport 部件')
  return el
}

/** 伪造视口的滚动几何与 scrollTo，把滚动位置放在离底很远处并派发 scroll。 */
function scrollAwayFromBottom(ctx: RawStepContext): void {
  const el = queryViewport(ctx)
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

/** 核对视口的高度按「行高槽位 × 行数」算，且行高留给皮肤。 */
function expectRowsHeight(rows: number) {
  return (ctx: RawStepContext): void => {
    const value = queryViewport(ctx).style.blockSize
    if (!value.includes('--xh-log-line-height'))
      throw new Error(`viewport 的高度是「${value}」，没走行高槽位，皮肤改行高就白改了`)
    if (!value.includes(`* ${rows}`))
      throw new Error(`viewport 的高度是「${value}」，没按 ${rows} 行算`)
  }
}

/** 视口的高度整条都没写：rows 缺席时高度归皮肤。 */
function expectNoInlineHeight(ctx: RawStepContext): void {
  const value = queryViewport(ctx).style.blockSize
  if (value !== '')
    throw new Error(`没给 rows，viewport 却带着内联高度「${value}」，皮肤的默认行数被压住了`)
}

/**
 * log 的一致性套件：核对日志区的 ARIA 接线、行数如何落成高度、加载态怎么报，
 * 以及粘底状态如实透出到根上。
 */
export const logSuite: ConformanceSuite = {
  component: 'log',
  anatomy: logAnatomy,
  keyboard: logKeyboard,
  fixture: {
    part: 'root',
    children: [
      {
        part: 'viewport',
        children: [
          {
            part: 'content',
            children: [
              { part: 'line', text: '12:00:01 服务已启动' },
              { part: 'line', text: '12:00:02 已连上数据库' },
              { part: 'line', text: '12:00:03 收到第一个请求' },
            ],
          },
        ],
      },
    ],
  },
  cases: [
    {
      name: 'ARIA 骨架：视口是可聚焦的 log 区，初始在底且粘附，没在取行故不报忙',
      spec: { apg: LIVE },
      initial: {
        order: ['root', 'viewport', 'content', 'line[0]', 'line[1]', 'line[2]'],
        counts: { root: 1, viewport: 1, content: 1, line: 3 },
        parts: {
          root: {
            // 没在取行，data-loading 不留空属性
            'data-loading': null,
            'data-at-bottom': '',
            'data-sticking': '',
          },
          viewport: {
            // role=log 自带 polite，追加进来的行由它播报
            'role': 'log',
            'aria-label': 'Log',
            'aria-busy': null,
            // 让键盘用户落得进日志区
            'tabindex': '0',
          },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '可访问名可改：translations 覆盖日志区的名字',
      spec: { apg: LIVE },
      props: { translations: { log: '构建日志' } },
      initial: {
        parts: {
          viewport: { 'aria-label': '构建日志' },
        },
      },
    },
    {
      name: 'rows 按行数定高，行高本身留给皮肤',
      spec: { apg: APG },
      props: { rows: 6 },
      steps: [
        {
          kind: 'raw',
          why: '内联样式不进属性快照，高度只能直接读节点的 style',
          run: expectRowsHeight(6),
        },
      ],
    },
    {
      name: 'rows 缺席时不写内联高度：默认行数归皮肤',
      spec: { apg: APG },
      steps: [
        {
          kind: 'raw',
          why: '内联样式不进属性快照，高度只能直接读节点的 style',
          run: expectNoInlineHeight,
        },
      ],
    },
    {
      name: '取行中：根落 data-loading，日志区报 aria-busy',
      spec: { apg: LIVE },
      props: { loading: true },
      initial: {
        parts: {
          root: { 'data-loading': '' },
          viewport: { 'aria-busy': 'true' },
        },
      },
    },
    {
      name: '日志区自身可聚焦：键盘用户落得进去',
      spec: { apg: APG },
      covers: ['log.kbd.viewport-tab'],
      steps: [
        {
          kind: 'focus',
          part: 'viewport',
          expect: { activeElement: { part: 'viewport', exact: true }, events: [] },
        },
      ],
    },
    {
      name: '用户上滚：根上的在底标记落下，粘附意图仍留着，状态如实报给宿主',
      spec: { apg: APG },
      skipParity: 'jsdom 无布局，粘底状态由伪造几何驱动，两适配器的 RO 回调时机天然不同步',
      steps: [
        {
          kind: 'raw',
          why: 'jsdom 无布局，滚动几何恒为 0、视口永远判成在底，粘底状态只能由伪造几何驱动',
          run: scrollAwayFromBottom,
          expect: {
            parts: {
              root: { 'data-at-bottom': null, 'data-sticking': '' },
            },
            events: [{ type: 'stick-change', detail: { atBottom: false, sticking: true } }],
          },
        },
      ],
    },
  ],
}
