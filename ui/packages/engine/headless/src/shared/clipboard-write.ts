/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 「已复制」停留时长：剪贴板组件与 JSON 视图的复制钮共用；写剪贴板用 core/clipboard 的 writeToClipboard。

/** 复制成功后指示器默认保持的毫秒数。 */
export const CLIPBOARD_TIMEOUT = 3000

/** 停留时长归一；timeout <= 0 或非有限数返回 Infinity，表示不自动回落。 */
export function resolveClipboardTimeout(timeout: number | undefined): number {
  const ms = timeout ?? CLIPBOARD_TIMEOUT
  return Number.isFinite(ms) && ms > 0 ? ms : Number.POSITIVE_INFINITY
}
