import type { ScrollTrackerHandle } from '@xihan-ui/behavior'
import type { BackTopSchema } from './back-top.types'
import { createScrollTracker, scrollBlockTo } from '@xihan-ui/behavior'
import { setup } from '@xihan-ui/machine'

const { createMachine } = setup<BackTopSchema>()

/** 滚过这么多像素按钮才露面的缺省值。 */
export const BACK_TOP_VISIBILITY_HEIGHT = 200

/** 露面阈值归一：夹到非负，非有限数退回缺省。 */
export function resolveBackTopVisibilityHeight(height: number | undefined): number {
  if (height == null || !Number.isFinite(height))
    return BACK_TOP_VISIBILITY_HEIGHT
  return Math.max(0, height)
}

/**
 * 回到顶部机器。
 *
 * 滚动量由效应里的观察器量，过没过线在那儿算好，机器只在两个状态间走动并对外通知。
 * 点按钮不改状态：滚回顶部后观察器自然会报"该收起来了"。
 */
export const backTopMachine = createMachine({
  name: 'back-top',
  refs: () => ({
    getTargetEl: () => null,
  }),
  // 起点一律收着：真实滚动量由观察器的第一次结算补上
  initialState: () => 'hidden',
  effects: ['trackScroll'],
  on: {
    'TRIGGER.CLICK': { actions: ['scrollToTop'] },
  },
  states: {
    hidden: {
      on: {
        'SCROLL.RESOLVE': [
          { guard: 'shouldShow', target: 'visible', actions: ['invokeOnChange'] },
        ],
      },
    },
    visible: {
      on: {
        'SCROLL.RESOLVE': [
          { guard: 'shouldHide', target: 'hidden', actions: ['invokeOnChange'] },
        ],
      },
    },
  },
  implementations: {
    guards: {
      shouldShow: ({ event }) => {
        const e = event.current()
        return e.type === 'SCROLL.RESOLVE' && e.visible
      },
      shouldHide: ({ event }) => {
        const e = event.current()
        return e.type === 'SCROLL.RESOLVE' && !e.visible
      },
    },
    actions: {
      invokeOnChange: ({ prop, event }) => {
        const e = event.current()
        if (e.type !== 'SCROLL.RESOLVE')
          return
        prop('onVisibleChange')?.({ visible: e.visible })
      },
      // 容器滚动滚容器，整页滚动滚窗口，两条路由同一个助手分派
      scrollToTop: ({ refs, prop, scope }) => {
        scrollBlockTo(refs.get('getTargetEl')(), scope, 0, prop('behavior') ?? 'smooth')
      },
    },
    effects: {
      /**
       * 滚动观察器：滚动量过线就报露面、退回线内就报收起。
       *
       * 推迟一拍再挂：挂载这一刻滚动容器的 ref 未必就位。挂上之后立刻结算一次，
       * 接住"页面一进来就已经滚在半路"的情形。
       */
      trackScroll: ({ refs, prop, scope, send, flush }) => {
        let disposed = false
        let tracker: ScrollTrackerHandle | undefined

        flush(() => {
          if (disposed)
            return
          const resolve = (): void => {
            if (disposed || !tracker)
              return
            const height = resolveBackTopVisibilityHeight(prop('visibilityHeight'))
            send({ type: 'SCROLL.RESOLVE', visible: tracker.metrics().top >= height })
          }
          tracker = createScrollTracker({
            scope,
            container: () => refs.get('getTargetEl')(),
            onChange: resolve,
          })
          resolve()
        })

        return () => {
          disposed = true
          tracker?.dispose()
        }
      },
    },
  },
})
