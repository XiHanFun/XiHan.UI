/** 按顶层逗号切多层取值：url("data:…,…") 里的逗号不算分隔符。 */
function layers(value: string): string[] {
  const out: string[] = []
  let depth = 0
  let quote = ''
  let start = 0
  for (let i = 0; i < value.length; i++) {
    const ch = value[i]!
    if (quote) {
      if (ch === quote)
        quote = ''
      continue
    }
    if (ch === '"' || ch === '\'') {
      quote = ch
    }
    else if (ch === '(') {
      depth++
    }
    else if (ch === ')') {
      depth--
    }
    else if (ch === ',' && depth === 0) {
      out.push(value.slice(start, i).trim())
      start = i + 1
    }
  }
  out.push(value.slice(start).trim())
  return out
}

/**
 * 状态字形当前露出的那一层遮罩图。
 *
 * 勾与半选杠叠成两层遮罩、按状态只换两层尺寸的写法里，mask-image 恒为两层，
 * 露出来的是尺寸不为 0 的那一层；单层写法直接返回那一层。
 */
export function shownMask(el: Element, pseudo: string): string {
  const style = getComputedStyle(el, pseudo)
  const images = layers(style.maskImage || style.webkitMaskImage)
  const sizes = layers(style.maskSize || style.webkitMaskSize)
  const shown = images.filter((_, index) => !/^0(?:px|%)? 0(?:px|%)?$/.test(sizes[index % sizes.length] ?? ''))
  if (shown.length !== 1)
    throw new Error(`${pseudo} 露出的遮罩层应只有一层，实际 ${shown.length} 层：${style.maskSize}`)
  return shown[0]!
}
