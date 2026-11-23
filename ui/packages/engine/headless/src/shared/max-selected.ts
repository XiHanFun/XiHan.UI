/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 多选上限：日历、时间、颜色选择器与选择器、组合框共用一条归一规则。
//
// 上限只拦用户这一路的加选：选满后没选中的那些加不进去，已选的照旧可以去掉，去掉一个即腾出名额。
// 程序写值（setValue）与受控值原样收下，不替作者裁剪。

/** maxSelected 的生效值：非整数向下取整，小于 1 或不是有限数时不设上限（返回 null）。 */
export function resolveMaxSelected(raw: number | undefined): number | null {
  if (raw == null || !Number.isFinite(raw))
    return null
  const max = Math.floor(raw)
  return max >= 1 ? max : null
}
