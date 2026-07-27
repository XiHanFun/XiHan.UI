import type { AvatarSchema } from './avatar.types'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<AvatarSchema>()

// 唯一的异步来源是 <img> 自己的 load / error：机器不碰 DOM、不预取图片，只等适配器把这两个
// 事件回送进来。没有 DOM 就永远收不到事件，状态停在 loading（回退内容照样可见），不崩。
export const avatarMachine = createMachine({
  name: 'avatar',
  // 首帧一律停在 idle：进入初始状态这一刻转移还没走完，此时 send 会读到半路的状态，
  // 来源决议因此推迟到宿主提交一帧之后（见 resolveSrc）
  initialState: () => 'idle',
  watch: ({ track, prop, action }) => track([() => prop('src')], () => action(['syncSrc'])),
  // 换图要重走一轮，从哪个状态出发都一样，因此挂根级
  on: {
    'SRC.CHANGE': [
      { guard: 'hasSrc', target: 'loading' },
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
      entry: ['invokeLoading'],
      on: {
        'IMAGE.LOAD': { target: 'loaded' },
        'IMAGE.ERROR': { target: 'error' },
      },
    },
    loaded: {
      entry: ['invokeLoaded'],
    },
    // 加载失败与压根没有 src 是同一个落点：都只剩回退内容可看
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
    },
  },
})
