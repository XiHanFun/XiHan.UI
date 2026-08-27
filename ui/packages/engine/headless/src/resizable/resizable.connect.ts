import type { NormalizeProps, PropTypes } from '@xihan-ui/kernel'
import type { Service } from '@xihan-ui/machine'
import type { ResizeEdge } from '@xihan-ui/pointer'
import type { ResizableApi, ResizableSchema } from './resizable.types'
import { dataAttr } from '@xihan-ui/kernel'
import { resizableAnatomy } from './resizable.anatomy'
import { RESIZABLE_EDGES, RESIZABLE_LARGE_STEP, RESIZABLE_STEP } from './resizable.machine'

const parts = resizableAnatomy.build()

/** 这条边动的是哪一轴。角同时动两轴，光标按对角线走。 */
const EDGE_CURSOR: Record<ResizeEdge, string> = {
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  nw: 'nwse-resize',
  se: 'nwse-resize',
}

export function connectResizable<T extends PropTypes>(
  service: Service<ResizableSchema>,
  normalize: NormalizeProps<T>,
): ResizableApi<T> {
  const { context, prop, send, state } = service

  const size = context.get('size')
  const offset = context.get('offset')
  const activeEdge = context.get('activeEdge')
  const resizing = state.matches('resizing')
  const disabled = !!prop('disabled')
  const translations = prop('translations')

  const allowed = new Set<ResizeEdge>(prop('edges') ?? RESIZABLE_EDGES)
  const edgeEnabled = (edge: ResizeEdge): boolean => !disabled && allowed.has(edge)

  const step = prop('keyboardStep') ?? RESIZABLE_STEP
  const largeStep = prop('keyboardLargeStep') ?? RESIZABLE_LARGE_STEP

  return {
    size,
    offset,
    resizing,
    activeEdge,
    disabled,
    edgeEnabled,
    setSize: next => send({ type: 'SIZE.SET', size: next }),

    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      'role': 'group',
      'aria-label': translations?.root ?? 'Resizable',
      'data-disabled': dataAttr(disabled),
      'data-resizing': dataAttr(resizing),
      'data-edge': activeEdge ?? undefined,
      // 尺寸与位移由连接层每帧写进内联样式：那两条轴归它，皮肤不再声明。
      // 用物理 left / top 而不是逻辑属性：位移来自指针，那是屏幕坐标，
      // 换成逻辑属性会在 rtl 与竖排书写模式下与手上的方向脱钩
      'style': {
        inlineSize: `${size.width}px`,
        blockSize: `${size.height}px`,
        left: offset.x === 0 ? undefined : `${offset.x}px`,
        top: offset.y === 0 ? undefined : `${offset.y}px`,
      },
    }),

    getHandleProps: ({ edge }) => {
      const enabled = edgeEnabled(edge)
      const active = resizing && activeEdge === edge
      return normalize.element({
        ...parts.handle.attrs,
        // 可聚焦的分隔条是个 widget，读屏要一个数值——报这条边所在那一轴的尺寸
        'role': 'separator',
        // 分隔条自身的横竖与它推的那一轴垂直：推东西两边的是竖线
        'aria-orientation': edge === 'n' || edge === 's' ? 'horizontal' : 'vertical',
        'aria-label': translations?.handle?.(edge) ?? `Resize ${edge}`,
        'aria-valuenow': Math.round(edge === 'n' || edge === 's' ? size.height : size.width),
        'aria-disabled': enabled ? 'false' : 'true',
        'tabindex': enabled ? 0 : -1,
        'data-edge': edge,
        'data-disabled': dataAttr(!enabled),
        'data-resizing': dataAttr(active),
        // 不关掉默认手势，触屏上手指一划就被系统收走（pointercancel）
        'style': { cursor: enabled ? EDGE_CURSOR[edge] : undefined, touchAction: enabled ? 'none' : undefined },
        'onPointerDown': (event: PointerEvent) => {
          // 只认主键：右键要弹上下文菜单，中键是自动滚动
          if (!enabled || event.button !== 0)
            return
          // 挡掉文本选中：把手一按就会把旁边的文字刷成选中态
          event.preventDefault()
          send({ type: 'RESIZE.START', edge, point: { clientX: event.clientX, clientY: event.clientY } })
        },
        'onKeyDown': (event: KeyboardEvent) => {
          if (!enabled)
            return
          if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            send({ type: 'RESIZE.TO_BOUND', edge, bound: event.key === 'Home' ? 'min' : 'max' })
            return
          }
          const move = nudgeFromKey(event.key, event.shiftKey ? largeStep : step)
          if (!move)
            return
          event.preventDefault()
          send({ type: 'RESIZE.NUDGE', edge, dx: move.x, dy: move.y })
        },
      })
    },
  }
}

/**
 * 方向键翻成一小段屏幕位移。
 *
 * 按的是**屏幕方向**而不是「变大 / 变小」：推东边时右键是变宽、推西边时右键是变窄，
 * 与拖动那条路完全同义。这里不看文字方向——从右往左排版时由机器把逻辑边翻成物理边，
 * 两处都翻会互相抵消。
 */
function nudgeFromKey(key: string, step: number): { x: number, y: number } | null {
  switch (key) {
    case 'ArrowRight':
      return { x: step, y: 0 }
    case 'ArrowLeft':
      return { x: -step, y: 0 }
    case 'ArrowDown':
      return { x: 0, y: step }
    case 'ArrowUp':
      return { x: 0, y: -step }
    default:
      return null
  }
}
