/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 按住液态面时的黏滞形变：面朝手指鼓出一点，沿指向拉长、另一个方向压扁；拖离时越拉越长，
// 但按越界衰减趋近上限，不会无限拉。松手由弹簧带回原形（见 surface.ts）。
//
// 形变只由一根「拉扯向量」决定：从面的中心指向手指，长度经衰减后不超过面的内切半径。

import { rubberBand } from '@xihan-ui/motion'

/** 拉长到头时沿指向的伸长比例：拉扯长度等于半径时伸长 35%。 */
const STRETCH = 0.35
/** 面朝手指挪过去的比例：挪动量是拉扯长度的一半。 */
const SHIFT = 0.5

/**
 * 手指相对面中心的偏移 → 拉扯向量。
 * 长度按越界跟手的橡皮筋衰减（motion 的 rubberBand，尺寸取半径 R）收：按在面里时只鼓出一点，
 * 拖得越远增长越慢，趋近半径 R。
 */
export function pullOf(dx: number, dy: number, radius: number): { x: number, y: number } {
  const distance = Math.hypot(dx, dy)
  if (distance === 0 || radius <= 0)
    return { x: 0, y: 0 }
  const reach = rubberBand(distance, radius)
  return { x: (dx / distance) * reach, y: (dy / distance) * reach }
}

/**
 * 拉扯向量 → transform：先朝指向挪，再沿指向拉长、垂直方向压扁（体积守恒，压扁不低于 squash）。
 * 沿任意方向缩放写成「转到指向 → 缩放 → 转回来」。向量为零时返回 null（撤掉形变）。
 */
export function deformTransform(pull: { x: number, y: number }, radius: number, squash: number): string | null {
  const reach = Math.hypot(pull.x, pull.y)
  if (radius <= 0 || reach < 0.05)
    return null
  const amount = Math.min(1, reach / radius)
  const along = 1 + amount * STRETCH
  const across = Math.max(squash, 1 - amount * (1 - squash))
  const angle = Math.atan2(pull.y, pull.x)
  const round = (value: number, digits: number): number => Math.round(value * 10 ** digits) / 10 ** digits
  return `translate(${round(pull.x * SHIFT, 2)}px, ${round(pull.y * SHIFT, 2)}px) rotate(${round(angle, 4)}rad) `
    + `scale(${round(along, 4)}, ${round(across, 4)}) rotate(${round(-angle, 4)}rad)`
}
