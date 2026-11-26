/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 退场闸门在 Light DOM 下的接线零件。闸门本身是 core 的 createExitGate：
// 元素无权增删作者的节点，被 presence 拉长的不是「节点存在的时间」而是「可见的时间」，
// 收起从跟着 open 走，改成跟着闸门的 visible 走。

/**
 * 摘掉 connect 给内容区的 hidden：它跟着开合走，带退场的内容区要等闸门定案才落，
 * 否则宿主的 [hidden]{display:none!important} 会让退场一帧都播不出来。
 */
export function withoutHidden<T extends object>(props: T): Omit<T, 'hidden'> {
  const { hidden: _hidden, ...rest } = props as T & { hidden?: unknown }
  return rest
}
