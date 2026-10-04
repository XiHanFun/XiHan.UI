/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 披露内容的挂卸判定：Collapsible、Accordion 与浮层（Dialog、Drawer）共用同一条规则，适配器只负责按它挂卸节点。

export interface DisclosureContentMountInput {
  /** 第一次展开时才挂载。 */
  lazyMount: boolean
  /** 收起动画播完后卸载。 */
  unmountOnExit: boolean
  /** 挂载之后展开过没有（含首帧即展开）。 */
  opened: boolean
  /** 适配器的退场闸门：展开中或收起动画还没播完为真。 */
  present: boolean
}

/**
 * 内容此刻该不该挂载。
 *
 * - 缺省：恒挂载，收起只隐藏。
 * - lazyMount：没展开过就不挂；展开过之后一直挂着。
 * - unmountOnExit：收起动画播完（闸门落下）就卸，展开即重新挂；收起动画播放期间仍挂着，退场才看得见。
 */
export function disclosureContentMounted(input: DisclosureContentMountInput): boolean {
  if (input.lazyMount && !input.opened)
    return false
  if (input.unmountOnExit && !input.present)
    return false
  return true
}
