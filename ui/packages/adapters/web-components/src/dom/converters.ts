/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 元素布尔属性的 attribute 转换器，全部元素共用这一份。

/**
 * 三态布尔：属性缺席为 undefined（交给机器与连接层的缺省值），显式写 "false" 为 false，其余写法（含空串）为 true。
 * 缺省为真的开关因此写得出「关」，移除属性回到缺省值。
 */
export const BOOLEAN_CONVERTER = {
  fromAttribute: (value: string | null): boolean | undefined => (value === null ? undefined : value !== 'false'),
}
