import type { Disposable } from '@xihan-ui/kernel'
import type { InfiniteScrollPhase, InfiniteScrollSchema } from './infinite-scroll.types'
import { createViewportEntry } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<InfiniteScrollSchema>()

/** 由两个开关算出该落在哪一段：关掉优先于取数中。 */
export function resolveInfiniteScrollPhase(disabled: boolean | undefined, loading: boolean | undefined): InfiniteScrollPhase {
  if (disabled)
    return 'paused'
  return loading ? 'loading' : 'idle'
}

/**
 * 无限滚动机器。
 *
 * 观察器只在 idle 挂着：取数中与关掉两段都不观察，哨兵留在可视区里也不会连着触发第二次。
 * 取数的进度归宿主：loading 由宿主写入，写回 false 才回到 idle 重新挂上观察器。
 */
export const infiniteScrollMachine = createMachine({
  name: 'infinite-scroll',
  refs: () => ({
    getSentinelEl: () => null,
    getTargetEl: () => null,
  }),
  initialState: ({ prop }) => resolveInfiniteScrollPhase(prop('disabled'), prop('loading')),
  watch: ({ track, prop, action }) => {
    track([() => prop('disabled'), () => prop('loading')], () => action(['syncMode']))
  },
  on: {
    'MODE.SYNC': [
      { guard: 'isPaused', target: 'paused' },
      { guard: 'isLoading', target: 'loading' },
      { target: 'idle' },
    ],
  },
  states: {
    idle: {
      effects: ['observeSentinel'],
      on: {
        // 只报意图，不自己切到 loading：取不取、什么时候取完，宿主说了算
        'SENTINEL.ENTER': { actions: ['invokeOnLoad'] },
      },
    },
    // 这两段都不挂观察器，哨兵进出可视区一律不响应
    loading: {},
    paused: {},
  },
  implementations: {
    guards: {
      isPaused: ({ prop }) => !!prop('disabled'),
      isLoading: ({ prop }) => !!prop('loading'),
    },
    actions: {
      syncMode: ({ send }) => send({ type: 'MODE.SYNC' }),
      invokeOnLoad: ({ prop }) => prop('onLoad')?.(),
    },
    effects: {
      /**
       * 哨兵观察器。推迟一拍再挂：挂载这一刻哨兵节点未必就位。
       * 无 DOM 环境（宿主没有 IntersectionObserver）建不出观察器，这一段就整个让位，不抛错也不轮询。
       */
      observeSentinel: ({ refs, prop, scope, send, flush }) => {
        let disposed = false
        let entry: Disposable | null = null

        flush(() => {
          if (disposed)
            return
          entry = createViewportEntry({
            scope,
            target: () => refs.get('getSentinelEl')(),
            // 提前量扩的是这块可视区，滚在容器里就得把容器交出来
            container: () => refs.get('getTargetEl')(),
            distance: prop('distance'),
            onEnter: () => send({ type: 'SENTINEL.ENTER' }),
          })
        })

        return () => {
          disposed = true
          entry?.dispose()
        }
      },
    },
  },
})
