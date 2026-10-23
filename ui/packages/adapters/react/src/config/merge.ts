/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 全局配置的合并：纯函数，不碰 React，服务端组件里也能调用（不进 'use client' 模块）。
import type { XhConfig } from './types'
import { mergeXhConfig as mergeBase } from '@xihan-ui/headless'

/**
 * 本层与外层逐键合并。
 *
 * 键缺席与写为 undefined 都视为本层未声明，一律回落外层：子树只需要改文案时，
 * 不应把外层的 locale 与 portalContainer 一并清除。
 */
export function mergeXhConfig(base: XhConfig | undefined, over: XhConfig): XhConfig {
  return mergeBase(base, over)
}
