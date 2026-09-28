/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 区间的端号写在 attribute 上的形态：'0' 起点、'1' 终点。

/** 只认 '0' 与 '1'，其余写法等同于没写，缺省由连接层给。 */
export const END_INDEX_CONVERTER = {
  fromAttribute: (v: string | null): 0 | 1 | undefined => (v === '1' ? 1 : v === '0' ? 0 : undefined),
}
