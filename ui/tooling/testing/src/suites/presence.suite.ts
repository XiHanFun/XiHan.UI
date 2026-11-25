import type { ConformanceSuite, RawStepContext, StepWithExpect } from '../conformance/types'
import { presenceAnatomy, presenceKeyboard } from '@xihan-ui/headless'
import { installCssAnimationMock } from '../conformance/css-animation-mock'
import { expectPartText } from './shared/content-text'

// 出处：进出场等退场动画播完再撤下，设计真源「浮层进出场」一节；挂卸判定与披露内容同一份
const ADR = 'disclosure-content-mount'

/** 挂卸看的是子节点，快照不收子节点。 */
const WHY_TEXT = '挂卸看的是子节点，快照不收子节点'

/** root 里此刻的文字：挂着内容是「内容」，撤下了是空串。 */
function contentIs(expected: string): StepWithExpect {
  return { kind: 'raw', why: WHY_TEXT, run: expectPartText('presence', 'root', 0, expected) }
}

/** 原生的 getComputedStyle，伪造退场动画期间暂存，结束后放回。 */
let nativeComputedStyle: Window['getComputedStyle'] | null = null
const animationMocks = new Map<Element, ReturnType<typeof installCssAnimationMock>>()

/**
 * 给退场中的 root 伪造一支退场动画：无头 DOM 不把样式表里的 animation 算进 getComputedStyle，
 * 退场闸门那条路走不到；这里让它读到 xh-fade-out 并申领租约，退场那一段才在三端都看得见。
 */
function fakeFadeOut(on: boolean): StepWithExpect {
  return {
    kind: 'raw',
    why: '无头 DOM 里 animationName 恒为空串，退场闸门申领不了租约；退场那一段还看得见的事实只能靠伪造的退场动画验',
    run: ({ doc }) => {
      const win = doc.defaultView!
      if (!on) {
        for (const mock of animationMocks.values()) mock.restore()
        animationMocks.clear()
        if (nativeComputedStyle)
          win.getComputedStyle = nativeComputedStyle
        nativeComputedStyle = null
        return
      }
      const native = win.getComputedStyle
      nativeComputedStyle = native
      win.getComputedStyle = (el: Element, pseudo?: string | null): CSSStyleDeclaration => {
        const style = native.call(win, el, pseudo)
        const exiting = el.getAttribute('data-scope') === 'presence'
          && el.getAttribute('data-part') === 'root'
          && el.getAttribute('data-state') === 'closed'
        if (!exiting)
          return style
        if (!animationMocks.has(el))
          animationMocks.set(el, installCssAnimationMock(el, 'xh-fade-out'))
        return new Proxy(style, {
          get(target, key) {
            if (key === 'animationName')
              return 'xh-fade-out'
            if (key === 'display')
              return 'block'
            const value = Reflect.get(target, key)
            return typeof value === 'function' ? value.bind(target) : value
          },
        })
      }
    },
  }
}

/** 伪造的退场动画播完：派一次 root 自己的 animationend，再等闸门把收起落下来。 */
function finishFadeOut(): StepWithExpect {
  return {
    kind: 'raw',
    why: '退场动画的结束信号由平台派发，无头 DOM 里只能手工派 animationend',
    run: async ({ doc, flush }: RawStepContext) => {
      const el = doc.querySelector<HTMLElement>('[data-scope="presence"][data-part="root"]')
      if (!el)
        throw new Error('找不到 presence root')
      const event = new Event('animationend', { bubbles: true })
      Object.defineProperty(event, 'animationName', { value: 'xh-fade-out' })
      el.dispatchEvent(event)
      // 租约在动画的 finished 兑现后的微任务里归还，适配器随后才重渲：多刷几拍直到收起落下
      for (let attempt = 0; attempt < 20 && !el.hidden; attempt++) {
        await flush()
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    },
  }
}

/** 退场那一段里 root 的文字：伪造动画的对象没有 finish()，不能走 expectPartText 那条先结束动画的路。 */
function exitingContentIs(expected: string): StepWithExpect {
  return {
    kind: 'raw',
    why: WHY_TEXT,
    run: async ({ doc, flush }: RawStepContext) => {
      await flush()
      const got = doc.querySelector('[data-scope="presence"][data-part="root"]')?.textContent ?? null
      if (got !== expected)
        throw new Error(`presence root 的文本是 ${JSON.stringify(got)}，期望 ${JSON.stringify(expected)}`)
    },
  }
}

/**
 * presence 的一致性套件：锁「在不在」投影到 root 的 data-state / hidden / data-instant，内容几时挂、几时卸，
 * 以及 exit-complete 几时发。无头 DOM 没有动画，退场按无动画即刻结束；退场那一段由伪造的退场动画验。
 */
export const presenceSuite: ConformanceSuite = {
  component: 'presence',
  anatomy: presenceAnatomy,
  keyboard: presenceKeyboard,
  fixture: { part: 'root', children: [{ tag: 'span', text: '内容' }] },
  cases: [
    {
      name: '缺省不在场：root 带 data-state=closed 与 hidden，不挂内容、不派发 exit-complete',
      spec: { adr: ADR },
      initial: {
        order: ['root'],
        counts: { root: 1 },
        parts: {
          root: {
            'role': null,
            'data-state': 'closed',
            'hidden': '',
            'data-instant': null,
          },
        },
        events: [],
      },
      steps: [contentIs('')],
    },
    {
      name: '首帧就在场：直接呈现，root 带 data-instant、不带 hidden，内容挂着',
      spec: { adr: ADR },
      props: { present: true },
      initial: {
        parts: {
          root: {
            'data-state': 'open',
            'hidden': null,
            'data-instant': '',
          },
        },
        events: [],
      },
      steps: [contentIs('内容')],
    },
    {
      name: 'present 变 true 进场（不带 data-instant），变 false 退场落定后藏起、卸下内容并派发 exit-complete',
      spec: { adr: ADR },
      steps: [
        {
          kind: 'setProps',
          props: { present: true },
          expect: {
            parts: { root: { 'data-state': 'open', 'hidden': null, 'data-instant': null } },
            events: [],
          },
        },
        contentIs('内容'),
        // 无头 DOM 里没有退场动画，闸门当场放行：这一步里就藏起、卸下并派发
        {
          kind: 'setProps',
          props: { present: false },
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': '', 'data-instant': null } },
            events: [{ type: 'exit-complete', detail: null }],
          },
        },
        contentIs(''),
      ],
    },
    {
      name: '首帧在场的第一次退场照常播：撤掉 data-instant，退场落定后派发 exit-complete',
      spec: { adr: ADR },
      props: { present: true },
      steps: [
        {
          kind: 'setProps',
          props: { present: false },
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': '', 'data-instant': null } },
            events: [{ type: 'exit-complete', detail: null }],
          },
        },
        contentIs(''),
      ],
    },
    {
      name: '退场那一段：root 不带 hidden、内容还在、不派发；动画播完才藏起、卸下并派发 exit-complete',
      spec: { adr: ADR },
      props: { present: true },
      steps: [
        fakeFadeOut(true),
        {
          kind: 'setProps',
          props: { present: false },
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': null } },
            events: [],
          },
        },
        exitingContentIs('内容'),
        {
          ...finishFadeOut(),
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'exit-complete', detail: null }],
          },
        },
        exitingContentIs(''),
        fakeFadeOut(false),
      ],
    },
    {
      name: '退场中途改回在场：取消退场，内容不卸、不派发 exit-complete',
      spec: { adr: ADR },
      props: { present: true },
      steps: [
        fakeFadeOut(true),
        {
          kind: 'setProps',
          props: { present: false },
          expect: { parts: { root: { 'data-state': 'closed', 'hidden': null } } },
        },
        {
          kind: 'setProps',
          props: { present: true },
          expect: {
            parts: { root: { 'data-state': 'open', 'hidden': null, 'data-instant': null } },
            events: [],
          },
        },
        exitingContentIs('内容'),
        fakeFadeOut(false),
      ],
    },
    {
      name: 'lazyMount 与 unmountOnExit 都为 false：没在场过内容也挂着，随 root 一起藏起',
      spec: { adr: ADR },
      props: { lazyMount: false, unmountOnExit: false },
      initial: { parts: { root: { 'data-state': 'closed', 'hidden': '' } } },
      steps: [contentIs('内容')],
    },
    {
      name: 'unmountOnExit 为 false：第一次在场之前仍不挂；在场过之后退场落定内容留着，root 只带 hidden，再次在场原样露出',
      spec: { adr: ADR },
      props: { unmountOnExit: false },
      steps: [
        contentIs(''),
        { kind: 'setProps', props: { present: true } },
        contentIs('内容'),
        {
          kind: 'setProps',
          props: { present: false },
          expect: {
            parts: { root: { 'data-state': 'closed', 'hidden': '' } },
            events: [{ type: 'exit-complete', detail: null }],
          },
        },
        contentIs('内容'),
        {
          kind: 'setProps',
          props: { present: true },
          expect: { parts: { root: { 'data-state': 'open', 'hidden': null } } },
        },
        contentIs('内容'),
      ],
    },
  ],
}
