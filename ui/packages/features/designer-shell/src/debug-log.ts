/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 调试日志：四款共用的记日志小工具。每次按此刻的设置判断这一路开没开（开发者模式与这一路的开关都开着才算开），
// 开着时在浏览器控制台按设计器名加前缀、折叠成一组；关着时不碰控制台、不现取详情。

import type { DesignerSettings } from './settings/model'
import { DESIGNER_SETTING_KEYS, developerModeOf } from './settings/model'

/** 调试日志的两路：分页（分页的每一步）与渲染（各渲染环节的耗时）。 */
export type DesignerDebugChannel = 'pagination' | 'render'

const CHANNEL_KEYS: Readonly<Record<DesignerDebugChannel, string>> = {
  pagination: DESIGNER_SETTING_KEYS.debugPagination,
  render: DESIGNER_SETTING_KEYS.debugRender,
}

/** 这一路调试日志此刻开没开：开发者模式与这一路的开关都写了 true 才开。 */
export function debugLogOf(settings: DesignerSettings | undefined, channel: DesignerDebugChannel): boolean {
  return developerModeOf(settings) && settings?.[CHANNEL_KEYS[channel]] === true
}

/** createDesignerDebugLogger 的选项。 */
export interface DesignerDebugLoggerOptions {
  /** 日志前缀里的设计器名，通常是元素的标签名，如 xh-print-designer。 */
  readonly name: string
  /** 此刻生效的设置；每次记日志都现取。 */
  readonly settings: () => DesignerSettings | undefined
  /** 写到哪个控制台；缺省是全局的 console。 */
  readonly console?: Pick<Console, 'groupCollapsed' | 'groupEnd' | 'log'>
  /** 取当前时刻（毫秒）；缺省 performance.now。 */
  readonly now?: () => number
}

/** 一台设计器的调试日志。各款在自己分页、渲染的地方调；详情给函数，开着时才现取。 */
export interface DesignerDebugLogger {
  /** 这一路此刻开着；标题本身要算很久时先问它。 */
  readonly enabled: (channel: DesignerDebugChannel) => boolean
  /** 记一条：开着时折叠成一组，组名是「[设计器名] 这一路 · 标题」，details 的结果写在组里。 */
  readonly log: (channel: DesignerDebugChannel, title: string, details?: () => unknown) => void
  /** 量一段同步过程：开着时记一条，组名末尾带耗时（毫秒，一位小数）；关着时只跑。返回 run 的结果。 */
  readonly measure: <T>(channel: DesignerDebugChannel, title: string, run: () => T, details?: () => unknown) => T
  /** 开始量一段过程（可以跨异步）：返回结束函数，调用时记一条带耗时的；关着时返回什么都不做的函数。 */
  readonly start: (channel: DesignerDebugChannel, title: string) => (details?: () => unknown) => void
}

function IDLE(): void {}

/** 建一台设计器的调试日志。 */
export function createDesignerDebugLogger(options: DesignerDebugLoggerOptions): DesignerDebugLogger {
  const now = options.now ?? (() => performance.now())
  const enabled = (channel: DesignerDebugChannel): boolean => debugLogOf(options.settings(), channel)
  const write = (channel: DesignerDebugChannel, title: string, duration: number | undefined, details: (() => unknown) | undefined): void => {
    const out = options.console ?? globalThis.console
    out.groupCollapsed(`[${options.name}] ${channel} · ${title}${duration === undefined ? '' : ` ${duration.toFixed(1)} ms`}`)
    if (details)
      out.log(details())
    out.groupEnd()
  }
  return {
    enabled,
    log(channel, title, details) {
      if (enabled(channel))
        write(channel, title, undefined, details)
    },
    measure(channel, title, run, details) {
      if (!enabled(channel))
        return run()
      const begin = now()
      const result = run()
      write(channel, title, now() - begin, details)
      return result
    },
    start(channel, title) {
      if (!enabled(channel))
        return IDLE
      const begin = now()
      return details => write(channel, title, now() - begin, details)
    },
  }
}
