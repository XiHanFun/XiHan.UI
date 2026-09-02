import type { Dict, NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { CarouselApi, CarouselSchema } from './carousel.types'
import { navIntentFromKey } from '@xihan-ui/behavior'
import { dataAttr, isHTMLElement } from '@xihan-ui/kernel'
import { carouselAnatomy } from './carousel.anatomy'
import { resolveAutoplayInterval } from './carousel.machine'
import {
  carouselPageCount,
  carouselPageSnapPoints,
  carouselSlideRange,
  carouselTranslatePercent,
  clampCarouselPage,
  normalizeSlideCount,
  normalizeSlidesPerMove,
  normalizeSlidesPerPage,
} from './carousel.pages'

const parts = carouselAnatomy.build()

/** 方向键落在可编辑控件上时不归轮播管。 */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!isHTMLElement(target))
    return false
  return target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]') != null
}

export function connectCarousel<T extends PropTypes>(
  service: Service<CarouselSchema>,
  normalize: NormalizeProps<T>,
): CarouselApi<T> {
  const { state, prop, send, context, scope } = service
  const ids = scope.ids('carousel', 'viewport')

  const orientation = prop('orientation') ?? 'horizontal'
  const horizontal = orientation === 'horizontal'
  const dir = prop('dir')
  const loop = prop('loop') ?? false
  // 水平轴 + rtl 时轨道往正方向位移；纵轨与文字方向无关
  const flipped = horizontal && dir === 'rtl'
  const allowPointerDrag = !!prop('allowPointerDrag')
  // spacing 为空时写空串摘掉内联声明；恒写 calc(0px / 2) 会盖掉样式表里的 padding
  const spacing = prop('spacing')
  const gutter = spacing == null ? '' : `calc(${spacing} / 2)`

  const slideCount = normalizeSlideCount(prop('slideCount'))
  const slidesPerPage = normalizeSlidesPerPage(prop('slidesPerPage'))
  const slidesPerMove = normalizeSlidesPerMove(prop('slidesPerMove'), slidesPerPage)
  const totalPages = carouselPageCount(slideCount, slidesPerPage, slidesPerMove)
  // slideCount 变小后内部 page 会越界，显示用页码一律夹过（不回绕）
  const page = clampCarouselPage(context.get('page'), totalPages)
  const range = carouselSlideRange(page, slideCount, slidesPerPage, slidesPerMove)

  // 拖拽态须从 context 现读，读这一帧快照会把重渲前的 pointermove 全当成没在拖
  const isDragging = (): boolean => context.get('dragStart') != null
  const dragging = isDragging()
  const dragOffset = context.get('dragOffset')

  const autoplaying = state.matches('playing.running')
  const paused = state.matches('playing.paused')
  const autoplayInterval = resolveAutoplayInterval(prop('autoplay'))
  // 只认「用户按停的」这一档：计时没在走，或调用方那一路按住了。
  // 悬停与焦点那两路刻意不算——开关本身就在轮播里，鼠标一移上去就会把计时按住，
  // 跟着它走的话按钮的名字与图形会在指针刚碰到时就翻面，指的还是一件没发生的事
  const autoplayStopped = state.matches('idle') || context.get('pausedBy').includes('api')

  const canScrollPrev = totalPages > 1 && (loop || page > 0)
  const canScrollNext = totalPages > 1 && (loop || page < totalPages - 1)

  const translations = prop('translations')
  const label = {
    root: translations?.root ?? 'Carousel',
    prevTrigger: translations?.prevTrigger ?? 'Previous slide',
    nextTrigger: translations?.nextTrigger ?? 'Next slide',
    autoplayTriggerPlay: translations?.autoplayTriggerPlay ?? 'Start automatic slide show',
    autoplayTriggerPause: translations?.autoplayTriggerPause ?? 'Stop automatic slide show',
    indicatorGroup: translations?.indicatorGroup ?? 'Choose slide to display',
    indicator: translations?.indicator ?? ((value: number) => `Go to slide ${value}`),
    item: translations?.item ?? ((index: number, count: number) => `${index} of ${count}`),
  }

  const isInView = (index: number): boolean => index >= range.start && index <= range.end

  const pointerPosition = (event: PointerEvent): number => (horizontal ? event.clientX : event.clientY)

  /** 轨道位移：百分比为页位移，像素为拖拽偏移。样式层不得再写这条 transform 轴。 */
  const trackStyle = (): Dict => {
    const percent = carouselTranslatePercent(range.start, slidesPerPage, flipped)
    const fn = horizontal ? 'translateX' : 'translateY'
    const offset = dragging ? dragOffset : 0
    if (offset === 0)
      return { transform: `${fn}(${percent}%)` }
    // calc 里 `+ -60px` 各家解析不一致，符号拆成 `- 60px`
    const sign = offset < 0 ? '-' : '+'
    return { transform: `${fn}(calc(${percent}% ${sign} ${Math.abs(offset)}px))` }
  }

  const setPage = (next: number): void => {
    send({ type: 'PAGE.SET', page: next })
  }

  return {
    page,
    totalPages,
    slideCount,
    slidesPerPage,
    slidesPerMove,
    orientation,
    slideRange: range,
    pageSnapPoints: carouselPageSnapPoints(slideCount, slidesPerPage, slidesPerMove),
    canScrollPrev,
    canScrollNext,
    autoplaying,
    paused,
    autoplayStopped,
    dragging,
    isInView,
    setPage,
    goToPrev: () => send({ type: 'PAGE.PREV' }),
    goToNext: () => send({ type: 'PAGE.NEXT' }),
    play: () => send({ type: 'AUTOPLAY.START' }),
    pause: () => send({ type: 'AUTOPLAY.PAUSE', src: 'api' }),
    resume: () => send({ type: 'AUTOPLAY.RESUME', src: 'api' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'region',
      'aria-roledescription': 'carousel',
      'aria-label': label.root,
      // 只在作者显式给了才写，写死 ltr 会切断从 RTL 祖先继承的方向
      'dir': dir,
      'data-orientation': orientation,
      'data-dragging': dataAttr(dragging),
      'data-autoplay': dataAttr(autoplaying),
      'data-paused': dataAttr(paused),
      // pointerenter / pointerleave 不冒泡，只认这一条轮播
      'onPointerEnter': () => send({ type: 'AUTOPLAY.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'AUTOPLAY.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'AUTOPLAY.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 内部换焦点也会派 focusout，需判断焦点是否真的离开本条轮播
        const next = event.relatedTarget as Node | null
        const root = event.currentTarget as Element | null
        if (next && root?.contains(next))
          return
        send({ type: 'AUTOPLAY.RESUME', src: 'focus' })
      },
      'onKeyDown': (event: KeyboardEvent) => {
        if (isEditableTarget(event.target))
          return
        // 不归导航管的键绝不 preventDefault，放行给页面滚动；dir 只作用于水平轴
        const intent = navIntentFromKey(event, { axis: orientation, dir })
        if (!intent)
          return
        event.preventDefault()
        if (intent === 'first') {
          setPage(0)
          return
        }
        if (intent === 'last') {
          setPage(Math.max(0, totalPages - 1))
          return
        }
        send({ type: intent === 'next' ? 'PAGE.NEXT' : 'PAGE.PREV' })
      },
    }),

    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'id': ids.viewport,
      // 自动播放时置 off，否则每翻一张都会打断读屏
      'aria-live': autoplaying ? 'off' : 'polite',
      'aria-atomic': 'false',
      'data-orientation': orientation,
      'data-dragging': dataAttr(dragging),
      // 不关掉沿轨道那一轴的默认滚动，指针会被 pointercancel 收走；另一轴留给页面滚动
      'style': { touchAction: allowPointerDrag ? (horizontal ? 'pan-y' : 'pan-x') : '' },
      /**
       * 手指落在轨道上。这里只报落点，跟手与收尾都归会话——
       * 它挂在文档上，手划出视口仍跟得住，不必再捕获指针。
       * 只交第一根进去：轮播是单指划动，已经在划的时候第二根不算数。
       */
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键弹上下文菜单、中键是自动滚动
        if (!allowPointerDrag || event.button !== 0 || totalPages <= 1)
          return
        const session = service.refs.get('gesture')
        if (!session || session.points().length > 0)
          return
        session.add({ pointerId: event.pointerId, clientX: pointerPosition(event), clientY: 0 })
        send({ type: 'DRAG.START', position: pointerPosition(event) })
      },
    }),

    getItemGroupProps: () => normalize.element({
      ...parts['item-group'].attrs,
      'data-orientation': orientation,
      // 供样式层在拖拽期间关掉过渡
      'data-dragging': dataAttr(dragging),
      'style': trackStyle(),
    }),

    getItemProps: (item) => {
      const index = Number.isFinite(item.index) ? Math.trunc(item.index) : -1
      const inView = isInView(index)
      return normalize.element({
        ...parts.item.attrs,
        'role': 'group',
        'aria-roledescription': 'slide',
        'aria-label': label.item(index + 1, slideCount),
        'data-index': String(index),
        'data-orientation': orientation,
        'data-inview': dataAttr(inView),
        // 间距落成条目内边距而非轨道 gap，gap 会破坏「一张 = 100%/slidesPerPage」的位移前提
        'style': horizontal
          ? { flexBasis: `calc(100% / ${slidesPerPage})`, paddingInline: gutter }
          : { flexBasis: `calc(100% / ${slidesPerPage})`, paddingBlock: gutter },
      })
    },

    // 单体控件用原生 disabled（集合条目才用 aria-disabled）
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'aria-label': label.prevTrigger,
      'aria-controls': ids.viewport,
      'disabled': !canScrollPrev || undefined,
      'data-disabled': dataAttr(!canScrollPrev),
      'data-orientation': orientation,
      // 边界由机器守住，这里不再判一次 canScrollPrev
      'onClick': () => send({ type: 'PAGE.PREV' }),
    }),

    getNextTriggerProps: () => normalize.button({
      ...parts['next-trigger'].attrs,
      'type': 'button',
      'aria-label': label.nextTrigger,
      'aria-controls': ids.viewport,
      'disabled': !canScrollNext || undefined,
      'data-disabled': dataAttr(!canScrollNext),
      'data-orientation': orientation,
      'onClick': () => send({ type: 'PAGE.NEXT' }),
    }),

    /**
     * 播放 / 暂停开关。自动翻页是一段用户没要求就一直动下去的画面，
     * 必须有一处能把它停住，且停住之后不会被任何别的交互重新点着。
     *
     * 名字随动作走，不再加 aria-pressed：名字与按压态两个通道各说各的，
     * 会念成"停止自动播放 已按下"，听的人分不清此刻到底在放还是停着。
     */
    getAutoplayTriggerProps: () => normalize.button({
      ...parts['autoplay-trigger'].attrs,
      'type': 'button',
      'aria-label': autoplayStopped ? label.autoplayTriggerPlay : label.autoplayTriggerPause,
      'aria-controls': ids.viewport,
      // 压根没配自动播放时它没有可开关的东西，走原生 disabled（单体控件）
      'disabled': autoplayInterval <= 0 || undefined,
      'data-disabled': dataAttr(autoplayInterval <= 0),
      'data-state': autoplayStopped ? 'paused' : 'running',
      // 三条出口各对一种停法：从没起播过要 START，被自己按住的要 RESUME，
      // 正在走的才是 PAUSE。只发 PAUSE / RESUME 的话，reduce 档下那条停在 idle 的
      // 轮播永远也播不起来
      'onClick': () => {
        if (state.matches('idle'))
          send({ type: 'AUTOPLAY.START' })
        else if (context.get('pausedBy').includes('api'))
          send({ type: 'AUTOPLAY.RESUME', src: 'api' })
        else
          send({ type: 'AUTOPLAY.PAUSE', src: 'api' })
      },
    }),

    getIndicatorGroupProps: () => normalize.element({
      ...parts['indicator-group'].attrs,
      'role': 'group',
      'aria-label': label.indicatorGroup,
      'data-orientation': orientation,
    }),

    getIndicatorProps: (indicator) => {
      const index = Number.isFinite(indicator.index) ? Math.trunc(indicator.index) : -1
      // totalPages 为 0 时没有当前页
      const current = totalPages > 0 && index === page
      return normalize.button({
        ...parts.indicator.attrs,
        'type': 'button',
        'aria-label': label.indicator(index + 1),
        // 非当前页也显式写 'false'，不省略
        'aria-current': current ? 'true' : 'false',
        'data-index': String(index),
        'data-current': dataAttr(current),
        // 指示点各占一个 Tab 位，不做 roving tabindex
        'onClick': () => setPage(index),
      })
    },
  }
}
