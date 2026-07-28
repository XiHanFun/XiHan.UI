import type { ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { loadingBarAnatomy, loadingBarKeyboard } from '@xihan-ui/headless'

// progressbar 是 ARIA 的角色定义，不是一种键盘模式，APG 那边没有与之对应的交互规格
const SPEC = 'https://www.w3.org/TR/wai-aria-1.2/#progressbar'

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { part: 'track', children: [{ part: 'range' }] },
  ],
}

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="loading-bar"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

/** range 的宽度只落内联样式（快照不收 style），要验只能直接读节点。 */
function rangeWidth(doc: Document): string {
  return partEl(doc, 'range').style.inlineSize
}

/** 宽度百分比转回数字；空串（还没写过）按 -1 处理，好与"写了 0%"区分开。 */
function widthPercent(doc: Document): number {
  const raw = rangeWidth(doc)
  if (!raw.endsWith('%'))
    return -1
  return Number.parseFloat(raw)
}

function assertRangeWidth(expected: string): (ctx: RawStepContext) => void {
  return ({ doc }) => {
    const actual = rangeWidth(doc)
    if (actual !== expected)
      throw new Error(`range 宽度期望 ${expected}，实际 ${actual || '(空)'}`)
  }
}

/** 爬升跑在真实时钟上，只能真等。每处等待的余量都写在调用点。 */
function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/** 轮询到宽度真的长过起点为止；超时即判定"根本没在爬"。 */
function waitForClimb(timeoutMs: number): (ctx: RawStepContext) => Promise<void> {
  return async ({ doc, flush }) => {
    const start = widthPercent(doc)
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
      await flush()
      if (widthPercent(doc) > start)
        return
      await sleep(10)
    }
    throw new Error(`等了 ${timeoutMs}ms 宽度仍停在 ${start}%：爬升没跑起来`)
  }
}

/**
 * 顶部加载条。
 *
 * 声明式用例一律把 trickle 关掉：爬升会按真实时钟一拍一拍地改值并派 value-change，
 * 帧里的事件条数随时钟漂，逐帧断言与跨适配器比对都没法成立。
 * 爬升本身另开两条 raw 用例验，并标 skipParity。
 */
export const loadingBarSuite: ConformanceSuite = {
  component: 'loading-bar',
  anatomy: loadingBarAnatomy,
  keyboard: loadingBarKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '初始收起：root 是 progressbar 且带名字与值域两端，条子让位',
      spec: { apg: SPEC },
      props: { loading: false },
      initial: {
        order: ['root', 'track', 'range'],
        counts: { root: 1, track: 1, range: 1 },
        parts: {
          root: {
            'role': 'progressbar',
            // progressbar 没有可见标题，名字只能由组件给
            'aria-label': 'Loading',
            'aria-valuemin': '0',
            'aria-valuemax': '100',
            // 没在加载也没给 value：不确定进度，valuenow 整个缺席
            'aria-valuenow': null,
            'data-state': 'idle',
            'data-indeterminate': '',
            'hidden': '',
            // 不可聚焦、不进 Tab 序列：它只是一条报进度的带子
            'tabindex': null,
          },
          track: { 'data-state': 'idle' },
          range: { 'data-state': 'idle' },
        },
        activeElement: null,
        events: [],
      },
    },
    {
      name: '确定进度：照着 value 显示，aria-valuenow 与宽度对得上',
      spec: { apg: SPEC },
      props: { loading: true, value: 40, trickle: false },
      initial: {
        parts: {
          root: {
            'aria-valuenow': '40',
            // 有确定进度就不是"不确定"，这个钩子必须消失
            'data-indeterminate': null,
            'data-state': 'loading',
            'hidden': null,
          },
        },
      },
      steps: [
        {
          kind: 'raw',
          why: '宽度只落内联 style，不进归一化快照',
          run: assertRangeWidth('40%'),
        },
      ],
    },
    {
      name: '受控 value：宿主写回什么就显示什么，越界也夹得住',
      spec: { adr: 'controlled-uncontrolled' },
      props: { loading: true, value: 10, trickle: false },
      steps: [
        {
          kind: 'setProps',
          props: { value: 70 },
          expect: {
            parts: { root: { 'aria-valuenow': '70' } },
            // 宿主自己写进来的值不是新的用户意图，不回一个 value-change
            events: [],
          },
        },
        { kind: 'raw', why: '宽度只落内联 style', run: assertRangeWidth('70%') },
        {
          kind: 'setProps',
          props: { value: 500 },
          expect: { parts: { root: { 'aria-valuenow': '100' } } },
        },
        { kind: 'raw', why: '宽度只落内联 style', run: assertRangeWidth('100%') },
      ],
    },
    {
      name: '不确定进度走完一轮：起步跳到 minimum，收尾先冲 100 再淡出归零',
      spec: { apg: SPEC },
      // trickle 关掉，这一轮里除了起步/冲刺/归零之外没有第二个人改值
      props: { loading: false, trickle: false, minimum: 25, fadeDuration: 200 },
      steps: [
        {
          kind: 'setProps',
          props: { loading: true },
          expect: {
            parts: {
              root: {
                'data-state': 'loading',
                'hidden': null,
                // 编出来的宽度不报给读屏：省略 valuenow 才是"进度未知"的表达
                'aria-valuenow': null,
                'data-indeterminate': '',
              },
              track: { 'data-state': 'loading' },
              range: { 'data-state': 'loading' },
            },
            events: [{ type: 'value-change', detail: { value: 25 } }],
          },
        },
        { kind: 'raw', why: '起步高度只落内联 style', run: assertRangeWidth('25%') },
        {
          kind: 'setProps',
          props: { loading: false },
          expect: {
            parts: {
              // 冲到 100 之后还得留在台上，淡出那一段动画才跑得完
              root: { 'data-state': 'finishing', 'hidden': null, 'aria-valuenow': null },
              range: { 'data-state': 'finishing' },
            },
            events: [{ type: 'value-change', detail: { value: 100 } }],
          },
        },
        { kind: 'raw', why: '冲刺后的宽度只落内联 style', run: assertRangeWidth('100%') },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'idle' } },
          expect: {
            parts: { root: { 'data-state': 'idle', 'hidden': '' } },
            // 归零发生在淡出走完那一刻，不在进入淡出那一刻
            events: [{ type: 'value-change', detail: { value: 0 } }],
          },
        },
        { kind: 'raw', why: '归零后的宽度只落内联 style', run: assertRangeWidth('0%') },
      ],
    },
    {
      name: '淡出途中又开始加载：从起步值重来，不从满格接着走',
      spec: { apg: SPEC },
      props: { loading: true, trickle: false, minimum: 12, fadeDuration: 5000 },
      steps: [
        { kind: 'setProps', props: { loading: false }, expect: { parts: { root: { 'data-state': 'finishing' } } } },
        {
          kind: 'setProps',
          props: { loading: true },
          expect: {
            parts: { root: { 'data-state': 'loading' } },
            events: [{ type: 'value-change', detail: { value: 12 } }],
          },
        },
        { kind: 'raw', why: '起步高度只落内联 style', run: assertRangeWidth('12%') },
      ],
    },
    {
      name: 'trickle 关掉：停在起步值等宿主收尾，自己一步都不挪',
      spec: { apg: SPEC },
      props: { loading: true, trickle: false, minimum: 30, trickleSpeed: 10 },
      steps: [
        {
          kind: 'raw',
          why: '"什么都没发生"只能靠真等一段时间来验；节拍是 10ms，等它三十拍',
          run: async ({ doc, flush }) => {
            await sleep(300)
            await flush()
            const width = rangeWidth(doc)
            if (width !== '30%')
              throw new Error(`关掉 trickle 之后宽度不该动，期望 30%，实际 ${width || '(空)'}`)
          },
          // 一步都没挪，也就一个事件都不该派
          expect: { events: [] },
        },
      ],
    },
    {
      name: '确定进度下爬升整个让位：值一动不动，也不派 value-change',
      spec: { apg: SPEC },
      // trickle 没关，靠的就是"给了 value"这一条把它挡在门外
      props: { loading: true, value: 40, trickleSpeed: 10 },
      steps: [
        {
          kind: 'raw',
          why: '要验的正是"过了三十拍也没人动它"，只能真等',
          run: async ({ doc, flush }) => {
            await sleep(300)
            await flush()
            const width = rangeWidth(doc)
            if (width !== '40%')
              throw new Error(`确定进度的宽度归宿主，期望 40%，实际 ${width || '(空)'}`)
          },
          expect: {
            parts: { root: { 'aria-valuenow': '40' } },
            events: [],
          },
        },
      ],
    },
    {
      name: '不确定进度自行爬升：宽度真的往前长',
      spec: { apg: SPEC },
      props: { loading: true, minimum: 5, trickleSpeed: 20 },
      skipParity: '爬升按真实时钟改值并派 value-change，两侧一次录制里跑到第几拍天然对不齐',
      steps: [
        {
          kind: 'raw',
          why: '爬升跑在真实时钟上，settle 只认属性、认不了内联宽度',
          run: waitForClimb(1000),
        },
      ],
    },
    {
      name: '爬升永远到不了 100：一直爬也留着最后那一线',
      spec: { apg: SPEC },
      props: { loading: true, minimum: 5, trickleSpeed: 5 },
      skipParity: '同上，爬升的帧序与时钟绑定',
      steps: [
        {
          kind: 'raw',
          why: '"永远到不了 100"只能靠爬够多拍再看',
          run: async ({ doc, flush }) => {
            // 5ms 一拍，等一百多拍：按剩余量取步长的实现此刻已经贴着上限了
            await sleep(600)
            await flush()
            const percent = widthPercent(doc)
            if (percent <= 5)
              throw new Error(`等了 600ms 宽度仍是 ${percent}%：爬升没跑起来`)
            if (percent >= 100)
              throw new Error(`不确定进度爬到了 ${percent}%：假进度不该顶到满格`)
            // 满格是"事情办完了"的意思，此刻谁都还不知道办没办完
            if (partEl(doc, 'root').getAttribute('data-state') !== 'loading')
              throw new Error('爬到头不等于加载结束，状态不该离开 loading')
          },
        },
      ],
    },
    {
      name: 'height / color 落到内联样式上：厚度归 root，颜色归 range',
      spec: { apg: SPEC },
      props: { loading: true, value: 50, trickle: false, height: 6, color: 'tomato' },
      steps: [
        {
          kind: 'raw',
          why: '两处都只落内联 style，不进归一化快照',
          run: ({ doc }) => {
            const thickness = partEl(doc, 'root').style.blockSize
            if (thickness !== '6px')
              throw new Error(`厚度期望 6px，实际 ${thickness || '(空)'}`)
            const background = partEl(doc, 'range').style.background
            if (background !== 'tomato')
              throw new Error(`进度段颜色期望 tomato，实际 ${background || '(空)'}`)
          },
        },
      ],
    },
    {
      name: 'translations.root 换掉读屏念出的名字',
      spec: { apg: SPEC },
      props: { loading: true, trickle: false, translations: { root: '正在加载' } },
      initial: {
        parts: { root: { 'aria-label': '正在加载' } },
      },
    },
  ],
}
