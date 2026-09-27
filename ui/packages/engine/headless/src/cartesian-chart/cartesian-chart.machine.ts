/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { CartesianChartSchema, CartesianDrag, CartesianWindow } from './cartesian-chart.types'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import { clampWindow, FULL_WINDOW } from '@xihan-ui/viz'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { cartesianActive, cartesianDetails, cartesianMarkKey, cartesianModelOf, cartesianTrigger, FULL_CARTESIAN_WINDOW, sameWindow } from './cartesian-chart.logic'
import { cartesianEntryScene, cartesianLabelNumbers, cartesianRevealAt, createCartesianPipeline } from './cartesian-chart.model'

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
    drag: params.cell<CartesianDrag | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({ ...chartBaseRefs(), pipeline: createCartesianPipeline(), touches: new Map() }),
  computed: {
    scene: params => cartesianModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
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
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: {
    ...chartBaseTransitions<CartesianChartSchema>(),
    'WINDOW.SET': { actions: ['setWindow'] },
    'DRAG.START': { actions: ['startDrag'] },
    'DRAG.END': { actions: ['endDrag'] },
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
      // 窗口夹在 [0, 1] 里；不能缩放的方向保持整条轴
      setWindow: ({ context, event, prop }) => {
        const e = event.current()
        if (e.type !== 'WINDOW.SET')
          return
        const zoom = prop('zoom') ?? 'none'
        context.set('window', {
          x: zoom === 'x' || zoom === 'xy' ? clampWindow(e.window.x) : FULL_WINDOW,
          y: zoom === 'y' || zoom === 'xy' ? clampWindow(e.window.y) : FULL_WINDOW,
        })
      },
      startDrag: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'DRAG.START')
          context.set('drag', e.drag)
      },
      endDrag: ({ context }) => context.set('drag', null),
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
    },
  },
})
