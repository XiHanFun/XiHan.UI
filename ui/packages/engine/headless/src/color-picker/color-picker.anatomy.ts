/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 color picker 相关实现。

import { createAnatomy } from '@xihan-ui/core'

/**
 * hue-slider / alpha-slider / swatch-picker 是三个挂载点，内部分别是两条颜色滑块（data-scope="color-slider"）
 * 与一台色块选择器（data-scope="color-swatch-picker"）的部件。内嵌 DOM 须保留各自的 scope：
 * 色板的方向键按 color-swatch-picker 的 item 查活 DOM，改了 scope 就查不到。
 * 挂载点同时充当各自的根节点，内嵌组件自己的 root 部件不再出现。
 */
export const colorPickerAnatomy = createAnatomy('color-picker', [
  'root',
  'label',
  'control',
  'trigger',
  'value-text',
  'swatch',
  'positioner',
  'content',
  'saturation-area',
  'area-thumb',
  'hue-slider',
  'alpha-slider',
  'channel-input',
  'eye-dropper-trigger',
  'swatch-picker',
  'hidden-input',
])
