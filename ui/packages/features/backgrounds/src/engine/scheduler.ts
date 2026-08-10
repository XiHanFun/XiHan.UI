// 全局帧调度：所有 surface 共用一条 requestAnimationFrame。
// 一张页面上放十几张效果卡时，十几条各自的 rAF 会被浏览器排成十几个回调，
// 合成一条既省调度开销，也保证同一帧里各卡拿到同一个 dt。

export interface Tickable {
  tick: (dt: number) => void
}

const members = new Set<Tickable>()
let frameId = 0
let prev = 0

function frame(now: number): void {
  frameId = requestAnimationFrame(frame)
  const dt = prev === 0 ? 0.016 : Math.min((now - prev) / 1000, 0.05)
  prev = now
  for (const member of members)
    member.tick(dt)
}

function start(): void {
  if (frameId !== 0 || typeof requestAnimationFrame !== 'function')
    return
  prev = 0
  frameId = requestAnimationFrame(frame)
}

function stop(): void {
  if (frameId === 0)
    return
  cancelAnimationFrame(frameId)
  frameId = 0
}

/** 加入调度，返回退出函数。 */
export function joinScheduler(member: Tickable): () => void {
  members.add(member)
  start()
  return () => {
    members.delete(member)
    if (members.size === 0)
      stop()
  }
}

/** 当前在调度里的成员数。 */
export function scheduledCount(): number {
  return members.size
}
