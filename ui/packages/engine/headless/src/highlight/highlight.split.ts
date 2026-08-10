// 关键词切段的纯函数：不碰 DOM、不认识解剖，把一段文本切成命中与未命中交替的片段。
//
// 全程逐字符比对，不把关键词拼进正则：关键词是用户敲进搜索框的东西，
// 里面的 `.` `*` `(` `[` `\` 一旦被当成正则语法，轻则匹配到别的地方，重则整条构造抛错。

/** 切出来的一段。 */
export interface HighlightSegment {
  readonly text: string
  /** 这一段是不是命中了某个关键词。 */
  readonly matched: boolean
}

/**
 * 关键词归一：单个串与数组收成同一种形状，空串丢掉。
 * 空串在任何位置都「命中」，留着会把整段文本切成一串零长片段。
 */
export function normalizeHighlightKeywords(keyword: string | readonly string[] | undefined | null): readonly string[] {
  if (keyword == null)
    return []
  const list = typeof keyword === 'string' ? [keyword] : keyword
  return list.filter(item => typeof item === 'string' && item !== '')
}

/**
 * 从 at 起，needle 是不是逐字符相等。
 *
 * 不整串转小写再比：有的字符转小写后长度会变（比如带点的大写 I 转成两个码元），
 * 转完的串与原串下标就对不上了，切出来的片段会错位。逐字符比时两侧同样处理，下标恒对齐。
 */
function matchesAt(text: string, at: number, needle: string, caseSensitive: boolean): boolean {
  if (at + needle.length > text.length)
    return false
  for (let i = 0; i < needle.length; i++) {
    const a = text[at + i]!
    const b = needle[i]!
    if (a === b)
      continue
    if (caseSensitive || a.toLowerCase() !== b.toLowerCase())
      return false
  }
  return true
}

/**
 * 把文本切成命中与未命中交替的片段。
 *
 * 一处有多个关键词都命中时取最长的那个，命中后从这一段的末尾接着扫：
 * 重叠的命中因此只切出一段，同一段文字不会被套两层标记。
 * 相邻的未命中字符并成一段；所有片段依次拼回去恒等于原文。
 *
 * @example
 * // 「abc」与「bcd」在同一处起跳，取长的那个，剩下的 d 归未命中段
 * splitHighlight('abcd', ['bcd', 'abc']) // [{ text: 'abc', matched: true }, { text: 'd', matched: false }]
 */
export function splitHighlight(
  text: string,
  keywords: readonly string[],
  caseSensitive = false,
): readonly HighlightSegment[] {
  const segments: HighlightSegment[] = []
  let plain = ''
  let at = 0

  while (at < text.length) {
    let hit = 0
    for (const keyword of keywords) {
      if (keyword.length > hit && matchesAt(text, at, keyword, caseSensitive))
        hit = keyword.length
    }
    if (hit === 0) {
      plain += text[at]
      at += 1
      continue
    }
    if (plain !== '') {
      segments.push({ text: plain, matched: false })
      plain = ''
    }
    segments.push({ text: text.slice(at, at + hit), matched: true })
    at += hit
  }

  if (plain !== '')
    segments.push({ text: plain, matched: false })
  return segments
}
