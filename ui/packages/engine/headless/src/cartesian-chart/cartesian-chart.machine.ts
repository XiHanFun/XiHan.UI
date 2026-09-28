/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { CartesianChartSchema } from './cartesian-chart.schema'
import type { CartesianBrushing, CartesianBrushSelection, CartesianDrag, CartesianWindow } from './cartesian-chart.types'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartCanvas,
  trackChartViewport,
} from '../shared/chart'
import { cartesianActive, cartesianDetails, cartesianMarkKey, cartesianModelOf, cartesianRenderer, cartesianTrigger, FULL_CARTESIAN_WINDOW, sameSelection, sameWindow } from './cartesian-chart.logic'
import { cartesianEntryScene, cartesianLabelNumbers, cartesianRevealAt } from './cartesian-chart.model'
import { paintCartesianCanvas } from './cartesian-chart.paint'
import { createCartesianPipeline } from './cartesian-chart.pipeline'

const { createMachine } = setup<CartesianChartSchema>()

// 直角坐标图的机器只存事实：视口量出来的尺寸与度量、指针命中了谁、键盘锚点在哪、图例怎么显隐。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，不让任何一段几何重算。
// 状态不编码进状态节点，机器只有一个状态，逻辑全在 context 与 actions。
export const cartesianChartMachine = createMachine({
  name: 'cartesian-chart',
  context: params => ({
    ...chartBaseContext(params),
    window: params.cell<CartesianWindow>(() => ({
      value: params.prop('window'),
      defaultValue: params.prop('defaultWindow') ?? FULL_CARTESIAN_WINDOW,
      isEqual: sameWindow,
      onChange: window => params.prop('onWindowChange')?.({ window }),
    })),
    windowStep: params.cell<boolean>(() => ({ defaultValue: false })),
    drag: params.cell<CartesianDrag | null>(() => ({ defaultValue: null })),
    // 刷选的范围：回调要带上范围里的数据，由 setBrush 在写入时自己派发
    brushSelection: params.cell<CartesianBrushSelection | null>(() => ({
      value: params.prop('brushSelection'),
      defaultValue: params.prop('defaultBrushSelection') ?? null,
      isEqual: sameSelection,
    })),
    brushing: params.cell<CartesianBrushing | null>(() => ({ defaultValue: null })),
    brushAnchor: params.cell<number | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({ ...chartBaseRefs(), pipeline: createCartesianPipeline(), touches: new Map(), zoomRatio: null, getCanvasEl: () => null, canvas: null }),
  computed: {
    scene: params => cartesianModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport', 'trackCanvas'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的数据由这几处合成，任一变都要重算；数据换了而激活的键没换，报出去的数也得跟着变。
    // 合成结果没变时 notifyActive 自己会闭嘴，回调不会重复派
    track([
      context.dep('hover'),
      context.dep('focused'),
      context.dep('focusWithin'),
      context.dep('dismissed'),
      context.dep('activeKey'),
      context.dep('hiddenSeries'),
      () => prop('data'),
      () => prop('series'),
      () => prop('trigger'),
      () => prop('locale'),
    ], () => action(['notifyActive']))
    // 规格换了就重新核一遍：不合法的组合经诊断通道报出，根上 data-state="error"、不画标记
    track([
      () => prop('data'),
      () => prop('series'),
      () => prop('xAxis'),
      () => prop('yAxis'),
      () => prop('orientation'),
      () => prop('annotations'),
      context.dep('hiddenSeries'),
    ], () => action(['reportIssues']))
    // 目标场景换了（数据、图例显隐、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated'), () => prop('renderer')], () => action(['syncTransition']))
    // 画布上的数据层：场景、渲染器、刷选与淡出（悬停图例、item 模式的强调）一变就排一次重绘，在宿主提交之后画
    track([
      () => computed('scene'),
      () => prop('renderer'),
      () => prop('palette'),
      () => prop('brush'),
      context.dep('brushSelection'),
      context.dep('brushing'),
      context.dep('legendHover'),
      context.dep('hover'),
    ], () => action(['requestPaint']))
  },
  on: {
    ...chartBaseTransitions<CartesianChartSchema>(),
    'WINDOW.SET': { actions: ['setWindow'] },
    'DRAG.START': { actions: ['startDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
    'BRUSH.START': { actions: ['startBrush'] },
    'BRUSH.MOVE': { actions: ['moveBrush'] },
    'BRUSH.END': { actions: ['endBrush'] },
    'BRUSH.SET': { actions: ['setBrush'] },
    'BRUSH.ANCHOR': { actions: ['setBrushAnchor'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<CartesianChartSchema>({
        markKeyOf: (params, ref) => cartesianMarkKey(cartesianModelOf(params), ref),
        // 数据点随描线出现：描线走 continuous 曲线
        transition: {
          entry: cartesianEntryScene,
          stagger: true,
          revealAt: cartesianRevealAt,
          revealEasing: 'continuous',
          numbers: params => cartesianLabelNumbers(cartesianModelOf(params).scene),
          // 缩放与平移是连续的操作：窗口一变场景直接跟到终态，不在两帧之间插值
          extent: params => params.context.get('window'),
          // 键盘缩放、滚轮一格这类一步到位的换窗补间过去；拖着平移与捏合照旧跟手
          extentStep: params => params.context.get('windowStep'),
          // 数据层画在画布上时不播几何过渡：画布直接画终态，SVG 的坐标轴与它同步落位
          geometry: params => cartesianRenderer(params.prop('renderer'), cartesianModelOf(params)) === 'svg',
        },
      }),
      notifyActive: (params) => {
        const model = cartesianModelOf(params)
        const active = cartesianActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked'
          ? null
          : cartesianDetails(model, active.ref, cartesianTrigger(params.prop('trigger'), model))
        notifyChartActive(params, details)
      },
      // 不能缩放的方向保持整条轴；越出整条轴的部分由布局按比例尺夹回来
      setWindow: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'WINDOW.SET')
          return
        const zoom = prop('zoom') ?? 'none'
        context.set('windowStep', e.step === true)
        context.set('window', {
          x: zoom === 'x' || zoom === 'xy' ? e.window.x ?? null : null,
          y: zoom === 'y' || zoom === 'xy' ? e.window.y ?? null : null,
        })
      },
      startDrag: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'DRAG.START')
          context.set('drag', e.drag)
      },
      endDrag: ({ context }) => context.set('drag', null),
      startBrush: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'BRUSH.START')
          context.set('brushing', e.brushing)
      },
      moveBrush: ({ context, event }) => {
        const e = event.current()
        const brushing = context.get('brushing')
        if (e.type === 'BRUSH.MOVE' && brushing)
          context.set('brushing', { ...brushing, to: e.to })
      },
      endBrush: ({ context }) => context.set('brushing', null),
      // 范围没变不派发：受控时由作者写回，写回的同一个范围不算变化
      setBrush: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'BRUSH.SET' || sameSelection(e.selection, context.get('brushSelection')))
          return
        context.set('brushSelection', e.selection)
        prop('onBrushSelectionChange')?.({ selection: e.selection, data: e.data })
      },
      setBrushAnchor: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'BRUSH.ANCHOR')
          context.set('brushAnchor', e.index)
      },
      requestPaint: ({ refs, flush }) => flush(() => refs.get('canvas')?.request()),
      reportIssues: (params) => {
        const model = cartesianModelOf(params)
        for (const issue of model.issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'cartesian-chart', message: issue.message, detail: issue.detail })
        // 注释指错了目标只少画那一条，图照常画：按提醒报
        for (const issue of model.warnings)
          reportDiagnostic({ code: issue.code, level: 'warn', scope: 'cartesian-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<CartesianChartSchema>(),
      trackCanvas: trackChartCanvas<CartesianChartSchema>({
        active: params => cartesianRenderer(params.prop('renderer'), cartesianModelOf(params)) === 'canvas',
        paint: paintCartesianCanvas,
      }),
    },
  },
})
