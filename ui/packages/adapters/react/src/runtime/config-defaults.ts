/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 配置 config defaults。

import type { XhConfig } from '../config/config'
import { fillXhConfigDefaults } from '@xihan-ui/headless'
import { useXhConfig } from '../config/config'

/**
 * 把全局配置合入一份状态机 props：locale 与 size 在实例未提供时回落全局，
 * translations 按组件名分桶、仍经 withXhConfig。全部未填时原样返回。
 */
export function applyXhConfigDefaults<T extends object>(machine: string, props: T, config: XhConfig): T {
  return fillXhConfigDefaults(machine, props, config)
}

/** 取当前作用域的配置读取器。 */
export function useXhConfigDefaults(): () => XhConfig {
  const config = useXhConfig()
  return () => config
}
