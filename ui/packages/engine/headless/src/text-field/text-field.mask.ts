/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 文本框的掩码：按一串模式把输入排成固定格式，分隔符自动补上。

/** 占位符：9 收数字，a 收字母，* 收字母或数字。 */
type MaskToken = '9' | 'a' | '*'

/** 掩码里的一格：占位符收某一类字符，字面量原样落在值里。 */
type MaskCell = { kind: 'slot', token: MaskToken } | { kind: 'literal', char: string }

const ACCEPTS: Record<MaskToken, RegExp> = {
  '9': /^\d$/,
  'a': /^\p{L}$/u,
  '*': /^[\p{L}\d]$/u,
}

function isToken(char: string): char is MaskToken {
  return char === '9' || char === 'a' || char === '*'
}

/**
 * 读掩码：`9` 收数字，`a` 收字母，`*` 收字母或数字，其余字符是分隔符；
 * 在 9 / a / * / \ 前面写 `\` 即把它当分隔符原样写出。
 */
export function parseTextFieldMask(mask: string): MaskCell[] {
  const cells: MaskCell[] = []
  const chars = Array.from(mask)
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]!
    if (char === '\\' && i + 1 < chars.length)
      cells.push({ kind: 'literal', char: chars[++i]! })
    else
      cells.push(isToken(char) ? { kind: 'slot', token: char } : { kind: 'literal', char })
  }
  return cells
}

export interface TextFieldMaskResult {
  /** 按掩码排好的值，含分隔符；最后一个填上的占位符之后的分隔符不预先补出。 */
  value: string
  /** 去掉分隔符、只剩填进占位符的字符。 */
  unmasked: string
  /** 每个占位符都填上了；掩码里一个占位符都没有时为 false。 */
  complete: boolean
}

/**
 * 把一串输入按掩码排好：逐格往后填，占位符只收它接受的字符、跳过其余；分隔符等到后面真有字符要填时才补上。
 * 输入里与分隔符相同的字符就地收掉，所以对已经排好的值再排一遍结果不变。
 */
export function applyTextFieldMask(mask: string, input: string): TextFieldMaskResult {
  const cells = parseTextFieldMask(mask)
  const chars = Array.from(input)
  const total = cells.filter(cell => cell.kind === 'slot').length
  let value = ''
  let unmasked = ''
  let pending = ''
  let filled = 0
  let i = 0
  for (const cell of cells) {
    if (cell.kind === 'literal') {
      pending += cell.char
      if (chars[i] === cell.char)
        i++
      continue
    }
    while (i < chars.length && !ACCEPTS[cell.token].test(chars[i]!))
      i++
    if (i >= chars.length)
      break
    value += pending + chars[i]
    unmasked += chars[i]
    pending = ''
    filled++
    i++
  }
  return { value, unmasked, complete: total > 0 && filled === total }
}

/** 掩码里只有收数字的占位符：输入框据此请移动端弹数字键盘。 */
export function isNumericTextFieldMask(mask: string): boolean {
  const slots = parseTextFieldMask(mask).filter(cell => cell.kind === 'slot')
  return slots.length > 0 && slots.every(cell => cell.token === '9')
}

/**
 * 用户的一次编辑按掩码排好：值重排，光标落在原光标之前那几个有效字符排好之后的位置。
 * 删掉一个分隔符时值排回原样，光标退到它前面，再删一次才删到字符。
 */
export function fitToTextFieldMask(mask: string, next: string, caret: number | null): { value: string, caret: number } {
  const { value } = applyTextFieldMask(mask, next)
  if (caret == null)
    return { value, caret: value.length }
  return { value, caret: Math.min(applyTextFieldMask(mask, next.slice(0, caret)).value.length, value.length) }
}
