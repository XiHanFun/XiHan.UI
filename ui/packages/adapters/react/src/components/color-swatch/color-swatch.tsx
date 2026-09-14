/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch 相关实现。

import type { Size } from '@xihan-ui/core'
import type { ColorSwatchProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectColorSwatch } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'

export interface XhColorSwatchProps extends ComponentPropsWithRef<'span'> {
  /** 要展示的颜色串：#rgb / #rrggbb(aa) / rgb() / hsl()，不认颜色关键字。 */
  value?: string
  size?: Size
  /** 读屏怎么念这块颜色，例如「品牌红」；不给就念颜色串。 */
  label?: string
}

/**
 * 颜色色块：把一个颜色画成一小块给人看，不接交互。
 *
 * 只有 root 一个部件，颜色经家族配方铺在棋盘格上；要挑颜色请用 XhColorSwatchPicker。
 */
export function XhColorSwatch({ value, size, label, ...rest }: XhColorSwatchProps): ReactNode {
  const configured = withXhConfig('color-swatch', { value, size, label } as ColorSwatchProps)
  const api = connectColorSwatch(configured, reactNormalize)
  return <span {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}
