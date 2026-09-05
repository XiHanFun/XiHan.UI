import type { PropFn } from '@xihan-ui/core'
import type { CarouselPauseSource, CarouselSchema } from './carousel.types'
import { setTimeoutEffect, setup } from '@xihan-ui/core'
import { resolveMotionPreference } from '@xihan-ui/motion'
import { createMultiPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'
import { carouselDragDelta, carouselPageCount, clampCarouselPage } from './carousel.pages'

const { createMachine } = setup<CarouselSchema>()

/** autoplay 写 true 时用的默认间隔毫秒。 */
export const CAROUSEL_AUTOPLAY_INTERVAL = 4000

/** 拖拽翻页的位移阈值（像素）。 */
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

/**
 * 这一刻允不允许自己起播。
 *
 * 减弱动效档一律不许：自动翻页是一段没人按下去就一直动下去的画面，
 * 表示"少放动画"的用户不该一进页面就被它推着走。用户按下播放开关是另一回事，
 * 那条路只看间隔（见 hasAutoplay），不看这里。
 *
 * 偏好探测走 motion 包的统一入口：应用级强制档（setMotionOverride）只有它看得见，
 * 自己拿 matchMedia 问一遍会漏掉那一层。不传窗口即取全局窗口——起播判定发生在
 * 服务构造期，此时 scope 还可能落在没有 document 的宿主上。
 */
function startsOnItsOwn(prop: PropFn<CarouselSchema>): boolean {
  return resolveAutoplayInterval(prop('autoplay')) > 0 && resolveMotionPreference() !== 'reduce'
}

/** 总页数由 props 现算，不缓存（slideCount 与两个 perX 随时会被宿主改）。 */
function pageCount(prop: PropFn<CarouselSchema>): number {
  return carouselPageCount(prop('slideCount'), prop('slidesPerPage'), prop('slidesPerMove'))
}

/** 水平轴 + rtl 时左右含义互换；纵向轨道与文字方向无关。 */
function isFlipped(prop: PropFn<CarouselSchema>): boolean {
  return (prop('orientation') ?? 'horizontal') === 'horizontal' && prop('dir') === 'rtl'
}

/**
 * 走一步。先把当前页夹回合法区间再加减：slideCount 变小后内部值可能停在已不存在的页上，
 * 而界面显示的是夹过的页（connect 同样夹）。
 */
function step(current: number, direction: 1 | -1, totalPages: number, loop: boolean): number {
  return clampCarouselPage(clampCarouselPage(current, totalPages) + direction, totalPages, loop)
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
  }),
  // 间隔为 0（没开自动播放）或用户要求减弱动效时不进 playing
  initialState: ({ prop }) => (startsOnItsOwn(prop) ? 'playing' : 'idle'),
  // 跟手的会话整个生命周期都在。它不按拖动状态挂卸——常驻的代价只是几个早退的
  // pointermove，换来的是不必为了「有拆卸时机」去改状态树
  effects: ['trackPointer'],
  refs: () => ({
    gesture: null,
  }),
  // autoplay 被改写（关掉、打开、换间隔）都要重挂计时器
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

      // autoplay 被改写后的重挂：同样只走"自己起播"那道判据，
      // 否则减弱动效档下宿主一改间隔就把刚才没起播的这一条给点着了
      syncAutoplay: ({ prop, send }) => {
        send(startsOnItsOwn(prop)
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
       * 跟住划在轨道上的那根手指。
       *
       * 监听挂在文档上：手划出轨道、划出窗口都要继续跟，系统收走指针也会收尾。
       * 只认第一根——轮播是单指划动，第二根落下时连接层不会把它交进来。
       */
      trackPointer: ({ refs, scope, send }) => {
        const session = createMultiPointerSession({
          doc: resolveSessionDoc(scope.getDoc().documentElement),
          onChange: (points: readonly { clientX: number }[]) => {
            const first = points[0]
            if (first)
              send({ type: 'DRAG.MOVE', position: first.clientX })
          },
          onEnd: () => send({ type: 'DRAG.END' }),
        })
        refs.set('gesture', session)
        return () => {
          session.dispose()
          refs.set('gesture', null)
        }
      },

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
