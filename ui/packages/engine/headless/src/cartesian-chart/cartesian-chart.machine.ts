/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 cartesian chart 相关实现。

import type { CartesianChartSchema } from './cartesian-chart.types'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { cartesianActive, cartesianDetails, cartesianMarkKey, cartesianModelOf, cartesianTrigger } from './cartesian-chart.logic'
import { createCartesianPipeline } from './cartesian-chart.model'

const { createMachine } = setup<CartesianChartSchema>()

// 直角坐标图的机器只存事实：视口量出来的尺寸与度量、指针命中了谁、键盘锚点在哪、图例怎么显隐。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，不让任何一段几何重算。
// 状态不编码进状态节点，机器只有一个状态，逻辑全在 context 与 actions。
export const cartesianChartMachine = createMachine({
  name: 'cartesian-chart',
  context: params => chartBaseContext(params),
  refs: () => ({ ...chartBaseRefs(), pipeline: createCartesianPipeline() }),
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, context, action, prop }) => {
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
      context.dep('hiddenSeries'),
    ], () => action(['reportIssues']))
  },
  on: chartBaseTransitions<CartesianChartSchema>(),
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<CartesianChartSchema>({
        markKeyOf: (params, ref) => cartesianMarkKey(cartesianModelOf(params), ref),
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
          : cartesianDetails(model, active.ref, cartesianTrigger(params.prop('trigger')))
        notifyChartActive(params, details)
      },
      reportIssues: (params) => {
        for (const issue of cartesianModelOf(params).issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'cartesian-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<CartesianChartSchema>(),
    },
  },
})
