// 逐帧推进的宿主胶水：机器的效应用它把时间喂给纯补间。补间自己不认识帧、也不持有计时器。

/** 当前时间戳毫秒。宿主没有 performance 时退回 Date。 */
export function frameNow(win: Window): number {
  const perf = win.performance
  return typeof perf?.now === 'function' ? perf.now() : Date.now()
}

/**
 * 起一个逐帧回调的循环，返回值即停掉它。
 *
 * 停掉的标记在回调里再查一次：onFrame 有可能当场把循环停掉（补间走完、机器换状态），
 * 而那一刻 cancelAnimationFrame 撤的是已经跑过的那一帧，若不查标记就会在它后面再排一帧，
 * 循环从此撤不掉。
 */
export function frameLoop(win: Window, onFrame: () => void): VoidFunction {
  let stopped = false
  let id = 0
  const step = (): void => {
    if (stopped)
      return
    onFrame()
    if (stopped)
      return
    id = win.requestAnimationFrame(step)
  }
  id = win.requestAnimationFrame(step)
  return () => {
    stopped = true
    win.cancelAnimationFrame(id)
  }
}
