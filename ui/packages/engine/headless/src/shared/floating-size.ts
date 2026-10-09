/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮在内容之上的单图标圆钮走 Action Control floating 档：sm 28 / md 36 / lg 44px（紧凑档各小 4px）。
// 主控制钮（翻页、回顶、浮动按钮）与组件同档；从属的钮（日志与消息流的回到底部）低一档，
// 不抢主控制钮与内容的视线。

import type { Size } from '@xihan-ui/core'

/** 从属浮钮的档：比组件的尺寸低一档，最低 sm；组件没写尺寸按 md 算，取 sm。 */
export function floatingSizeBelow(size: Size | undefined): Size {
  return size === 'lg' ? 'md' : 'sm'
}
