import type { ImageSchema } from './image.types'
import { setTimeoutEffect, setup } from '@xihan-ui/machine'

const { createMachine } = setup<ImageSchema>()

/** 回退延迟归一：负数与 NaN 按 0 处理，Infinity 保留（表示加载期间永不露面）。 */
export function resolveFallbackDelay(delay: number | undefined): number {
  const ms = delay ?? 0
  if (Number.isNaN(ms) || ms <= 0)
    return 0
  return ms
}

// 异步来源只有 <img> 的 load / error，由适配器回送。
export const imageMachine = createMachine({
  name: 'image',
  context: ({ prop, cell }) => ({
    // 初值按 fallbackDelay 定
    fallbackVisible: cell<boolean>(() => ({
      defaultValue: resolveFallbackDelay(prop('fallbackDelay')) <= 0,
    })),
  }),
  // 首帧一律停在 idle，来源决议推迟到宿主提交一帧之后（见 resolveSrc）
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('src')], () => action(['syncSrc'])),
  // 换图重走一轮；loading→loading 用 reenter 重跑 entry 并重挂计时器。
  on: {
    'SRC.CHANGE': [
      { guard: 'hasSrc', target: 'loading', reenter: true },
      { target: 'error' },
    ],
  },
  states: {
    idle: {
      effects: ['resolveSrc'],
      // 决议落地前图片已就绪（缓存命中）时也接事件
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loading: {
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
    // 加载失败与无 src 同落此态，回退内容不受延迟约束
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
      // 换图时把上一轮翻开的回退内容按回去
      resetFallback: ({ context, prop }) => {
        context.set('fallbackVisible', resolveFallbackDelay(prop('fallbackDelay')) <= 0)
      },
      showFallback: ({ context }) => {
        context.set('fallbackVisible', true)
      },
    },
    effects: {
      // 推迟到宿主提交一帧之后再决议；离开 idle（含卸载）后回调作废。
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
      // 计时器只在 loading 期间存在，离开 loading 即撤
      trackFallbackDelay: ({ prop, send }) => {
        const ms = resolveFallbackDelay(prop('fallbackDelay'))
        // 0（回退内容已露面）与 Infinity（永不露面）都不起计时器
        if (ms <= 0 || !Number.isFinite(ms))
          return undefined
        return setTimeoutEffect(() => send({ type: 'after.fallbackDelay' }), ms)
      },
    },
  },
})
