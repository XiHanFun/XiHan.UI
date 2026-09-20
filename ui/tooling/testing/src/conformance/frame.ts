import type { AdapterHarness } from './types'

/** 连续自排的动画帧最多等这么多轮。 */
const MAX_FRAMES = 5

/**
 * 一帧 = 适配器把改动提交到 DOM，再让排着的动画帧回调跑完，再把回调写下的东西提交完。
 *
 * 只等 DOM 静止是不够的：Core 把「焦点域拆除后归还焦点」「挂载后补试落焦」这类移焦
 * 排在 requestAnimationFrame 上，DOM 早就不动了、焦点还在半路。停在这个半路上采样，
 * 看到的是两端各自的过渡态——Vue 侧焦点停在刚落 hidden 的条目上（Chromium 同样如此，
 * 它的 focus fixup 排在渲染更新末尾、动画帧回调之后，来不及跑就被 Core 搬走了），
 * WC 侧浮层壳物理搬回原位、焦点被同步收回 body（Chromium 也一样）。两种过渡态都
 * 到不了屏幕：同一帧稍后 Core 就把焦点还给 trigger。逐帧对拍要比的是能画出来的那一帧，
 * 所以采样前把这一帧等完。
 *
 * 只在真有回调排着时才等：jsdom 的一帧是 16ms 的定时器，每一步都干等会把全量拖慢三倍，
 * 而没人排帧时等它什么也不会变。回调本身可能再排下一帧（挂载落焦最多重试三帧），
 * 所以等到没有新排的为止；持续自排的动画（marquee 一类）由上限截住。
 */
export async function settleFrame(harness: AdapterHarness, doc: Document): Promise<void> {
  await harness.flush()
  const frames = trackFrames(doc)
  for (let round = 0; round < MAX_FRAMES && frames.pending > 0; round++) {
    await frames.next()
    await harness.flush()
  }
}

/**
 * 卸载后的收尾：把这条轨迹排下的、还没跑的回调在本条轨迹里跑完，不带进下一条。
 *
 * 拆焦点域时 Core 把「归还焦点 / 显式松手」排在动画帧上；jsdom 把 input.select() 的 select 事件、
 * 超链接的导航排成 0ms 定时器。用例之间没有人让出宏任务，这些回调会一直躺到后面某条轨迹第一次
 * 等动画帧或 settle 轮询时才跑——跑在别人的文档状态上。逐帧对拍要的是每条轨迹只由自己的
 * fixture 与步骤决定，所以卸载后先等排着的帧，再让事件循环转一整圈，把本条的尾巴收干净。
 *
 * 转一圈用两次 setImmediate 而不是 setTimeout(0)：Windows 上一次 0ms 定时器要等约 13ms，
 * 两千多条轨迹会多出半分钟；两次 immediate 之间事件循环必经一次 timers 阶段，到期的 0ms
 * 定时器在那里跑掉，代价不到 0.01ms。
 */
export async function settleTeardown(harness: AdapterHarness, doc: Document): Promise<void> {
  await settleFrame(harness, doc)
  const immediate = (globalThis as { setImmediate?: (callback: () => void) => unknown }).setImmediate
  if (typeof immediate !== 'function')
    throw new Error('settleTeardown：没有 setImmediate，一致性轨迹只在 Node 事件循环上录制')
  await new Promise<void>(resolve => immediate(resolve))
  await new Promise<void>(resolve => immediate(resolve))
  await harness.flush()
}

/** 此刻还排着、没跑的动画帧回调数；只认 settleFrame 记过账的 window。 */
export function pendingFrames(doc: Document): number {
  return trackFrames(doc).pending
}

interface FrameTracker {
  readonly pending: number
  next: () => Promise<void>
}

const trackers = new WeakMap<Window, FrameTracker>()

/** 给 window 的 requestAnimationFrame 记账：此刻排着、还没跑的回调有几个。 */
function trackFrames(doc: Document): FrameTracker {
  const win = doc.defaultView
  if (!win)
    throw new Error('settleFrame：document 没有挂在 window 上，等不到动画帧')
  const existing = trackers.get(win)
  if (existing)
    return existing
  const pending = new Set<number>()
  const request = win.requestAnimationFrame.bind(win)
  const cancel = win.cancelAnimationFrame.bind(win)
  win.requestAnimationFrame = (callback) => {
    const id = request((time) => {
      pending.delete(id)
      callback(time)
    })
    pending.add(id)
    return id
  }
  win.cancelAnimationFrame = (id) => {
    pending.delete(id)
    cancel(id)
  }
  const tracker: FrameTracker = {
    get pending() {
      return pending.size
    },
    next: () => new Promise<void>(resolve => request(() => resolve())),
  }
  trackers.set(win, tracker)
  return tracker
}
