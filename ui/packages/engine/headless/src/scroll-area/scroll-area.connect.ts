import type { NormalizeProps, Orientation, PropTypes } from '@xihan-ui/kernel'
import type { ScrollbarApi, ScrollbarSchema } from '../scrollbar/scrollbar.types'
import type { ScrollAreaApi, ScrollAreaAxisState, ScrollAreaProps, ScrollAreaServices } from './scroll-area.types'
import { dataAttr } from '@xihan-ui/kernel'
import { connectScrollbar } from '../scrollbar/scrollbar.connect'
import { SCROLLBAR_DEFAULT_TYPE } from '../scrollbar/scrollbar.machine'
import { scrollAreaAnatomy } from './scroll-area.anatomy'

const parts = scrollAreaAnatomy.build()

/** 哪几条轴归这块滚动区管。 */
function axisEnabled(props: Pick<ScrollAreaProps, 'orientation'>, axis: Orientation): boolean {
  const orientation = props.orientation ?? 'both'
  return orientation === 'both' || orientation === axis
}

/**
 * 某条轴那台 scrollbar 机器的 props：滚动区的 type / hideDelay / size / dir / forceVisible
 * 原样交下去；被 orientation 关掉的那条轴按禁用跑——不接指针、恒不显形。
 * 交叉口的让位（gutter）不在这里给：它取决于另一条轴此刻显不显形，由 connect 按帧算。
 */
export function scrollAreaScrollbarProps(props: ScrollAreaProps, axis: Orientation): ScrollbarSchema['props'] {
  return {
    orientation: axis,
    type: props.type,
    hideDelay: props.hideDelay,
    size: props.size,
    dir: props.dir,
    forceVisible: props.forceVisible,
    disabled: !axisEnabled(props, axis),
  }
}

export function connectScrollArea<T extends PropTypes>(
  services: ScrollAreaServices,
  props: ScrollAreaProps,
  normalize: NormalizeProps<T>,
): ScrollAreaApi<T> {
  const type = props.type ?? SCROLLBAR_DEFAULT_TYPE
  const orientation = props.orientation ?? 'both'
  const dir = props.dir

  // 两条轴各是一台完整的 scrollbar：显隐、拖动、几何全从它们读，这里不再量一遍
  const bars: Record<Orientation, ScrollbarApi<T>> = {
    vertical: connectScrollbar(services.vertical, normalize),
    horizontal: connectScrollbar(services.horizontal, normalize),
  }
  // 一条轴在场 = orientation 没关掉它，且作者真写了那条滚动条：没写的轴不占道、不让位、不算显形
  const enabled = (axis: Orientation): boolean => axisEnabled(props, axis) && services[axis].context.get('rootMounted')

  const axisState = (axis: Orientation): ScrollAreaAxisState => {
    const bar = bars[axis]
    return {
      overflow: bar.overflow,
      visible: enabled(axis) && bar.visible,
      size: bar.thumbSize,
      offset: bar.thumbOffset,
    }
  }
  const vertical = axisState('vertical')
  const horizontal = axisState('horizontal')
  const draggingAxis: Orientation | null = bars.vertical.dragging ? 'vertical' : bars.horizontal.dragging ? 'horizontal' : null
  const cornerVisible = vertical.visible && horizontal.visible

  /**
   * 这条轴要不要在布局里占一条道：只有常驻的滚动条才占，浮在内容上的不占。
   * always 恒占；auto 溢出才占；hover 与 scroll 是临时露面，一律不占。
   * 判据取 overflow 而非 visible——visible 随指针进出翻转，占道与否不跟着翻。
   * 只喂给视口上的 data-lane-*，不进 ScrollAreaAxisState、不进公开 api。
   */
  const persistent = type === 'always' || type === 'auto'
  /** 这条轴的滚动条常驻在场：在场、没交给原生滚动，且 always 恒在或确实溢出。 */
  const standing = (axis: Orientation): boolean =>
    enabled(axis) && !bars[axis].native && (type === 'always' || bars[axis].overflow)
  const lane = (axis: Orientation): boolean => persistent && standing(axis)

  /**
   * 两条都在场且都会露面时，各自在末端让出交叉口那一格；只有一条时不让，免得滑块行程平白短一截。
   * 判据同样取溢出而非 visible：hover / scroll 档两条一起淡出时，长度不能在半透明里跳一下。
   */
  const both = standing('vertical') && standing('horizontal')
  const gutter = (axis: Orientation): boolean => enabled(axis) && both

  return {
    type,
    orientation,
    vertical,
    horizontal,
    draggingAxis,
    cornerVisible,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 作者没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': dir,
      'data-orientation': orientation,
      'data-type': type,
      'data-dragging': dataAttr(draggingAxis != null),
      // 缺省档不写属性：皮肤的基础规则就是缺省档
      'data-size': props.size,
    }),

    // 滚动本身不接管：不监听按键、不拦滚轮，按键与滚轮全部走浏览器原生通路。
    // tabindex=0 让滚动区在没有可聚焦元素时也能被键盘落入
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'tabindex': 0,
      'data-orientation': orientation,
      // 皮肤据此把视口在该轴上缩掉一条道的宽度，末端内容不再被压在滚动条底下
      'data-lane-vertical': dataAttr(lane('vertical')),
      'data-lane-horizontal': dataAttr(lane('horizontal')),
      // 触屏上自绘滚动条交给了原生，皮肤据此把原生滚动条放回来
      'data-native': dataAttr(bars.vertical.native),
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'data-orientation': orientation,
    }),

    // 挂载点同时是那条 scrollbar 的根：根上的状态照 scrollbar 那份抄一遍，
    // 皮肤两边写法一致；指针进出由机器的效应挂在节点上，不经 props
    getScrollbarProps: ({ orientation: axis }) => {
      const bar = bars[axis]
      const shown = enabled(axis) && bar.visible
      return normalize.element({
        ...parts.scrollbar.attrs,
        // 自绘滚动条只是视觉替身，键盘与读屏走原生滚动，不报 role=scrollbar
        'aria-hidden': true,
        'data-orientation': axis,
        'data-type': type,
        'data-state': shown ? 'visible' : 'hidden',
        'data-scrolling': dataAttr(bar.scrolling),
        'data-dragging': dataAttr(bar.dragging),
        'data-native': dataAttr(bar.native),
        'data-gutter': dataAttr(gutter(axis)),
        'data-size': props.size,
      })
    },

    getTrackProps: ({ orientation: axis }) => bars[axis].getTrackProps(),
    getThumbProps: ({ orientation: axis }) => bars[axis].getThumbProps(),

    // 补丁住在竖条的挂载点里，随它一起淡入淡出；只有一条滚动条时右下角没有缺口要补，留着会平白盖住一块内容
    getCornerProps: () => normalize.element({
      ...bars.vertical.getCornerProps() as Record<string, unknown>,
      'data-state': cornerVisible ? 'visible' : 'hidden',
      'hidden': !both || undefined,
    }),
  }
}
