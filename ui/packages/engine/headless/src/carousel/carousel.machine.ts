/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 carousel 相关实现。

import type { ContextFacade, PropFn, RefsFacade, Scope } from '@xihan-ui/core'
import type { CarouselWrap } from './carousel.pages'
import type { CarouselPauseSource, CarouselPressedKey, CarouselSchema } from './carousel.types'
import { DIAGNOSTIC_CODES, isDev, queryItems, reportDiagnostic, setTimeoutEffect, setup } from '@xihan-ui/core'
import { createSpringValue, projectRelease, resolveMotionPreference, rubberBand } from '@xihan-ui/motion'
import { createMultiPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { trackLiquidPart } from '../shared/liquid'
import {
  carouselDragDelta,
  carouselPageCount,
  carouselSlideRange,
  carouselTranslatePercent,
  carouselWrapOf,
  carouselWrapPercent,
  carouselWrapStart,
  clampCarouselPage,
  normalizeSlideCount,
  normalizeSlidesPerMove,
  normalizeSlidesPerPage,
} from './carousel.pages'

const { createMachine } = setup<CarouselSchema>()

/** autoplay 写 true 时用的默认间隔毫秒。 */
export const CAROUSEL_AUTOPLAY_INTERVAL = 4000

/** 拖拽翻页的位移阈值（像素）。 */
export const CAROUSEL_DRAG_THRESHOLD = 40

/** 松手落点的投影时间（秒）：落点 = 拖拽位移 + 松手速度 × 这么久，轻甩一下也能翻页，往回甩则收回。 */
const PROJECTION_SECONDS = 0.2

/** 不回绕的首末页往外拖时的橡皮筋尺寸（像素）：越拉越沉，趋近这么远。 */
const EDGE_STRETCH = 60

/**
 * 自动播放间隔归一。返回 0 表示"不起计时器"：
 * 缺省、false、非正数、非有限数一律按不自动播放处理（写 0 就是关掉它的方式）。
 */
export function resolveAutoplayInterval(autoplay: boolean | number | undefined): number {
  if (autoplay == null || autoplay === false)
    return 0
  if (autoplay === true)
    return CAROUSEL_AUTOPLAY_INTERVAL
  return Number.isFinite(autoplay) && autoplay > 0 ? autoplay : 0
}

/**
 * 这一刻允不允许自己起播。
 *
 * 减弱动效档一律不许：自动翻页是一段没人按下去就一直动下去的画面，
 * 表示"少放动画"的用户不该一进页面就被它推着走。用户按下播放开关是另一回事，
 * 那条路只看间隔（见 hasAutoplay），不看这里。
 *
 * 偏好按根节点判断：最近祖先上的 data-motion 优先，与 CSS 的作用域一致；其次应用级 override，
 * 最后系统设置。偏好探测走 motion 包的统一入口，自己拿 matchMedia 问一遍会漏掉前两层。
 */
function startsOnItsOwn(prop: PropFn<CarouselSchema>, target: Window | Element): boolean {
  return resolveAutoplayInterval(prop('autoplay')) > 0 && resolveMotionPreference(target) !== 'reduce'
}

/** 判断偏好的目标：根节点；没有渲染宿主（纯逻辑驱动）时是 scope 所在窗口。 */
function motionTarget(scope: Scope): Window | Element {
  return scope.getById(scope.partId('carousel', 'root')) ?? scope.getWin()
}

/** 总页数由 props 现算，不缓存（slideCount 与两个 perX 随时会被宿主改）。 */
function pageCount(prop: PropFn<CarouselSchema>): number {
  return carouselPageCount(prop('slideCount'), prop('slidesPerPage'), prop('slidesPerMove'))
}

/** 水平轴 + rtl 时左右含义互换；纵向轨道与文字方向无关。 */
function isFlipped(prop: PropFn<CarouselSchema>): boolean {
  return (prop('orientation') ?? 'horizontal') === 'horizontal' && prop('dir') === 'rtl'
}

function isHorizontal(prop: PropFn<CarouselSchema>): boolean {
  return (prop('orientation') ?? 'horizontal') === 'horizontal'
}

/** 淡变换页：轨道不位移，回绕与松手落定都没有可走的路，换页就是一次淡变。 */
function isFade(prop: PropFn<CarouselSchema>): boolean {
  return prop('effect') === 'fade'
}

/** 某一页落定时轨道的位移百分比（相对轨道自身沿轴的尺寸），与连接层的算法同一套。 */
function trackPercent(prop: PropFn<CarouselSchema>, page: number, wrap: CarouselWrap = null): number {
  const slideCount = normalizeSlideCount(prop('slideCount'))
  const perPage = normalizeSlidesPerPage(prop('slidesPerPage'))
  if (wrap)
    return carouselWrapPercent(carouselWrapStart(wrap, slideCount, perPage), perPage, isFlipped(prop))
  const perMove = normalizeSlidesPerMove(prop('slidesPerMove'), perPage)
  const range = carouselSlideRange(clampCarouselPage(page, carouselPageCount(slideCount, perPage, perMove)), slideCount, perPage, perMove)
  return carouselTranslatePercent(range.start, perPage, isFlipped(prop))
}

/** 翻一步并记下是否回绕；回绕之外的翻页一律撤掉「已归位」的过渡开关，让新一步照常走过渡。 */
function moveTo(context: CarouselContext, prop: PropFn<CarouselSchema>, direction: 1 | -1): number {
  const total = pageCount(prop)
  const from = clampCarouselPage(context.get('page'), total)
  const next = step(context.get('page'), direction, total, prop('loop') ?? false)
  context.set('wrap', isFade(prop) ? null : carouselWrapOf(from, next, direction, total, prop('loop') ?? false))
  context.set('snapped', false)
  return next
}

/** 回绕落定：轨道与条目无动画地归位到真实页；过渡开关留到下一次翻页才撤。 */
function settleWrap(context: CarouselContext): void {
  if (context.get('wrap') == null)
    return
  context.set('wrap', null)
  context.set('snapped', true)
}

/** 轨道节点：位移百分比按它沿轴的尺寸算；落定弹簧也按它判断减弱动效。 */
function trackEl(scope: Scope): HTMLElement | null {
  return scope.getById<HTMLElement>(scope.partId('carousel', 'viewport'))
    ?.querySelector<HTMLElement>(':scope > [data-scope="carousel"][data-part="list"]') ?? null
}

/**
 * 这一拖朝哪边、那边还走不走得动：+1 往下一页、-1 往上一页。不回绕的首页往上一页、末页往下一页拖时走不动，
 * 拖出去的那段按橡皮筋衰减。
 */
function blockedToward(prop: PropFn<CarouselSchema>, page: number, offset: number): boolean {
  const direction = carouselDragDelta(offset, 0, isFlipped(prop))
  if (direction === 0 || (prop('loop') ?? false))
    return false
  const total = pageCount(prop)
  const current = clampCarouselPage(page, total)
  return direction === 1 ? current >= total - 1 : current <= 0
}

/**
 * 按住的那个按钮此刻是不是已经转成原生 disabled：到边界的翻页钮（不回绕）与没配自动播放的开关。
 * 按住途中翻到末页、宿主关掉 loop 或改写 autoplay，按钮转禁用后不会再来 keyup，按压面得由机器收。
 * 指示点没有禁用态。
 */
function pressedKeyInert(prop: PropFn<CarouselSchema>, page: number, key: CarouselPressedKey): boolean {
  const total = pageCount(prop)
  const loop = prop('loop') ?? false
  const current = clampCarouselPage(page, total)
  if (key === 'prev')
    return !(total > 1 && (loop || current > 0))
  if (key === 'next')
    return !(total > 1 && (loop || current < total - 1))
  if (key === 'autoplay')
    return resolveAutoplayInterval(prop('autoplay')) <= 0
  return false
}

/**
 * 走一步。先把当前页夹回合法区间再加减：slideCount 变小后内部值可能停在已不存在的页上，
 * 而界面显示的是夹过的页（connect 同样夹）。
 */
function step(current: number, direction: 1 | -1, totalPages: number, loop: boolean): number {
  return clampCarouselPage(clampCarouselPage(current, totalPages) + direction, totalPages, loop)
}

type CarouselRefs = RefsFacade<CarouselSchema>
type CarouselContext = ContextFacade<CarouselSchema>

/** 撤下落定弹簧并把轨道交还给连接层的页位移。 */
function stopSettle(refs: CarouselRefs, context: CarouselContext): void {
  refs.get('settle')?.spring.stop()
  refs.set('settle', null)
  context.set('settleOffset', 0)
  context.set('settling', false)
}

/**
 * 别的途径翻页时，落定弹簧若不是奔着这一页去的就让开：轨道从弹簧此刻的位置起按样式层的过渡曲线走向新页。
 * 松手那一下自己发的翻页与弹簧同一页，弹簧留着。
 */
function yieldSettle(refs: CarouselRefs, context: CarouselContext, next: number): void {
  const settle = refs.get('settle')
  if (settle && settle.page !== next)
    stopSettle(refs, context)
}

interface SettleFrom {
  from: number
  fromPage: number
  toPage: number
  /** 这一步是回绕：弹簧收向虚拟页，不倒卷过全部页。 */
  wrap: CarouselWrap
  velocity: number
  spring: 'smooth' | 'stiff'
}

/**
 * 松手落定：轨道从松手那一刻的位置带着松手速度落到目标页。位移拆成「目标页的页位移 + 还差的像素」，
 * 弹簧只收后一段。量不到轨道（纯逻辑驱动、尺寸为 0）时直接落定，交给样式层的过渡。
 */
function settleFrom(refs: CarouselRefs, context: CarouselContext, scope: Scope, prop: PropFn<CarouselSchema>, o: SettleFrom): void {
  stopSettle(refs, context)
  const track = trackEl(scope)
  const size = track ? (isHorizontal(prop) ? track.offsetWidth : track.offsetHeight) : 0
  if (!track || size <= 0)
    return
  const gap = o.from + ((trackPercent(prop, o.fromPage) - trackPercent(prop, o.toPage, o.wrap)) / 100) * size
  if (Math.abs(gap) < 0.5 && Math.abs(o.velocity) < 5)
    return
  const spring = createSpringValue({
    spring: o.spring,
    value: gap,
    target: track,
    onUpdate: value => context.set('settleOffset', value),
  })
  refs.set('settle', { spring, page: o.toPage })
  context.set('settleOffset', gap)
  context.set('settling', true)
  void spring.to(0, { velocity: o.velocity }).then((result) => {
    if (result === 'rest' && refs.get('settle')?.spring === spring) {
      stopSettle(refs, context)
      // 弹簧收向的是虚拟页：落定即归位，与撤掉 data-animating 同一拍，归位这一下不走过渡
      settleWrap(context)
    }
  })
}

// 页码住在 context 的 cell 里（page prop 给定即受控），不编码进状态。
// 编进状态的只有自动播放："跑 / 被按住 / 没开"三段，计时器跟着状态挂拆。
export const carouselMachine = createMachine({
  name: 'carousel',
  context: ({ prop, cell }) => ({
    page: cell<number>(() => ({
      value: prop('page'),
      defaultValue: prop('defaultPage') ?? 0,
      onChange: page => prop('onPageChange')?.({ page }),
    })),
    // 按住来源做成集合而不是布尔：指针悬停与焦点停留会同时按住计时
    pausedBy: cell<CarouselPauseSource[]>(() => ({ defaultValue: [] })),
    dragStart: cell<number | null>(() => ({ defaultValue: null })),
    dragOffset: cell<number>(() => ({ defaultValue: 0 })),
    dragBase: cell<number>(() => ({ defaultValue: 0 })),
    settleOffset: cell<number>(() => ({ defaultValue: 0 })),
    settling: cell<boolean>(() => ({ defaultValue: false })),
    wrap: cell<CarouselWrap>(() => ({ defaultValue: null })),
    snapped: cell<boolean>(() => ({ defaultValue: false })),
    // 按压通道：正被按住的那个按钮，与自动播放的开合互相独立（按住播放开关时计时会停 / 起，按压面不随之丢）
    pressed: cell<CarouselPressedKey | null>(() => ({ defaultValue: null })),
  }),
  // 间隔为 0（没开自动播放）时不进 playing。减弱动效要看根节点所在的作用域，构造期还没有节点，
  // 由 respectScopedMotion 在宿主提交之后判定
  initialState: ({ prop }) => (resolveAutoplayInterval(prop('autoplay')) > 0 ? 'playing' : 'idle'),
  // 跟手的会话整个生命周期都在。它不按拖动状态挂卸——常驻的代价只是几个早退的
  // pointermove，换来的是不必为了「有拆卸时机」去改状态树
  effects: ['trackPointer', 'respectScopedMotion', 'trackLiquid', 'trackWrapSettle', 'trackVisibility', 'checkSlideCount'],
  refs: () => ({
    gesture: null,
    settle: null,
  }),
  watch: ({ track, prop, context, action }) => {
    // autoplay 被改写（关掉、打开、换间隔）都要重挂计时器
    track([() => prop('autoplay')], () => action(['syncAutoplay']))
    // 按住途中按钮转禁用：按住 Enter 翻到末页、宿主关掉 loop / 减少张数 / 改写 autoplay，
    // 按钮原生 disabled 后不会再来 keyup，按压面由机器收
    track([
      context.dep('page'),
      () => prop('loop'),
      () => prop('slideCount'),
      () => prop('slidesPerPage'),
      () => prop('slidesPerMove'),
      () => prop('autoplay'),
    ], () => action(['releaseWhenInert']))
  },
  on: {
    // 翻页与拖拽在三个状态里都得认；自动播放没开时它们同样要工作
    'PAGE.SET': { actions: ['setPage'] },
    'PAGE.PREV': { actions: ['goPrev'] },
    'PAGE.NEXT': { actions: ['goNext'] },
    'DRAG.START': { actions: ['startDrag'] },
    'DRAG.MOVE': { actions: ['moveDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
    'WRAP.SETTLE': { actions: ['settleWrap'] },
    // 按压通道同样挂根级：按住播放开关时状态在 idle / playing 之间切，按压面不能随状态丢
    'PRESS.START': { guard: 'canPress', actions: ['startPress'] },
    'PRESS.END': { actions: ['endPress'] },
  },
  states: {
    // 没开自动播放：没有计时可按住，PAUSE / RESUME 在这里无事可做
    idle: {
      on: {
        'AUTOPLAY.START': [{ guard: 'hasAutoplay', target: 'playing' }],
      },
    },
    playing: {
      initial: 'running',
      on: {
        // 停掉时一并清空按住来源，下次开播是全新一轮
        'AUTOPLAY.STOP': { target: 'idle', actions: ['clearPauseSources'] },
      },
      states: {
        running: {
          effects: ['trackAutoplay'],
          on: {
            'AUTOPLAY.PAUSE': { target: 'playing.paused', actions: ['addPauseSource'] },
            // 间隔被改写：重入把 trackAutoplay 拆掉再挂，新间隔当场生效
            'AUTOPLAY.START': [{ guard: 'hasAutoplay', target: 'playing.running', reenter: true }],
            // 手动翻页重入，重新计满一整个间隔
            'PAGE.SET': { target: 'playing.running', reenter: true, actions: ['setPage'] },
            'PAGE.PREV': { target: 'playing.running', reenter: true, actions: ['goPrev'] },
            'PAGE.NEXT': { target: 'playing.running', reenter: true, actions: ['goNext'] },
            // 到点：还走得动就走一格并重起计时；走不动（不回绕且已在末页）回 idle。
            // 守卫在动作之前求值，末页是拿满一个间隔之后才停
            'after.autoplay': [
              { guard: 'canAdvance', target: 'playing.running', reenter: true, actions: ['goNext'] },
              { target: 'idle' },
            ],
          },
        },
        paused: {
          on: {
            // 已经按住时再来一个来源只是登记，不重入
            'AUTOPLAY.PAUSE': { actions: ['addPauseSource'] },
            'AUTOPLAY.RESUME': [
              { guard: 'isLastPauseSource', target: 'playing.running', actions: ['removePauseSource'] },
              { actions: ['removePauseSource'] },
            ],
          },
        },
      },
    },
  },
  implementations: {
    guards: {
      hasAutoplay: ({ prop }) => resolveAutoplayInterval(prop('autoplay')) > 0,
      // 守卫在动作之前求值，所以问的是"把这个来源摘掉之后还剩人按着吗"，
      // 而不是"现在还剩几个"
      isLastPauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'AUTOPLAY.RESUME')
          return false
        return context.get('pausedBy').every(src => src === e.src)
      },
      canAdvance: ({ prop, context }) => {
        const total = pageCount(prop)
        if (total <= 1)
          return false
        if (prop('loop') ?? false)
          return true
        return clampCarouselPage(context.get('page'), total) < total - 1
      },
      // 轮播没有整组禁用；到边界的翻页钮与没配自动播放的开关是原生 disabled，那份事实由 connect 判定后随事件带入
      canPress: ({ event }) => {
        const e = event.current()
        return e.type === 'PRESS.START' && !e.disabled
      },
    },
    actions: {
      startPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.START')
          context.set('pressed', e.key)
      },
      // 只收自己那一下：别的按钮的 keyup 不该把正按着的这个松开
      endPress: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'PRESS.END' && context.get('pressed') === e.key)
          context.set('pressed', null)
      },
      releaseWhenInert: ({ context, prop }) => {
        const key = context.get('pressed')
        if (key != null && pressedKeyInert(prop, context.get('page'), key))
          context.set('pressed', null)
      },
      // 越界页码在写入口就收口：受控宿主拿到的回调值永远是可用的页
      setPage: ({ context, prop, event, refs }) => {
        const e = event.current()
        if (e.type !== 'PAGE.SET')
          return
        const next = clampCarouselPage(e.page, pageCount(prop), prop('loop') ?? false)
        yieldSettle(refs, context, next)
        // 直接跳页不回绕：按页码的远近走
        context.set('wrap', null)
        context.set('snapped', false)
        context.set('page', next)
      },
      goPrev: ({ context, prop, refs }) => {
        const next = moveTo(context, prop, -1)
        yieldSettle(refs, context, next)
        context.set('page', next)
      },
      goNext: ({ context, prop, refs }) => {
        const next = moveTo(context, prop, 1)
        yieldSettle(refs, context, next)
        context.set('page', next)
      },
      settleWrap: ({ context }) => settleWrap(context),

      addPauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'AUTOPLAY.PAUSE')
          return
        const current = context.get('pausedBy')
        // focusin 会随内部每个可聚焦节点冒上来，同一个来源登记一次就够
        if (current.includes(e.src))
          return
        context.set('pausedBy', [...current, e.src])
      },
      removePauseSource: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'AUTOPLAY.RESUME')
          return
        context.set('pausedBy', context.get('pausedBy').filter(src => src !== e.src))
      },
      clearPauseSources: ({ context }) => context.set('pausedBy', []),

      // autoplay 被改写后的重挂：同样只走"自己起播"那道判据，
      // 否则减弱动效档下宿主一改间隔就把刚才没起播的这一条给点着了
      syncAutoplay: ({ prop, scope, send }) => {
        send(startsOnItsOwn(prop, motionTarget(scope))
          ? { type: 'AUTOPLAY.START' }
          : { type: 'AUTOPLAY.STOP' })
      },

      // 落定途中又按下：接住弹簧此刻的位置，从这里接着拖，轨道不跳
      startDrag: ({ context, event, refs }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        const caught = context.get('settleOffset')
        stopSettle(refs, context)
        // 回绕途中又按下：先无动画地归位到真实页，再从这里接着拖
        settleWrap(context)
        context.set('dragStart', e.position)
        context.set('dragBase', caught)
        context.set('dragOffset', caught)
      },
      moveDrag: ({ context, event, prop }) => {
        const e = event.current()
        const start = context.get('dragStart')
        // 没按下就收到 move（指针只是划过视口）：不记位移，否则松手时会凭空翻一页
        if (e.type !== 'DRAG.MOVE' || start == null)
          return
        const raw = context.get('dragBase') + e.position - start
        context.set('dragOffset', blockedToward(prop, context.get('page'), raw) ? rubberBand(raw, EDGE_STRETCH) : raw)
      },
      endDrag: ({ context, prop, send, event, refs, scope }) => {
        const e = event.current()
        const start = context.get('dragStart')
        const offset = context.get('dragOffset')
        const base = context.get('dragBase')
        // 先把拖拽态清干净再决定翻不翻页：翻页会重入 running 拆装计时器，
        // 那一刻若 dragStart 还在，连接层算出的位移里就还挂着已经松手的那一段
        context.set('dragStart', null)
        context.set('dragOffset', 0)
        context.set('dragBase', 0)
        if (start == null)
          return
        const canceled = e.type === 'DRAG.END' && e.canceled === true
        const velocity = e.type === 'DRAG.END' && !canceled ? (e.velocity ?? 0) : 0
        // 只看这次按下之后拖出去的那一段，顺着松手速度往前投影：轻甩也能翻页。
        // 往回甩到起点另一侧是「算了」，收回原页，不翻到反方向去
        const intent = offset - base
        const projected = projectRelease(intent, velocity, PROJECTION_SECONDS)
        const reversed = intent !== 0 && Math.sign(projected) !== Math.sign(intent)
        const delta = canceled || reversed ? 0 : carouselDragDelta(projected, CAROUSEL_DRAG_THRESHOLD, isFlipped(prop))
        const from = context.get('page')
        const to = delta === 0 ? from : step(from, delta, pageCount(prop), prop('loop') ?? false)
        const total = pageCount(prop)
        // 淡变下画面没跟手位移，也就没有要收回的那一截：只按方向决定翻不翻页
        if (!isFade(prop)) {
          settleFrom(refs, context, scope, prop, {
            // 轨道此刻的位置换算到落定那一页：差的就是两页的位移差加上松手时的拖拽位移
            from: offset,
            fromPage: from,
            toPage: to,
            wrap: delta === 0 ? null : carouselWrapOf(clampCarouselPage(from, total), to, delta, total, prop('loop') ?? false),
            velocity,
            // 在走不动的边界上被拉出去：硬弹簧回弹
            spring: to === from && blockedToward(prop, from, offset) ? 'stiff' : 'smooth',
          })
        }
        if (to !== from)
          send({ type: delta === 1 ? 'PAGE.NEXT' : 'PAGE.PREV' })
      },
    },
    effects: {
      /**
       * 看不见就不翻页：视口滚出可视区、或页面切到后台时按住自动播放，看得见了再从头计一整个间隔。
       * 页面上没人看的时候照样翻页，回来看到的是翻到半路的页与对不上的进度条。
       */
      /**
       * 开发期核对张数：张数只看 slideCount、不从 DOM 计数（服务端渲染与按需渲染都靠它），漏传时按 0 张处理——
       * 没有指示点、翻页禁用、自动播放不动、读屏报总数为 0，却不报任何错。挂载后与 slideCount 改写时各量一次，
       * 只报「渲染出来的比声明的多」：按需渲染时 DOM 里的条目本来就可以比张数少。
       */
      checkSlideCount: ({ scope, prop, flush, track }) => {
        if (!isDev())
          return undefined
        let disposed = false
        const check = (): void => flush(() => {
          if (disposed)
            return
          const viewport = scope.getById(scope.partId('carousel', 'viewport'))
          const rendered = queryItems(viewport, { scope: 'carousel', part: 'item' }).length
          const declared = normalizeSlideCount(prop('slideCount'))
          if (rendered <= declared)
            return
          reportDiagnostic({
            code: DIAGNOSTIC_CODES.carouselSlideCountMismatch,
            level: 'warn',
            scope: 'carousel',
            message: `渲染了 ${rendered} 张条目，slideCount 却是 ${declared}：张数只看 slideCount、不从 DOM 计数，`
              + '多出来的那几张翻不到、指示点与读屏播报的总数也对不上。把 slideCount 写成条目数',
          })
        })
        check()
        track([() => prop('slideCount')], check)
        return () => {
          disposed = true
        }
      },

      trackVisibility: ({ scope, state, send, flush, track }) => {
        const doc = scope.getDoc()
        let intersecting = true
        let observer: IntersectionObserver | undefined
        let disposed = false
        const sync = (): void => {
          const visible = intersecting && doc.visibilityState !== 'hidden'
          if (!visible && state.matches('playing.running'))
            send({ type: 'AUTOPLAY.PAUSE', src: 'visibility' })
          else if (visible && state.matches('playing.paused'))
            send({ type: 'AUTOPLAY.RESUME', src: 'visibility' })
        }
        flush(() => {
          const viewport = scope.getById(scope.partId('carousel', 'viewport'))
          const Observer = scope.getWin().IntersectionObserver
          if (disposed || !viewport || typeof Observer !== 'function')
            return
          observer = new Observer((entries) => {
            const last = entries.at(-1)
            if (!last)
              return
            intersecting = last.isIntersecting
            sync()
          })
          observer.observe(viewport)
        })
        doc.addEventListener('visibilitychange', sync)
        track([() => state.matches('playing.running')], sync)
        return () => {
          disposed = true
          observer?.disconnect()
          doc.removeEventListener('visibilitychange', sync)
        }
      },
      /**
       * 回绕那一步的轨道过渡播完即归位。过渡结束事件在三端经框架合成事件的命名各不相同，
       * 这里在文档上挂原生监听，按事件目标认出自己的轨道；没有过渡（作者关掉、减弱动效下 1ms 也照样触发）
       * 时下一次翻页同样会清掉回绕态。
       */
      trackWrapSettle: ({ scope, send, context }) => {
        const doc = scope.getDoc()
        const onEnd = (event: TransitionEvent): void => {
          if (context.get('wrap') == null || event.propertyName !== 'translate')
            return
          const target = event.target as Element | null
          const viewport = scope.getById<HTMLElement>(scope.partId('carousel', 'viewport'))
          if (!target || !viewport || target.parentElement !== viewport)
            return
          send({ type: 'WRAP.SETTLE' })
        }
        doc.addEventListener('transitionend', onEnd, true)
        return () => doc.removeEventListener('transitionend', onEnd, true)
      },
      /** 三颗控制钮与分页条浮在媒体之上：材质轴为 liquid 时按下层换色调、亮边随指针 */
      trackLiquid: ({ scope, flush }) => {
        const stops = ['prev-trigger', 'next-trigger', 'autoplay-trigger', 'indicator-group']
          .map(part => trackLiquidPart(scope, flush, 'carousel', part))
        return () => stops.forEach(stop => stop())
      },

      /**
       * 跟住划在轨道上的那根手指。
       *
       * 监听挂在文档上：手划出轨道、划出窗口都要继续跟，系统收走指针也会收尾。
       * 只认第一根——轮播是单指划动，第二根落下时连接层不会把它交进来。
       */
      /**
       * 起播判定的减弱动效那一半：宿主提交之后才拿得到根节点，按它所在的作用域判断，减弱档就停下自动播放。
       * 仍在首帧绘制之前，自动翻页的计时器在这一轮里就被撤掉，一页也不会翻。
       */
      respectScopedMotion: ({ prop, scope, send, flush }) => {
        let disposed = false
        flush(() => {
          if (!disposed && !startsOnItsOwn(prop, motionTarget(scope)))
            send({ type: 'AUTOPLAY.STOP' })
        })
        return () => {
          disposed = true
        }
      },

      trackPointer: ({ refs, scope, send, prop }) => {
        const session = createMultiPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          // 沿轨道那一轴取坐标：纵向轮播取 clientY
          onChange: (points) => {
            const first = points[0]
            if (first)
              send({ type: 'DRAG.MOVE', position: isHorizontal(prop) ? first.clientX : first.clientY })
          },
          onEnd: ({ reason, velocity }) => send({
            type: 'DRAG.END',
            velocity: isHorizontal(prop) ? velocity.x : velocity.y,
            canceled: reason === 'pointercancel',
          }),
        })
        refs.set('gesture', session)
        return () => {
          session.dispose()
          refs.set('gesture', null)
          refs.get('settle')?.spring.stop()
          refs.set('settle', null)
        }
      },

      /**
       * 计时器只在 running 子态存在，且每次进入都从整个间隔重新计。
       * 刻意不记"还剩多少"这笔账（与通知卡片相反）：指针从轮播上扫过一下之后立刻翻页，
       * 观感像是画面在躲人；每一页拿满一个完整的展示间隔才是自动播放该有的样子。
       */
      trackAutoplay: ({ prop, send }) => {
        const interval = resolveAutoplayInterval(prop('autoplay'))
        // 间隔为 0 = 不自动播放：不起计时器（也不把 0 送进 setTimeoutEffect 空转一拍）
        if (interval <= 0)
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.autoplay' }), interval)
      },
    },
  },
})
