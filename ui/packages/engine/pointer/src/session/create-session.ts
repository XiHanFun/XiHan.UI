/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 指针会话：一根指针从按下到抬起的那一段，监听、过滤、收尾都在这里。
import type { PointerEndReason, PointerSession, PointerSessionDetails, PointerSessionOptions, PointerVelocity } from './types'

/** 松手速度只看抬起前这么长的一段：更早的移动与松手时的手势无关。 */
export const VELOCITY_WINDOW_MS = 80

/** 抬起时刻之前窗口内的采样求速度；不足两个采样或时间差不为正时为零。 */
export function releaseVelocity(samples: ReadonlyArray<readonly [number, number, number]>, endTime: number): PointerVelocity {
  const recent = samples.filter(([t]) => t >= endTime - VELOCITY_WINDOW_MS && t <= endTime)
  if (recent.length < 2)
    return { x: 0, y: 0 }
  const [t0, x0, y0] = recent[0]!
  const [t1, x1, y1] = recent[recent.length - 1]!
  const dt = (t1 - t0) / 1000
  return dt > 0 ? { x: (x1 - x0) / dt, y: (y1 - y0) / dt } : { x: 0, y: 0 }
}

/**
 * 跟住一根指针，直到它抬起或被系统收走。
 *
 * 监听挂在文档上而不是挂在按下的那个元素上：指针拖出元素、拖出容器、甚至拖出窗口都要继续跟手。
 * `pointercancel` 必须收——不收会让调用方永远停在"拖动中"，元素从此粘在指针上。
 *
 * 会话只回送坐标与松手速度，不碰 DOM、不改样式、不决定拖多远才算数：这些都是调用方的事。
 */
export function createPointerSession(options: PointerSessionOptions): PointerSession {
  const { doc, pointerId, onMove, onEnd } = options

  if (!doc)
    return { dispose: () => {} }

  // 一场只结束一次。抬起与取消在同一拍里先后到达时，第二次不该再回送。
  let done = false
  // 移动采样：[时间戳, x, y]，只留速度窗口内用得上的那一截
  const samples: Array<[number, number, number]> = []
  const record = (event: PointerEvent): void => {
    samples.push([event.timeStamp, event.clientX, event.clientY])
    while (samples.length > 2 && event.timeStamp - samples[0]![0] > VELOCITY_WINDOW_MS)
      samples.shift()
  }

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
    record(event)
    onMove(details(event))
  }

  const finish = (reason: PointerEndReason) => (event: PointerEvent): void => {
    if (done || !isSamePointer(event))
      return
    done = true
    let velocity: PointerVelocity = { x: 0, y: 0 }
    if (reason === 'pointerup') {
      record(event)
      velocity = releaseVelocity(samples, event.timeStamp)
    }
    onEnd({ ...details(event), reason, velocity })
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
