// 打字机投影。
//
// 纯函数：无定时器、无内部状态、无副作用。时间原点由调用方持有——
// 一个只做投影的函数不该替调用方记住"什么时候开始的"。
//
// 与渲染层解耦：这里只决定"喂给渲染器的全文截到多长"，渲染器对打字机毫无感知。

export interface TypewriterOpts {
  /** 'off'：ended 一到即全量。'fixed'：按 charsPerSec 匀速推进。 */
  readonly mode: 'off' | 'fixed'
  readonly charsPerSec?: number
}

export const TYPEWRITER_DEFAULT_CHARS_PER_SEC = 60

/** 纯投影：给定全文长度与已流逝毫秒，返回当前应可见的前缀长度。 */
export function visibleLength(fullLength: number, elapsedMs: number, opts: TypewriterOpts): number {
  if (opts.mode === 'off')
    return fullLength
  const rate = opts.charsPerSec ?? TYPEWRITER_DEFAULT_CHARS_PER_SEC
  return Math.min(fullLength, Math.max(0, Math.floor(rate * elapsedMs / 1000)))
}
