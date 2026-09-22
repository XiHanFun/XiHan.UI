/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tabs 相关实现。

import type { ItemQuery, Params } from '@xihan-ui/core'
import type { DragAnnounceKind, DropTarget } from '../shared/drag'
import type { TabsIndicatorRect, TabsSchema } from './tabs.types'
import { itemValue, queryItems, setup } from '@xihan-ui/core'
import { durations, frameLoop, frameNow, isTweenDone, resolveMotionPreference, tweenValueAt } from '@xihan-ui/motion'
import { createMultiPointerSession, resolveSessionDoc, shouldActivate } from '@xihan-ui/pointer'
import { dragAnnouncement, hitAlong, reorderFlat } from '../shared/drag'
import { snapshotDrift } from '../shared/drag-drift'
import { tabsAnatomy, tabsTriggerQuery } from './tabs.anatomy'

const { createMachine } = setup<TabsSchema>()

/** 两次量测是否一样。作 cell 的 isEqual 用：不给的话每次量测都是新对象，版本号会一直空转自增。 */
function sameRect(a: TabsIndicatorRect | null, b: TabsIndicatorRect | null | undefined): boolean {
  if (a == null || b == null)
    return a === b
  return a.blockStart === b.blockStart && a.blockSize === b.blockSize
    && a.inlineStart === b.inlineStart && a.inlineSize === b.inlineSize
}

/** 一页翻多远：标签带可见长度的八成，翻页前后总有一截重叠，用户看得出接上了哪一段。 */
const SCROLL_PAGE_RATIO = 0.8

/** 两端的翻页钮：贴在标签带两端、不随标签位移，露出标签时要把它们盖住的那一截也让开。 */
const PREV_TRIGGER_QUERY: ItemQuery = { scope: tabsAnatomy.name, part: 'prev-trigger' }
const NEXT_TRIGGER_QUERY: ItemQuery = { scope: tabsAnatomy.name, part: 'next-trigger' }

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
    indicator: cell<TabsIndicatorRect | null>(() => ({ defaultValue: null, isEqual: sameRect })),
    // 标签带的位移：放不下时整条标签带沿主轴往起始端挪了多少（px，≥ 0），上限是内容长度超出可见长度的那一截；
    // 放得下时上限为 0。两者都不受控、不对外通知，翻页钮的显隐与禁用由它们推出
    scroll: cell<number>(() => ({ defaultValue: 0 })),
    scrollMax: cell<number>(() => ({ defaultValue: 0 })),
    // 按压通道：正被按住的 trigger（按 value 记），与选中、焦点锚点、拖动无关
    pressedValue: cell<string | null>(() => ({ defaultValue: null })),
  }),
  // 挂载即量一次，让指示条首帧就在位、翻页钮首帧就知道要不要露面
  entry: ['measureStrip', 'measureIndicator'],
  watch: ({ track, context, action }) => {
    // 选中值一变：被裁掉的选中标签先挪进视野，再重量指示条。指示条量的是排布位、与位移无关，
    // 先后顺序只为让两次更新落在同一轮
    track([context.dep('value')], () => action(['revealSelected', 'measureIndicator']))
    // 焦点落到被裁掉的标签上，标签带自己挪过去：标签带不是滚动容器，浏览器不会替它做这件事
    track([context.dep('focusedValue')], () => action(['revealFocused']))
  },
  // 跟手的会话整个生命周期都在，不按拖动状态挂卸。常驻的代价只是几个早退的
  // pointermove，换来的是状态树一行都不用改
  effects: ['trackPointer', 'trackResize', 'trackStrip'],
  refs: () => ({
    getListEl: () => null,
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
      },
    },
  },
  implementations: {
    effects: {
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
        const m = list && measureStrip(list, isHorizontal(prop('orientation')))
        // 亚像素误差留 1px 余量：不然一个标签带在某些缩放比下会永远"差一点点"放不下
        const excess = m ? m.extent - m.viewport : 0
        const scrollMax = excess <= 1 ? 0 : excess
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
        context.set('scroll', clampScroll(tweenValueAt({ from: tween.from, to: tween.to, duration: durations.normal, easing: 'standard' }, elapsed), context.get('scrollMax')))
        if (isTweenDone(elapsed, durations.normal)) {
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
      measureIndicator: ({ refs, prop, context, flush }) => {
        const run = (): void => {
          const list = refs.get('getListEl')()
          const value = context.get('value') ?? null
          if (!list || value == null) {
            context.set('indicator', null)
            return
          }
          const trigger = queryItems(list, tabsTriggerQuery).find(el => itemValue(el) === value)
          if (!trigger) {
            context.set('indicator', null)
            return
          }
          // 指示条是 list 的绝对定位后代，落点以 list 的内衬盒为原点，offset* 量的正是相对 offsetParent
          // 内衬盒的排布位（边框已经扣掉，segment 档的标签带带一圈占位边）。不量 rect：标签带放不下时
          // 整条标签带用 translate 挪，指示条跟着同一个位移走，位移中途 rect 是半路上的值，排布位不动
          const host = (trigger.offsetParent as HTMLElement | null) ?? list
          context.set('indicator', {
            blockStart: trigger.offsetTop,
            blockSize: trigger.offsetHeight,
            // 起始缘按逻辑方向算，RTL 从右边缘量起
            inlineStart: (prop('dir') ?? 'ltr') === 'rtl'
              ? host.clientWidth - trigger.offsetLeft - trigger.offsetWidth
              : trigger.offsetLeft,
            inlineSize: trigger.offsetWidth,
          })
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
 * 把标签带挪到目标位移。屏内的像素级推移，走 continuous 一档（normal 时长 + standard 曲线，
 * 与皮肤里指示条滑动的那一档同值）；补间在 JS 里跑、逐帧写进 scroll，不交给 CSS transition——
 * 标签带里的孩子各有自己的过渡清单（line 档的标签归家族），往每一份里都加一条 translate 会把
 * 家族与皮肤的过渡耦在一起。目标换了从当前显示值接着走；减弱动效下一步到位。
 */
function startScroll({ refs, scope, context, send }: ScrollParams, target: number): void {
  const to = clampScroll(target, context.get('scrollMax'))
  refs.get('scrollTween')?.stop()
  refs.set('scrollTween', null)
  const from = context.get('scroll')
  if (from === to)
    return
  const win = scope.getWin()
  if (resolveMotionPreference(win) === 'reduce') {
    context.set('scroll', to)
    return
  }
  const stop = frameLoop(win, () => send({ type: 'SCROLL.FRAME' }))
  refs.set('scrollTween', { from, to, startedAt: frameNow(win), stop })
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
  const reserve = (query: ItemQuery): number => {
    const el = queryItems(list, query)[0]
    if (!el)
      return 0
    return (horizontal ? el.offsetWidth : el.offsetHeight) || trigger.offsetHeight
  }
  const [start, end] = logicalBounds(trigger, m, horizontal, (prop('dir') ?? 'ltr') === 'rtl')
  const scroll = scrollTarget(params)
  const visibleStart = scroll + reserve(PREV_TRIGGER_QUERY)
  const visibleEnd = scroll + m.viewport - reserve(NEXT_TRIGGER_QUERY)
  if (start >= visibleStart && end <= visibleEnd)
    return
  // 起点在前就对齐起点；否则对齐终点。比可见区还宽的标签也对齐起点：标签名的开头比结尾要紧
  startScroll(params, start < visibleStart ? scroll - (visibleStart - start) : scroll + (end - visibleEnd))
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
