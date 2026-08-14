// 文字拆分：把一段文字拆成逐字或逐词的行内块，供 playAll 错开起播。
//
// 拆出来的每一段都是 aria-hidden，原文挂回容器的 aria-label——逐字的 span
// 会让部分读屏逐字念出来。要拿到无障碍名，容器的角色得支持命名。

/** 拆分粒度。 */
export type SplitBy = 'char' | 'word'

export interface SplitTextOptions {
  /** 拆分粒度，省略为 char。 */
  by?: SplitBy
  /** 每一段套上的类名。 */
  className?: string
}

export interface SplitTextResult {
  /** 拆出来的段，按文档顺序。 */
  parts: HTMLElement[]
  /** 还原容器的子节点与 aria-label。幂等。 */
  restore: () => void
}

const EMPTY: SplitTextResult = { parts: [], restore: () => {} }

/** 按空白切成「词 / 空白」交替的片段，空白原样保留。 */
function chunks(text: string, by: SplitBy): string[] {
  if (by === 'word')
    return text.split(/(\s+)/).filter(part => part !== '')
  // 按码点切，避免把 emoji 与代理对拆成两半
  return [...text]
}

export function splitText(element: HTMLElement, options: SplitTextOptions = {}): SplitTextResult {
  const doc = element.ownerDocument
  const text = element.textContent ?? ''
  if (doc === null || text.trim() === '')
    return EMPTY

  const by = options.by ?? 'char'
  const original = [...element.childNodes]
  const previousLabel = element.getAttribute('aria-label')

  const parts: HTMLElement[] = []
  const fragment = doc.createDocumentFragment()

  for (const chunk of chunks(text, by)) {
    if (chunk.trim() === '') {
      fragment.append(doc.createTextNode(chunk))
      continue
    }
    const part = doc.createElement('span')
    part.textContent = chunk
    part.setAttribute('aria-hidden', 'true')
    // 行内元素吃不到 translate 与 scale
    part.style.display = 'inline-block'
    if (options.className !== undefined)
      part.className = options.className
    parts.push(part)
    fragment.append(part)
  }

  element.replaceChildren(fragment)
  element.setAttribute('aria-label', text)

  let restored = false
  return {
    parts,
    restore: () => {
      if (restored)
        return
      restored = true
      element.replaceChildren(...original)
      if (previousLabel === null)
        element.removeAttribute('aria-label')
      else element.setAttribute('aria-label', previousLabel)
    },
  }
}
