import type { PropFn } from '@xihan-ui/machine'
import type { HeatmapGridOptions } from './heatmap.grid'
import type { HeatmapSchema } from './heatmap.types'
import { setup } from '@xihan-ui/machine'
import { heatmapStatsOf } from './heatmap.grid'

const { createMachine } = setup<HeatmapSchema>()

/**
 * 从 props 里取出建网格要用的那几项。
 * 连接层与机器都得算同一张网格，取值收在这一处，两边就不会各算各的。
 */
export function heatmapGridOptions(prop: PropFn<HeatmapSchema>): HeatmapGridOptions {
  return {
    startDate: prop('startDate'),
    endDate: prop('endDate'),
    value: prop('value'),
    levels: prop('levels'),
    thresholds: prop('thresholds'),
    firstDayOfWeek: prop('firstDayOfWeek'),
    locale: prop('locale'),
  }
}

// 热力图没有可选中的值，机器只管一件事：记住焦点走到了哪一天，好让整张网格只占一个 Tab 位。
// 锚点不受控、也不进状态，机器因此只有一个状态。
export const heatmapMachine = createMachine({
  name: 'heatmap',
  context: ({ cell }) => ({
    focusedDate: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  states: {
    idle: {
      on: {
        'CELL.FOCUS': { actions: ['setFocusedDate'] },
        'FOCUS.SET': { actions: ['setFocusedDate'] },
      },
    },
  },
  implementations: {
    actions: {
      setFocusedDate: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.FOCUS' && e.type !== 'FOCUS.SET')
          return
        const next = e.date
        // 同一格反复聚焦（点一下再按一次方向键回来）不重复通知
        if (context.get('focusedDate') === next)
          return
        context.set('focusedDate', next)
        if (next == null)
          return
        // 只有 DOM 焦点真的落到某一格时才通知；FOCUS.SET 只挪锚点、焦点没动，
        // 通知了就是报一件没发生的事
        if (e.type !== 'CELL.FOCUS')
          return
        // 只查这一天的计数与档位，不建整张网格：方向键每按一下都会走到这里
        const stats = heatmapStatsOf(heatmapGridOptions(prop), next)
        prop('onCellFocus')?.({ date: next, count: stats.count, level: stats.level })
      },
    },
  },
})
