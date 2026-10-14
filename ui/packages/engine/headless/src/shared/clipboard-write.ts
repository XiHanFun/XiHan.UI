/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 往系统剪贴板写文本与「已复制」停留时长：剪贴板组件与 JSON 视图的复制钮共用。

import type { Scope } from '@xihan-ui/core'

/** 复制成功后指示器默认保持的毫秒数。 */
export const CLIPBOARD_TIMEOUT = 3000

/** 停留时长归一；timeout <= 0 或非有限数返回 Infinity，表示不自动回落。 */
export function resolveClipboardTimeout(timeout: number | undefined): number {
  const ms = timeout ?? CLIPBOARD_TIMEOUT
  return Number.isFinite(ms) && ms > 0 ? ms : Number.POSITIVE_INFINITY
}

/**
 * 往系统剪贴板写一段文本。
 *
 * 只走 navigator.clipboard.writeText（要求安全上下文）；接口缺席时合成一个拒绝，
 * 失败一律以 promise 拒绝表达。全局对象经 scope 取，跨 iframe / shadow 时须问宿主文档的 window。
 */
export function writeToClipboard(scope: Scope, text: string): Promise<void> {
  try {
    const clipboard = scope.getWin().navigator?.clipboard
    if (typeof clipboard?.writeText !== 'function')
      return Promise.reject(new Error('[xh] 当前环境不提供 navigator.clipboard.writeText（需要安全上下文）'))
    // 保留 this：拆出 writeText 再裸调会在部分实现上抛 Illegal invocation
    return Promise.resolve(clipboard.writeText(text))
  }
  catch (error) {
    // 无 document 的纯逻辑环境里 getWin 会抛；个别实现的 writeText 也会同步抛
    return Promise.reject(error)
  }
}
