import type { NormalizeProps, Orientation, PropTypes } from '@xihan-ui/core'
import type { Service } from '@xihan-ui/machine'
import type { ScrollAreaApi, ScrollAreaAxisState, ScrollAreaSchema } from './scroll-area.types'
import { dataAttr } from '@xihan-ui/core'
import { scrollAreaAnatomy } from './scroll-area.anatomy'
import { scrollbarGeometry } from './scroll-area.geometry'
import { SCROLL_AREA_DEFAULT_TYPE } from './scroll-area.machine'

const parts = scrollAreaAnatomy.build()

/** 比例转 CSS 长度，留两位小数。 */
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
   * 一条轴此刻的完整状态，尺寸全从 context 读。
   * connect 在 Vue 的 render 期求值，此时 DOM 尚不存在，不得读 DOM。
   * auto / always 不看状态机，运行期改 type 立刻生效。
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
   * 滑块在主轴上的起点与长度。两条轴的键每帧都写全（用不上的写空串清掉）：
   * WC 侧 Object.assign 到 style 上不会撤掉上一帧的旧键，换轴时两轴会同时被钉死。
   * 横轴用 inset-inline-start，与机器给出的距逻辑起始缘滚动量同向。
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
      // 作者没给就不写：写死 ltr 会切断从 RTL 祖先继承来的方向
      'dir': dir,
      'data-orientation': orientation,
      'data-type': type,
      'data-dragging': dataAttr(draggingAxis != null),
      // 这两个事件不冒泡，只在指针进出组件边界时各来一次
      'onPointerEnter': () => send({ type: 'POINTER.ENTER' }),
      'onPointerLeave': () => send({ type: 'POINTER.LEAVE' }),
    }),

    // 滚动本身不接管：不监听按键、不拦滚轮，按键与滚轮全部走浏览器原生通路。
    // tabindex=0 让滚动区在没有可聚焦元素时也能被键盘落入
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
        // 自绘滚动条只是视觉替身，键盘与读屏走原生滚动，不再报 role=scrollbar
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
          // 挡掉文本选中与默认聚焦
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
