/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 carousel 相关实现。

import { createAnatomy } from '@xihan-ui/core'

export const carouselAnatomy = createAnatomy('carousel', [
  'root',
  'viewport',
  'list',
  'item',
  'prev-trigger',
  'next-trigger',
  'autoplay-trigger',
  'indicator-group',
  'indicator',
])
