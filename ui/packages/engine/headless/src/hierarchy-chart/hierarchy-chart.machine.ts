/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 hierarchy chart 相关实现。

import type { HierarchyChartSchema } from './hierarchy-chart.schema'
import { reportDiagnostic, setup } from '@xihan-ui/core'
import {
  chartBaseActions,
  chartBaseContext,
  chartBaseRefs,
  chartBaseTransitions,
  notifyChartActive,
  trackChartViewport,
} from '../shared/chart'
import { hierarchyActive, hierarchyDetails, hierarchyMarkKey, hierarchyModelOf } from './hierarchy-chart.logic'
import { createHierarchyPipeline, hierarchyEntryScene } from './hierarchy-chart.model'

const { createMachine } = setup<HierarchyChartSchema>()

// 层级图的机器只存事实：视口量出来的尺寸与度量、指针命中了哪个节点、键盘锚点在哪、当前下钻到哪个根。
// 几何全在管线里，连接层与机器读同一条管线；悬停与聚焦只改状态，换根才换派生那一段的输入。
export const hierarchyChartMachine = createMachine({
  name: 'hierarchy-chart',
  context: (params) => {
    const { prop, cell } = params
    return {
      ...chartBaseContext(params),
      rootKey: cell<string | null>(() => ({
        value: prop('rootKey'),
        defaultValue: prop('defaultRootKey') ?? null,
        onChange: rootKey => prop('onRootKeyChange')?.({ rootKey }),
      })),
    }
  },
  refs: () => ({ ...chartBaseRefs(), pipeline: createHierarchyPipeline() }),
  computed: {
    scene: params => hierarchyModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, context, action, prop, computed }) => {
    // 激活的节点由这几处合成，任一变都要重算；合成结果没变时 notifyActive 自己会闭嘴
    track([
      context.dep('hover'),
      context.dep('focused'),
      context.dep('focusWithin'),
      context.dep('dismissed'),
      context.dep('activeKey'),
      context.dep('rootKey'),
      () => prop('data'),
      () => prop('nameField'),
      () => prop('valueField'),
      () => prop('locale'),
    ], () => action(['notifyActive']))
    track([
      () => prop('data'),
      () => prop('childrenField'),
      () => prop('idField'),
      () => prop('parentField'),
      () => prop('valueField'),
      () => prop('colorBy'),
    ], () => action(['reportIssues']))
    // 目标场景换了（数据、下钻、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: {
    ...chartBaseTransitions<HierarchyChartSchema>(),
    'ROOT.SET': { actions: ['setRoot'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      ...chartBaseActions<HierarchyChartSchema>({
        markKeyOf: (params, ref) => hierarchyMarkKey(hierarchyModelOf(params), ref),
        // 各节点一起出现：层级占比看的是整体的切分，不按分支错开
        transition: {
          entry: hierarchyEntryScene,
          stagger: false,
          revealEasing: 'enter-strong',
        },
      }),
      // 换根后指针下的那个节点多半已经不在原处：清掉悬停，等指针再动一下重新命中
      setRoot: ({ context, event }) => {
        const e = event.current()
        if (e.type !== 'ROOT.SET')
          return
        context.set('rootKey', e.key)
        context.set('hover', null)
      },
      notifyActive: (params) => {
        const model = hierarchyModelOf(params)
        const active = hierarchyActive(model, {
          hover: params.context.get('hover'),
          focused: params.context.get('focused'),
          focusWithin: params.context.get('focusWithin'),
          dismissed: params.context.get('dismissed'),
          activeKey: params.context.get('activeKey'),
        })
        // 联动过来的键不算本图的激活：那是另一张图在报，本图再报一次就成了回声
        const details = active == null || active.source === 'linked' ? null : hierarchyDetails(model, active.ref)
        notifyChartActive(params, details)
      },
      reportIssues: (params) => {
        const model = hierarchyModelOf(params)
        for (const issue of model.issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'hierarchy-chart', message: issue.message, detail: issue.detail })
      },
    },
    effects: {
      trackViewport: trackChartViewport<HierarchyChartSchema>(),
    },
  },
})
