import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { truncateAnatomy, truncateKeyboard } from '@xihan-ui/headless'

// 不可展开时这块文字只是一段字；开了 expandable 才按按钮那套走。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

const TEXT = '这一段话长得一行放不下，夹住之后尾巴上会收一个省略号'

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [{ text: TEXT }],
}

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="truncate"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

/**
 * 把这一刻的量测结果原地伪造出来，再逼观察器重量一次。
 *
 * 无布局环境四个尺寸恒是 0，谁都不溢出；那里也没有 ResizeObserver，
 * 只能动一下盒内的内容，让盯内容的那个观察器把量测拉起来。
 * 伪造的尺寸留到本用例结束不撤：铺开再收回时还要再量一次，两次得读到同一份。
 */
function measuredAs(scroll: number, client: number): (ctx: RawStepContext) => Promise<void> {
  return async ({ doc, flush }) => {
    const el = partEl(doc, 'root')
    for (const name of ['scrollWidth', 'clientWidth', 'scrollHeight', 'clientHeight']) {
      Object.defineProperty(el, name, {
        configurable: true,
        value: name.startsWith('scroll') ? scroll : client,
      })
    }
    el.appendChild(doc.createTextNode(''))
    await flush()
  }
}

/** 量成某个样子，并断言溢出结论。 */
function measureStep(scroll: number, client: number, overflowing: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '无布局环境四个尺寸恒是 0，只能把这一刻量到的结果原地伪造出来',
    run: measuredAs(scroll, client),
    expect: {
      parts: {
        root: { 'data-overflowing': overflowing ? '' : null },
      },
    },
  }
}

/** 原生提示不进快照（title 既不是 data- 也不是 aria-），只能原地读一眼。 */
function assertTitle(expected: string | null): StepWithExpect {
  return {
    kind: 'raw',
    why: 'title 不在快照采集的属性集里（既非 data- 也非 aria-），只能直接读节点',
    run: async ({ doc, flush }) => {
      await flush()
      const el = partEl(doc, 'root')
      const actual = el.getAttribute('title')
      if (actual !== expected)
        throw new Error(`title 期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(actual)}（state=${el.getAttribute('data-state')} overflowing=${el.getAttribute('data-overflowing')} scrollW=${el.scrollWidth} clientW=${el.clientWidth}）`)
    },
  }
}

export const truncateSuite: ConformanceSuite = {
  component: 'truncate',
  anatomy: truncateAnatomy,
  keyboard: truncateKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '缺省：夹一行，没有按钮语义，也还没报溢出',
      spec: { apg: APG },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'data-lines': '1',
            'data-multiline': null,
            'data-expandable': null,
            'data-state': null,
            'data-overflowing': null,
            // 不可展开时这几件一个都不写，它就还是一段普通的文字
            'role': null,
            'tabindex': null,
            'aria-expanded': null,
          },
        },
        activeElement: null,
      },
    },
    {
      name: 'lines > 1 改走多行裁剪，行数如实落在 data-lines 上',
      spec: { apg: APG },
      props: { lines: 3 },
      initial: {
        parts: {
          root: { 'data-lines': '3', 'data-multiline': '' },
        },
      },
    },
    {
      name: 'lines 给不出有限数就退回夹一行',
      spec: { apg: APG },
      props: { lines: Number.NaN },
      initial: {
        parts: {
          root: { 'data-lines': '1', 'data-multiline': null },
        },
      },
    },
    {
      name: '量到被裁才报 data-overflowing，装得下就不报',
      spec: { apg: APG },
      steps: [
        // 差 1 是取整带来的，不算被裁
        measureStep(101, 100, false),
        measureStep(400, 100, true),
      ],
    },
    {
      name: 'expandable 且真被裁：整块文字变成一颗按钮，Tab 停得住',
      spec: { apg: APG },
      covers: ['truncate.kbd.tab'],
      props: { expandable: true },
      // 还没量出被裁的这一帧：按下去什么都不变，按钮那几件一个都不写，
      // 否则读屏念出的是一颗按不动的按钮、Tab 也白停一站
      initial: {
        parts: {
          root: {
            'data-expandable': '',
            'data-overflowing': null,
            'role': null,
            'tabindex': null,
            'aria-expanded': null,
            'data-state': null,
          },
        },
      },
      steps: [
        {
          ...measureStep(400, 100, true),
          expect: {
            parts: {
              root: {
                'role': 'button',
                'tabindex': '0',
                'aria-expanded': 'false',
                'data-expandable': '',
                'data-overflowing': '',
                'data-state': 'closed',
              },
            },
          },
        },
      ],
    },
    {
      name: 'expandable：Enter 铺开、Space 收回',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['truncate.kbd.toggle'],
      props: { expandable: true },
      steps: [
        measureStep(400, 100, true),
        { kind: 'focus', part: 'root' },
        {
          kind: 'key',
          key: 'Enter',
          expect: {
            parts: { root: { 'aria-expanded': 'true', 'data-state': 'open' } },
          },
        },
        {
          kind: 'key',
          key: 'Space',
          expect: {
            parts: { root: { 'aria-expanded': 'false', 'data-state': 'closed' } },
          },
        },
      ],
    },
    {
      name: '点一下也能铺开；铺开着不再报被裁的那一版',
      spec: { apg: APG },
      props: { expandable: true },
      steps: [
        measureStep(400, 100, true),
        {
          kind: 'click',
          part: 'root',
          expect: {
            // 铺开后不再重量：结论留着上一次的，供作者判断收回去会不会又被裁
            parts: { root: { 'data-state': 'open', 'data-overflowing': '' } },
          },
        },
      ],
    },
    {
      name: 'tooltip：真被裁了才把整段文字交给平台的原生提示，铺开后撤走',
      spec: { apg: APG },
      props: { tooltip: true, expandable: true },
      steps: [
        // 先量成放得下：「还没被裁」必须是量出来的，不能指望挂载那一刻恰好不溢出——
        // 真实浏览器里这段字在默认视口下本来就放不下
        measureStep(101, 100, false),
        assertTitle(null),
        measureStep(400, 100, true),
        assertTitle(TEXT),
        { kind: 'click', part: 'root' },
        assertTitle(null),
      ],
    },
    {
      name: '受控 expanded：点一下不自改 DOM，父写回 expanded 后才铺开',
      spec: { adr: 'controlled-uncontrolled' },
      props: { expandable: true, expanded: false },
      steps: [
        measureStep(400, 100, true),
        {
          kind: 'click',
          part: 'root',
          expect: {
            parts: { root: { 'data-state': 'closed', 'aria-expanded': 'false' } },
          },
        },
        { kind: 'setProps', props: { expanded: true } },
        {
          kind: 'settle',
          until: { attr: { part: 'root', name: 'data-state', value: 'open' } },
          expect: {
            parts: { root: { 'data-state': 'open', 'aria-expanded': 'true' } },
          },
        },
      ],
    },
  ],
}
