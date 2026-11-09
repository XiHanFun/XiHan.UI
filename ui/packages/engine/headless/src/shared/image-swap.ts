/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 换图时旧图的退场（Avatar、Image）：宿主换了 src、新图还在载入时，原处留一张旧图的替身盖着；
// 新图载好（或载入失败）那一刻替身淡出、播完即移除，与新图的淡入交叉，中间不露一拍底色或回退内容。

import { markGhost } from '@xihan-ui/core'

/** 每个实例至多一张在场的旧图替身，按实例的 scope 记。 */
const swaps = new WeakMap<object, HTMLElement>()

/**
 * 换图开始：在图片节点后面放一张旧图的替身（src 取上一回载好的那一张：React 的宿主此刻可能已经换上了新 src）。
 * 图片节点不在、上一回没载好过时什么也不做
 */
export function beginImageSwap(owner: object, img: HTMLImageElement | null, previousSrc: string | null): void {
  endImageSwap(owner, true)
  if (!img || !previousSrc || !img.parentNode)
    return
  const ghost = img.cloneNode(false) as HTMLImageElement
  ghost.removeAttribute('hidden')
  ghost.removeAttribute('srcset')
  ghost.setAttribute('src', previousSrc)
  ghost.setAttribute('data-state', 'loaded')
  ghost.alt = ''
  markGhost(ghost)
  img.parentNode.insertBefore(ghost, img.nextSibling)
  swaps.set(owner, ghost)
}

/**
 * 换图结束（新图载好或载入失败）：替身转入退场态淡出，浏览器实际起播的退场动画播完即移除，没有可等的当场移除。
 * immediate 时不等，直接撤掉（又换了一张、或实例卸载）
 */
export function endImageSwap(owner: object, immediate = false): void {
  const ghost = swaps.get(owner)
  if (!ghost)
    return
  swaps.delete(owner)
  if (immediate) {
    ghost.remove()
    return
  }
  ghost.setAttribute('data-state', 'closed')
  const exits = ghost.getAnimations?.().filter(animation => 'animationName' in animation) ?? []
  if (exits.length === 0) {
    ghost.remove()
    return
  }
  void Promise.allSettled(exits.map(animation => animation.finished)).then(() => ghost.remove())
}
