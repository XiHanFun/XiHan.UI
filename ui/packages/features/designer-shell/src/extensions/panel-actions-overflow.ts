/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 面板头命令条交给外框的读口：放不下的命令由外框列进面板头的「更多」菜单。

/** 一条收起来的命令。 */
export interface OverflowedCommand {
  readonly id: string
  readonly label: string
  readonly disabled: boolean
}

/** 命令条此刻收起来的命令，以及照点按钮那样执行其中一条。 */
export interface PanelActionsOverflow {
  readonly overflowed: () => readonly OverflowedCommand[]
  readonly activate: (id: string) => void
}

const LINKS = new WeakMap<Element, PanelActionsOverflow>()

/** 把命令条的读口挂在它放进外框的元素上。 */
export function linkPanelActionsOverflow(element: Element, overflow: PanelActionsOverflow): void {
  LINKS.set(element, overflow)
}

/** 外框面板头操作区里一个元素的读口；不是面板头命令条时为 undefined。 */
export function panelActionsOverflow(element: Element): PanelActionsOverflow | undefined {
  return LINKS.get(element)
}
