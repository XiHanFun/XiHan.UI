/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 aspect ratio 相关实现。

import type { AspectRatioProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectAspectRatio } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhAspectRatioProps extends ComponentPropsWithRef<'div'> {
  /** 宽高比：宽 ÷ 高，如 `16 / 9`；缺省 1。不是大于 0 的有限数时按缺省处理。 */
  ratio?: number
}

/**
 * 按 ratio（宽 ÷ 高）定出一个盒子，children 铺满它。
 *
 * 盒宽随容器，高由比例算出；内容不撑高盒子，图片与视频按 cover 裁切填满。
 * 根上不写 role：放进来的是图片、视频还是地图，语义由内容自己给。
 */
export function XhAspectRatio({ ratio, children, ...rest }: XhAspectRatioProps): ReactNode {
  // 没有状态机，全局配置（组件级缺省）在这里并进来
  const configured = withXhConfig('aspect-ratio', { ratio })
  const api = connectAspectRatio({
    ratio: configured.ratio,
  } satisfies AspectRatioProps, reactNormalize)
  return (
    <div {...mergeReactProps(api.getRootProps(), rest)}>
      {children}
    </div>
  )
}
