/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color swatch 相关实现。

import type { NormalizeProps, PropTypes } from '@xihan-ui/core'
import type { ColorSwatchApi, ColorSwatchProps } from './color-swatch.types'
import { dataAttr } from '@xihan-ui/core'
import { colorCss, colorParse, colorToRgba } from '../shared/color'
import { colorSwatchAnatomy } from './color-swatch.anatomy'

const parts = colorSwatchAnatomy.build()

// 色块无状态机：画什么颜色、怎么念，都是由 props 直接算出来的。
export function connectColorSwatch<T extends PropTypes>(
  props: ColorSwatchProps,
  normalize: NormalizeProps<T>,
): ColorSwatchApi<T> {
  const value = props.value ?? ''
  const parsed = colorParse(value)
  const valid = parsed !== null
  const rgba = parsed ?? colorToRgba(value)
  // 解析不出就不画颜色层：留着棋盘格，看得出「这里没有一个能画的颜色」
  const css = valid ? colorCss(rgba) : ''
  const name = props.label ?? (value || undefined)

  return {
    value,
    valid,
    rgba,
    css,
    getRootProps: () => normalize.element({
      ...parts.root.attrs,
      // 有名字才是一张图；既没 label 又没值的色块是纯装饰
      'role': name ? 'img' : undefined,
      'aria-label': name,
      'aria-hidden': name ? undefined : true,
      'data-value': value || undefined,
      'data-size': props.size,
      'data-invalid': dataAttr(value !== '' && !valid),
      // 色块面家族：棋盘格底、描边与尺寸档由家族配方画，这里只投影角色、尺寸与颜色
      'data-xh-swatch': '',
      'data-xh-swatch-size': props.size,
      // 颜色经私有槽写进去，家族把它铺在棋盘格上面；写空串撤销声明而不是不写键：
      // WC 侧 Object.assign 不会撤掉上一帧旧值
      'style': { '--xh-_swatch-color': css },
    }),
  }
}
