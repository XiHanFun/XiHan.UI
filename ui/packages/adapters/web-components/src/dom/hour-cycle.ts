/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 小时制写在 attribute 上的形态：'12' 或 '24'。

/** 只认 '12' 与 '24'，其余写法等同于没写，缺省由连接层给。 */
export const HOUR_CYCLE_CONVERTER = {
  fromAttribute: (v: string | null): 12 | 24 | undefined => (v === '12' ? 12 : v === '24' ? 24 : undefined),
}
