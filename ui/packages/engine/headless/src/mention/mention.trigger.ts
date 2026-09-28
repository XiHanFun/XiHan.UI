/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 mention.trigger 相关实现。

import type { MentionRange, MentionTrigger } from './mention.types'

/** 缺省前缀。 */
export const MENTION_DEFAULT_PREFIX = '@'

/** 把 prefix prop 归一成一张前缀表；空串会在任意位置命中，直接剔掉。 */
export function normalizeMentionPrefixes(prefix: string | string[] | undefined): string[] {
  if (prefix === undefined)
    return [MENTION_DEFAULT_PREFIX]
  const list = typeof prefix === 'string' ? [prefix] : prefix
  return list.filter(item => item !== '')
}

/** 前缀前面只允许行首或空白。 */
function opensAt(text: string, index: number): boolean {
  return index === 0 || /\s/.test(text.charAt(index - 1))
}

/**
 * 从光标往前找触发点，找不到返回 null。
 *
 * 扫到空白就收工，所以查询串里不会有空白，长度也不会无限增长。
 * 「foo@bar」这样的邮箱：扫到 @ 时它前面是 o 不是空白，不算触发；接着往前扫到空白或行首，
 * 整段一个触发点也报不出来。
 */
export function findMentionTrigger(
  text: string,
  caret: number,
  prefixes: readonly string[],
): MentionTrigger | null {
  if (caret <= 0 || prefixes.length === 0)
    return null
  const end = Math.min(caret, text.length)
  for (let i = end - 1; i >= 0; i--) {
    if (/\s/.test(text.charAt(i)))
      return null
    for (const prefix of prefixes) {
      // 前缀整段要落在光标之前，否则查询串是负的
      if (i + prefix.length > end)
        continue
      if (!text.startsWith(prefix, i) || !opensAt(text, i))
        continue
      return { prefix, index: i, query: text.slice(i + prefix.length, end) }
    }
  }
  return null
}

/**
 * 正文从 from 改成 to 之后，已插入的提及挪到新位置。
 *
 * 改动按两版正文的公共前缀与公共后缀定位成一段：整条在这段之前的原样留着，整条在这段之后的按长度差平移，
 * 与这段有交叠的（改到了提及内部）撤掉。挪完再核一遍文字，对不上的同样撤掉。
 * 紧贴提及首尾打字不算改到内部：提及原样留着，打的字是它旁边的普通文字。
 */
export function remapMentionRanges(ranges: readonly MentionRange[], from: string, to: string): MentionRange[] {
  if (from === to || ranges.length === 0)
    return [...ranges]
  const bound = Math.min(from.length, to.length)
  let head = 0
  while (head < bound && from.charCodeAt(head) === to.charCodeAt(head))
    head++
  let tail = 0
  while (tail < bound - head && from.charCodeAt(from.length - 1 - tail) === to.charCodeAt(to.length - 1 - tail))
    tail++
  const editEnd = from.length - tail
  const delta = to.length - from.length
  const out: MentionRange[] = []
  for (const range of ranges) {
    let next: MentionRange
    if (range.end <= head)
      next = range
    else if (range.start >= editEnd)
      next = { ...range, start: range.start + delta, end: range.end + delta }
    else
      continue
    if (to.slice(next.start, next.end) === range.prefix + range.label)
      out.push(next)
  }
  return out
}

/**
 * 把光标处那段查询串换成候选文本，返回新正文与新光标位置。
 * 插入的是「前缀 + 文本 + 一个空格」：末尾那个空格既是分隔，也让光标落在空白之后，
 * 于是紧接着的一次重算扫不到触发点，浮层不会刚合上就自己弹回来。
 */
export function insertMention(
  text: string,
  trigger: MentionTrigger,
  label: string,
): { value: string, caret: number } {
  const inserted = `${trigger.prefix}${label} `
  const end = trigger.index + trigger.prefix.length + trigger.query.length
  return {
    value: text.slice(0, trigger.index) + inserted + text.slice(end),
    caret: trigger.index + inserted.length,
  }
}
