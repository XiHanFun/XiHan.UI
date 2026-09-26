/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 pie chart 相关实现。

import type { PieChartSchema } from './pie-chart.types'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { pieActive, pieDetails, pieMarkKey, pieModelOf, pieTranslations } from './pie-chart.logic'
import { createPiePipeline, pieEntryScene } from './pie-chart.model'

const { createMachine } = setup<PieChartSchema>()

// 饼图的机器只存事实：视口量出来的尺寸与度量、指针命中了哪个扇区、键盘锚点在哪、图例怎么显隐。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，不让任何一段几何重算。
export const pieChartMachine = createMachine({
  name: 'pie-chart',
  context: params => chartBaseContext(params),
  refs: () => ({ ...chartBaseRefs(), pipeline: createPiePipeline() }),
  computed: {
    scene: params => pieModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的扇区由这几处合成，任一变都要重算；合成结果没变时 notifyActive 自己会闭嘴
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
      () => prop('locale'),
    ], () => action(['notifyActive']))
    track([
      () => prop('data'),
      () => prop('nameField'),
      () => prop('valueField'),
      () => prop('maxSlices'),
    ], () => action(['reportIssues']))
    // 目标场景换了（数据、图例显隐、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: chartBaseTransitions<PieChartSchema>(),
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<PieChartSchema>({
        markKeyOf: (params, ref) => pieMarkKey(pieModelOf(params), ref),
        // 扇区是同一整圈里的几块，错开就断成了几段，整圈一起扫开
        transition: { entry: pieEntryScene, stagger: false },
      }),
      notifyActive: (params) => {
        const model = pieModelOf(params)
        const active = pieActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked'
          ? null
          : pieDetails(model, active.ref, pieTranslations(params.prop('translations')))
        notifyChartActive(params, details)
      },
      reportIssues: (params) => {
        for (const issue of pieModelOf(params).issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'pie-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<PieChartSchema>(),
    },
  },
})
