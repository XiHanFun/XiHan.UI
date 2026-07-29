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
