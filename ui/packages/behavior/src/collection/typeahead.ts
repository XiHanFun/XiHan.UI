// 首字母/连打检索：把连续敲入的字符攒成一个查询串，用它在条目里找落点。
// 缓冲区是有时效的——停顿够久就重开一轮，这样"ab"能选到 Abby，隔几秒再敲 b 又能选到 Bob。

/** 两次按键间隔超过它就重开一轮。APG 未规定具体值，主流实现都在 300–500ms。 */
const RESET_AFTER = 350

export interface TypeaheadOptions {
  /** 重开一轮的间隔毫秒，默认 350。 */
  timeout?: number
  /** 取当前时间戳，便于测试注入。 */
  now?: () => number
}

export interface Typeahead {
  /**
   * 收一个按键。返回本轮累计的查询串；该键不参与检索时返回 null。
   * 空格只在已有查询串时才算字符——缓冲区空时它归"选中当前项"那类语义。
   */
  push: (key: string) => string | null
  /** 丢弃当前缓冲（收起浮层、切换焦点组时调用）。 */
  clear: () => void
}

/** 单个可打印字符才参与检索：方向键、Enter、F1 这类键名长度都大于 1。 */
function isTypeaheadKey(key: string, hasBuffer: boolean): boolean {
  if (key.length !== 1)
    return false
  return key !== ' ' || hasBuffer
}

export function createTypeahead(options: TypeaheadOptions = {}): Typeahead {
  const { timeout = RESET_AFTER, now = () => Date.now() } = options
  let buffer = ''
  let last = 0

  return {
    push(key) {
      if (!isTypeaheadKey(key, buffer.length > 0))
        return null
      const at = now()
      buffer = at - last > timeout ? key : buffer + key
      last = at
      return buffer
    },
    clear() {
      buffer = ''
      last = 0
    },
  }
}

/**
 * 同一个字符连打（"aaa"）是"在以 a 开头的条目之间轮换"，不是找前缀 "aaa"。
 * 这条是 APG 明说的，漏了就会出现"按住 a 卡在第一个 a 开头的条目上"。
 */
function normalize(query: string): { needle: string, cycling: boolean } {
  const cycling = query.length > 1 && [...query].every(c => c === query[0])
  return { needle: cycling ? query[0]! : query, cycling }
}

/** 取条目用于检索的文本。 */
export type ItemTextFn = (el: HTMLElement) => string

export interface TypeaheadMatchOptions {
  /** 取条目文本；缺省取 textContent。 */
  text?: ItemTextFn
  /** 返回 true 表示该条目不可停留（禁用项）。 */
  skip?: (el: HTMLElement) => boolean
}

/**
 * 在条目里找查询串的落点。从 `from` 的**下一个**开始绕一圈回来，
 * 这样连打同一字符能在候选之间轮换，而首次输入又能命中当前项之后最近的那个。
 * 找不到返回 null（调用方应保持原状，不要清空选中）。
 */
export function matchTypeahead(
  items: readonly HTMLElement[],
  from: number,
  query: string,
  options: TypeaheadMatchOptions = {},
): HTMLElement | null {
  if (!items.length || !query)
    return null
  const { text = el => el.textContent ?? '', skip } = options
  const { needle, cycling } = normalize(query)
  const target = needle.toLowerCase()

  // 连打轮换从下一个起步；正常输入允许命中当前项（否则边打边改会一直往后跳）
  const start = cycling || from < 0 ? from + 1 : from
  for (let i = 0; i < items.length; i++) {
    const el = items[(start + i + items.length) % items.length]!
    if (skip?.(el))
      continue
    if (text(el).trim().toLowerCase().startsWith(target))
      return el
  }
  return null
}
