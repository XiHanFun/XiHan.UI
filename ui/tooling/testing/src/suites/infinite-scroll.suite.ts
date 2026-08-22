import type { ConformanceCase, ConformanceSuite, FixtureNode, RawStepContext } from '../conformance/types'
import { infiniteScrollAnatomy, infiniteScrollKeyboard } from '@xihan-ui/headless'

// 触发的判据是「哨兵进没进可视区」，滚动走浏览器原生通路；APG 没有与之对应的交互模式。
const APG = 'https://www.w3.org/WAI/ARIA/apg/'

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [
    { tag: 'div', text: '第 1 条' },
    { part: 'sentinel' },
  ],
}

/** 一次观察的记录：观察到了谁、放宽了多少、有没有被释放。 */
interface ObserverProbe {
  target: Element | null
  rootMargin: string
  disconnected: boolean
}

/** 把宿主的 IntersectionObserver 换成只记账的假货，返回还原函数。 */
function installProbe(win: Window, probes: ObserverProbe[]): () => void {
  const original = Object.getOwnPropertyDescriptor(win, 'IntersectionObserver')

  class Probe {
    private readonly record: ObserverProbe

    constructor(_callback: unknown, options?: { rootMargin?: string }) {
      this.record = { target: null, rootMargin: options?.rootMargin ?? '', disconnected: false }
      probes.push(this.record)
    }

    observe(el: Element): void {
      this.record.target = el
    }

    unobserve(): void {}

    disconnect(): void {
      this.record.disconnected = true
    }

    takeRecords(): unknown[] {
      return []
    }
  }

  Object.defineProperty(win, 'IntersectionObserver', { configurable: true, writable: true, value: Probe })
  return () => {
    if (original)
      Object.defineProperty(win, 'IntersectionObserver', original)
    else
      Reflect.deleteProperty(win, 'IntersectionObserver')
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

/** 观察器推迟一拍才挂，轮询到它出现为止；超时即判定"根本没挂上"。 */
async function waitForProbe(probes: ObserverProbe[], ctx: RawStepContext, timeoutMs = 1000): Promise<ObserverProbe> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    await ctx.flush()
    const probe = probes[0]
    if (probe)
      return probe
    await sleep(10)
  }
  throw new Error(`等了 ${timeoutMs}ms 也没人建观察器：哨兵根本没被观察`)
}

function sentinelEl(doc: Document): HTMLElement {
  const el = doc.querySelector<HTMLElement>('[data-scope="infinite-scroll"][data-part="sentinel"]')
  if (!el)
    throw new Error('fixture 里没有 sentinel 部件')
  return el
}

/**
 * 观察器的接线：只在 idle 挂着，离开 idle 就释放。
 *
 * 从 disabled 起步，等假观察器装好之后再放开，这样挂的那一台一定是假的。
 * 记账数组每次跑用例都先清空——同一份用例数据会被两个适配器各跑一遍。
 */
function observerWiringCase(): ConformanceCase {
  const probes: ObserverProbe[] = []
  let restore: (() => void) | undefined

  return {
    name: '观察器只在 idle 挂着：哨兵是被观察的那个，进入 loading 就释放',
    spec: { apg: APG },
    props: { disabled: true, distance: 120 },
    skipParity: '用例要改写宿主的 IntersectionObserver，两侧各录一次会互相踩到这次全局改写',
    steps: [
      {
        kind: 'raw',
        why: '无布局环境没有 IntersectionObserver，要验接线只能自己装一台只记账的',
        run: ({ doc }) => {
          probes.length = 0
          restore?.()
          const win = doc.defaultView
          if (!win)
            throw new Error('没有 window，无法安装观察器探针')
          restore = installProbe(win, probes)
        },
      },
      // 放开 disabled 才回到 idle，观察器这时才挂
      { kind: 'setProps', props: { disabled: false } },
      {
        kind: 'raw',
        why: '观察器推迟一拍才挂，只能轮询等它出现',
        run: async (ctx) => {
          const probe = await waitForProbe(probes, ctx)
          if (probe.target !== sentinelEl(ctx.doc))
            throw new Error('观察的不是哨兵：观察错了目标，滚到底也不会有人报信')
          // distance 是提前量，只沿块轴放宽
          if (probe.rootMargin !== '120px 0px 120px 0px')
            throw new Error(`提前量应写成块轴两侧各 120px，实际 ${probe.rootMargin}`)
        },
      },
      { kind: 'setProps', props: { loading: true } },
      {
        kind: 'raw',
        why: '释放与否只看假观察器的记账，DOM 上没有对应的痕迹',
        run: async (ctx) => {
          await ctx.flush()
          const probe = probes[0]
          if (!probe?.disconnected)
            throw new Error('进入 loading 之后观察器没释放：哨兵还留在可视区里，会连着触发第二次')
          restore?.()
          restore = undefined
        },
        expect: { parts: { root: { 'data-loading': '' } } },
      },
    ],
  }
}

export const infiniteScrollSuite: ConformanceSuite = {
  component: 'infinite-scroll',
  anatomy: infiniteScrollAnatomy,
  keyboard: infiniteScrollKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '缺省：等着触发，两个部件各一份，哨兵不进无障碍树',
      spec: { apg: APG },
      initial: {
        order: ['root', 'sentinel'],
        counts: { root: 1, sentinel: 1 },
        parts: {
          root: {
            'data-loading': null,
            'data-disabled': null,
            // 没在取数就不该说自己忙
            'aria-busy': null,
            'role': null,
          },
          // 哨兵是纯机制，没有可读内容
          sentinel: { 'aria-hidden': 'true', 'data-loading': null, 'data-disabled': null },
        },
        activeElement: null,
      },
    },
    {
      name: 'loading：报 aria-busy，读屏据此推迟播报这块正在变的内容',
      spec: { apg: APG },
      props: { loading: true },
      initial: {
        parts: {
          root: {
            'data-loading': '',
            'aria-busy': 'true',
            'data-disabled': null,
          },
          sentinel: { 'data-loading': null },
        },
      },
    },
    {
      name: 'disabled 压过 loading：没有下一页了就整个停住，不再是"正在取"',
      spec: { apg: APG },
      props: { disabled: true, loading: true },
      initial: {
        parts: {
          root: {
            'data-disabled': '',
            'data-loading': null,
            // 停住了就不忙了
            'aria-busy': null,
          },
        },
      },
    },
    {
      name: '取完由宿主写回 loading=false，这才回到等着触发的那一段',
      spec: { apg: APG },
      props: { loading: true },
      steps: [
        {
          kind: 'setProps',
          props: { loading: false },
          expect: {
            parts: {
              root: { 'data-loading': null, 'aria-busy': null },
            },
          },
        },
        {
          kind: 'setProps',
          props: { loading: true },
          expect: { parts: { root: { 'data-loading': '' } } },
        },
      ],
    },
    {
      name: '关掉再放开：disabled 收回之后重新回到等着触发的那一段',
      spec: { apg: APG },
      props: { disabled: true },
      steps: [
        {
          kind: 'setProps',
          props: { disabled: false },
          expect: { parts: { root: { 'data-disabled': null, 'data-loading': null } } },
        },
      ],
    },
    observerWiringCase(),
  ],
}
