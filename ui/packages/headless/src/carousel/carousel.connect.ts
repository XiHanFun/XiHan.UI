import type { Dict, NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { CarouselApi, CarouselSchema } from './carousel.types'
import { navIntentFromKey } from '@xihan-ui/behavior'
import { dataAttr, isHTMLElement } from '@xihan-ui/core'
import { carouselAnatomy } from './carousel.anatomy'
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

/**
 * 方向键落在可编辑控件上时不归轮播管。
 * 幻灯片里放一个输入框是很常见的用法（搜索框、报名表），此时左右键是移动光标；
 * 轮播若照吞不误，用户既编辑不了文字，画面还会莫名其妙翻走。
 */
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
  // 水平轴 + rtl 时"下一张"在左手边，轨道也要往正方向位移；纵向轨道与文字方向无关
  const flipped = horizontal && dir === 'rtl'
  const allowMouseDrag = !!prop('allowMouseDrag')
  // 没给 spacing 就把那条内边距写成空串，也就是把内联声明摘掉，
  // 让作者写在样式表里的 padding 照常生效——恒写 calc(0px / 2) 会把它无声盖掉
  const spacing = prop('spacing')
  const gutter = spacing == null ? '' : `calc(${spacing} / 2)`

  const slideCount = normalizeSlideCount(prop('slideCount'))
  const slidesPerPage = normalizeSlidesPerPage(prop('slidesPerPage'))
  const slidesPerMove = normalizeSlidesPerMove(prop('slidesPerMove'), slidesPerPage)
  const totalPages = carouselPageCount(slideCount, slidesPerPage, slidesPerMove)
  // 显示用的页码一律夹过（这里不回绕）：宿主把 slideCount 改小之后内部值会停在一个已不存在的页上，
  // 不夹的话轨道会位移到空白处，指示点也没有一个能自称当前项
  const page = clampCarouselPage(context.get('page'), totalPages)
  const range = carouselSlideRange(page, slideCount, slidesPerPage, slidesPerMove)

  // 拖拽态从 context 现读而不是从这一帧的快照读：指针按下与下一次重渲之间还会来好几个
  // pointermove，读快照的话那几拍全被当成"没在拖"丢掉
  const isDragging = (): boolean => context.get('dragStart') != null
  const dragging = isDragging()
  const dragOffset = context.get('dragOffset')

  const autoplaying = state.matches('playing.running')
  const paused = state.matches('playing.paused')

  // 只有一页时两端都推不动：回绕也绕不出第二页来
  const canScrollPrev = totalPages > 1 && (loop || page > 0)
  const canScrollNext = totalPages > 1 && (loop || page < totalPages - 1)

  const translations = prop('translations')
  const label = {
    root: translations?.root ?? 'Carousel',
    prevTrigger: translations?.prevTrigger ?? 'Previous slide',
    nextTrigger: translations?.nextTrigger ?? 'Next slide',
    indicatorGroup: translations?.indicatorGroup ?? 'Choose slide to display',
    indicator: translations?.indicator ?? ((value: number) => `Go to slide ${value}`),
    item: translations?.item ?? ((index: number, count: number) => `${index} of ${count}`),
  }

  const isInView = (index: number): boolean => index >= range.start && index <= range.end

  /** 沿轨道轴取指针坐标：横轨看 x，纵轨看 y。 */
  const pointerPosition = (event: PointerEvent): number => (horizontal ? event.clientX : event.clientY)

  /**
   * 轨道位移。百分比那一段是页位移（一个条目占 100%/slidesPerPage，走到第 n 张即 n/slidesPerPage 个视口），
   * 像素那一段是拖拽中手指还没松开的偏移。样式层不得再碰这条轴，否则两个位移会互相覆盖。
   */
  const trackStyle = (): Dict => {
    const percent = carouselTranslatePercent(range.start, slidesPerPage, flipped)
    const fn = horizontal ? 'translateX' : 'translateY'
    const offset = dragging ? dragOffset : 0
    if (offset === 0)
      return { transform: `${fn}(${percent}%)` }
    // 符号自己归一：calc 里写 `+ -60px` 各家解析并不一致，拆成 `- 60px` 才稳
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
      // region + roledescription 是轮播的规格形态：读屏先报"轮播"再报名字，
      // 用户才知道自己进的是一块会自己变化的区域，而不是普通段落
      'role': 'region',
      'aria-roledescription': 'carousel',
      'aria-label': label.root,
      // 只有作者显式给了才写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': dir,
      'data-orientation': orientation,
      'data-dragging': dataAttr(dragging),
      'data-autoplay': dataAttr(autoplaying),
      'data-paused': dataAttr(paused),
      // 指针停在轮播上就把计时按住：用户正在看的东西不该从眼皮底下溜走。
      // pointerenter / pointerleave 不冒泡，正好只认这一条轮播这一块区域
      'onPointerEnter': () => send({ type: 'AUTOPLAY.PAUSE', src: 'pointer' }),
      'onPointerLeave': () => send({ type: 'AUTOPLAY.RESUME', src: 'pointer' }),
      'onFocusIn': () => send({ type: 'AUTOPLAY.PAUSE', src: 'focus' }),
      'onFocusOut': (event: FocusEvent) => {
        // 焦点在轮播内部换节点（从上一张按到下一张）也会派 focusout，
        // 判据取"焦点是不是真的离开了本条轮播"，否则中间会漏出一拍没人按着计时
        const next = event.relatedTarget as Node | null
        const root = event.currentTarget as Element | null
        if (next && root?.contains(next))
          return
        send({ type: 'AUTOPLAY.RESUME', src: 'focus' })
      },
      // 键盘统一在根上收口：两端按钮与指示点都在它之内，一次冒泡一个处理器
      'onKeyDown': (event: KeyboardEvent) => {
        if (isEditableTarget(event.target))
          return
        // 轴跟随 orientation：横轨里的上下键返回 null，不归导航管就绝不 preventDefault，
        // 放行给页面滚动与读屏。dir 只作用于水平轴
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
      // 自动播放跑着的时候必须闭麦：每翻一张就念一遍会把用户正在做的事一路打断。
      // 停下来（被按住、或压根没开自动播放）时才转 polite——那时的变化是用户自己按出来的，
      // 念一句"第 3 张，共 6 张"正是他要的确认
      'aria-live': autoplaying ? 'off' : 'polite',
      // 只念变化的那一张，不要把整条轨道从头念到尾
      'aria-atomic': 'false',
      'data-orientation': orientation,
      'data-dragging': dataAttr(dragging),
      // 拖拽要自己接管沿轨道那一轴的手势：不关掉浏览器的默认滚动，手指一动页面就跟着滚，
      // 指针事件随即被系统收走（pointercancel），拖到一半的轨道停在原地。
      // 另一轴留给页面，横向轮播里仍要能上下滚页面
      'style': { touchAction: allowMouseDrag ? (horizontal ? 'pan-y' : 'pan-x') : '' },
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键会顺带弹出上下文菜单，中键是自动滚动。单页时也不必拖
        if (!allowMouseDrag || event.button !== 0 || totalPages <= 1)
          return
        const el = event.currentTarget as HTMLElement
        // 捕获指针：手滑出视口边界之后的 move / up 也仍然送到这里，不必往 document 上挂监听器
        try {
          el.setPointerCapture(event.pointerId)
        }
        catch {
          // 合成事件没有真实指针轨迹，捕获不到不影响拖拽本身
        }
        send({ type: 'DRAG.START', position: pointerPosition(event) })
      },
      'onPointerMove': (event: PointerEvent) => {
        if (!isDragging())
          return
        send({ type: 'DRAG.MOVE', position: pointerPosition(event) })
      },
      'onPointerUp': () => {
        if (isDragging())
          send({ type: 'DRAG.END' })
      },
      // 系统收走指针（来电、手势冲突）与松手同样要收尾，否则拖拽态会永久卡住
      'onPointerCancel': () => {
        if (isDragging())
          send({ type: 'DRAG.END' })
      },
    }),

    getItemGroupProps: () => normalize.element({
      ...parts['item-group'].attrs,
      'data-orientation': orientation,
      // 拖拽期间样式层要关掉过渡（不关的话画面会拖着手指慢半拍），标记在这里给出
      'data-dragging': dataAttr(dragging),
      'style': trackStyle(),
    }),

    getItemProps: (item) => {
      const index = Number.isFinite(item.index) ? Math.trunc(item.index) : -1
      const inView = isInView(index)
      return normalize.element({
        ...parts.item.attrs,
        // group + roledescription="slide"：读屏在进出每一张时报"幻灯片 1 之 6"，
        // 用户才数得清自己看到第几张、还剩几张
        'role': 'group',
        'aria-roledescription': 'slide',
        'aria-label': label.item(index + 1, slideCount),
        'data-index': String(index),
        'data-orientation': orientation,
        'data-inview': dataAttr(inView),
        // 宽度由连接层给：一屏放几张只有这里知道，样式层拿不到这个数
        // （CSS 无法从属性值参与计算）。间距落成条目自身的内边距而不是轨道的 gap——
        // gap 会让"一张 = 100%/slidesPerPage"这条位移前提不再成立，越翻越偏
        'style': horizontal
          ? { flexBasis: `calc(100% / ${slidesPerPage})`, paddingInline: gutter }
          : { flexBasis: `calc(100% / ${slidesPerPage})`, paddingBlock: gutter },
      })
    },

    // 两端按钮是单体控件，用原生 disabled：不可聚焦、也进不了 Tab 序列，
    // 这正是"这条路走不通"该有的表现。集合条目才用 aria-disabled
    getPrevTriggerProps: () => normalize.button({
      ...parts['prev-trigger'].attrs,
      'type': 'button',
      'aria-label': label.prevTrigger,
      'aria-controls': ids.viewport,
      'disabled': !canScrollPrev || undefined,
      'data-disabled': dataAttr(!canScrollPrev),
      'data-orientation': orientation,
      // 不在这里再判一次 canScrollPrev：边界由机器的收口守住（首页不回绕时再往回还是首页，
      // 值没变 cell 也不会通知宿主）。多一道判断只是把同一条边界写两遍，哪一份都没法单独验
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

    getIndicatorGroupProps: () => normalize.element({
      ...parts['indicator-group'].attrs,
      // 一组功能相同、只差目标页的按钮：给它一个名字，读屏才不会把这排圆点念成一串裸按钮
      'role': 'group',
      'aria-label': label.indicatorGroup,
      'data-orientation': orientation,
    }),

    getIndicatorProps: (indicator) => {
      const index = Number.isFinite(indicator.index) ? Math.trunc(indicator.index) : -1
      // 一页都没有时谁都不是当前页："停在第 0 页"只是个兜底读数，
      // 不该让某个指示点对读屏自称当前项
      const current = totalPages > 0 && index === page
      return normalize.button({
        ...parts.indicator.attrs,
        'type': 'button',
        'aria-label': label.indicator(index + 1),
        // 显式写 false 而不是省略：这排按钮里"哪一个是当前页"是它们唯一的区别，
        // 省略会让读屏无从区分"不是当前页"与"作者忘了标"
        'aria-current': current ? 'true' : 'false',
        'data-index': String(index),
        'data-selected': dataAttr(current),
        // 不写 tabindex：指示点是一组各自独立的按钮，不是 roving tabindex 的复合控件，
        // 用户要能 Tab 到某一页再按 Enter
        'onClick': () => setPage(index),
      })
    },
  }
}
