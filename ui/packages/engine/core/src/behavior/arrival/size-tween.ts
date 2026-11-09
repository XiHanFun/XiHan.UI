/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 块尺寸换档的补间：一段文字铺开与收回这类「同一个盒子换了一副排法、高度跟着变」的过渡。
//
// 状态改之前先量下盒子此刻的高度，宿主提交新排法之后再量一次，从旧高度补到新高度，overflow 整段裁着。
// 中途反向时从此刻的高度接着走。时长按方向取 expand / collapse、曲线取 disclosure，都从元素现读；减弱动效下直接到位。

import { animate, motionEasings, readMotion } from '@xihan-ui/motion'

/**
 * 边框盒的块尺寸，不取整：offsetHeight 取整到像素，补到它那一刻会差出半像素一跳。
 * 祖先带缩放（浮层进场途中）时矩形量的是缩放后的尺寸，退回排布值
 */
export function heightOf(el: HTMLElement): number {
  const rect = el.getBoundingClientRect().height
  const layout = el.offsetHeight
  return Math.abs(rect - layout) < 1 ? rect : layout
}

/** 在播的那一段：再换一次档时先撤掉它，量到的才是新排法的本来高度。 */
const tweens = new WeakMap<HTMLElement, { cancel: () => void }>()

/**
 * 记下盒子此刻的块尺寸，返回开始补间的函数：宿主提交新排法之后调用。
 *
 * hold 是整段保持的离散样式：收回时新排法会当场把多出来的行裁掉（行数夹紧、单行省略），
 * 先把它推迟到补间播完——补间里仍按铺开的排法摆，盒子收到新高度那一刻才换回来
 */
export function tweenBlockSize(el: HTMLElement): (hold?: Keyframe) => void {
  const from = heightOf(el)
  return (hold = {}) => {
    tweens.get(el)?.cancel()
    tweens.delete(el)
    const to = heightOf(el)
    if (Math.abs(to - from) < 0.5)
      return
    const win = el.ownerDocument.defaultView
    const easing = win?.getComputedStyle(el).getPropertyValue('--xh-motion-ease-disclosure').trim() || motionEasings.disclosure
    const frame = (height: number): Keyframe => ({ ...hold, blockSize: `${height}px`, overflow: 'clip', boxSizing: 'border-box' })
    const handle = animate(el, [frame(from), frame(to)], {
      duration: readMotion(el).duration(to > from ? 'expand' : 'collapse'),
      easing,
    })
    tweens.set(el, handle)
    void handle.finished.then(() => {
      if (tweens.get(el) === handle)
        tweens.delete(el)
    })
  }
}
