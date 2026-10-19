/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 往系统剪贴板写文本：剪贴板组件、JSON 视图的复制钮与设计器零件共用这一份。

/** 写剪贴板用哪个窗口：直接给 window，或给能在写的那一刻取出 window 的对象（状态机的 scope 就是）。 */
export type ClipboardWindowSource = Window | { readonly getWin: () => Window }

/**
 * 往系统剪贴板写一段文本。
 *
 * 只走 navigator.clipboard.writeText（要求安全上下文）；接口缺席时合成一个拒绝，失败一律以 promise 拒绝表达。
 * 窗口跨 iframe / shadow 时须是宿主文档的那个；给 getWin 时在写的那一刻再取，取不到也按失败处理。
 */
export function writeToClipboard(source: ClipboardWindowSource, text: string): Promise<void> {
  try {
    const win = 'getWin' in source ? source.getWin() : source
    const clipboard = win.navigator?.clipboard
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
