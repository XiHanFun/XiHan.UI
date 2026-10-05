/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

import type { ItemQuery, Params } from '@xihan-ui/core'
import type { DragAnnounceKind, DropTarget } from '../shared/drag'
import type { TabsIndicatorRect, TabsOverflowItem, TabsSchema } from './tabs.types'
import { isItemDisabled, itemQuerySelector, itemValue, overflowOutsideWindow, queryItems, setup, trackListMotion, trackOverflowLayout } from '@xihan-ui/core'
import { frameLoop, frameNow, isTweenDone, readMotion, resolveMotionPreference, tweenValueAt } from '@xihan-ui/motion'
import { createMultiPointerSession, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { hitAlong, reorderFlat } from '../shared/drag'
import { dragAnnouncement } from '../shared/drag-announce'
import { snapshotDrift } from '../shared/drag-drift'
import { createLiquidIndicator, measureIndicatorBox, sameIndicatorBox } from '../shared/indicator'
import { tabsAnatomy, tabsOverflowTriggerQuery, tabsTriggerQuery } from './tabs.anatomy'
import { describeOverflowTab, sameTabsOverflowItems } from './tabs.overflow'

const { createMachine } = setup<TabsSchema>()

/** 换位时随之挪动的标签带孩子：标签与标签之间的分隔线。指示条与两端翻页钮不在其列。 */
const TABS_REORDER_ITEMS = `[data-scope='${tabsAnatomy.name}']:is([data-part='trigger'], [data-part='separator'])`

/** 一页翻多远：标签带可见长度的八成，翻页前后总有一截重叠，用户看得出接上了哪一段。 */
const SCROLL_PAGE_RATIO = 0.8

/** 两端的翻页钮：贴在标签带两端、不随标签位移，露出标签时要把它们盖住的那一截也让开。 */
const PREV_TRIGGER_QUERY: ItemQuery = { scope: tabsAnatomy.name, part: 'prev-trigger' }
const NEXT_TRIGGER_QUERY: ItemQuery = { scope: tabsAnatomy.name, part: 'next-trigger' }

const ROOT_SELECTOR = itemQuerySelector({ scope: tabsAnatomy.name, part: 'root' })

/**
 * 标签带里不随位移走的部件：翻页钮贴在两端不动；指示条是绝对定位的部件，不占排布位，
 * 位置由量测另给。量标签带的内容长度时把它们剔掉。
 */
const STRIP_FIXED_PARTS = new Set(['prev-trigger', 'next-trigger', 'indicator'])

/**
 * 标签带的量测结果，全是排布几何（offset*），不含位移：标签带不是滚动容器，
 * 标签整体用 translate 挪，位移中途量 rect 会量到半路上的值，offset* 量的是没挪之前的排布位。
 * 主轴按方向取：横排量行内轴，竖排量块轴。
 */
interface StripMetrics {
  /** 标签带内容盒在主轴上的长度：能露出多少 */
  viewport: number
  /** 排在带里的孩子在主轴上铺开的总长 */
  extent: number
  /** 首个孩子的起点（物理坐标，相对 offsetParent 的内衬盒） */
  contentStart: number
  /** 末个孩子的终点（物理坐标） */
  contentEnd: number
}

function measureStrip(list: HTMLElement, horizontal: boolean): StripMetrics | null {
  let contentStart = Number.POSITIVE_INFINITY
  let contentEnd = Number.NEGATIVE_INFINITY
  for (const child of list.children) {
    const el = child as HTMLElement
    if (el.dataset.scope === tabsAnatomy.name && STRIP_FIXED_PARTS.has(el.dataset.part ?? ''))
      continue
    // 收起的孩子（display: none）两边都是 0，量进去会把起点拉到 0
    if (el.offsetWidth === 0 && el.offsetHeight === 0)
      continue
    const start = horizontal ? el.offsetLeft : el.offsetTop
    const size = horizontal ? el.offsetWidth : el.offsetHeight
    contentStart = Math.min(contentStart, start)
    contentEnd = Math.max(contentEnd, start + size)
  }
  if (contentStart === Number.POSITIVE_INFINITY)
    return null
  const style = list.ownerDocument.defaultView?.getComputedStyle(list)
  const pad = (name: 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'): number => Number.parseFloat(style?.[name] ?? '0') || 0
  const viewport = horizontal
    ? list.clientWidth - pad('paddingLeft') - pad('paddingRight')
    : list.clientHeight - pad('paddingTop') - pad('paddingBottom')
  return { viewport, extent: contentEnd - contentStart, contentStart, contentEnd }
}

/** 一个孩子在主轴上的逻辑区间 [起点, 终点]：从内容起始端量起，RTL 横排从右端量。 */
function logicalBounds(el: HTMLElement, m: StripMetrics, horizontal: boolean, rtl: boolean): [number, number] {
  const start = horizontal ? el.offsetLeft : el.offsetTop
  const size = horizontal ? el.offsetWidth : el.offsetHeight
  return horizontal && rtl
    ? [m.contentEnd - start - size, m.contentEnd - start]
    : [start - m.contentStart, start + size - m.contentStart]
}

function isHorizontal(orientation: 'horizontal' | 'vertical' | undefined): boolean {
  return (orientation ?? 'horizontal') === 'horizontal'
}

function px(value: string | undefined): number {
  return Number.parseFloat(value ?? '') || 0
}

/**
 * 一只翻页钮在主轴上盖住标签带的那一截：它贴在标签带一端、浮在标签上。
 * 首帧翻页钮还没露面、量不到宽，按 fallback 算（翻页钮是与标签同高的正方形）；没放翻页钮时是 0。
 */
function pageTriggerReserve(list: HTMLElement, query: ItemQuery, horizontal: boolean, fallback: number): number {
  const el = queryItems(list, query)[0]
  if (!el)
    return 0
  return (horizontal ? el.offsetWidth : el.offsetHeight) || fallback
}

/**
 * 「更多」钮露着时从标签带那里占走的一截：钮排在标签带之后，露面时标签带跟着让出它的长度与它前面的间距。
 * 收着（hidden）或没放钮时是 0。钮是 root 的孩子，从标签带往上找自己的 root 再按归属取。
 */
function overflowTriggerReserve(list: HTMLElement, horizontal: boolean): number {
  const root = list.closest<HTMLElement>(ROOT_SELECTOR)
  const trigger = root ? queryItems(root, tabsOverflowTriggerQuery)[0] : undefined
  if (!trigger || trigger.hidden)
    return 0
  const size = horizontal ? trigger.offsetWidth : trigger.offsetHeight
  if (size === 0)
    return 0
  const style = trigger.ownerDocument.defaultView?.getComputedStyle(trigger)
  const margin = horizontal ? px(style?.marginLeft) + px(style?.marginRight) : px(style?.marginTop) + px(style?.marginBottom)
  return size + margin
}

// 选中值住在 context 的 cell 里，受控/非受控在 cell 收口，不需要影子事件与受控守卫。
export const tabsMachine = createMachine({
  name: 'tabs',
  context: ({ prop, cell }) => ({
    value: cell<string | null>(() => ({
      value: prop('value'),
      defaultValue: prop('defaultValue') ?? null,
      onChange: value => prop('onValueChange')?.({ value }),
    })),
    // 焦点锚点：不受控、不对外通知，只服务 roving tabindex 与方向键起点
    focusedValue: cell<string | null>(() => ({ defaultValue: null })),
    draggingTab: cell<string | null>(() => ({ defaultValue: null })),
    dropTarget: cell<DropTarget | null>(() => ({ defaultValue: null })),
    announcement: cell<string>(() => ({ defaultValue: '' })),
    // 量测结果不受控、不对外通知
    indicator: cell<TabsIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameIndicatorBox })),
    indicatorStretch: cell<number>(() => ({ defaultValue: 0 })),
    // 指示器这一落点直接到位（首次落位与同一项的重量），还是交给皮肤滑过去（标准档换项）
    indicatorInstant: cell<boolean>(() => ({ defaultValue: true })),
    // 标签带的位移：放不下时整条标签带沿主轴往起始端挪了多少（px，≥ 0），上限是内容长度超出可见长度的那一截；
    // 放得下时上限为 0。两者都不受控、不对外通知，翻页钮的显隐与禁用由它们推出
    scroll: cell<number>(() => ({ defaultValue: 0 })),
    scrollMax: cell<number>(() => ({ defaultValue: 0 })),
    // 按压通道：正被按住的 trigger（按 value 记），与选中、焦点锚点、拖动无关
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
    // 被选中过的标签：初值即首帧的选中项，之后每换一次选中记一笔，只增不减
    visited: cell<string[]>(() => {
      const initial = prop('value') ?? prop('defaultValue') ?? null
      return { defaultValue: initial == null ? [] : [initial] }
    }),
    // 「更多」下拉里列的标签：可见区外的那几个，随位移与量测重算；不受控、不对外通知
    overflowItems: cell<TabsOverflowItem[]>(() => ({ defaultValue: [], isEqual: sameTabsOverflowItems })),
  }),
  // 挂载即量一次，让指示条首帧就在位、翻页钮与「更多」钮首帧就知道要不要露面
  entry: ['measureStrip', 'measureOverflow', 'measureIndicator'],
  watch: ({ track, context, prop, action }) => {
    // 选中值一变：先记进被选中过的标签，再把被裁掉的选中标签挪进视野，最后重量指示条。指示条量的是排布位、
    // 与位移无关，先后顺序只为让几次更新落在同一轮
    track([context.dep('value')], () => action(['recordVisited', 'revealSelected', 'measureIndicator']))
    // 焦点落到被裁掉的标签上，标签带自己挪过去：标签带不是滚动容器，浏览器不会替它做这件事
    track([context.dep('focusedValue')], () => action(['revealFocused']))
    // 可见区随位移走：标签带挪了（翻页、滚轮、手指、补间的每一帧）、位移上限变了、数据里的文字换了，
    // 「更多」下拉里列哪几个标签跟着重算。这一路可能正跑在尺寸观察的回调里，只换项、不改钮的有无（见 refreshOverflow）
    track([context.dep('scroll'), context.dep('scrollMax'), () => prop('collection')], () => action(['refreshOverflow']))
  },
  // 跟手的会话整个生命周期都在，不按拖动状态挂卸。常驻的代价只是几个早退的
  // pointermove，换来的是状态树一行都不用改
  // trackReorder 排在 trackStrip 之前：同一批重排里它的观察器先回调，指示条先按「跟着换位滑」量这一次
  effects: ['trackPointer', 'trackResize', 'trackReorder', 'trackStrip', 'trackOverflow', 'trackLiquidIndicator'],
  refs: () => ({
    getListEl: () => null,
    liquidIndicator: null,
    gesture: null,
    tabDrag: null,
    scrollTween: null,
    pan: null,
    panJustEnded: false,
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      // 省略 target：只跑 actions，不换状态
      on: {
        'VALUE.SET': { actions: ['setValue'] },
        'TRIGGER.SELECT': { actions: ['setValue', 'setFocusedValue'] },
        'TRIGGER.FOCUS': { actions: ['setFocusedValue'] },
        // automatic 下方向键顺带切换选中，manual 下只搬焦点锚点
        'TRIGGER.NAVIGATE': [
          { guard: 'isAutomatic', actions: ['setValue', 'setFocusedValue'] },
          { actions: ['setFocusedValue'] },
        ],
        'LIST.BLUR': { actions: ['clearFocusedValue'] },
        'TAB_DRAG.START': { actions: ['startTabDrag'] },
        'TAB_DRAG.MOVE': { actions: ['trackTabDrag'] },
        'TAB_DRAG.END': { actions: ['endTabDrag'] },
        'TAB_DRAG.CANCEL': { actions: ['cancelTabDrag'] },
        // 键盘换位不进拖动态：按一下就是一次已过守卫的完整提交
        'TAB.MOVE_BY': { actions: ['moveTabBy'] },
        // 关闭只发意图，标签序归数据源
        'TAB.CLOSE': { actions: ['invokeOnTabClose'] },
        // 按压通道：条目按 value 记按住的那一个；条目自身的禁用由 connect 判定后随事件带入
        'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
        'PRESS.END': { actions: ['endPress'] },
        // 标签带位移：翻页钮按页翻，滚轮按滚了多少挪多少
        'SCROLL.PREV': { actions: ['scrollPrev'] },
        'SCROLL.NEXT': { actions: ['scrollNext'] },
        'SCROLL.BY': { actions: ['scrollBy'] },
        'SCROLL.FRAME': { actions: ['stepScroll'] },
        // 触屏手势平移：与换位拖动共用一个指针会话，按 refs.pan 在不在分流
        'PAN.START': { actions: ['startPan'] },
        'PAN.MOVE': { actions: ['trackPan'] },
        'PAN.END': { actions: ['endPan'] },
        'PAN.CANCEL': { actions: ['cancelPan'] },
        // 「更多」下拉里选中一个标签：选中它并挪进可见区
        'OVERFLOW.SELECT': { actions: ['selectOverflowItem'] },
      },
    },
  },
  implementations: {
    effects: {
      /** 液态档的双沿指示器：建好放进 refs，先把眼下的落点交给它，之后的落位都经它走。 */
      trackLiquidIndicator: ({ refs, prop, context }) => {
        const liquid = createLiquidIndicator({
          axis: () => (prop('orientation') === 'vertical' ? 'block' : 'inline'),
          host: () => refs.get('getListEl')(),
          onFrame: (box, stretch, instant) => {
            context.set('indicator', box)
            context.set('indicatorStretch', stretch)
            context.set('indicatorInstant', instant)
          },
        })
        liquid.place(context.get('indicator'), context.get('value'))
        refs.set('liquidIndicator', liquid)
        return () => {
          liquid.dispose()
          refs.set('liquidIndicator', null)
        }
      },
      // 挂 resize 监听器重量标签带与指示条；disposed 标记挡掉 cleanup 后仍被触发的那一次
      trackResize: ({ scope, action }) => {
        let disposed = false
        const win = scope.getWin()
        const onResize = (): void => {
          if (!disposed)
            action(['measureStrip', 'measureIndicator'])
        }
        win.addEventListener('resize', onResize)
        return () => {
          disposed = true
          win.removeEventListener('resize', onResize)
        }
      },

      /**
       * 盯住标签带放不放得下：标签带自己或里面的标签变尺寸、标签增减，都重量一次，
       * 放不放得下变了（首帧、外层变宽变窄、标签增减）就把选中标签挪进视野（首帧选中的可能就在被裁掉的那一截里）。
       * list 由连接层在首轮渲染后交进 refs，效应挂在根级、只在 INIT 挂一次，这里现取；
       * 没有 ResizeObserver / MutationObserver 的宿主（jsdom）只靠 resize 事件与显式事件。
       */
      trackStrip: ({ refs, scope, action, context }) => {
        let disposed = false
        const win = scope.getWin()
        let observed: HTMLElement | null = null
        let resizeObserver: ResizeObserver | null = null
        let mutationObserver: MutationObserver | null = null
        const remeasure = (): void => {
          if (disposed)
            return
          const before = context.get('scrollMax')
          action(['measureStrip'])
          // 只在放不放得下真变了（外层变宽变窄、标签增减）才把选中标签挪进视野：观察器的首次回报、
          // 标签换个面之类的量测都不动位置，手指正拖着标签带时更不能从它手里抢回去
          if (context.get('scrollMax') !== before && !refs.get('pan'))
            action(['revealSelected'])
          action(['measureIndicator'])
        }
        const observeChildren = (list: HTMLElement): void => {
          if (!resizeObserver)
            return
          resizeObserver.disconnect()
          resizeObserver.observe(list)
          for (const child of list.children)
            resizeObserver.observe(child)
        }
        const attach = (): void => {
          const list = refs.get('getListEl')()
          if (!list || list === observed)
            return
          resizeObserver?.disconnect()
          mutationObserver?.disconnect()
          observed = list
          const ResizeObserverCtor = win.ResizeObserver
          if (ResizeObserverCtor) {
            resizeObserver = new ResizeObserverCtor(remeasure)
            observeChildren(list)
          }
          // 标签增减不改标签带自己的盒（宽度由外面给），得盯住孩子的进出，新来的孩子也要量尺寸
          const MutationObserverCtor = win.MutationObserver
          if (MutationObserverCtor) {
            mutationObserver = new MutationObserverCtor(() => {
              observeChildren(list)
              remeasure()
            })
            mutationObserver.observe(list, { childList: true })
          }
          remeasure()
        }
        // 首轮渲染后 list 才在；下一帧再挂一次，挂上后由观察器接管
        attach()
        const raf = win.requestAnimationFrame(attach)
        return () => {
          disposed = true
          win.cancelAnimationFrame(raf)
          resizeObserver?.disconnect()
          mutationObserver?.disconnect()
          refs.get('scrollTween')?.stop()
          refs.set('scrollTween', null)
        }
      },

      /**
       * 盯住「更多」下拉该列哪几个标签（core 的溢出观察，与 Toolbar 收纳同一套）：标签带与标签的尺寸、
       * 标签增减与改写（文字、可及名、禁用）、字体加载完成、窗口尺寸，都排到下一帧重算一次。
       * 钮的露面与收起只走这一路（与挂载那一次）：钮一露面标签带就短一截、一收起就长一截，
       * 在尺寸观察的回调里当场改，浏览器会报 ResizeObserver 循环；排到下一帧再写，标签带的变化在下一轮量测里照常接住。
       * list 首轮渲染后才在：挂上那一刻、这一轮渲染落定时与下一帧各量一次——Web Components 的标签要等首轮接线
       * 才带上身份标记，落定时那一次让钮首帧就露面，下一帧那一次兜住首轮渲染时还没有 list 的宿主。
       */
      trackOverflow: ({ refs, scope, action, flush }) => {
        const win = scope.getWin() as Window & typeof globalThis
        let observed: HTMLElement | null = null
        let stop: (() => void) | null = null
        const attach = (): void => {
          const list = refs.get('getListEl')()
          if (list && list !== observed) {
            stop?.()
            observed = list
            stop = trackOverflowLayout(win, {
              container: list,
              nodes: () => queryItems(list, tabsTriggerQuery),
              onChange: () => action(['measureOverflow']),
            })
          }
          action(['measureOverflow'])
        }
        let disposed = false
        attach()
        flush(() => {
          if (!disposed)
            attach()
        })
        const raf = win.requestAnimationFrame(attach)
        return () => {
          disposed = true
          win.cancelAnimationFrame(raf)
          stop?.()
        }
      },

      /**
       * 标签换位：宿主按新顺序重排标签（拖动放下、键盘挪位、增删）之后，挪了位置的标签与分隔线从原处滑到新位置，
       * 与指示条同一段 move / continuous，减弱动效下直接到位。标签带整体位移占着它们的 translate、过渡清单归家族，
       * 换位走 transform 上的一段动画；删掉的标签直接离开，不放离场替身。list 首轮渲染后才在，挂法同标签带。
       */
      trackReorder: ({ refs, scope, action }) => {
        const win = scope.getWin()
        let observed: HTMLElement | null = null
        let stop: (() => void) | undefined
        const attach = (): void => {
          const list = refs.get('getListEl')()
          if (!list || list === observed)
            return
          stop?.()
          observed = list
          stop = trackListMotion(list, {
            item: TABS_REORDER_ITEMS,
            depart: false,
            channel: 'transform',
            // 选中的标签若跟着挪了，指示条与它同一段 move 一起滑过去
            onReflow: () => {
              refs.set('indicatorGlide', true)
              action(['measureIndicator'])
            },
          })
        }
        attach()
        const raf = win.requestAnimationFrame(attach)
        return () => {
          win.cancelAnimationFrame(raf)
          stop?.()
        }
      },

      /**
       * 跟住按在标签上的那根手指。
       *
       * 监听挂在文档上：拖出标签条、拖出窗口都要继续跟，系统收走指针也会收尾。
       * 会话只跟调用方交进来的那一根——连接层在按下时判完是不是该起拖再交。
       */
      trackPointer: ({ prop, refs, scope, send }) => {
        const session = createMultiPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          onChange: (points: readonly { clientX: number, clientY: number }[]) => {
            const first = points[0]
            if (!first)
              return
            // 轴在这里现读，不在效应顶部求值：会话是根级效应建的、只在 INIT 挂一次，
            // 提前求值等于把轴钉死在挂载那一刻，运行期改 orientation 就量错轴了
            const horizontal = (prop('orientation') ?? 'horizontal') === 'horizontal'
            const point = horizontal ? first.clientX : first.clientY
            // 同一个会话两种手势：触屏按在标签带上是平移，鼠标按在标签上是换位拖动；哪一场在跑看 refs.pan
            send(refs.get('pan') ? { type: 'PAN.MOVE', point } : { type: 'TAB_DRAG.MOVE', point })
          },
          onEnd: ({ reason }: { reason: string }) => {
            const canceled = reason === 'pointercancel'
            if (refs.get('pan'))
              send({ type: canceled ? 'PAN.CANCEL' : 'PAN.END' })
            else
              send({ type: canceled ? 'TAB_DRAG.CANCEL' : 'TAB_DRAG.END' })
          },
        })
        refs.set('gesture', session)
        return () => {
          session.dispose()
          refs.set('gesture', null)
        }
      },
    },
    guards: {
      isAutomatic: ({ prop }) => (prop('activationMode') ?? 'automatic') === 'automatic',
      // Tabs 没有整组禁用，只有条目自己的禁用：它随 PRESS.START 带进来
      canPress: ({ event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressedValue', e.value)
      },
      // 只收自己那一下：另一个 trigger 的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressedValue') === e.value)
          context.set('pressedValue', null)
      },
      setValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'VALUE.SET' || e.type === 'TRIGGER.SELECT' || e.type === 'TRIGGER.NAVIGATE')
          context.set('value', e.value)
      },
      setFocusedValue: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'TRIGGER.SELECT' || e.type === 'TRIGGER.FOCUS' || e.type === 'TRIGGER.NAVIGATE')
          context.set('focusedValue', e.value)
      },
      clearFocusedValue: ({ context }) => context.set('focusedValue', null),
      recordVisited: ({ context }) => {
        const value = context.get('value') ?? null
        const visited = context.get('visited')
        if (value != null && !visited.includes(value))
          context.set('visited', [...visited, value])
      },
      startTabDrag: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'TAB_DRAG.START')
          return
        refs.set('tabDrag', { value: e.value, rects: e.rects, origin: e.origin, activated: !!e.activate, source: e.source })
        // 从把手起手即刻算拖；整个标签起手时按下还不算拖，要等走够激活距离
        context.set('draggingTab', e.activate ? e.value : null)
        context.set('dropTarget', null)
        context.set('announcement', '')
      },

      trackTabDrag: ({ context, prop, refs, event }) => {
        const e = event.current()
        const session = refs.get('tabDrag')
        if (e.type !== 'TAB_DRAG.MOVE' || !session)
          return
        // 两件事在两个坐标系里判：
        // 激活看的是「手指动没动」，用原始视口坐标——内容滚过去了但手没动，不算拖了一段；
        // 命中看的是「指针此刻指着哪一项」，要减掉版面漂移换算回快照那一刻的坐标
        const horizontal = (prop('orientation') ?? 'horizontal') === 'horizontal'
        if (!session.activated) {
          // 整个标签都是拖动源，没有把手表明意图：要走够激活距离才算拖动，
          // 否则点一下切换标签就会被算成一次零位移的拖拽
          if (!shouldActivate({ x: e.point - session.origin, y: 0 }))
            return
          refs.set('tabDrag', { ...session, activated: true })
          context.set('draggingTab', session.value)
        }
        // 横排标签是横轴：rtl 下几何左右与逻辑前后相反。竖排与文字方向无关
        const point = e.point - snapshotDrift(session.source, session.rects, session.value, horizontal ? 'x' : 'y')
        const hit = hitAlong(session.rects, point, horizontal && prop('dir') === 'rtl')
        // 落在自己身上不算落点：那不是一次移动，指示线该消失
        context.set('dropTarget', hit && hit.targetValue !== session.value ? hit : null)
      },

      endTabDrag: ({ context, prop, refs }) => {
        const session = refs.get('tabDrag')
        const target = context.get('dropTarget')
        clearTabDrag(context, refs)
        // 没激活过就只是按了一下：那是一次点击，不是拖动
        if (!session?.activated)
          return
        if (!target) {
          announceTabMove(context, prop, 'rejected', session.value)
          return
        }
        commitTabMove(context, prop, session.value, target, 'dropped')
      },

      cancelTabDrag: ({ context, prop, refs }) => {
        const session = refs.get('tabDrag')
        clearTabDrag(context, refs)
        if (session?.activated)
          announceTabMove(context, prop, 'canceled', session.value)
      },

      moveTabBy: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'TAB.MOVE_BY')
          return
        commitTabMove(context, prop, e.value, e.target, 'moved')
      },

      invokeOnTabClose: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'TAB.CLOSE')
          return
        prop('onTabClose')?.({ value: e.value, values: e.values })
      },

      /**
       * 量指示条。必须量两遍：同步那遍照顾"标签早就在 DOM 里"的常规情形，推迟那遍照顾首帧
       * （WC 侧的身份标记要等首次 wire 才写上，这一刻一个标签都查不到）。
       * cell 带 isEqual，量到同一结果不会多推更新。
       */
      /** 量标签带放不放得下：内容超出可见长度的那一截就是位移上限；上限缩了，已有的位移跟着夹回来。 */
      measureStrip: ({ refs, prop, context }) => {
        const list = refs.get('getListEl')()
        const horizontal = isHorizontal(prop('orientation'))
        const m = list && measureStrip(list, horizontal)
        // 亚像素误差留 1px 余量：不然一个标签带在某些缩放比下会永远"差一点点"放不下
        const excess = m ? m.extent - m.viewport : 0
        // 「更多」钮露着时占走了标签带的一截：放不放得下按让回这一截算。钮的有无只取决于全部标签放不放得下，
        // 不会因为钮自己把标签带挤窄了一截就一直留着（放得下时钮收起，标签带随之变回原长）
        const fits = !list || excess - overflowTriggerReserve(list, horizontal) <= 1
        const scrollMax = fits ? 0 : excess
        context.set('scrollMax', scrollMax)
        // 上限缩到位移之下：正在走的补间停掉，直接夹回来
        if (context.get('scroll') > scrollMax) {
          refs.get('scrollTween')?.stop()
          refs.set('scrollTween', null)
          context.set('scroll', scrollMax)
        }
      },
      scrollPrev: (params) => {
        const list = params.refs.get('getListEl')()
        const m = list && measureStrip(list, isHorizontal(params.prop('orientation')))
        if (m)
          startScroll(params, scrollTarget(params) - m.viewport * SCROLL_PAGE_RATIO)
      },
      scrollNext: (params) => {
        const list = params.refs.get('getListEl')()
        const m = list && measureStrip(list, isHorizontal(params.prop('orientation')))
        if (m)
          startScroll(params, scrollTarget(params) + m.viewport * SCROLL_PAGE_RATIO)
      },
      // 滚轮连着来的每一下都叠在上一下的目标上，不然补间刚起步就被下一下从半路拽回去
      scrollBy: (params) => {
        const e = params.event.current()
        if (e.type === 'SCROLL.BY')
          startScroll(params, scrollTarget(params) + e.delta)
      },
      stepScroll: ({ refs, scope, context }) => {
        const tween = refs.get('scrollTween')
        if (!tween)
          return
        const elapsed = frameNow(scope.getWin()) - tween.startedAt
        context.set('scroll', clampScroll(tweenValueAt({ from: tween.from, to: tween.to, duration: tween.duration, easing: tween.ease }, elapsed), context.get('scrollMax')))
        if (isTweenDone(elapsed, tween.duration)) {
          tween.stop()
          refs.set('scrollTween', null)
        }
      },
      /** 手指按在标签带上：记下起点与此刻的位移，正在走的补间停掉——手指接管了位置。 */
      startPan: ({ refs, context, event }) => {
        const e = event.current()
        if (e.type !== 'PAN.START')
          return
        refs.get('scrollTween')?.stop()
        refs.set('scrollTween', null)
        refs.set('pan', { origin: e.origin, base: context.get('scroll'), activated: false })
      },
      /**
       * 手指跟着走。走够激活距离才算平移（不然点一下也成了一次零位移的平移），一旦算平移就把
       * 指下那枚标签的按压面撤掉：手指是在拖标签带，不是在按它。位移 = 起手位移 + 手指走的逻辑距离，
       * 横排 LTR 手指往左是朝结束端、RTL 相反，竖排手指往上是朝结束端；两端夹住，不做回弹。
       */
      trackPan: ({ refs, context, prop, event }) => {
        const e = event.current()
        const pan = refs.get('pan')
        if (e.type !== 'PAN.MOVE' || !pan)
          return
        const delta = e.point - pan.origin
        if (!pan.activated) {
          if (!shouldActivate({ x: delta, y: 0 }))
            return
          refs.set('pan', { ...pan, activated: true })
          context.set('pressedValue', null)
        }
        const horizontal = isHorizontal(prop('orientation'))
        const logical = horizontal && (prop('dir') ?? 'ltr') === 'rtl' ? delta : -delta
        context.set('scroll', clampScroll(pan.base + logical, context.get('scrollMax')))
      },
      /** 手指抬起：真平移过的话，紧跟着的那次 click 是抬手的余波，记下来让标签不认它。 */
      endPan: ({ refs }) => {
        const pan = refs.get('pan')
        refs.set('pan', null)
        refs.set('panJustEnded', !!pan?.activated)
      },
      /** 被系统收走（比如判成了页面竖向滚动）：位置留在半路上即可，不会有 click 跟来。 */
      cancelPan: ({ refs }) => {
        refs.set('pan', null)
        refs.set('panJustEnded', false)
      },
      /** 选中的标签被裁在视野外时把它挪进来：点到半露的标签、受控换值、首帧量测都走这里。 */
      revealSelected: (params) => {
        revealTab(params, params.context.get('value') ?? null)
      },
      /** 焦点落到被裁掉的标签上（方向键走到那里），标签带挪过去露出它。 */
      revealFocused: (params) => {
        revealTab(params, params.context.get('focusedValue') ?? null)
      },
      /** 量「更多」下拉该列哪几个标签并写回；列表由空变有、由有变空（钮露面 / 收起）也照写。 */
      measureOverflow: (params) => {
        const next = overflowTabs(params)
        if (next)
          params.context.set('overflowItems', next)
      },
      /**
       * 同样量一次，但只换项、不改钮的有无：位移与上限的变化可能正出在尺寸观察的回调里，钮在这里露面或收起会让标签带
       * 当场变长变短，浏览器报 ResizeObserver 循环。有无变了就先留着，由 trackOverflow 排到下一帧的那一次写回。
       * 位移只在放不下时变，项从不因为位移由有变空，翻页、滚轮与补间的每一帧照常换项。
       */
      refreshOverflow: (params) => {
        const next = overflowTabs(params)
        if (next && (next.length === 0) === (params.context.get('overflowItems').length === 0))
          params.context.set('overflowItems', next)
      },
      /**
       * 「更多」下拉里选中一个标签：与点它同一个意图——选中（受控时只发 onValueChange），并把它挪进可见区。
       * 受控下宿主没写回时选中不变，标签仍挪进视野：它就是用户要去的那一个。禁用的标签在下拉里同样禁用、选不中，
       * 这里再按标签当下的禁用守一道。
       */
      selectOverflowItem: (params) => {
        const e = params.event.current()
        if (e.type !== 'OVERFLOW.SELECT')
          return
        const list = params.refs.get('getListEl')()
        const tab = list ? queryItems(list, tabsTriggerQuery).find(el => itemValue(el) === e.value) : undefined
        if (!tab || isItemDisabled(tab))
          return
        params.context.set('value', e.value)
        revealTab(params, e.value)
      },
      measureIndicator: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const list = refs.get('getListEl')()
          const value = context.get('value') ?? null
          // 量到的落点交给液态指示器：液态档下选中项一变，两沿走弹簧过去；其余直接落定
          const place = (box: TabsIndicatorRect | null): void => {
            const liquid = refs.get('liquidIndicator')
            const glide = !!refs.get('indicatorGlide')
            refs.set('indicatorGlide', false)
            if (liquid) {
              liquid.place(box, value, { glide })
            }
            else {
              // 指示器的落位器建起之前（挂载即量的那一次）：首次落位，直接到位
              context.set('indicator', box)
              context.set('indicatorInstant', true)
            }
          }
          if (!list || value == null) {
            place(null)
            return
          }
          const trigger = queryItems(list, tabsTriggerQuery).find(el => itemValue(el) === value)
          if (!trigger) {
            place(null)
            return
          }
          // 指示条是 list 的绝对定位后代，落点以 list 的内衬盒为原点，量排布位而不是 rect：
          // 标签带放不下时整条标签带用 translate 挪，指示条跟着同一个位移走，位移中途 rect 是半路上的值；
          // 祖先带缩放时 rect 也跟着缩。方向缺省从 list 现读，与皮肤按 :dir(rtl) 翻转位移同一个来源
          place(measureIndicatorBox(list, trigger, prop('dir')))
        }
        run()
        flush(run)
      },
    },
  },
})

function clampScroll(next: number, max: number): number {
  return Math.min(Math.max(0, next), max)
}

/** 位移动作用到的那几样。 */
type ScrollParams = Pick<Params<TabsSchema>, 'refs' | 'scope' | 'context' | 'send' | 'prop'>

/** 位移正要去的地方：补间在走就是它的终点，否则就是眼下的位移。 */
function scrollTarget({ refs, context }: ScrollParams): number {
  return refs.get('scrollTween')?.to ?? context.get('scroll')
}

/**
 * 把标签带挪到目标位移。屏内的像素级推移，时长与曲线从标签带上读 move / continuous 两支令牌，
 * 与皮肤里指示条滑动的那一档同源：作者改令牌、容器写 data-motion 都一起生效。补间在 JS 里跑、
 * 逐帧写进 scroll，不交给 CSS transition——标签带里的孩子各有自己的过渡清单（line 档的标签归家族），
 * 往每一份里都加一条 translate 会把家族与皮肤的过渡耦在一起。目标换了从当前显示值接着走；
 * 标签带所在处是减弱动效档、或还没有标签带节点时一步到位。
 */
function startScroll({ refs, scope, context, send }: ScrollParams, target: number): void {
  const to = clampScroll(target, context.get('scrollMax'))
  refs.get('scrollTween')?.stop()
  refs.set('scrollTween', null)
  const from = context.get('scroll')
  if (from === to)
    return
  const list = refs.get('getListEl')()
  if (!list || resolveMotionPreference(list) === 'reduce') {
    context.set('scroll', to)
    return
  }
  const win = scope.getWin()
  const motion = readMotion(list)
  const stop = frameLoop(win, () => send({ type: 'SCROLL.FRAME' }))
  refs.set('scrollTween', { from, to, startedAt: frameNow(win), duration: motion.duration('move'), ease: motion.easing('continuous'), stop })
}

/**
 * 把一个标签挪进视野：起点在可见区之前就把它挪到可见区开头，终点在可见区之后就挪到结尾，
 * 已经整个在视野里则不动。两端的翻页钮浮在标签带上、各盖住边上一截，可见区从它们里侧算起；
 * 首帧翻页钮还没露面、量不到宽，按标签高度算（翻页钮是与标签同高的正方形）。
 * 挪到头那一侧的翻页钮会收起，那时可见区比这里算的还宽，标签只会露得更全。
 */
function revealTab(params: ScrollParams, value: string | null): void {
  const { refs, prop, context } = params
  const list = refs.get('getListEl')()
  const scrollMax = context.get('scrollMax')
  if (!list || value == null || scrollMax <= 0)
    return
  const trigger = queryItems(list, tabsTriggerQuery).find(el => itemValue(el) === value)
  const horizontal = isHorizontal(prop('orientation'))
  const m = trigger && measureStrip(list, horizontal)
  if (!trigger || !m)
    return
  const [start, end] = logicalBounds(trigger, m, horizontal, (prop('dir') ?? 'ltr') === 'rtl')
  const scroll = scrollTarget(params)
  const visibleStart = scroll + pageTriggerReserve(list, PREV_TRIGGER_QUERY, horizontal, trigger.offsetHeight)
  const visibleEnd = scroll + m.viewport - pageTriggerReserve(list, NEXT_TRIGGER_QUERY, horizontal, trigger.offsetHeight)
  if (start >= visibleStart && end <= visibleEnd)
    return
  // 起点在前就对齐起点；否则对齐终点。比可见区还宽的标签也对齐起点：标签名的开头比结尾要紧
  startScroll(params, start < visibleStart ? scroll - (visibleStart - start) : scroll + (end - visibleEnd))
}

/**
 * 「更多」下拉该列的标签：没有整个露在可见区里的，文档序。
 * 可见区从位移处起、长一个标签带的可见长度，两端让出翻页钮盖住的那一截——挪到头那一侧的钮已收起（透明、不接指针），
 * 那一侧不让。量的是排布位（offset*），与位移中途的 translate 无关，补间的每一帧都按此刻的位移算。
 * 放得下时一个不列；作者自己藏起来的标签（display: none）不在标签带里，也不列。标签带没有排布时返回 null，保留上一轮。
 */
function overflowTabs({ refs, prop, context }: Pick<Params<TabsSchema>, 'refs' | 'prop' | 'context'>): TabsOverflowItem[] | null {
  const list = refs.get('getListEl')()
  const scrollMax = context.get('scrollMax')
  if (!list || scrollMax <= 0)
    return []
  const horizontal = isHorizontal(prop('orientation'))
  const m = measureStrip(list, horizontal)
  if (!m)
    return null
  const rtl = (prop('dir') ?? 'ltr') === 'rtl'
  const tabs = queryItems(list, tabsTriggerQuery).filter(el => el.offsetWidth > 0 || el.offsetHeight > 0)
  const spans = tabs.map((el) => {
    const [start, end] = logicalBounds(el, m, horizontal, rtl)
    return { start, end }
  })
  const scroll = context.get('scroll')
  const fallback = tabs[0]?.offsetHeight ?? 0
  const start = scroll + (scroll > 0 ? pageTriggerReserve(list, PREV_TRIGGER_QUERY, horizontal, fallback) : 0)
  const end = scroll + m.viewport - (scroll < scrollMax ? pageTriggerReserve(list, NEXT_TRIGGER_QUERY, horizontal, fallback) : 0)
  const collection = prop('collection') ?? []
  const labelOf = (value: string): string | undefined => collection.find(node => node.value === value)?.label
  return overflowOutsideWindow(spans, { start, end }).map(index => describeOverflowTab(tabs[index]!, labelOf))
}

/** 播报与提交两处都要写 announcement，抽一个最小接口，别把整个 service 拖进来。 */
interface TabDragContext {
  set: (k: 'announcement', v: string) => void
}

/** 标签的顺序真源就是 collection 给的那一串。 */
function tabValues(
  prop: <K extends keyof TabsSchema['props']>(k: K) => TabsSchema['props'][K],
): string[] {
  return (prop('collection') ?? []).map(node => node.value)
}

/** 播报一句。位置说的是这一串里的第几个。 */
function announceTabMove(
  context: TabDragContext,
  prop: <K extends keyof TabsSchema['props']>(k: K) => TabsSchema['props'][K],
  kind: DragAnnounceKind,
  value: string,
  position?: number,
): void {
  const values = tabValues(prop)
  const collection = prop('collection') ?? []
  context.set('announcement', dragAnnouncement(kind, {
    value,
    position: position ?? values.indexOf(value) + 1,
    total: values.length,
    // 标签文字比 value 好听。作者没给 translations.item 时退回条目的 label
    translations: {
      item: (id: string) => collection.find(node => node.value === id)?.label ?? id,
      ...prop('translations'),
    },
  }))
}

/**
 * 落点折算成一次换位，报给宿主并播报。
 *
 * 顺序不进机器：collection 是 prop，库没有一份自己的标签序可写，所以只发意图、
 * 写回归宿主——它本来就是那一串的主人。
 */
function commitTabMove(
  context: TabDragContext,
  prop: <K extends keyof TabsSchema['props']>(k: K) => TabsSchema['props'][K],
  value: string,
  target: DropTarget,
  kind: DragAnnounceKind,
): void {
  const moved = reorderFlat(tabValues(prop), value, target)
  if (!moved) {
    announceTabMove(context, prop, 'rejected', value)
    return
  }
  prop('onTabMove')?.({ value, from: moved.from, to: moved.to, values: moved.ids })
  announceTabMove(context, prop, kind, value, moved.to + 1)
}

/** 收尾：拖动态的三样一起清干净，别留半截。 */
function clearTabDrag(
  context: { set: (k: 'draggingTab' | 'dropTarget', v: null) => void },
  refs: { set: (k: 'tabDrag', v: null) => void },
): void {
  refs.set('tabDrag', null)
  context.set('draggingTab', null)
  context.set('dropTarget', null)
}
