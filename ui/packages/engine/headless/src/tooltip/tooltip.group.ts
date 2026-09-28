/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 一组提示共用一个「热」窗口：另一个提示还开着，或刚收起一个的短窗口内，
// 指向下一个时不等 openDelay、也不播进场，直接接替。横扫一排工具栏钮时提示一个个跟上，
// 而不是每一个都重新等、重新滑入。上一个开着的提示随即收起，同一组里同一时刻只留一个。
//
// 没放进 Provider 的提示同属页面级的那一组；Provider 各自建一组，组内另给延时的缺省值。

/** 组内提示没写这几项时取的缺省值；没给的项再回落到提示自己的内建缺省。 */
export interface TooltipGroupOptions {
  /** 悬停进入到展开的等待毫秒。 */
  openDelay?: number
  /** 悬停移出到收起的等待毫秒。 */
  closeDelay?: number
  /** 跳过等待的窗口毫秒；0 或负数表示组内的提示不接替。 */
  skipDelayDuration?: number
}

/** 一组提示：共用接替窗口、同一时刻只开一个，并给组内提示下发延时的缺省值。 */
export interface TooltipGroup {
  /** 组内缺省值，每次现读：Provider 上的值改了，下一次开合就按新值走。 */
  readonly defaults: () => TooltipGroupOptions
  /**
   * 此刻指向 self 这一个提示，能不能直接接替：组里另一个提示还开着，或最近一次收起离现在不到 skipDelay 毫秒。
   * skipDelay 取打开的那一个提示自己的窗口；0 表示它不参与接替。
   */
  readonly isWarm: (self: string, skipDelay: number) => boolean
  /** self 这一个露面：组里别的开着的提示随即收起。返回撤销函数，收起时调用。 */
  readonly join: (self: string, dismiss: () => void) => () => void
}

interface TooltipGroupMember {
  /** 让这一个收起：新的一个接替它时调用。 */
  dismiss: () => void
}

const NO_DEFAULTS: TooltipGroupOptions = {}

/** 建一组提示。defaults 每次现读，Provider 把自己的 props 包成函数交进来。 */
export function createTooltipGroup(defaults: () => TooltipGroupOptions = () => NO_DEFAULTS): TooltipGroup {
  const visible = new Map<string, TooltipGroupMember>()
  /** 最近一次有提示收起的时刻（Date.now 毫秒）。 */
  let lastClosedAt = Number.NEGATIVE_INFINITY

  return {
    defaults,
    isWarm(self, skipDelay) {
      if (skipDelay <= 0)
        return false
      for (const id of visible.keys()) {
        if (id !== self)
          return true
      }
      return Date.now() - lastClosedAt < skipDelay
    },
    join(self, dismiss) {
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
    },
  }
}

/** 页面级的那一组：没放进 Provider 的提示都在这里。 */
export const pageTooltipGroup: TooltipGroup = createTooltipGroup()
