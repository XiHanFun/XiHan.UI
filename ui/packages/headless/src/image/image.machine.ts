import type { ImageSchema } from './image.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'

const { createMachine } = setup<ImageSchema>()

/**
 * 回退延迟归一。
 * 0 与负数、以及 NaN 一律按 0 处理（加载期间回退内容立刻露面）；
 * Infinity 保留原样，表示加载期间永不露面。
 */
export function resolveFallbackDelay(delay: number | undefined): number {
  const ms = delay ?? 0
  if (Number.isNaN(ms) || ms <= 0)
    return 0
  return ms
}

// 唯一的异步来源是 <img> 自己的 load / error：机器不碰 DOM、不预取图片，只等适配器把这两个
// 事件回送进来。没有 DOM 就永远收不到事件，状态停在 loading（回退内容照样能顶上），不崩。
export const imageMachine = createMachine({
  name: 'image',
  context: ({ prop, cell }) => ({
    // 初值就按 fallbackDelay 定：给了延迟时连 idle 那一拍也不该让回退内容闪出来
    fallbackVisible: cell<boolean>(() => ({
      defaultValue: resolveFallbackDelay(prop('fallbackDelay')) <= 0,
    })),
  }),
  // 首帧一律停在 idle：进入初始状态这一刻转移还没走完，此时 send 会读到半路的状态，
  // 来源决议因此推迟到宿主提交一帧之后（见 resolveSrc）
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('src')], () => action(['syncSrc'])),
  // 换图要重走一轮，从哪个状态出发都一样，因此挂根级。
  //
  // loading 那条必须 reenter：上一张还没到就换了图时，from 与 to 同是 loading，
  // 不重入的话既不重跑 entry（回退内容停在上一轮翻开的状态，新图的延迟窗口白给），
  // 也不重挂副作用（计时器还是上一张那个，早已跑掉就再也没有人翻开回退内容了）。
  // watch 只在 src 真变时才发这条事件，所以重入不会退化成"同一张图反复重来"。
  on: {
    'SRC.CHANGE': [
      { guard: 'hasSrc', target: 'loading', reenter: true },
      { target: 'error' },
    ],
  },
  states: {
    idle: {
      effects: ['resolveSrc'],
      // 决议落地前图片就已就绪（缓存命中）时不丢事件
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loading: {
      // 通知写在 entry 而不是转移上：同一个 src 反复回写只走自转移、不重入，也就不会重复通知
      entry: ['invokeLoading', 'resetFallback'],
      effects: ['trackFallbackDelay'],
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
        'after.fallbackDelay': { actions: ['showFallback'] },
      },
    },
    loaded: {
      entry: ['invokeLoaded'],
    },
    // 加载失败与压根没有 src 是同一个落点：都只剩回退内容可看，且不受延迟约束
    error: {
      entry: ['invokeError'],
    },
  },
  implementations: {
    guards: {
      hasSrc: ({ prop }) => !!prop('src'),
    },
    actions: {
      invokeLoading: ({ prop }) => prop('onStatusChange')?.({ status: 'loading' }),
      invokeLoaded: ({ prop }) => prop('onStatusChange')?.({ status: 'loaded' }),
      invokeError: ({ prop }) => prop('onStatusChange')?.({ status: 'error' }),
      syncSrc: ({ send }) => send({ type: 'SRC.CHANGE' }),
      // 换图重来一轮时要把上一轮翻开的回退内容按回去，否则新图的延迟窗口白给了
      resetFallback: ({ context, prop }) => {
        context.set('fallbackVisible', resolveFallbackDelay(prop('fallbackDelay')) <= 0)
      },
      showFallback: ({ context }) => {
        context.set('fallbackVisible', true)
      },
    },
    effects: {
      // 推迟到宿主提交一帧之后再决议：进入 idle 这一刻转移还没结束，此刻 send 会被丢在半路。
      // 离开 idle（含卸载）后回调作废，不会补发。
      resolveSrc: ({ send, flush }) => {
        let disposed = false

        flush(() => {
          if (!disposed)
            send({ type: 'SRC.CHANGE' })
        })

        return () => {
          disposed = true
        }
      },
      // 计时器只在 loading 期间存在：图片先到就随退出一并撤掉，回退内容再也不会迟到一步冒出来
      trackFallbackDelay: ({ prop, send }) => {
        const ms = resolveFallbackDelay(prop('fallbackDelay'))
        // 0 = 回退内容已经在台前（entry 已置真），不必再等；Infinity = 永不露面，两种都不起计时器
        if (ms <= 0 || !Number.isFinite(ms))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.fallbackDelay' }), ms)
      },
    },
  },
})
