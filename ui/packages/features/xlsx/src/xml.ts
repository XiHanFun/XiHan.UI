/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// XML 文本转义与单元格引用。

const LITERAL_ESCAPE = /_(?=x[0-9a-f]{4}_)/gi

function hex(code: number): string {
  return `_x${code.toString(16).toUpperCase().padStart(4, '0')}_`
}

function isInvalid(code: number): boolean {
  return (code < 0x20 && code !== 0x09 && code !== 0x0A && code !== 0x0D) || code === 0xFFFE || code === 0xFFFF
}

function replaceInvalid(text: string): string {
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 0xD800 && code <= 0xDBFF) {
      const next = text.charCodeAt(i + 1)
      if (next >= 0xDC00 && next <= 0xDFFF) {
        out += text.slice(i, i + 2)
        i++
      }
      else {
        out += hex(code)
      }
      continue
    }
    out += (code >= 0xDC00 && code <= 0xDFFF) || isInvalid(code) ? hex(code) : text[i]
  }
  return out
}

/** 转义属性值与文本里的 XML 特殊字符。 */
export function escapeXml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * 单元格文本：原文里的 _xHHHH_ 写成 _x005F_xHHHH_，XML 不允许的字符写成 _xHHHH_，再转义 XML 特殊字符。
 */
export function escapeCellText(text: string): string {
  return escapeXml(replaceInvalid(text.replace(LITERAL_ESCAPE, '_x005F_')))
}

/** 列号（0 起）写成列字母：0 → A，25 → Z，26 → AA。 */
export function columnName(index: number): string {
  let name = ''
  let n = index + 1
  while (n > 0) {
    const rest = (n - 1) % 26
    name = String.fromCharCode(65 + rest) + name
    n = Math.floor((n - 1) / 26)
  }
  return name
}

/** 单元格引用：行列都从 0 起，如 (0, 0) → A1。 */
export function cellRef(row: number, column: number): string {
  return `${columnName(column)}${row + 1}`
}
