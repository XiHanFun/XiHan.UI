// 多指会话：同时跟住落在同一块区域上的几根指针，任意一根动都回送当前全部触点。
import type { PinchPoint } from './pinch'

export interface MultiPointerSessionOptions {
  /** 会话跟随的文档。给 null（无 DOM 的纯逻辑测试）时会话退化成空操作。 */
  doc: Document | null
  /**
   * 触点变了。`points` 按落下的先后排，同一根指针的位置就地更新。
   * 抬起一根手指也会回送一次——少了那根之后的样子。
   */
  onChange: (points: readonly TrackedPoint[]) => void
  /** 最后一根手指离开。 */
  onEnd: () => void
}

export interface TrackedPoint extends PinchPoint {
  pointerId: number
}

export interface MultiPointerSession {
  /** 记下一根新按下的指针。落点由调用方在 pointerdown 里交进来。 */
  add: (point: TrackedPoint) => void
  /** 当前跟着的触点，按落下的先后。 */
  points: () => readonly TrackedPoint[]
  dispose: () => void
}

/**
 * 跟住多根指针。
 *
 * 与单指会话一样把监听挂在文档上：手指划出元素、划出容器都要继续跟。
 * 与它不同的是**按下不由这里接管**——哪几根手指算数由调用方决定（比如只认落在
 * 图片上的那些），调用方在自己的 pointerdown 里调 `add` 把它们交进来。
 */
export function createMultiPointerSession(options: MultiPointerSessionOptions): MultiPointerSession {
  const { doc, onChange, onEnd } = options
  const points: TrackedPoint[] = []

  if (!doc) {
    return {
      add: point => void points.push(point),
      points: () => points,
      dispose: () => void points.splice(0),
    }
  }

  let done = false

  const indexOf = (pointerId: number): number => points.findIndex(p => p.pointerId === pointerId)

  const handleMove = (event: PointerEvent): void => {
    if (done)
      return
    const at = indexOf(event.pointerId)
    if (at < 0)
      return
    points[at] = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY }
    onChange([...points])
  }

  const handleUp = (event: PointerEvent): void => {
    if (done)
      return
    const at = indexOf(event.pointerId)
    if (at < 0)
      return
    points.splice(at, 1)
    // 少了一根之后先回送一次：从双指退回单指时，调用方要拿这一下重新拍起始快照，
    // 否则剩下那根手指会带着上一段的缩放基准继续走，图会跳一下
    onChange([...points])
    if (points.length === 0) {
      done = true
      onEnd()
    }
  }

  doc.addEventListener('pointermove', handleMove)
  doc.addEventListener('pointerup', handleUp)
  doc.addEventListener('pointercancel', handleUp)

  return {
    add: (point) => {
      if (done)
        return
      const at = indexOf(point.pointerId)
      if (at < 0)
        points.push(point)
      else
        points[at] = point
    },
    points: () => [...points],
    dispose: () => {
      done = true
      points.splice(0)
      doc.removeEventListener('pointermove', handleMove)
      doc.removeEventListener('pointerup', handleUp)
      doc.removeEventListener('pointercancel', handleUp)
    },
  }
}
