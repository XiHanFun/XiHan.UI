/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 aspect ratio 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { AspectRatioApi, AspectRatioProps } from './aspect-ratio.types'
import { aspectRatioAnatomy } from './aspect-ratio.anatomy'

const parts = aspectRatioAnatomy.build()

/** 宽高比归一：不是大于 0 的有限数时取 1。 */
export function resolveAspectRatio(ratio: number | undefined): number {
  return ratio != null && Number.isFinite(ratio) && ratio > 0 ? ratio : 1
}

/**
 * AspectRatio 无状态机：盒子的宽高比由 props 算出，写成私有槽交给皮肤的 aspect-ratio。
 * 根上不写 role：里面放的是图片、视频还是地图，语义由内容自己给。
 */
export function connectAspectRatio<T extends PropTypes>(
  props: AspectRatioProps,
  normalize: NormalizeProps<T>,
): AspectRatioApi<T> {
  const ratio = resolveAspectRatio(props.ratio)
  return {
    ratio,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      style: { '--xh-_aspect-ratio': String(ratio) },
    }),
  }
}
