/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 元素属性的 attribute 转换器：库内元素共用这一份，经 authoring 子入口给作者自己写的元素用。
// 口径统一：没写这个 attribute 一律为 undefined，交给机器与连接层的缺省值；经 property 赋值不经过它们。

/**
 * 布尔属性的三态转换器，元素的 properties 里写 `{ converter: BOOLEAN_CONVERTER }`：
 * - 没写这个 attribute 为 undefined，交给机器与连接层的缺省值；
 * - 写 "false" 为 false；
 * - 其余写法（空串、"true" 与别的值）为 true。
 *
 * 缺省为真的开关因此写得出「关」，移除 attribute 回到缺省值。
 */
export const BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean | undefined => (value === null ? undefined : value !== 'false'),
}

/** 字符串属性：写了什么就是什么，空串也是一个值。 */
export const STRING_CONVERTER = {
  fromAttribute: (value: string | null): string | undefined => value ?? undefined,
}

/** 数字属性：空串、空白与读不出数（NaN）的写法都当没写；Infinity 照收，如 max-visible="Infinity" 即不限。 */
export const NUMBER_CONVERTER = {
  fromAttribute: (value: string | null): number | undefined => {
    if (value === null || value.trim() === '')
      return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  },
}

/**
 * 逗号分隔的字符串列表（value="a,b"）：逐项去掉首尾空白、丢掉空项。
 * 写了就是一份列表，空串是空列表：值集合写 value="" 即受控且一项不选。
 * 条目里不能带逗号；要带逗号或换分隔符就经 property 赋数组。
 */
export const STRING_LIST_CONVERTER = {
  fromAttribute: (value: string | null): string[] | undefined =>
    value === null ? undefined : value.split(',').map(item => item.trim()).filter(item => item !== ''),
}

/** 逗号分隔的数字列表（sizes="30,70"）：逐项读数、丢掉空项与读不出数的项；一个都不剩（含空串）当没写。 */
export const NUMBER_LIST_CONVERTER = {
  fromAttribute: (value: string | null): number[] | undefined => {
    if (value === null)
      return undefined
    const items = value.split(',').filter(item => item.trim() !== '').map(Number).filter(item => !Number.isNaN(item))
    return items.length > 0 ? items : undefined
  },
}
