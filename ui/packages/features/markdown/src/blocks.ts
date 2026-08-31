import { FENCE_OPEN, MATH_FENCE } from './scan'

/** 围栏块是否已经闭合；不是围栏块返回 false。 */
export function isFenceClosed(blockSrc: string): boolean {
  const lines = blockSrc.split('\n')
  const open = lines[0]?.match(FENCE_OPEN)
  if (!open)
    return false
  const marker = open[1]![0]!
  const minLength = open[1]!.length
  const closing = new RegExp(`^ {0,3}\\${marker}{${minLength},}\\s*$`)
  return lines.slice(1).some(line => closing.test(line))
}

/** 语言标注只认这一小撮字符。 */
const SAFE_LANG = /^[\w+#.-]{1,24}$/

/** 取围栏语言标注，过白名单；不匹配返回 undefined 交给消费方降级。 */
export function fenceLang(blockSrc: string): string | undefined {
  const open = blockSrc.split('\n')[0]?.match(FENCE_OPEN)
  const raw = open?.[2]
  if (!raw)
    return undefined
  return SAFE_LANG.test(raw) ? raw.toLowerCase() : undefined
}

/** 判断块的种类。html 永远不会从这里产出。 */
export function blockKind(blockSrc: string): 'markdown' | 'code' | 'math' {
  if (FENCE_OPEN.test(blockSrc))
    return 'code'
  if (MATH_FENCE.test(blockSrc))
    return 'math'
  return 'markdown'
}

/** 去掉末尾的空行。 */
function withoutTrailingBlank(lines: readonly string[]): string[] {
  const out = [...lines]
  while (out.length > 0 && out[out.length - 1]!.trim() === '') out.pop()
  return out
}

/** 取围栏代码块的正文：剥掉起止围栏行，正文自身的缩进与空行原样留着。不是围栏块时原样返回。 */
export function fenceBody(blockSrc: string): string {
  const lines = blockSrc.split('\n')
  const open = FENCE_OPEN.exec(lines[0]!)
  if (open === null)
    return blockSrc
  const marker = open[1]!
  const closing = new RegExp(`^ {0,3}\\${marker[0]!}{${marker.length},}\\s*$`)
  const body = lines.slice(1)
  if (body.length > 0 && closing.test(body[body.length - 1]!))
    body.pop()
  return body.join('\n')
}

/**
 * 取 $$ 段的正文：剥掉起止的 $$ 定界符。
 * 单行形态 `$$x$$` 取中间那段；多行形态取开定界符之后、闭定界符之前的全部行。
 * 还没闭合时没有闭定界符可剥，剥掉开定界符就返回。
 */
export function mathBody(blockSrc: string): string {
  const lines = withoutTrailingBlank(blockSrc.split('\n'))
  const first = (lines[0] ?? '').trim()
  if (!first.startsWith('$$'))
    return blockSrc
  if (first.length > 2 && first.endsWith('$$'))
    return first.slice(2, -2)

  const rest = lines.slice(1)
  const last = rest.length - 1
  if (last >= 0) {
    const at = rest[last]!.lastIndexOf('$$')
    if (at !== -1) {
      const kept = rest[last]!.slice(0, at)
      if (kept.trim() === '')
        rest.pop()
      else
        rest[last] = kept
    }
  }
  const head = first.slice(2)
  return (head === '' ? rest : [head, ...rest]).join('\n')
}
