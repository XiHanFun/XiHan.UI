// 首字母/连打检索：把连续敲入的字符攒成查询串，用它在条目里找落点；停顿超时后重开一轮。

/** 两次按键间隔超过它就重开一轮。 */
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
   * 空格仅在缓冲区非空时参与检索。
   */
  push: (key: string) => string | null
  /** 丢弃当前缓冲（收起浮层、切换焦点组时调用）。 */
  clear: () => void
}

/** 单个可打印字符才参与检索。 */
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

/** 同一字符连打视为在该首字母的条目间轮换，而非匹配重复前缀。 */
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
 * 在条目里找查询串的落点，自 `from` 起绕一圈回来。
 * 找不到返回 null。
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

  // 连打轮换从下一个起步，正常输入允许命中当前项
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
