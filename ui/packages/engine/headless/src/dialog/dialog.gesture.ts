/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 面板手势的几何与指针会话：拖动位移夹在视口里的边界、键盘一步走多远，以及跟手期间挂在文档上的那一场会话。
// 几何只算数，矩形由状态机量好再交进来。

import type { DialogBounds, DialogOffset, DialogPoint } from './dialog.types'
import { createPointerSession, resolveSessionDoc } from '@xihan-ui/pointer'

/** 方向键挪一步的像素。与浮动面板同一档：面板级的挪动，一步要看得出来。 */
export const DIALOG_DRAG_STEP = 10

/** Shift + 方向键挪一步的像素。 */
export const DIALOG_DRAG_LARGE_STEP = 50

/** 方向键对应的屏幕方向：物理键位，RTL 下不翻。 */
export const DIALOG_ARROW_DELTA: Readonly<Record<string, { dx: number, dy: number } | undefined>> = {
  ArrowDown: { dx: 0, dy: 1 },
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
}

/** 视口的量度。 */
export interface DialogViewport {
  width: number
  height: number
}

/** 面板此刻在视口里的矩形（已含当前位移）。 */
export interface DialogRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 位移的边界：面板四边都留在视口里。先把当前位移从矩形里减掉，得到居中时的落点，
 * 再算它往四个方向各能挪多远。
 */
export function dialogDragBounds(rect: DialogRect, offset: DialogOffset, viewport: DialogViewport): DialogBounds {
  const left = rect.left - offset.x
  const top = rect.top - offset.y
  return {
    minX: -left,
    maxX: viewport.width - (left + rect.width),
    minY: -top,
    maxY: viewport.height - (top + rect.height),
  }
}

/** 夹进边界。下界高过上界（面板比视口还大）时取下界：起始缘留在视口里，标题栏够得着。 */
export function clampToBounds(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max))
}

/**
 * 挂上这一场手势的指针会话，返回拆除句柄。按下那一刻就挂：监听要赶在第一次移动之前就位，
 * 挂在文档上而不是按下的元素上——指针拖出面板乃至视口仍要跟手；系统收走指针也会收尾，
 * 不收会让面板从此粘在指针上。
 */
export function startGesturePointer(
  node: Element | null,
  pointerId: number | undefined,
  onMove: (point: DialogPoint) => void,
  onEnd: () => void,
): { dispose: () => void } {
  return createPointerSession({
    doc: resolveSessionDoc(node),
    pointerId,
    onMove: ({ point }) => onMove({ clientX: point.clientX, clientY: point.clientY }),
    onEnd,
  })
}

/** 位移夹进边界。 */
export function clampDialogOffset(offset: DialogOffset, bounds: DialogBounds): DialogOffset {
  return {
    x: clampToBounds(offset.x, bounds.minX, bounds.maxX),
    y: clampToBounds(offset.y, bounds.minY, bounds.maxY),
  }
}
