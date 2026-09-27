/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { Params } from '@xihan-ui/core'
import type { ChartFrame, ChartMetrics, ChartSize, ChartTransitionOptions, ChartTransitionState } from '../shared/chart'
import type { SparklineSchema } from './sparkline.schema'
import { DIAGNOSTIC_CODES, reportDiagnostic, setup } from '@xihan-ui/core'
import {
  advanceChartTransition,
  CHART_METRICS,
  sameChartMetrics,
  syncChartTransition,
  trackChartViewport,
} from '../shared/chart'
import { sparklineModelOf } from './sparkline.logic'
import { createSparklinePipeline, sparklineEntryScene, sparklineRevealAt } from './sparkline.model'

const { createMachine } = setup<SparklineSchema>()

function sameSize(a: ChartSize | null, b: ChartSize | null | undefined): boolean {
  return a === b || (a != null && b != null && a.width === b.width && a.height === b.height)
}

// 只有一条系列，同一时刻整条一起描出、一起长出，不错开；标记点等笔尖到了才出现
const TRANSITION: ChartTransitionOptions = {
  entry: sparklineEntryScene,
  stagger: false,
  revealAt: sparklineRevealAt,
}

/** 把机器的几片状态交给过渡：时长与减弱动效从根上读，根就是 `<svg>`。 */
function transitionState(params: Params<SparklineSchema>): ChartTransitionState {
  const { context, refs, prop, scope, computed, send } = params
  return {
    animated: prop('animated') !== false,
    target: computed('scene'),
    numbers: {},
    size: context.get('size'),
    metrics: context.get('metrics'),
    // 迷你图不画文字，文字度量器换了也不必重排
    measurerVersion: 0,
    // 迷你图没有缩放窗口一类的框架
    extent: null,
    plot: refs.get('getRootEl')(),
    win: scope.getWin(),
    shown: refs.get('shown'),
    run: refs.get('transition'),
    frame: context.get('frame'),
    setShown: shown => refs.set('shown', shown),
    setRun: run => refs.set('transition', run),
    setFrame: frame => context.set('frame', frame),
    requestFrame: () => send({ type: 'SCENE.FRAME' }),
  }
}

// 迷你图的机器只存事实：根量出来的尺寸与度量、过渡正显示哪一帧。几何全在管线里，
// 连接层与机器读同一条管线；没有悬停、聚焦与键盘，也就没有激活态。
export const sparklineMachine = createMachine({
  name: 'sparkline',
  context: ({ cell }) => ({
    size: cell<ChartSize | null>(() => ({ defaultValue: null, isEqual: sameSize })),
    metrics: cell<ChartMetrics>(() => ({ defaultValue: CHART_METRICS, isEqual: sameChartMetrics })),
    frame: cell<ChartFrame | null>(() => ({ defaultValue: null })),
  }),
  refs: () => ({
    getRootEl: () => null,
    getViewportEl: () => null,
    alive: false,
    transition: null,
    shown: null,
    pipeline: createSparklinePipeline(),
  }),
  computed: {
    scene: params => sparklineModelOf(params).scene?.scene ?? null,
  },
  initialState: () => 'idle',
  // 建机器就核一遍规格：watch 只在依赖变化时跑，挂载那一刻的不合法组合得在这里报
  entry: ['reportIssues'],
  effects: ['trackViewport'],
  watch: ({ track, action, prop, computed }) => {
    track([
      () => prop('data'),
      () => prop('x'),
      () => prop('y'),
      () => prop('band'),
      () => prop('variant'),
      () => prop('markers'),
    ], () => action(['reportIssues']))
    // 目标场景换了（数据、形态、尺寸、度量）就安排过渡；animated 改了也要重新核一遍
    track([() => computed('scene'), () => prop('animated')], () => action(['syncTransition']))
  },
  on: {
    'RESIZE': { actions: ['setSize'] },
    'METRICS': { actions: ['setMetrics'] },
    'SCENE.FRAME': { actions: ['advanceTransition'] },
  },
  states: {
    idle: {},
  },
  implementations: {
    actions: {
      setSize: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'RESIZE')
          context.set('size', e.size)
      },
      setMetrics: ({ context, event }) => {
        const e = event.current()
        if (e.type === 'METRICS')
          context.set('metrics', e.metrics)
      },
      syncTransition: params => syncChartTransition(transitionState(params), TRANSITION),
      advanceTransition: params => advanceChartTransition(transitionState(params)),
      reportIssues: (params) => {
        for (const issue of sparklineModelOf(params).issues)
          reportDiagnostic({ code: issue.code, level: 'error', scope: 'sparkline', message: issue.message, detail: issue.detail })
        // 盈亏形态只看正负：参考带与标记点在这里没有意义，写了就说一声，不静默吞掉
        const { prop } = params
        if (prop('variant') !== 'win-loss')
          return
        if (prop('band') != null)
          reportDiagnostic({ code: DIAGNOSTIC_CODES.warn, level: 'warn', scope: 'sparkline', message: '盈亏形态不画参考带，band 被忽略' })
        const markers = prop('markers')
        if (markers != null && markers !== 'none')
          reportDiagnostic({ code: DIAGNOSTIC_CODES.warn, level: 'warn', scope: 'sparkline', message: '盈亏形态不画标记点，markers 被忽略', detail: { markers } })
      },
    },
    effects: {
      // 不画文字：不建文字度量器
      trackViewport: trackChartViewport<SparklineSchema>({ text: false }),
    },
  },
})
