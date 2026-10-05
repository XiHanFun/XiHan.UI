/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 timestamp 相关实现。

import type { TimestampProps, TimestampSchema } from './timestamp.types'
import { setup } from '@xihan-ui/core'
import { watchInView, watchPageVisibility } from '../shared/view-watch'
import { isTimestampTimeZone, timestampRefreshDelay, toTimeDate } from './timestamp.format'

const { createMachine } = setup<TimestampSchema>()

type PropReader = <K extends keyof TimestampProps>(key: K) => TimestampProps[K]

/**
 * 下一次刷新距现在多久（毫秒）；不必刷新时为 null。
 *
 * 只有相对型、没给参照时刻、刷新没关、时刻与时区都认得出时才刷新：给了 now 的产出完全由入参决定，
 * 绝对型的文字不随时间变。固定间隔按作者给的，缺省按文字下一次会变的那一刻。
 */
export function timestampNextRefresh(prop: PropReader, now: number): number | null {
  if (prop('type') !== 'relative' || prop('now') != null)
    return null
  const interval = prop('refreshInterval')
  if (interval != null && (!Number.isFinite(interval) || interval <= 0))
    return null
  const timeZone = prop('timeZone')
  if (!isTimestampTimeZone(timeZone))
    return null
  const date = toTimeDate(prop('value'), timeZone)
  if (!date)
    return null
  const adaptive = timestampRefreshDelay(date, new Date(now))
  if (adaptive == null)
    return null
  return interval ?? adaptive
}

/**
 * 相对时间的刷新机器。
 *
 * 两段状态：idle 不刷新，live 挂一个计时器到文字下一次会变的那一刻。到点只做一件事——
 * 取一次当前时刻写进 context，再重入 live 按新的距离重新定时。
 * 页面隐藏或元素离开视口时撤掉计时器，回来时立即取一次当前时刻：隐藏期间过去的时间一步补上。
 * 可见性监听与视口观察器全页共用（见 shared/view-watch）：表格里几百个相对时间不再各挂一份。
 */
export const timestampMachine = createMachine({
  name: 'timestamp',
  context: ({ cell }) => ({
    now: cell<number>(() => ({ defaultValue: Date.now() })),
  }),
  initialState: ({ prop }) => (timestampNextRefresh(prop, Date.now()) == null ? 'idle' : 'live'),
  watch: ({ track, prop, action }) => {
    track(
      [() => prop('type'), () => prop('value'), () => prop('now'), () => prop('refreshInterval'), () => prop('timeZone')],
      () => action(['syncRefresh']),
    )
  },
  states: {
    idle: {
      on: {
        'REFRESH.SYNC': { guard: 'shouldRefresh', target: 'live', actions: ['syncNow'] },
      },
    },
    live: {
      effects: ['trackRefresh'],
      on: {
        'REFRESH.SYNC': [
          { guard: 'shouldRefresh', target: 'live', reenter: true, actions: ['syncNow'] },
          { target: 'idle' },
        ],
        'TICK': { target: 'live', reenter: true, actions: ['syncNow'] },
      },
    },
  },
  implementations: {
    guards: {
      shouldRefresh: ({ prop }) => timestampNextRefresh(prop, Date.now()) != null,
    },
    actions: {
      syncRefresh: ({ send }) => send({ type: 'REFRESH.SYNC' }),
      syncNow: ({ context }) => context.set('now', Date.now()),
    },
    effects: {
      /**
       * 计时器按进入 live 那一刻的距离定：重入即换基准，与「每次刷新都重新量一次距离」一一对应。
       * 可见性与视口两路只管暂停与补刷：隐藏时撤计时器，重新可见时发一次 TICK 让机器重入。
       */
      trackRefresh: ({ prop, scope, send }) => {
        const win = scope.getWin()
        const doc = scope.getDoc()
        const delay = timestampNextRefresh(prop, Date.now())
        let timer: ReturnType<Window['setTimeout']> | undefined
        let pageVisible = doc.visibilityState !== 'hidden'
        let inView = true

        const disarm = (): void => {
          if (timer !== undefined) {
            win.clearTimeout(timer)
            timer = undefined
          }
        }
        const arm = (): void => {
          if (timer === undefined && delay != null && pageVisible && inView)
            timer = win.setTimeout(() => send({ type: 'TICK' }), delay)
        }

        const stopVisibility = watchPageVisibility(doc, (visible) => {
          if (visible === pageVisible)
            return
          pageVisible = visible
          if (!visible)
            disarm()
          else if (inView)
            send({ type: 'TICK' })
        })

        // 视口：离开视口不再刷新，重回视口补刷一次。订阅后会先报一次当前状态，那一次只记下、不补刷
        const root = scope.getById(scope.partId('timestamp', 'root'))
        const stopView = root
          ? watchInView(win, root, (visible) => {
              if (visible === inView)
                return
              inView = visible
              if (!visible)
                disarm()
              else if (pageVisible)
                send({ type: 'TICK' })
            })
          : null

        arm()
        return () => {
          disarm()
          stopVisibility()
          stopView?.()
        }
      },
    },
  },
})
