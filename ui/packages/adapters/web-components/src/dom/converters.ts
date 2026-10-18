/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 元素布尔属性的 attribute 转换器：库内元素共用这一份，经 authoring 子入口给作者自己写的元素用。

/**
 * 布尔属性的三态转换器，元素的 properties 里写 `{ converter: BOOLEAN_CONVERTER }`：
 * - 没写这个 attribute 为 undefined，交给机器与连接层的缺省值；
 * - 写 "false" 为 false；
 * - 其余写法（空串、"true" 与别的值）为 true。
 *
 * 缺省为真的开关因此写得出「关」，移除 attribute 回到缺省值。经 property 赋值不经过它。
 */
export const BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean | undefined => (value === null ? undefined : value !== 'false'),
}
