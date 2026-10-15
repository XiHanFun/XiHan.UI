/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

/** 是否为空白：制表、换行、回车、垂直制表、换页、空格、不换行空格、全角空格与 BOM。 */
export function isWhitespace(code: number): boolean {
  return (code >= 0x09 && code <= 0x0D) || code === 0x20 || code === 0xA0 || code === 0x3000 || code === 0xFEFF
}

/** 是否为 ASCII 数字。 */
export function isDigit(code: number): boolean {
  return code >= 0x30 && code <= 0x39
}

function isExtendedNameChar(code: number): boolean {
  if (code < 0xC0)
    return false
  return code !== 0xD7
    && code !== 0xF7
    && !(code >= 0x2000 && code <= 0x206F)
    && !(code >= 0x3000 && code <= 0x303F)
    && !(code >= 0xD800 && code <= 0xDFFF)
    && !(code >= 0xFE30 && code <= 0xFE4F)
    && code !== 0xFEFF
    && !(code >= 0xFF00 && code <= 0xFFEF)
    && !(code >= 0xFFF0 && code <= 0xFFFF)
}

/** 是否可作标识符首字符：ASCII 字母、`_`、`$`，或不在排除区间内的非 ASCII 码点。 */
export function isNameStart(code: number): boolean {
  return (code >= 0x41 && code <= 0x5A) || (code >= 0x61 && code <= 0x7A) || code === 0x5F || code === 0x24 || isExtendedNameChar(code)
}

/** 是否可作标识符后续字符：首字符集合加 ASCII 数字。 */
export function isNamePart(code: number): boolean {
  return isNameStart(code) || isDigit(code)
}
