/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 导出 dismissable layer 模块的公共接口。

import type { Disposable } from '../../kernel'
import type { DismissLayerOptions, EscapeFallbackOptions } from './types'
import { registerDismissLayer, registerEscapeFallback } from './hub'

export type { DismissLayerOptions, DismissReason, EscapeFallbackOptions } from './types'

export function createDismissLayer(options: DismissLayerOptions): Disposable {
  return registerDismissLayer(options)
}

/**
 * 给显式 LayerRegistry 的空栈 Escape 注册一个后备出口。
 * 同一 lane 只执行注册顺序中最后一个当前启用的出口。
 */
export function createEscapeFallback(options: EscapeFallbackOptions): Disposable {
  return registerEscapeFallback(options)
}
