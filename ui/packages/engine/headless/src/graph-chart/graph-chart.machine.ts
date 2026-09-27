/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 graph chart 相关实现。

import type { Params } from '@xihan-ui/core'
import type { GraphSimulationRef } from './graph-chart.model'
import type { GraphChartSchema, GraphView } from './graph-chart.types'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import { frameLoop, resolveMotionPreference } from '@xihan-ui/motion'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  memoizeLast,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { graphActive, graphDetails, graphMarkKey, graphModelOf } from './graph-chart.logic'
import { createGraphPipeline, createGraphSimulation, graphEntryScene } from './graph-chart.model'

const { createMachine } = setup<GraphChartSchema>()

/** 拖着的节点：模拟一直保持这么热，邻居跟着动；松手后降到 0、冷却到收敛。 */
const DRAG_ALPHA = 0.3
/** 按下后挪过这么远（px）才算拖动：再近的是点击。 */
const DRAG_SLOP = 3
const HOME_VIEW: GraphView = Object.freeze({ k: 1, x: 0, y: 0 })

type GraphParams = Params<GraphChartSchema>

/** 布局坐标：屏幕坐标减去平移、除以缩放。 */
function toWorld(view: GraphView, at: { x: number, y: number }): { x: number, y: number } {
  return { x: (at.x - view.x) / view.k, y: (at.y - view.y) / view.k }
}

function writePositions({ context }: GraphParams, ref: GraphSimulationRef): void {
  const out: Record<string, { x: number, y: number }> = {}
  ref.ids.forEach((id, i) => {
    const p = ref.sim.nodes[i]!
    out[id] = { x: p.x, y: p.y }
  })
  context.set('positions', out)
}

function stopSettle({ refs }: GraphParams): void {
  refs.get('settle')?.()
  refs.set('settle', null)
}

/** 关了过渡或减弱动效时不逐帧放模拟：拖着时每一步当场推进，松手后一次跑到收敛。 */
function reduced({ refs, prop }: GraphParams): boolean {
  return prop('animated') === false || resolveMotionPreference(refs.get('getViewportEl')() ?? refs.get('getRootEl')()) === 'reduce'
}

// 关系图的机器只存事实：视口量出来的尺寸与度量、指针命中了哪个节点、键盘锚点在哪、图例怎么显隐、拖动后的位置与画布视图。
// 底图在管线里；拖动时另建一个活着的模拟，逐帧把位置写回 positions，管线只把它盖在底图上。
export const graphChartMachine = createMachine({
  name: 'graph-chart',
  context: (params) => {
    const { cell } = params
    return {
      ...chartBaseContext(params),
      positions: cell<GraphChartSchema['context']['positions']>(() => ({ defaultValue: null })),
      view: cell<GraphView>(() => ({ defaultValue: HOME_VIEW })),
      drag: cell<GraphChartSchema['context']['drag']>(() => ({ defaultValue: null })),
    }
  },
  refs: () => ({
    ...chartBaseRefs(),
    pipeline: createGraphPipeline(),
    simulation: null,
    settle: null,
    dragMoved: false,
    extent: memoizeLast((positions: GraphChartSchema['context']['positions'], view: GraphView) => ({ positions, view })),
  }),
  computed: {
    scene: params => graphModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport', 'stopSimulation'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的节点由这几处合成，任一变都要重算；合成结果没变时 notifyActive 自己会闭嘴
    track([
      context.dep('hover'),
      context.dep('focused'),
      context.dep('focusWithin'),
      context.dep('dismissed'),
      context.dep('activeKey'),
      context.dep('hiddenSeries'),
      () => prop('nodes'),
      () => prop('links'),
      () => prop('locale'),
    ], () => action(['notifyActive']))
    track([() => prop('nodes'), () => prop('links'), () => prop('layout'), () => prop('root')], () => action(['reportIssues']))
    // 数据、布局、尺寸或图例显隐一变，拖动后的位置就作废；zoom 关掉时视图回到原样
    track([
      () => prop('nodes'),
      () => prop('links'),
      () => prop('layout'),
      () => prop('root'),
      () => prop('zoom'),
      context.dep('size'),
      context.dep('hiddenSeries'),
    ], () => action(['resetPositions']))
    // 目标场景换了（数据、图例显隐、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: {
    ...chartBaseTransitions<GraphChartSchema>(),
    'DRAG.START': { actions: ['startDrag'] },
    'DRAG.MOVE': { actions: ['moveDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
    'SIM.FRAME': { actions: ['advanceSimulation'] },
    'VIEW.SET': { actions: ['setView'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<GraphChartSchema>({
        markKeyOf: (params, ref) => graphMarkKey(graphModelOf(params), ref),
        // 节点从圆心一起长出，连线淡入：关系是整张一起读的，不按分组错开
        transition: {
          entry: graphEntryScene,
          stagger: false,
          revealEasing: 'enter-strong',
          // 拖动与平移缩放是直接操纵：画面跟手，不播过渡
          extent: ({ refs, context }) => refs.get('extent')(context.get('positions'), context.get('view')),
        },
      }),

      startDrag: (params) => {
        const { context, refs, event, scope, send } = params
        const e = event.current()
        if (e.type !== 'DRAG.START')
          return
        context.set('drag', e.drag)
        context.set('hover', null)
        refs.set('dragMoved', false)
        if (e.drag.id == null)
          return
        const model = graphModelOf(params)
        const layout = model.scene?.layout
        if (!model.base || !layout)
          return
        // 接着上一次还没冷却完的模拟拖：位置连续，不重建
        let ref = refs.get('simulation')
        if (!ref || ref.base !== model.base) {
          ref = createGraphSimulation(model.base, layout.placed)
          refs.set('simulation', ref)
        }
        const i = ref.index.get(e.drag.id)
        if (i == null)
          return
        const at = toWorld(e.drag.view, e.at)
        ref.sim.fix(i, at.x, at.y)
        ref.sim.reheat(Math.max(ref.sim.alpha(), DRAG_ALPHA))
        ref.sim.setAlphaTarget(DRAG_ALPHA)
        const win = scope.getWin()
        if (!reduced(params) && win && !refs.get('settle'))
          refs.set('settle', frameLoop(win, () => send({ type: 'SIM.FRAME' })))
      },

      moveDrag: (params) => {
        const { context, refs, event } = params
        const e = event.current()
        const drag = context.get('drag')
        if (e.type !== 'DRAG.MOVE' || !drag || drag.id == null)
          return
        if (Math.hypot(e.at.x - drag.from.x, e.at.y - drag.from.y) > DRAG_SLOP)
          refs.set('dragMoved', true)
        const ref = refs.get('simulation')
        const i = ref?.index.get(drag.id)
        if (!ref || i == null)
          return
        const at = toWorld(drag.view, e.at)
        ref.sim.fix(i, at.x, at.y)
        // 没有逐帧循环（减弱动效）时当场推进一步
        if (!refs.get('settle')) {
          ref.sim.tick(1)
          writePositions(params, ref)
        }
      },

      endDrag: (params) => {
        const { context, refs } = params
        const drag = context.get('drag')
        context.set('drag', null)
        if (!drag || drag.id == null)
          return
        const ref = refs.get('simulation')
        const i = ref?.index.get(drag.id)
        if (!ref || i == null)
          return
        ref.sim.release(i)
        ref.sim.setAlphaTarget(0)
        // 没有逐帧循环时一次冷却到收敛
        if (!refs.get('settle')) {
          ref.sim.run()
          writePositions(params, ref)
          refs.set('simulation', null)
        }
      },

      advanceSimulation: (params) => {
        const { context, refs } = params
        const ref = refs.get('simulation')
        if (!ref) {
          stopSettle(params)
          return
        }
        ref.sim.tick(1)
        writePositions(params, ref)
        // 松了手、冷却到了底：停下循环，撤掉模拟
        if (!context.get('drag') && ref.sim.alpha() < 0.001) {
          stopSettle(params)
          refs.set('simulation', null)
        }
      },

      setView: ({ context, refs, event }) => {
        const e = event.current()
        if (e.type !== 'VIEW.SET')
          return
        const drag = context.get('drag')
        if (drag && drag.id == null && (e.view.x !== drag.view.x || e.view.y !== drag.view.y))
          refs.set('dragMoved', true)
        context.set('view', e.view)
      },

      resetPositions: (params) => {
        const { context, refs, prop } = params
        stopSettle(params)
        refs.set('simulation', null)
        if (context.get('positions') != null)
          context.set('positions', null)
        if (prop('zoom') !== true && context.get('view') !== HOME_VIEW)
          context.set('view', HOME_VIEW)
      },

      notifyActive: (params) => {
        const model = graphModelOf(params)
        const active = graphActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked' ? null : graphDetails(model, active.ref)
        notifyChartActive(params, details)
      },

      reportIssues: (params) => {
        const model = graphModelOf(params)
        for (const issue of model.issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'graph-chart', message: issue.message, detail: issue.detail })
        // 节点多了交互变慢：图照常画，按提醒报
        for (const issue of model.warnings)
          reportDiagnostic({ code: issue.code, level: 'warn', scope: 'graph-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<GraphChartSchema>(),
      // 卸载时停掉还在冷却的逐帧循环
      stopSimulation: params => () => stopSettle(params),
    },
  },
})
