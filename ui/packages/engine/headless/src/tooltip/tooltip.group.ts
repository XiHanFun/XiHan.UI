/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 同一页面里的提示共用一个「热」窗口：另一个提示还开着，或刚收起一个的短窗口内，
// 指向下一个时不等 openDelay、也不播进场，直接接替。横扫一排工具栏钮时提示一个个跟上，
// 而不是每一个都重新等、重新滑入。上一个开着的提示随即收起，页面上同一时刻只留一个。

interface TooltipGroupMember {
  /** 让这一个收起：新的一个接替它时调用。 */
  dismiss: () => void
}

const visible = new Map<string, TooltipGroupMember>()
/** 最近一次有提示收起的时刻（Date.now 毫秒）。 */
let lastClosedAt = Number.NEGATIVE_INFINITY

/**
 * 此刻指向 self 这一个提示，能不能直接接替：另一个提示还开着，或最近一次收起离现在不到 skipDelay 毫秒。
 * skipDelay 取打开的那一个提示自己的窗口；0 表示它不参与接替。
 */
export function isTooltipGroupWarm(self: string, skipDelay: number): boolean {
  if (skipDelay <= 0)
    return false
  for (const id of visible.keys()) {
    if (id !== self)
      return true
  }
  return Date.now() - lastClosedAt < skipDelay
}

/** self 这一个露面：别的开着的提示随即收起，同一时刻只留一个。返回撤销函数，收起时调用。 */
export function joinTooltipGroup(self: string, dismiss: () => void): () => void {
  for (const [id, member] of [...visible]) {
    if (id !== self)
      member.dismiss()
  }
  visible.set(self, { dismiss })
  return () => {
    if (visible.get(self)?.dismiss === dismiss) {
      visible.delete(self)
      lastClosedAt = Date.now()
    }
  }
}
