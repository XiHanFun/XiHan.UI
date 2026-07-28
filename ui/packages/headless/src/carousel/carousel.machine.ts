import type { PropFn } from '@xihan-ui/machine'
import type { CarouselPauseSource, CarouselSchema } from './carousel.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'
import { carouselDragDelta, carouselPageCount, clampCarouselPage } from './carousel.pages'

const { createMachine } = setup<CarouselSchema>()

/** autoplay 写 true 时用的默认间隔毫秒。 */
export const CAROUSEL_AUTOPLAY_INTERVAL = 4000

/**
 * 拖拽翻页的位移阈值（像素）。
 * 做成常量而不是可配项：它要挡的是"点一下"和"想选中文字"这两种误触，
 * 这个界线与视口多宽无关，几十像素在哪块屏上都是同一个手感。
 */
export const CAROUSEL_DRAG_THRESHOLD = 40

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

/** 总页数由 props 现算：slideCount 与两个 perX 随时会被宿主改，缓存下来只会拿到过期的页数。 */
function pageCount(prop: PropFn<CarouselSchema>): number {
  return carouselPageCount(prop('slideCount'), prop('slidesPerPage'), prop('slidesPerMove'))
}

/** 水平轴 + rtl 时左右含义互换；纵向轨道与文字方向无关。 */
function isFlipped(prop: PropFn<CarouselSchema>): boolean {
  return (prop('orientation') ?? 'horizontal') === 'horizontal' && prop('dir') === 'rtl'
}

/**
 * 走一步。先把当前页夹回合法区间再加减：slideCount 变小之后内部值可能停在一个已不存在的页上，
 * 而界面显示的是夹过的页（connect 同样夹）。此时按"上一张"该从看得见的那一页往回走，
 * 从那个越界的旧值往回走的话，用户得连点好几下才看得到反应。
 */
function step(current: number, direction: 1 | -1, totalPages: number, loop: boolean): number {
  return clampCarouselPage(clampCarouselPage(current, totalPages) + direction, totalPages, loop)
}

// 页码住在 context 的 cell 里，不编码进状态：cell 本身就是受控/非受控的收口点
// （page prop 给定即受控，读直取 prop，写只发 onPageChange 不落内部值），因此不需要影子事件。
// 编进状态的只有自动播放：它是"跑 / 被按住 / 没开"三段真状态，计时器必须跟着状态挂拆。
export const carouselMachine = createMachine({
  name: 'carousel',
  context: ({ prop, cell }) => ({
    page: cell<number>(() => ({
      value: prop('page'),
      defaultValue: prop('defaultPage') ?? 0,
      onChange: page => prop('onPageChange')?.({ page }),
    })),
    // 按住来源做成集合而不是一个布尔：指针悬停与焦点停留会同时按住计时，
    // 只记布尔的话鼠标一移开就把仍用键盘停在这条轮播里的人的计时放开了
    pausedBy: cell<CarouselPauseSource[]>(() => ({ defaultValue: [] })),
    dragStart: cell<number | null>(() => ({ defaultValue: null })),
    dragOffset: cell<number>(() => ({ defaultValue: 0 })),
  }),
  // 间隔为 0（没开自动播放）时压根不进 playing：进去也只是挂一个不会响的计时器
  initialState: ({ prop }) => (resolveAutoplayInterval(prop('autoplay')) > 0 ? 'playing' : 'idle'),
  // autoplay 被改写（关掉、打开、换间隔）都要重挂计时器。最常见的一次是宿主按"减少动效"
  // 偏好把它关掉：不重挂的话画面还会自己接着翻。
  watch: ({ track, prop, action }) => track([() => prop('autoplay')], () => action(['syncAutoplay'])),
  on: {
    // 翻页与拖拽在三个状态里都得认；自动播放没开时它们同样要工作
    'PAGE.SET': { actions: ['setPage'] },
    'PAGE.PREV': { actions: ['goPrev'] },
    'PAGE.NEXT': { actions: ['goNext'] },
    'DRAG.START': { actions: ['startDrag'] },
    'DRAG.MOVE': { actions: ['moveDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
  },
  states: {
    // 没开自动播放。PAUSE / RESUME 在这里无事可做：没有计时可按住
    idle: {
      on: {
        'AUTOPLAY.START': [{ guard: 'hasAutoplay', target: 'playing' }],
      },
    },
    playing: {
      initial: 'running',
      on: {
        // 停掉时一并清空按住来源：下次开播是全新一轮，不该背着上一轮遗留的"指针还悬着"
        'AUTOPLAY.STOP': { target: 'idle', actions: ['clearPauseSources'] },
      },
      states: {
        running: {
          effects: ['trackAutoplay'],
          on: {
            'AUTOPLAY.PAUSE': { target: 'playing.paused', actions: ['addPauseSource'] },
            // 间隔被改写：重入把 trackAutoplay 拆掉再挂，新间隔当场生效
            'AUTOPLAY.START': [{ guard: 'hasAutoplay', target: 'playing.running', reenter: true }],
            // 手动翻页要重新计满一整个间隔。不重挂的话，用户刚点完"下一张"，
            // 上一轮残余的那一小截会立刻把画面又翻走一屏
            'PAGE.SET': { target: 'playing.running', reenter: true, actions: ['setPage'] },
            'PAGE.PREV': { target: 'playing.running', reenter: true, actions: ['goPrev'] },
            'PAGE.NEXT': { target: 'playing.running', reenter: true, actions: ['goNext'] },
            // 到点：还走得动就走一格并重起计时；走不动（不回绕且已在末页）就收摊回 idle——
            // 留在 running 只会挂一个永远把画面停在原地的计时器。
            // 守卫在动作之前求值，所以末页是"露面之后再拿满一个间隔"才停，不是一到就断
            'after.autoplay': [
              { guard: 'canAdvance', target: 'playing.running', reenter: true, actions: ['goNext'] },
              { target: 'idle' },
            ],
          },
        },
        paused: {
          on: {
            // 已经按住时再来一个来源只是登记，不必重入（重入会白白拆装一遍效应）
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
    },
    actions: {
      // 越界页码在写入口就收口：受控宿主拿到的回调值永远是可用的页
      setPage: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type === 'PAGE.SET')
          context.set('page', clampCarouselPage(e.page, pageCount(prop), prop('loop') ?? false))
      },
      goPrev: ({ context, prop }) =>
        context.set('page', step(context.get('page'), -1, pageCount(prop), prop('loop') ?? false)),
      goNext: ({ context, prop }) =>
        context.set('page', step(context.get('page'), 1, pageCount(prop), prop('loop') ?? false)),

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

      syncAutoplay: ({ prop, send }) => {
        send(resolveAutoplayInterval(prop('autoplay')) > 0
          ? { type: 'AUTOPLAY.START' }
          : { type: 'AUTOPLAY.STOP' })
      },

      startDrag: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        context.set('dragStart', e.position)
        context.set('dragOffset', 0)
      },
      moveDrag: ({ context, event }) => {
        const e = event.current()
        const start = context.get('dragStart')
        // 没按下就收到 move（指针只是划过视口）：不记位移，否则松手时会凭空翻一页
        if (e.type !== 'DRAG.MOVE' || start == null)
          return
        context.set('dragOffset', e.position - start)
      },
      endDrag: ({ context, prop, send }) => {
        const start = context.get('dragStart')
        const offset = context.get('dragOffset')
        // 先把拖拽态清干净再决定翻不翻页：翻页会重入 running 拆装计时器，
        // 那一刻若 dragStart 还在，连接层算出的位移里就还挂着已经松手的那一段
        context.set('dragStart', null)
        context.set('dragOffset', 0)
        if (start == null)
          return
        const delta = carouselDragDelta(offset, CAROUSEL_DRAG_THRESHOLD, isFlipped(prop))
        if (delta === 1)
          send({ type: 'PAGE.NEXT' })
        else if (delta === -1)
          send({ type: 'PAGE.PREV' })
      },
    },
    effects: {
      /**
       * 计时器只在 running 子态存在，且每次进入都从整个间隔重新计。
       * 刻意不记"还剩多少"这笔账（与 toast 相反）：指针从轮播上扫过一下之后立刻翻页，
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
