/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 radar chart 相关实现。

import type { RadarChartSchema } from './radar-chart.schema'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { radarActive, radarDetails, radarMarkKey, radarModelOf } from './radar-chart.logic'
import { createRadarPipeline, radarEntryScene } from './radar-chart.model'

const { createMachine } = setup<RadarChartSchema>()

// 雷达图的机器只存事实：视口量出来的尺寸与度量、指针命中了哪个顶点、键盘锚点在哪、图例怎么显隐。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，不让任何一段几何重算。
export const radarChartMachine = createMachine({
  name: 'radar-chart',
  context: params => chartBaseContext(params),
  refs: () => ({ ...chartBaseRefs(), pipeline: createRadarPipeline() }),
  computed: {
    scene: params => radarModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的顶点由这几处合成，任一变都要重算；合成结果没变时 notifyActive 自己会闭嘴
    track([
      context.dep('hover'),
      context.dep('focused'),
      context.dep('focusWithin'),
      context.dep('dismissed'),
      context.dep('activeKey'),
      context.dep('hiddenSeries'),
      () => prop('data'),
      () => prop('nameField'),
      () => prop('indicators'),
      () => prop('locale'),
    ], () => action(['notifyActive']))
    track([
      () => prop('data'),
      () => prop('nameField'),
      () => prop('indicators'),
    ], () => action(['reportIssues']))
    // 目标场景换了（数据、图例显隐、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: chartBaseTransitions<RadarChartSchema>(),
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<RadarChartSchema>({
        markKeyOf: (params, ref) => radarMarkKey(radarModelOf(params), ref),
        // 各系列从圆心张开，按系列次序错开一步：与直角坐标图的多系列同一种入场，叠在一起的几块多边形
        // 看得出谁是谁；错开封顶，系列再多整段入场也不随之拉长
        transition: {
          entry: radarEntryScene,
          stagger: true,
          revealEasing: 'enter-strong',
        },
      }),
      notifyActive: (params) => {
        const model = radarModelOf(params)
        const active = radarActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked' ? null : radarDetails(model, active.ref)
        notifyChartActive(params, details)
      },
      reportIssues: (params) => {
        const model = radarModelOf(params)
        for (const issue of model.issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'radar-chart', message: issue.message, detail: issue.detail })
        // 实体多了多边形互相遮挡：图照常画，按提醒报
        for (const issue of model.warnings)
          reportDiagnostic({ code: issue.code, level: 'warn', scope: 'radar-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<RadarChartSchema>(),
    },
  },
})
