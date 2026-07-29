// 打字机投影：由全文长度与流逝时间算出当前可见的前缀长度，时间原点由调用方持有。

export interface TypewriterOpts {
  /** 'off' 直接给出全文，'fixed' 按 charsPerSec 匀速推进。 */
  readonly mode: 'off' | 'fixed'
  readonly charsPerSec?: number
}

export const TYPEWRITER_DEFAULT_CHARS_PER_SEC = 60

/** 给定全文长度与已流逝毫秒，返回当前应可见的前缀长度。 */
export function visibleLength(fullLength: number, elapsedMs: number, opts: TypewriterOpts): number {
  if (opts.mode === 'off')
    return fullLength
  const rate = opts.charsPerSec ?? TYPEWRITER_DEFAULT_CHARS_PER_SEC
  return Math.min(fullLength, Math.max(0, Math.floor(rate * elapsedMs / 1000)))
}
