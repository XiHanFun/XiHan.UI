/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 funnel chart 相关实现。

import type { FunnelChartSchema } from './funnel-chart.types'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { funnelActive, funnelDetails, funnelMarkKey, funnelModelOf } from './funnel-chart.logic'
import { createFunnelPipeline, funnelEntryScene } from './funnel-chart.model'

const { createMachine } = setup<FunnelChartSchema>()

// 漏斗图的机器只存事实：视口量出来的尺寸与度量、指针命中了哪个阶段、键盘锚点在哪、哪些阶段被隐藏。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，不让任何一段几何重算。
export const funnelChartMachine = createMachine({
  name: 'funnel-chart',
  context: params => chartBaseContext(params),
  refs: () => ({ ...chartBaseRefs(), pipeline: createFunnelPipeline() }),
  computed: {
    scene: params => funnelModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的阶段由这几处合成，任一变都要重算；合成结果没变时 notifyActive 自己会闭嘴
    track([
      context.dep('hover'),
      context.dep('focused'),
      context.dep('focusWithin'),
      context.dep('dismissed'),
      context.dep('activeKey'),
      context.dep('hiddenSeries'),
      () => prop('data'),
      () => prop('nameField'),
      () => prop('valueField'),
      () => prop('conversion'),
      () => prop('locale'),
    ], () => action(['notifyActive']))
    track([
      () => prop('data'),
      () => prop('nameField'),
      () => prop('valueField'),
    ], () => action(['reportIssues']))
    // 目标场景换了（数据、图例显隐、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: chartBaseTransitions<FunnelChartSchema>(),
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<FunnelChartSchema>({
        markKeyOf: (params, ref) => funnelMarkKey(funnelModelOf(params), ref),
        // 各阶段一起横向展开：阶段之间要比的是宽度，错开就比不成了
        transition: {
          entry: funnelEntryScene,
          stagger: false,
          revealEasing: 'enter-strong',
        },
      }),
      notifyActive: (params) => {
        const model = funnelModelOf(params)
        const active = funnelActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked' ? null : funnelDetails(model, active.ref)
        notifyChartActive(params, details)
      },
      reportIssues: (params) => {
        const model = funnelModelOf(params)
        for (const issue of model.issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'funnel-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<FunnelChartSchema>(),
    },
  },
})
