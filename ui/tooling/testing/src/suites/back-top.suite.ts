import type { ConformanceSuite, FixtureNode, RawStepContext, StepWithExpect } from '../conformance/types'
import { backTopAnatomy, backTopKeyboard } from '@xihan-ui/headless'

// trigger 是原生 button，激活与 Tab 停靠归平台；判据锁的是「什么时候露面」与「点下去往哪滚」。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/button/'

const FIXTURE: FixtureNode = {
  part: 'root',
  children: [{ part: 'trigger', tag: 'button', text: '↑' }],
}

function partEl(doc: Document, part: string): HTMLElement {
  const el = doc.querySelector<HTMLElement>(`[data-scope="back-top"][data-part="${part}"]`)
  if (!el)
    throw new Error(`fixture 里没有 ${part} 部件`)
  return el
}

/**
 * 把整页滚动量摆到某个值再逼观察器重算一次。
 *
 * 无布局环境的滚动量恒是 0，只能原地伪造；且它必须真的变，观察器按
 * 「量到的值与上一次不同」才回调。派完 scroll、等 DOM 落定之后就撤掉，不留给下一个用例。
 */
function scrolledTo(top: number): (ctx: RawStepContext) => Promise<void> {
  return async ({ doc, flush }) => {
    Object.defineProperty(doc.documentElement, 'scrollTop', { configurable: true, value: top })
    doc.defaultView?.dispatchEvent(new Event('scroll'))
    await flush()
    Reflect.deleteProperty(doc.documentElement, 'scrollTop')
  }
}

/** 滚到某个位置并断言按钮露没露面。 */
function step(top: number, visible: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '无布局环境的滚动量恒是 0，只能把这一刻的滚动量原地伪造出来',
    run: scrolledTo(top),
    expect: {
      parts: {
        root: { 'data-state': visible ? 'visible' : 'hidden', 'hidden': visible ? null : '' },
        trigger: { 'data-state': visible ? 'visible' : 'hidden' },
      },
    },
  }
}

/** 点按钮，记下它请求浏览器滚到哪儿。滚动本身无布局环境跑不出来，只能拦下调用看参数。 */
function assertScrollRequest(expected: { top: number, behavior: string }): (ctx: RawStepContext) => Promise<void> {
  return async ({ doc, flush }) => {
    const win = doc.defaultView
    if (!win)
      throw new Error('没有 window，无法验证滚动请求')
    const trigger = partEl(doc, 'trigger')
    // Enter / Space 的激活由平台负责，前提是它真是个原生 button
    if (trigger.tagName !== 'BUTTON')
      throw new Error(`trigger 必须是原生 <button>，实际是 <${trigger.tagName.toLowerCase()}>`)
    const calls: Array<Record<string, unknown>> = []
    const original = Object.getOwnPropertyDescriptor(win, 'scrollTo')
    Object.defineProperty(win, 'scrollTo', {
      configurable: true,
      writable: true,
      value: (options: Record<string, unknown>) => void calls.push(options),
    })
    try {
      trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await flush()
      if (calls.length !== 1)
        throw new Error(`点一下应该只请求一次滚动，实际 ${calls.length} 次`)
      const call = calls[0]!
      if (call.top !== expected.top || call.behavior !== expected.behavior)
        throw new Error(`滚动请求期望 ${JSON.stringify(expected)}，实际 ${JSON.stringify(call)}`)
    }
    finally {
      if (original)
        Object.defineProperty(win, 'scrollTo', original)
      else
        Reflect.deleteProperty(win, 'scrollTo')
    }
  }
}

export const backTopSuite: ConformanceSuite = {
  component: 'back-top',
  anatomy: backTopAnatomy,
  keyboard: backTopKeyboard,
  fixture: FIXTURE,
  cases: [
    {
      name: '起点收着：root 带 hidden，按钮是原生 button 且自带名字',
      spec: { apg: APG },
      initial: {
        order: ['root', 'trigger'],
        counts: { root: 1, trigger: 1 },
        parts: {
          root: {
            'data-state': 'hidden',
            // 收起时整块让位：靠不透明度藏起来的按钮仍然可聚焦、仍然被读屏念到
            'hidden': '',
            'role': null,
            'data-tone': null,
            'data-size': null,
          },
          trigger: {
            // 不写死 type 的话，放在表单里会被当成提交按钮
            'type': 'button',
            // 按钮里通常只有一个图标，名字只能由组件给
            'aria-label': 'Back to top',
            'data-state': 'hidden',
            // 原生 button 自带 Tab 停靠，不该套 roving tabindex
            'tabindex': null,
          },
        },
        activeElement: null,
      },
    },
    {
      name: '滚过 visibilityHeight 才露面，退回线内又收起',
      spec: { apg: APG },
      covers: ['back-top.kbd.tab'],
      steps: [
        // 缺省阈值 200：120 还没到线
        step(120, false),
        step(300, true),
        step(80, false),
      ],
    },
    {
      name: 'visibilityHeight 自定：按给的线判，不按缺省的 200',
      spec: { apg: APG },
      props: { visibilityHeight: 600 },
      steps: [
        // 过了缺省的 200 但没过 600，仍然收着
        step(300, false),
        step(700, true),
      ],
    },
    {
      name: '点按钮滚回顶部，缺省平滑滚过去',
      spec: { apg: APG },
      covers: ['back-top.kbd.activate'],
      steps: [
        step(400, true),
        {
          kind: 'raw',
          why: '无布局环境滚不动，只能拦下 scrollTo 看它被请求成什么样',
          run: assertScrollRequest({ top: 0, behavior: 'smooth' }),
        },
      ],
    },
    {
      name: 'behavior=auto：一步到位，不走平滑',
      spec: { apg: APG },
      props: { behavior: 'auto' },
      steps: [
        step(400, true),
        {
          kind: 'raw',
          why: '无布局环境滚不动，只能拦下 scrollTo 看它被请求成什么样',
          run: assertScrollRequest({ top: 0, behavior: 'auto' }),
        },
      ],
    },
    {
      name: 'translations.trigger 换掉读屏念出的名字',
      spec: { apg: APG },
      props: { translations: { trigger: '回到顶部' } },
      initial: { parts: { trigger: { 'aria-label': '回到顶部' } } },
    },
    {
      name: '语气与尺寸如实落到定位壳上',
      spec: { apg: APG },
      props: { tone: 'brand', size: 'lg' },
      initial: {
        parts: {
          root: { 'data-tone': 'brand', 'data-size': 'lg' },
        },
      },
    },
  ],
}
