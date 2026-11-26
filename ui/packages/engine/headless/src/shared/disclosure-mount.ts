/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 披露内容的挂卸判定：Collapsible、Accordion 与浮层共用同一条规则，适配器只负责按它挂卸节点。
//
// 机器在 context 里记一格 opened（挂载之后展开过没有），展开态的 entry 上记下；connect 用它与适配器的退场闸门
// 判 content 里的内容此刻该不该挂。

import type { Bindable, ReactiveRuntime } from '@xihan-ui/core'

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

/** 记「挂载之后展开过没有」的那一格（context 的 opened）：初值取挂载时开着没有，首帧即展开也算展开过，lazyMount 下内容照常首屏就在。 */
export function openedCell(cell: ReactiveRuntime['cell'], open: boolean): Bindable<boolean> {
  return cell<boolean>(() => ({ defaultValue: open }))
}

/** 写在展开态的 entry（或进展开态的那条转移）上：记下展开过。记过就不再写，免得每次展开都多通知一轮。 */
export function markOpened(params: { context: { get: (key: 'opened') => boolean, set: (key: 'opened', value: boolean) => void } }): void {
  if (!params.context.get('opened'))
    params.context.set('opened', true)
}

/**
 * 浮层 connect 的 isContentMounted：`lazyMount` / `unmountOnExit` 缺省都是 false（内容常驻、收起只隐藏），作者写了才按它挂卸。
 * 返回的函数收适配器的退场闸门：展开中或收起动画还没播完为真。
 */
export function overlayContentMounted(
  prop: (key: 'lazyMount' | 'unmountOnExit') => boolean | undefined,
  opened: boolean,
): (present: boolean) => boolean {
  const lazyMount = prop('lazyMount') ?? false
  const unmountOnExit = prop('unmountOnExit') ?? false
  return present => disclosureContentMounted({ lazyMount, unmountOnExit, opened, present })
}
