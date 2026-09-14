/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 date picker.projection 相关实现。

export type DatePickerIndexInput = number | string | undefined

/** 公开部件的面板下标：缺席、空串或非法值都回到调用方提供的真实父面板。 */
export function resolveDatePickerPanelIndex(input: DatePickerIndexInput, fallback: number): number {
  if (input === undefined || input === '')
    return fallback
  const parsed = Math.trunc(Number(input))
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}
