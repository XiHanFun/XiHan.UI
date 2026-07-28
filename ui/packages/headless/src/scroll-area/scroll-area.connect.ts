import type { NormalizeProps, Orientation, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ScrollAreaApi, ScrollAreaAxisState, ScrollAreaSchema } from './scroll-area.types'
import { dataAttr } from '@xihan-ui/core'
import { scrollAreaAnatomy } from './scroll-area.anatomy'
import { scrollbarGeometry } from './scroll-area.geometry'
import { SCROLL_AREA_DEFAULT_TYPE } from './scroll-area.machine'

const parts = scrollAreaAnatomy.build()

/**
 * 比例转 CSS 长度。留两位小数：滚动量是像素级连续变化的，
 * 不截尾巴会拼出 33.333333333333336% 这种串，两个适配器的内联样式也会对不上。
 */
function pct(ratio: number): string {
  return `${Math.round(ratio * 10000) / 100}%`
}

export function connectScrollArea<T extends PropTypes>(
  service: Service<ScrollAreaSchema>,
  normalize: NormalizeProps<T>,
): ScrollAreaApi<T> {
  const { state, prop, send, context } = service

  const type = prop('type') ?? SCROLL_AREA_DEFAULT_TYPE
  const orientation = prop('orientation') ?? 'both'
  const dir = prop('dir')
  const stateName = state.get()
  const drag = context.get('drag')
  const draggingAxis = drag?.axis ?? null

  const axisEnabled = (axis: Orientation): boolean => orientation === 'both' || orientation === axis

  /**
   * 一条轴此刻的完整状态。尺寸全从 context 读——量尺子那件事发生在机器的效应里，
   * 这里保持纯函数：Vue 在 render 期求值（DOM 还不存在），WC 在 updated 之后求值，
   * 连接期读 DOM 会让两个适配器的首帧对不上。
   *
   * auto / always 刻意不看状态机：这样运行期把 type 从 always 改成 hover 立刻生效，
   * 不必再拿影子事件把状态拨回去。
   */
  const axisState = (axis: Orientation): ScrollAreaAxisState => {
    const geometry = scrollbarGeometry(context.get(axis))
    const shown = type === 'always'
      ? true
      : type === 'auto'
        ? geometry.overflow
        : geometry.overflow && stateName !== 'hidden'
    return {
      overflow: geometry.overflow,
      visible: axisEnabled(axis) && shown,
      size: geometry.size,
      offset: geometry.offset,
    }
  }

  const vertical = axisState('vertical')
  const horizontal = axisState('horizontal')
  const cornerVisible = vertical.visible && horizontal.visible

  const stateOf = (axis: Orientation): ScrollAreaAxisState => (axis === 'vertical' ? vertical : horizontal)

  /**
   * 滑块在主轴上的起点与长度。两条轴的键每帧都写全（用不上的那条写空串清掉）：
   * WC 侧是 Object.assign 到 style 上，只写新键不会撤掉上一帧的旧键，
   * 换轴时会同时留着 blockSize 与 inlineSize，滑块就此卡在一个两轴都被钉死的尺寸上。
   *
   * 横轴用 inset-inline-start 而不是 left：RTL 下逻辑起始缘就是右缘，
   * 而机器给出的滚动量本来就是"距逻辑起始缘"的，两者天然同向。
   */
  const thumbStyle = (axis: Orientation, axisView: ScrollAreaAxisState): Record<string, string> =>
    axis === 'vertical'
      ? {
          insetInlineStart: '',
          inlineSize: '',
          insetBlockStart: pct(axisView.offset),
          blockSize: pct(axisView.size),
        }
      : {
          insetBlockStart: '',
          blockSize: '',
          insetInlineStart: pct(axisView.offset),
          inlineSize: pct(axisView.size),
        }

  return {
    type,
    orientation,
    vertical,
    horizontal,
    draggingAxis,
    cornerVisible,

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 作者没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向，
      // 而滑块用的全是逻辑属性，方向一断整条横轴就反了
      'dir': dir,
      'data-orientation': orientation,
      'data-type': type,
      'data-dragging': dataAttr(draggingAxis != null),
      // 这两个事件不冒泡，只在指针真的进出组件边界时各来一次，天然合适做 hover 的判据
      'onPointerEnter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerLeave': () => send({ type: 'POINTER.LEAVE' }),
    }),

    // 滚动本身一概不接管：不监听任何按键、不拦滚轮，PageUp/PageDown、方向键、
    // Home/End、滚轮全部走浏览器原生通路。组件做的只是把原生滚动条藏起来另画一套。
    // tabindex=0 是唯一动过的地方：滚动区里若没有可聚焦元素，键盘用户根本落不进来，
    // 上面那些键也就无从按起
    getViewportProps: () => normalize.element({
      ...parts.viewport.attrs,
      'tabindex': 0,
      'data-orientation': orientation,
    }),

    getContentProps: () => normalize.element({
      ...parts.content.attrs,
      'data-orientation': orientation,
    }),

    getScrollbarProps: (bar) => {
      const axis = bar.orientation
      const axisView = stateOf(axis)
      return normalize.element({
        ...parts.scrollbar.attrs,
        // 自绘滚动条只是原生滚动的视觉替身：键盘与读屏走的是原生滚动那条路，
        // 再报一个 role=scrollbar 等于把同一件事说两遍，还会多出一个到不了的控件
        'aria-hidden': 'true',
        'data-orientation': axis,
        'data-state': axisView.visible ? 'visible' : 'hidden',
        'data-dragging': dataAttr(draggingAxis === axis),
        // 收起时留在 DOM 里只隐藏，不卸载作者节点
        'hidden': !axisView.visible || undefined,
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (event.button !== 0)
            return
          // 落在滑块上的那一下由滑块自己拦住，走不到这里；这里收的是轨道空白处
          event.preventDefault()
          send({
            type: 'TRACK.CLICK',
            axis,
            point: { clientX: event.clientX, clientY: event.clientY },
          })
        },
      })
    },

    getThumbProps: (bar) => {
      const axis = bar.orientation
      const axisView = stateOf(axis)
      return normalize.element({
        ...parts.thumb.attrs,
        'data-orientation': axis,
        'data-state': axisView.visible ? 'visible' : 'hidden',
        'data-dragging': dataAttr(draggingAxis === axis),
        'style': thumbStyle(axis, axisView),
        'onPointerDown': (event: PointerEvent) => {
          if (event.button !== 0)
            return
          // 拦住轨道那一层的跳转：同一下按压不该既抓住滑块、又把视口跳到别处
          event.stopPropagation()
          // 挡掉文本选中与默认聚焦：拖动时选中页面文字会让滑块"粘"住
          event.preventDefault()
          send({
            type: 'DRAG.START',
            axis,
            point: { clientX: event.clientX, clientY: event.clientY },
          })
        },
      })
    },

    getCornerProps: () => normalize.element({
      ...parts.corner.attrs,
      'aria-hidden': 'true',
      'data-state': cornerVisible ? 'visible' : 'hidden',
      // 只有一条滚动条时右下角没有缺口要补，留着会平白盖住一块内容
      'hidden': !cornerVisible || undefined,
    }),
  }
}
