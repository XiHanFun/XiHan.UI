/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 浮层的按需块一次取齐：core 的浮层按需块（消解层、焦点域、滚动锁、视觉桥）、定位引擎、浮层里的自绘滚动条。

import { loadOverlayKit } from '@xihan-ui/core'
import { loadPositionEngine } from '@xihan-ui/position'
import { loadOverlayScrollbars } from './overlay-scrollbars-controller'

/**
 * 把浮层第一次打开时才加载的几块提前取齐。不调也行：浮层在文档上第一次有交互时就在后台取，
 * 第一次打开时还没到的话晚一拍再接上。启动时调一次，第一次打开就与静态引入一样同步。
 */
export function preloadOverlay(): Promise<void> {
  return Promise.all([loadOverlayKit(), loadPositionEngine(), loadOverlayScrollbars()]).then(() => {})
}
