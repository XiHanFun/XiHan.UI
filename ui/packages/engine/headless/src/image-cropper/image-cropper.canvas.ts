/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 出图的那一步。连接层不碰它：什么时候出图、出成什么、拿去做什么，全归使用者。

import type { CropToCanvasOptions, ImageCropperRect } from './image-cropper.types'

/** 三角函数算出来的 1e-16 级尾巴：90° 的倍数要得到整整齐齐的宽高互换。 */
function snap(value: number): number {
  const rounded = Math.round(value)
  return Math.abs(value - rounded) < 1e-9 ? rounded : value
}

/**
 * 把裁切矩形那一块画到一张新画布上，尺寸与坐标都按源图的自然像素。
 * 翻转先作用、旋转后作用，与裁切器里的呈现一致：屏幕上看到什么，出来的就是什么。
 * 没有 document（服务端）、拿不到 2d 上下文、或裁切矩形是空的时候返回 null。
 */
export function cropToCanvas(
  image: CanvasImageSource,
  rect: ImageCropperRect,
  options: CropToCanvasOptions = {},
): HTMLCanvasElement | null {
  if (typeof document === 'undefined')
    return null
  if (!(rect.width > 0) || !(rect.height > 0))
    return null

  const width = Math.max(1, Math.round(options.width ?? rect.width))
  const height = Math.max(1, Math.round(options.height ?? (width * rect.height) / rect.width))
  const rotation = Number.isFinite(options.rotation) ? options.rotation! : 0
  const radians = (rotation * Math.PI) / 180
  const cos = Math.abs(snap(Math.cos(radians)))
  const sin = Math.abs(snap(Math.sin(radians)))
  // 旋转后的外接矩形：90° 的倍数恰好宽高互换，其余角度四角留空
  const canvasWidth = Math.max(1, Math.round(width * cos + height * sin))
  const canvasHeight = Math.max(1, Math.round(width * sin + height * cos))

  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return null

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = options.quality ?? 'high'
  if (options.background) {
    ctx.fillStyle = options.background
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
  // 原点挪到画布中心：先转、再翻，内容以自己的中心为轴，与呈现里 rotate() scale() 的先后一致
  ctx.translate(canvasWidth / 2, canvasHeight / 2)
  ctx.rotate(radians)
  ctx.scale(options.flip?.horizontal ? -1 : 1, options.flip?.vertical ? -1 : 1)
  if (options.shape === 'round') {
    ctx.beginPath()
    ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2)
    ctx.clip()
  }
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height, -width / 2, -height / 2, width, height)
  return canvas
}
