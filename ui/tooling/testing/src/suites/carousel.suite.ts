import type { ConformanceSuite, FixtureNode, StepWithExpect } from '../conformance/types'
import { carouselAnatomy, carouselKeyboard } from '@xihan-ui/headless'
import { dispatchClickOnDisabled } from './shared/disabled-press'
import { nativeActivation } from './shared/native-activation'

// APG 的轮播模式：region + aria-roledescription="carousel"，每张 group + roledescription="slide"，
// 自动播放期间视口活区闭麦。方向键翻页是本库在 APG 之外多给的一层（APG 只要求按钮可达）。
const APG = 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/'

function q(doc: Document, part: string, index = 0): HTMLElement | null {
  return doc.querySelectorAll<HTMLElement>(`[data-scope="carousel"][data-part="${part}"]`)[index] ?? null
}

/**
 * 四张幻灯片 + 一页一个的指示点。
 * 条目总数是作者声明的（slideCount prop），节点数与它对齐由用例自己保证——
 * 页数换算本身是纯函数的活，由 headless 单测按不变量守；这里验的是"给定页码，属性该长什么样"。
 *
 * editableSlide 给了就把那一张的正文换成一个输入框：幻灯片里摆搜索框、报名表是常见用法，
 * 方向键落在那儿是移动光标，不是翻页。
 */
function carouselTree(slides = 4, indicators = 4, editableSlide?: number): FixtureNode {
  return {
    part: 'root',
    children: [
      { part: 'prev-trigger', tag: 'button', text: '上一张' },
      {
        part: 'viewport',
        children: [
          {
            part: 'item-group',
            children: Array.from({ length: slides }, (_, i): FixtureNode => (
              i === editableSlide
                ? {
                    part: 'item',
                    attrs: { index: String(i) },
                    children: [{ tag: 'input', attrs: { 'type': 'text', 'data-testid': 'slide-input' } }],
                  }
                : {
                    part: 'item',
                    attrs: { index: String(i) },
                    text: `第 ${i + 1} 张`,
                  }
            )),
          },
        ],
      },
      { part: 'next-trigger', tag: 'button', text: '下一张' },
      {
        part: 'indicator-group',
        children: Array.from({ length: indicators }, (_, i): FixtureNode => ({
          part: 'indicator',
          tag: 'button',
          attrs: { index: String(i) },
          text: String(i + 1),
        })),
      },
    ],
  }
}

/** 轨道位移只写在内联 style 上，不进归一化快照，只能直接看节点。 */
function expectTrack(transform: string): StepWithExpect {
  return {
    kind: 'raw',
    why: '内联 style 不进归一化快照；轨道位移是轮播的核心产出，必须直接读节点才验得到',
    run: ({ doc }) => {
      const track = q(doc, 'item-group')
      if (!track)
        throw new Error('找不到 carousel 的 item-group 部件')
      if (track.style.transform !== transform)
        throw new Error(`item-group 的位移应为 ${transform}，实际是 ${track.style.transform || '(空)'}`)
    },
  }
}

/**
 * 从指定节点派一个方向键，并回读它有没有被 preventDefault。
 *
 * "轮播接没接管这一下"唯一可观察的结果就是 preventDefault：接管了就得吞掉默认行为，
 * 不接管就必须原样放行（页面滚动、输入框里的光标移动都靠它）。步骤词汇里的 key 步骤
 * 拿不到派出去的那个事件对象，读不到这个结果，所以只能走 raw。
 *
 * 事件显式开 cancelable：合成事件默认 cancelable=false，那样 preventDefault 是空操作、
 * defaultPrevented 恒 false，这条断言就永远绿着，什么也咬不住。
 */
function arrowKeyFrom(
  pick: (doc: Document) => HTMLElement | null,
  key: 'ArrowLeft' | 'ArrowRight',
  what: string,
  taken: boolean,
  expect?: StepWithExpect['expect'],
): StepWithExpect {
  return {
    kind: 'raw',
    why: '要验的是这一下有没有被 preventDefault（接管与否唯一的可观察结果），key 步骤读不到派出去的事件',
    run: async ({ doc, flush }) => {
      const el = pick(doc)
      if (!el)
        throw new Error(`找不到按键起点：${what}`)
      el.focus()
      // 焦点没落上去的话 event.target 还是对的，但"焦点在输入框里"这个前提就没演出来
      if (doc.activeElement !== el)
        throw new Error(`${what} 没拿到焦点，这一步没在演真实场景`)
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
      el.dispatchEvent(event)
      await flush()
      if (event.defaultPrevented !== taken) {
        throw new Error(taken
          ? `${what} 上的 ${key} 应被轮播接管并吞掉默认行为，实际放行了`
          : `${what} 上的 ${key} 不该被轮播接管——preventDefault 了，光标就再也移不动`)
      }
    },
    expect,
  }
}

/** 指针进出根节点：pointerenter / pointerleave 不冒泡，直接派在 root 上。 */
function pointerOnRoot(type: 'pointerenter' | 'pointerleave', expect: StepWithExpect['expect']): StepWithExpect {
  return {
    kind: 'raw',
    why: '步骤词汇里没有指针进出；自动播放的按住/放开正是靠这两个事件，必须直接派发',
    run: ({ doc, flush }) => {
      const root = q(doc, 'root')
      if (!root)
        throw new Error('找不到 carousel 的 root 部件')
      root.dispatchEvent(new Event(type))
      return flush()
    },
    expect,
  }
}

export const carouselSuite: ConformanceSuite = {
  component: 'carousel',
  anatomy: carouselAnatomy,
  keyboard: carouselKeyboard,
  fixture: carouselTree(),
  cases: [
    {
      name: '初始帧：region + roledescription，每张自报"第几张/共几张"，首页时上一张原生禁用',
      spec: { apg: APG },
      props: { slideCount: 4 },
      initial: {
        order: [
          'root',
          'prev-trigger',
          'viewport',
          'item-group',
          'item[0]',
          'item[1]',
          'item[2]',
          'item[3]',
          'next-trigger',
          'indicator-group',
          'indicator[0]',
          'indicator[1]',
          'indicator[2]',
          'indicator[3]',
        ],
        counts: { 'root': 1, 'viewport': 1, 'item-group': 1, 'item': 4, 'indicator': 4 },
        parts: {
          'root': {
            'role': 'region',
            'aria-roledescription': 'carousel',
            'aria-label': 'Carousel',
            'data-orientation': 'horizontal',
            // dir 没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向
            'dir': null,
            'data-dragging': null,
            'data-autoplay': null,
          },
          'viewport': {
            'id': '@self',
            // 没开自动播放时手动翻页要念出来
            'aria-live': 'polite',
            'aria-atomic': 'false',
            'data-orientation': 'horizontal',
          },
          'item-group': { 'data-orientation': 'horizontal', 'data-dragging': null },
          'item[0]': {
            'role': 'group',
            'aria-roledescription': 'slide',
            'aria-label': '1 of 4',
            'data-index': '0',
            'data-inview': '',
            // 集合条目从不输出原生 disabled
            'disabled': null,
          },
          'item[1]': { 'aria-label': '2 of 4', 'data-index': '1', 'data-inview': null },
          'item[3]': { 'aria-label': '4 of 4', 'data-inview': null },
          'prev-trigger': {
            'type': 'button',
            'aria-label': 'Previous slide',
            'aria-controls': '@part(viewport)',
            'disabled': '',
            'data-disabled': '',
          },
          'next-trigger': {
            'type': 'button',
            'aria-label': 'Next slide',
            'aria-controls': '@part(viewport)',
            'disabled': null,
            'data-disabled': null,
          },
          'indicator-group': { 'role': 'group', 'aria-label': 'Choose slide to display' },
          'indicator[0]': {
            'type': 'button',
            'aria-label': 'Go to slide 1',
            'aria-current': 'true',
            'data-current': '',
            'data-index': '0',
            // 指示点不做 roving tabindex：每一颗都该是一个 Tab 停靠点
            'tabindex': null,
          },
          // 省略等于"没说"，读屏就分不出"不是当前页"与"作者忘了标"
          'indicator[1]': { 'aria-current': 'false', 'data-current': null },
        },
      },
      steps: [expectTrack('translateX(0%)')],
    },
    {
      name: '点下一张：inview 与 aria-current 一起搬家，轨道位移跟上，上一张解除禁用',
      spec: { apg: APG },
      props: { slideCount: 4 },
      steps: [
        {
          kind: 'click',
          part: 'next-trigger',
          expect: {
            parts: {
              'item[0]': { 'data-inview': null },
              'item[1]': { 'data-inview': '' },
              'indicator[0]': { 'aria-current': 'false', 'data-current': null },
              'indicator[1]': { 'aria-current': 'true', 'data-current': '' },
              'prev-trigger': { 'disabled': null, 'data-disabled': null },
            },
          },
        },
        expectTrack('translateX(-100%)'),
      ],
    },
    {
      name: '点指示点即跳到那一页',
      spec: { apg: APG },
      props: { slideCount: 4 },
      steps: [
        {
          kind: 'click',
          part: 'indicator[2]',
          expect: {
            parts: {
              'item[2]': { 'data-inview': '' },
              'indicator[2]': { 'aria-current': 'true' },
              'indicator[0]': { 'aria-current': 'false' },
              'next-trigger': { disabled: null },
            },
          },
        },
        expectTrack('translateX(-200%)'),
      ],
    },
    {
      name: '横轨：左右键翻页；上下键不归导航管，焦点与页码都不动',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.next', 'carousel.kbd.prev'],
      props: { slideCount: 4 },
      steps: [
        { kind: 'focus', part: 'next-trigger' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: {
            activeElement: { part: 'next-trigger', exact: true },
            parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } },
          },
        },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: {
            // 横排轮播里吞掉上下键，整页就再也滚不动了
            parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } },
          },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: {
            parts: { 'item[0]': { 'data-inview': '' }, 'indicator[0]': { 'aria-current': 'true' } },
          },
        },
      ],
    },
    {
      // defaultPage 取 1：两边都还有页可去，页码没动才有判别力
      name: '幻灯片内的输入框：方向键交还给它做光标移动，轮播不接管也不翻页',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.editable'],
      fixture: () => carouselTree(4, 4, 1),
      props: { slideCount: 4, defaultPage: 1 },
      steps: [
        arrowKeyFrom(
          doc => q(doc, 'item', 1)?.querySelector<HTMLElement>('[data-testid="slide-input"]') ?? null,
          'ArrowRight',
          '幻灯片内的输入框',
          false,
          {
            // 焦点仍在输入框里（它在 item[1] 之内、不是 item 本身）
            activeElement: { part: 'item[1]', exact: false },
            parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } },
          },
        ),
        arrowKeyFrom(
          doc => q(doc, 'item', 1)?.querySelector<HTMLElement>('[data-testid="slide-input"]') ?? null,
          'ArrowLeft',
          '幻灯片内的输入框',
          false,
          {
            activeElement: { part: 'item[1]', exact: false },
            parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } },
          },
        ),
        // 对照组：少了这一步，keydown 处理器整个坏掉也能让上面两步绿过去
        arrowKeyFrom(
          doc => q(doc, 'next-trigger'),
          'ArrowRight',
          '下一张按钮',
          true,
          {
            activeElement: { part: 'next-trigger', exact: true },
            parts: {
              'item[1]': { 'data-inview': null },
              'item[2]': { 'data-inview': '' },
              'indicator[2]': { 'aria-current': 'true' },
            },
          },
        ),
      ],
    },
    {
      name: 'home / End 跳到首末页',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.first', 'carousel.kbd.last'],
      props: { slideCount: 4, defaultPage: 1 },
      steps: [
        // 焦点落在指示点而不是两端按钮上：端点按钮转原生 disabled 后焦点会被浏览器收走
        { kind: 'focus', part: 'indicator[1]' },
        {
          kind: 'key',
          key: 'End',
          expect: {
            activeElement: { part: 'indicator[1]', exact: true },
            parts: {
              'item[3]': { 'data-inview': '' },
              'indicator[3]': { 'aria-current': 'true' },
              'next-trigger': { disabled: '' },
            },
          },
        },
        {
          kind: 'key',
          key: 'Home',
          expect: {
            parts: {
              'item[0]': { 'data-inview': '' },
              'indicator[0]': { 'aria-current': 'true' },
              'prev-trigger': { disabled: '' },
            },
          },
        },
      ],
    },
    {
      name: 'orientation=vertical：上下键成为翻页键，左右键放行',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.next-vertical', 'carousel.kbd.prev-vertical'],
      props: { slideCount: 4, orientation: 'vertical' },
      initial: {
        parts: {
          'root': { 'data-orientation': 'vertical' },
          'viewport': { 'data-orientation': 'vertical' },
          'item-group': { 'data-orientation': 'vertical' },
        },
      },
      steps: [
        { kind: 'focus', part: 'next-trigger' },
        {
          kind: 'key',
          key: 'ArrowDown',
          expect: { parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } } },
        },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } } },
        },
        // 纵轨走 translateY，与文字方向无关
        expectTrack('translateY(-100%)'),
      ],
    },
    {
      name: '横轨 + dir=rtl：右键走上一页、左键走下一页，轨道往正方向位移',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.prev', 'carousel.kbd.next'],
      props: { slideCount: 4, dir: 'rtl', defaultPage: 2 },
      initial: { parts: { root: { dir: 'rtl' } } },
      steps: [
        expectTrack('translateX(200%)'),
        { kind: 'focus', part: 'next-trigger' },
        {
          kind: 'key',
          key: 'ArrowRight',
          expect: { parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } } },
        },
        {
          kind: 'key',
          key: 'ArrowLeft',
          expect: { parts: { 'item[2]': { 'data-inview': '' }, 'indicator[2]': { 'aria-current': 'true' } } },
        },
      ],
    },
    {
      name: 'loop=true：两端都推得动，首页往回落到末页',
      spec: { apg: APG },
      props: { slideCount: 4, loop: true },
      initial: {
        parts: {
          'prev-trigger': { 'disabled': null, 'data-disabled': null },
          'next-trigger': { disabled: null },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'prev-trigger',
          expect: {
            parts: {
              'item[3]': { 'data-inview': '' },
              'item[0]': { 'data-inview': null },
              'indicator[3]': { 'aria-current': 'true' },
            },
          },
        },
        {
          kind: 'click',
          part: 'next-trigger',
          expect: { parts: { 'item[0]': { 'data-inview': '' }, 'indicator[0]': { 'aria-current': 'true' } } },
        },
      ],
    },
    {
      // 走 dispatchEvent 而不是 click：禁用按钮上 el.click() 被激活行为短路，事件不派发
      name: '首页时上一张推不动：合成 click 也不会绕到末页',
      spec: { apg: APG },
      props: { slideCount: 4 },
      steps: [
        dispatchClickOnDisabled('carousel', 'prev-trigger', {
          parts: {
            'item[0]': { 'data-inview': '' },
            'item[3]': { 'data-inview': null },
            'indicator[0]': { 'aria-current': 'true' },
          },
        }),
      ],
    },
    {
      name: '末页时下一张推不动：合成 click 也不会绕回首页',
      spec: { apg: APG },
      props: { slideCount: 4, defaultPage: 3 },
      steps: [
        dispatchClickOnDisabled('carousel', 'next-trigger', {
          parts: {
            'item[3]': { 'data-inview': '' },
            'item[0]': { 'data-inview': null },
            'indicator[3]': { 'aria-current': 'true' },
          },
        }),
      ],
    },
    {
      name: 'slidesPerPage=2：一页露两张，指示点降到两颗，位移按份数摊',
      spec: { apg: APG },
      fixture: () => carouselTree(4, 2),
      props: { slideCount: 4, slidesPerPage: 2 },
      initial: {
        counts: { item: 4, indicator: 2 },
        parts: {
          'item[0]': { 'data-inview': '', 'aria-label': '1 of 4' },
          'item[1]': { 'data-inview': '' },
          'item[2]': { 'data-inview': null },
          'indicator[0]': { 'aria-current': 'true' },
          'indicator[1]': { 'aria-current': 'false' },
        },
      },
      steps: [
        {
          kind: 'click',
          part: 'next-trigger',
          expect: {
            parts: {
              'item[1]': { 'data-inview': null },
              'item[2]': { 'data-inview': '' },
              'item[3]': { 'data-inview': '' },
              'indicator[1]': { 'aria-current': 'true' },
              // 两页走完，下一张到头
              'next-trigger': { disabled: '' },
            },
          },
        },
        // 第 1 页从第 2 张起，一张占半屏 → 位移一个视口
        expectTrack('translateX(-100%)'),
      ],
    },
    {
      name: 'slideCount 变小：当前页夹回末页，下一张随之禁用',
      spec: { apg: APG },
      props: { slideCount: 4, defaultPage: 3 },
      initial: { parts: { 'item[3]': { 'data-inview': '' } } },
      steps: [
        {
          // 图片被撤掉一批后，停在第 4 张的轮播自己退回第 2 张
          kind: 'setProps',
          props: { slideCount: 2 },
          expect: {
            parts: {
              'item[3]': { 'data-inview': null },
              'item[1]': { 'data-inview': '' },
              'indicator[1]': { 'aria-current': 'true' },
              'indicator[3]': { 'aria-current': 'false' },
              'next-trigger': { disabled: '' },
              'prev-trigger': { disabled: null },
            },
          },
        },
        expectTrack('translateX(-100%)'),
      ],
    },
    {
      name: '受控 page：点击只发意图不自改 DOM，宿主写回 page 后才翻页',
      spec: { adr: 'controlled-uncontrolled' },
      props: { slideCount: 4, page: 1 },
      initial: { parts: { 'item[1]': { 'data-inview': '' }, 'indicator[1]': { 'aria-current': 'true' } } },
      steps: [
        {
          kind: 'click',
          part: 'next-trigger',
          expect: {
            parts: {
              'item[1]': { 'data-inview': '' },
              'item[2]': { 'data-inview': null },
              'indicator[1]': { 'aria-current': 'true' },
            },
          },
        },
        {
          kind: 'setProps',
          props: { page: 2 },
          expect: {
            parts: {
              'item[1]': { 'data-inview': null },
              'item[2]': { 'data-inview': '' },
              'indicator[2]': { 'aria-current': 'true' },
            },
          },
        },
      ],
    },
    {
      name: '自动播放：视口活区闭麦；指针停上去即按住，移开又接着播',
      spec: { apg: `${APG}#accessibilityfeatures` },
      // 间隔取大值：这条验的是按住/放开的标记与活区，不验计时
      props: { slideCount: 4, autoplay: 60_000 },
      initial: {
        parts: {
          root: { 'data-autoplay': '', 'data-paused': null },
          // 自动播放跑着时每翻一张就念一遍会把用户正在做的事一路打断
          viewport: { 'aria-live': 'off' },
        },
      },
      steps: [
        pointerOnRoot('pointerenter', {
          parts: {
            root: { 'data-autoplay': null, 'data-paused': '' },
            // 停下来之后的变化是用户自己按出来的，该念
            viewport: { 'aria-live': 'polite' },
          },
        }),
        pointerOnRoot('pointerleave', {
          parts: {
            root: { 'data-autoplay': '', 'data-paused': null },
            viewport: { 'aria-live': 'off' },
          },
        }),
      ],
    },
    {
      name: '焦点进到轮播里也按住自动播放，焦点离开才放开',
      spec: { apg: `${APG}#accessibilityfeatures` },
      props: { slideCount: 4, autoplay: 60_000 },
      steps: [
        {
          kind: 'focus',
          part: 'next-trigger',
          expect: { parts: { root: { 'data-autoplay': null, 'data-paused': '' } } },
        },
        {
          kind: 'blur',
          expect: { parts: { root: { 'data-autoplay': '', 'data-paused': null } } },
        },
      ],
    },
    {
      name: 'Enter / Space 由原生按钮负责：三类可点部件都得是 <button type="button">',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.trigger', 'carousel.kbd.indicator'],
      props: { slideCount: 4, defaultPage: 1 },
      steps: [
        nativeActivation('carousel', 'prev-trigger'),
        nativeActivation('carousel', 'next-trigger'),
        nativeActivation('carousel', 'indicator'),
      ],
    },
    {
      name: 'Tab 序列：每个可用按钮各占一个停靠点，端点上禁用的那个自动脱序',
      spec: { apg: `${APG}#keyboardinteraction` },
      covers: ['carousel.kbd.tab'],
      props: { slideCount: 4 },
      steps: [
        {
          kind: 'raw',
          why: 'Tab 停靠点的数目是跨节点的计数，逐个部件的属性期望表达不了；jsdom 也不会真的移动焦点',
          run: ({ doc }) => {
            const nodes = [...doc.querySelectorAll<HTMLElement>(
              '[data-scope="carousel"][data-part="indicator"],'
              + '[data-scope="carousel"][data-part="prev-trigger"],'
              + '[data-scope="carousel"][data-part="next-trigger"]',
            )]
            if (nodes.length !== 6)
              throw new Error(`预期 6 个可点部件，实际 ${nodes.length}`)
            for (const el of nodes) {
              // 出现 tabindex 就说明有人给指示点套了 roving tabindex
              if (el.hasAttribute('tabindex'))
                throw new Error(`${el.dataset.part} 上出现了 tabindex="${el.getAttribute('tabindex')}"，轮播不做 roving tabindex`)
            }
            const prev = q(doc, 'prev-trigger')
            if (!prev?.hasAttribute('disabled'))
              throw new Error('首页且不回绕时 prev-trigger 应带原生 disabled——只有原生禁用才会退出 Tab 序列')
          },
        },
      ],
    },
  ],
}
