import type { AvatarSchema } from './avatar.types'
import { setup } from '@xihan-ui/core'

const { createMachine } = setup<AvatarSchema>()

// 状态由 <img> 的 load / error 事件驱动
export const avatarMachine = createMachine({
  name: 'avatar',
  // 首帧停在 idle，来源决议推迟到宿主提交一帧之后
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('src')], () => action(['syncSrc'])),
  // 换图在任意状态都重走一轮
  on: {
    'SRC.CHANGE': [
      { guard: 'hasSrc', target: 'loading' },
      { target: 'error' },
    ],
  },
  states: {
    idle: {
      effects: ['resolveSrc'],
      // 决议落地前图片已就绪（缓存命中）时不丢事件
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loading: {
      // 通知写在 entry，重复回写同一 src 不重复通知
      entry: ['invokeLoading'],
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loaded: {
      entry: ['invokeLoaded'],
    },
    // 加载失败与没有 src 共用此落点
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
    },
    effects: {
      // 推迟到宿主提交一帧之后再决议，离开 idle 后回调作废
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
    },
  },
})
