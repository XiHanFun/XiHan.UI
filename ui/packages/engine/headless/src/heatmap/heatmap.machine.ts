import type { PropFn } from '@xihan-ui/machine'
import type { HeatmapCellRef, HeatmapGridOptions, HeatmapTipRect } from './heatmap.grid'
import type { HeatmapSchema } from './heatmap.types'
import { setup } from '@xihan-ui/machine'
import { heatmapCellKey, heatmapDetailsOf, sameHeatmapCell, sameHeatmapTip } from './heatmap.grid'

const { createMachine } = setup<HeatmapSchema>()

/**
 * 从 props 里取出建网格要用的那几项。
 * 连接层与机器都得算同一张网格，取值收在这一处，两边就不会各算各的。
 */
export function heatmapGridOptions(prop: PropFn<HeatmapSchema>): HeatmapGridOptions {
  return {
    variant: prop('variant'),
    startDate: prop('startDate'),
    endDate: prop('endDate'),
    value: prop('value'),
    rows: prop('rows'),
    columns: prop('columns'),
    levels: prop('levels'),
    thresholds: prop('thresholds'),
    firstDayOfWeek: prop('firstDayOfWeek'),
    locale: prop('locale'),
  }
}

/** 详情取自哪一路。 */
export type HeatmapActiveSource = 'hovered' | 'focused' | null

/** 判「详情取自哪一路」要读的那几处 context。 */
export interface HeatmapActiveContext {
  hoveredCell: HeatmapCellRef | null
  focusedCell: HeatmapCellRef | null
  focusWithin: boolean
  dismissed: boolean
}

/**
 * 详情取自哪一路：指针压过键盘，Escape 收起后两路都不取。
 * 内容与落点都由它挑，两者因此不会一个念 A 的数、一个摆在 B 的位置上。
 */
export function heatmapActiveSource(context: HeatmapActiveContext): HeatmapActiveSource {
  if (context.dismissed)
    return null
  if (context.hoveredCell != null)
    return 'hovered'
  return context.focusWithin && context.focusedCell != null ? 'focused' : null
}

/** 详情该显示哪一格；不显示时给 null。 */
export function heatmapActiveCell(context: HeatmapActiveContext): HeatmapCellRef | null {
  const source = heatmapActiveSource(context)
  if (source === 'hovered')
    return context.hoveredCell
  return source === 'focused' ? context.focusedCell : null
}

/** 详情条该落在哪：与 heatmapActiveCell 取自同一路的那一次量测。 */
export function heatmapActiveTip(
  context: HeatmapActiveContext & { hoverTip: HeatmapTipRect | null, focusTip: HeatmapTipRect | null },
): HeatmapTipRect | null {
  const source = heatmapActiveSource(context)
  if (source === 'hovered')
    return context.hoverTip
  return source === 'focused' ? context.focusTip : null
}

// 热力图没有可选中的值，机器只管两件事：焦点走到了哪一格（好让整张网格只占一个 Tab 位），
// 以及详情此刻该显示哪一格。两者都不受控、也不进状态，机器因此只有一个状态。
export const heatmapMachine = createMachine({
  name: 'heatmap',
  context: ({ cell }) => ({
    // 身份是对象，不给 isEqual 的话每次上报都算变更，版本号会一直空转自增
    focusedCell: cell<HeatmapCellRef | null>(() => ({ defaultValue: null, isEqual: sameHeatmapCell })),
    focusWithin: cell<boolean>(() => ({ defaultValue: false })),
    hoveredCell: cell<HeatmapCellRef | null>(() => ({ defaultValue: null, isEqual: sameHeatmapCell })),
    dismissed: cell<boolean>(() => ({ defaultValue: false })),
    // 两路各存各的量测：合成时按同一条优先级挑，内容与落点因此同源
    hoverTip: cell<HeatmapTipRect | null>(() => ({ defaultValue: null, isEqual: sameHeatmapTip })),
    focusTip: cell<HeatmapTipRect | null>(() => ({ defaultValue: null, isEqual: sameHeatmapTip })),
    // 上一次通知过的详情身份与数值，用来判「还是不是同一格、数还是不是那个数」
    activeKey: cell<string | null>(() => ({ defaultValue: null })),
  }),
  initialState: () => 'idle',
  watch: ({ track, context, action, prop }) => {
    // 详情落在哪一格由前四处 context 合成，任一变都要重算一次；
    // 其后那几项 props 是数字的来源：格子没换而数据换了，条上的数也得跟着变。
    // 合成后身份与数值都没变时 notifyActive 自己会闭嘴，回调不会重复派
    track([
      context.dep('hoveredCell'),
      context.dep('focusedCell'),
      context.dep('focusWithin'),
      context.dep('dismissed'),
      () => prop('variant'),
      () => prop('value'),
      () => prop('levels'),
      () => prop('thresholds'),
      () => prop('startDate'),
      () => prop('endDate'),
      () => prop('rows'),
      () => prop('columns'),
    ], () => action(['notifyActive']))
  },
  states: {
    idle: {
      on: {
        'CELL.FOCUS': { actions: ['setFocusedCell'] },
        'FOCUS.SET': { actions: ['setFocusedCell'] },
        'CELL.BLUR': { actions: ['clearFocusWithin'] },
        'CELL.ENTER': { actions: ['setHoveredCell'] },
        'CELL.LEAVE': { actions: ['clearHoveredCell'] },
        'DETAIL.DISMISS': { actions: ['dismissDetail'] },
      },
    },
  },
  implementations: {
    actions: {
      setFocusedCell: ({ context, prop, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.FOCUS' && e.type !== 'FOCUS.SET')
          return
        const next = e.cell
        if (e.type === 'CELL.FOCUS') {
          // 焦点真落上去了：详情跟着走，Escape 收起过也重新打开
          context.set('focusWithin', true)
          context.set('dismissed', false)
          context.set('focusTip', e.tip)
        }
        // 同一格反复聚焦（点一下再按一次方向键回来）不重复通知
        const same = sameHeatmapCell(context.get('focusedCell'), next)
        if (!same)
          context.set('focusedCell', next)
        if (same || next == null)
          return
        // 只有 DOM 焦点真的落到某一格时才通知；FOCUS.SET 只挪锚点、焦点没动，
        // 通知了就是报一件没发生的事
        if (e.type !== 'CELL.FOCUS')
          return
        // 只查这一格的数值与档位，不建整张网格：方向键每按一下都会走到这里
        prop('onCellFocus')?.(heatmapDetailsOf(heatmapGridOptions(prop), next))
      },

      clearFocusWithin: ({ context }) => {
        // 锚点留着：清掉就意味着 Tab 回来永远落回第一格
        context.set('focusWithin', false)
      },

      setHoveredCell: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'CELL.ENTER')
          return
        context.set('hoveredCell', e.cell)
        context.set('dismissed', false)
        context.set('hoverTip', e.tip)
      },

      clearHoveredCell: ({ context }) => {
        context.set('hoveredCell', null)
        // 量测跟着身份一起清：留着它，指针离开后详情会退回聚焦的那一格，
        // 却还摆在指针刚离开的那一格上
        context.set('hoverTip', null)
      },

      dismissDetail: ({ context }) => context.set('dismissed', true),

      notifyActive: ({ context, prop }) => {
        const active = heatmapActiveCell({
          hoveredCell: context.get('hoveredCell'),
          focusedCell: context.get('focusedCell'),
          focusWithin: context.get('focusWithin'),
          dismissed: context.get('dismissed'),
        })
        const details = active == null ? null : heatmapDetailsOf(heatmapGridOptions(prop), active)
        // 去重键把数值一起拼进去：格子没换而数据换了，条上的数也要跟着更新
        const key = active == null || details == null
          ? null
          : `${heatmapCellKey(active)}|${details.count}|${details.level}`
        // 悬停与聚焦落在同一格时两处 context 各变一次，合成结果没变就不必再派一次回调
        if (context.get('activeKey') === key)
          return
        context.set('activeKey', key)
        prop('onCellActive')?.(details)
      },
    },
  },
})
