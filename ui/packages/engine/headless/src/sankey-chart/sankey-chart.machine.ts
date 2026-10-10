/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sankey chart 相关实现。

import type { SankeyChartSchema } from './sankey-chart.schema'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { sankeyActive, sankeyDetails, sankeyMarkKey, sankeyModelOf } from './sankey-chart.logic'
import { createSankeyPipeline, sankeyEntryScene } from './sankey-chart.model'

const { createMachine } = setup<SankeyChartSchema>()

// 桑基图的机器只存事实：视口量出来的尺寸与度量、指针命中了哪个节点或流带、键盘锚点在哪、图例怎么显隐。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，不让任何一段几何重算。
export const sankeyChartMachine = createMachine({
  name: 'sankey-chart',
  context: params => chartBaseContext(params),
  refs: () => ({ ...chartBaseRefs(), pipeline: createSankeyPipeline() }),
  computed: {
    scene: params => sankeyModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的节点或流带由这几处合成，任一变都要重算；合成结果没变时 notifyActive 自己会闭嘴
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
    track([() => prop('nodes'), () => prop('links')], () => action(['reportIssues']))
    // 目标场景换了（数据、图例显隐、尺寸、度量）就安排过渡；animated 与 animateInView 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated'), () => prop('animateInView')], () => action(['syncTransition']))
  },
  on: chartBaseTransitions<SankeyChartSchema>(),
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<SankeyChartSchema>({
        markKeyOf: (params, ref) => sankeyMarkKey(sankeyModelOf(params), ref),
        // 流带与节点一起淡入：流量是一整张图一起读的，不按分组错开
        transition: {
          entry: sankeyEntryScene,
          stagger: false,
          revealEasing: 'enter-strong',
        },
      }),
      notifyActive: (params) => {
        const model = sankeyModelOf(params)
        const active = sankeyActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked' ? null : sankeyDetails(model, active.ref)
        notifyChartActive(params, details)
      },
      reportIssues: (params) => {
        const model = sankeyModelOf(params)
        for (const issue of model.issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'sankey-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<SankeyChartSchema>(),
    },
  },
})
