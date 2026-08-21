import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ScrollbarApi, ScrollbarSchema } from './scrollbar.types'
import { dataAttr } from '@xihan-ui/kernel'
import { maxScrollOffset, SCROLL_MIN_THUMB_SIZE, scrollbarGeometry } from '../shared/scroll-geometry'
import { scrollbarAnatomy } from './scrollbar.anatomy'
import { SCROLLBAR_DEFAULT_TYPE, SCROLLBAR_STEP } from './scrollbar.machine'

const parts = scrollbarAnatomy.build()

/** 比例转 CSS 长度，留两位小数。 */
function pct(ratio: number): string {
  return `${Math.round(ratio * 10000) / 100}%`
}

export function connectScrollbar<T extends PropTypes>(
  service: Service<ScrollbarSchema>,
  normalize: NormalizeProps<T>,
): ScrollbarApi<T> {
  const { state, prop, send, context } = service

  const orientation = prop('orientation') ?? 'vertical'
  const type = prop('type') ?? SCROLLBAR_DEFAULT_TYPE
  const dir = prop('dir')
  const disabled = !!prop('disabled')
  const focusable = !!prop('focusable')
  const step = prop('step') ?? SCROLLBAR_STEP
  const minThumbSize = prop('minThumbSize') ?? SCROLL_MIN_THUMB_SIZE
  const stateName = state.get()
  const dragging = context.get('drag') != null
  const scrolling = context.get('scrolling')
  const hover = context.get('pointerInside')
  // 触屏上默认交给原生滚动：没有悬停，拖滑块也不如直接划内容
  const native = context.get('coarse') && !prop('forceVisible')

  // connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得读 DOM：几何全从 context 读
  const metrics = context.get('metrics')
  const geometry = scrollbarGeometry(metrics, minThumbSize)
  const max = maxScrollOffset(metrics)

  /**
   * 这一刻该不该显形。auto / always 不看状态机，运行期改 type 立刻生效；
   * 禁用恒不显形——它连指针都不接，露一条按不动的灰条只会让人反复点。
   */
  const visible = disabled || native
    ? false
    : type === 'always'
      ? true
      : type === 'auto'
        ? geometry.overflow
        : geometry.overflow && stateName !== 'hidden'

  const vertical = orientation === 'vertical'

  const scrollTo = (offset: number): void => send({ type: 'SCROLL.TO', offset })
  const scrollBy = (delta: number): void => send({ type: 'STEP', delta })

  /**
   * 滑块在主轴上的起点与长度。两条轴的键每帧都写全（用不上的写空串清掉）：
   * WC 侧 Object.assign 到 style 上不会撤掉上一帧的旧键，换轴时两轴会同时被钉死。
   * 横轴用 inset-inline-start，与机器给出的距逻辑起始缘滚动量同向。
   */
  const thumbStyle = (): Record<string, string> =>
    vertical
      ? {
          insetInlineStart: '',
          inlineSize: '',
          insetBlockStart: pct(geometry.offset),
          blockSize: pct(geometry.size),
        }
      : {
          insetBlockStart: '',
          blockSize: '',
          insetInlineStart: pct(geometry.offset),
          inlineSize: pct(geometry.size),
        }

  /**
   * 键盘只在滑块上收口，且只认本轴那两个方向键：交叉轴的方向键不拦，
   * 让它照常冒上去交给页面（滑块常常就浮在一片可滚内容之上）。
   * 横轴的左右键按排版方向解释：RTL 下起始缘在右，往回走是 ArrowRight。
   */
  const onKeyDown = (event: KeyboardEvent): void => {
    if (disabled || event.ctrlKey || event.metaKey || event.altKey)
      return
    const rtl = !vertical && dir === 'rtl'
    const back = vertical ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft'
    const forward = vertical ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight'
    const page = Math.max(metrics.viewport, step)
    const moves: Record<string, (() => void) | undefined> = {
      [back]: () => scrollBy(-step),
      [forward]: () => scrollBy(step),
      PageUp: () => scrollBy(-page),
      PageDown: () => scrollBy(page),
      Home: () => scrollTo(0),
      End: () => scrollTo(max),
    }
    const run = moves[event.key]
    if (!run)
      return
    // 只对认下的键 preventDefault：不然连滚动容器自己的键盘滚动都一起挡掉
    event.preventDefault()
    run()
  }

  return {
    orientation,
    type,
    overflow: geometry.overflow,
    visible,
    native,
    hover,
    dragging,
    scrolling,
    thumbSize: geometry.size,
    thumbOffset: geometry.offset,
    scroll: metrics.scroll,
    max,
    scrollTo,
    scrollBy,
    measure: () => send({ type: 'MEASURE' }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 作者没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': dir,
      // 不进 Tab 序时对读屏整条隐藏：滚动本身由滚动容器报，同一件事没必要报两遍
      'aria-hidden': focusable ? undefined : 'true',
      'data-orientation': orientation,
      'data-type': type,
      // 收起时留在 DOM 里，由皮肤按 data-state 淡出；不写 hidden，display:none 播不了退场
      'data-state': visible ? 'visible' : 'hidden',
      'data-hover': dataAttr(hover),
      'data-scrolling': dataAttr(scrolling),
      'data-dragging': dataAttr(dragging),
      'data-disabled': dataAttr(disabled),
      'data-native': dataAttr(native),
      'data-gutter': dataAttr(prop('gutter')),
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-size': prop('size'),
    }),

    getTrackProps: () => normalize.element({
      ...parts.track.attrs,
      'data-orientation': orientation,
      'data-disabled': dataAttr(disabled),
      'onPointerDown': (event: PointerEvent) => {
        // 只认主键：右键要弹上下文菜单，中键是自动滚动
        if (event.button !== 0 || disabled)
          return
        // 落在滑块上的那一下由滑块自己拦住，走不到这里；这里收的是轨道空白处
        event.preventDefault()
        send({ type: 'TRACK.CLICK', point: { clientX: event.clientX, clientY: event.clientY } })
      },
    }),

    getThumbProps: () => normalize.element({
      ...parts.thumb.attrs,
      // 不进 Tab 序时不报 role：一个没有名字也够不着的 scrollbar 只会让读屏多念一句
      'role': focusable ? 'scrollbar' : undefined,
      'aria-orientation': focusable ? orientation : undefined,
      'aria-label': focusable ? (prop('translations')?.thumb ?? 'Scrollbar') : undefined,
      'aria-controls': focusable ? (prop('controls') ?? context.get('scrollableId') ?? undefined) : undefined,
      'aria-valuemin': focusable ? 0 : undefined,
      'aria-valuemax': focusable ? Math.round(max) : undefined,
      'aria-valuenow': focusable ? Math.round(metrics.scroll) : undefined,
      'aria-disabled': focusable && disabled ? 'true' : undefined,
      'tabindex': focusable && !disabled ? 0 : -1,
      'data-orientation': orientation,
      'data-dragging': dataAttr(dragging),
      'data-disabled': dataAttr(disabled),
      'style': thumbStyle(),
      'onPointerDown': (event: PointerEvent) => {
        if (event.button !== 0 || disabled)
          return
        // 拦住轨道那一层的跳转：同一下按压不该既抓住滑块、又把内容跳到别处
        event.stopPropagation()
        // 挡掉文本选中与默认聚焦
        event.preventDefault()
        send({ type: 'DRAG.START', point: { clientX: event.clientX, clientY: event.clientY } })
      },
      onKeyDown,
    }),

    getCornerProps: () => normalize.element({
      ...parts.corner.attrs,
      'data-orientation': orientation,
      'data-state': visible ? 'visible' : 'hidden',
      'data-size': prop('size'),
    }),
  }
}
