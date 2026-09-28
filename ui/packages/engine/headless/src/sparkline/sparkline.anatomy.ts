/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import { createAnatomy } from '@xihan-ui/core'

// 根就是 `<svg>`，作者只摆它一个；里面按数据生成：摘要（`<desc>`，根的 aria-describedby 指向它）、
// 参考带、参考线、面积、折线、柱与标记点。整张图是 role="img"，里面的图形对读屏都是装饰。
export const sparklineAnatomy = createAnatomy('sparkline', [
  'root',
  'summary',
  'band',
  'reference-line',
  'area-fill',
  'line',
  'bar',
  'dot',
])
