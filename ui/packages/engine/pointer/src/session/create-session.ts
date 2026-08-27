// 指针会话：一根指针从按下到抬起的那一段，监听、过滤、收尾都在这里。
import type { PointerEndReason, PointerSession, PointerSessionDetails, PointerSessionOptions } from './types'

/**
 * 跟住一根指针，直到它抬起或被系统收走。
 *
 * 监听挂在文档上而不是挂在按下的那个元素上：指针拖出元素、拖出容器、甚至拖出窗口都要继续跟手。
 * `pointercancel` 必须收——不收会让调用方永远停在"拖动中"，元素从此粘在指针上。
 *
 * 会话只回送坐标，不碰 DOM、不改样式、不决定拖多远才算数：这些都是调用方的事。
 */
export function createPointerSession(options: PointerSessionOptions): PointerSession {
  const { doc, pointerId, onMove, onEnd } = options

  if (!doc)
    return { dispose: () => {} }

  // 一场只结束一次。抬起与取消在同一拍里先后到达时，第二次不该再回送。
  let done = false

  const isSamePointer = (event: PointerEvent): boolean => pointerId == null || event.pointerId === pointerId

  const details = (event: PointerEvent): PointerSessionDetails => ({
    point: { clientX: event.clientX, clientY: event.clientY },
    pointerId: event.pointerId,
    pressure: event.pressure,
    event,
  })

  const handleMove = (event: PointerEvent): void => {
    if (done || !isSamePointer(event))
      return
    onMove(details(event))
  }

  const finish = (reason: PointerEndReason) => (event: PointerEvent): void => {
    if (done || !isSamePointer(event))
      return
    done = true
    onEnd({ ...details(event), reason })
  }

  const handleUp = finish('pointerup')
  const handleCancel = finish('pointercancel')

  doc.addEventListener('pointermove', handleMove)
  doc.addEventListener('pointerup', handleUp)
  doc.addEventListener('pointercancel', handleCancel)

  return {
    dispose: () => {
      done = true
      doc.removeEventListener('pointermove', handleMove)
      doc.removeEventListener('pointerup', handleUp)
      doc.removeEventListener('pointercancel', handleCancel)
    },
  }
}
