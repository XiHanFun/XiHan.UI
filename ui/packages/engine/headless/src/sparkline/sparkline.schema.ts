/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 定义 sparkline 状态机与连接层契约，和不依赖实现的公开类型分开，避免类型环。

import type { MachineSchema, PropTypes, Tone } from '@xihan-ui/core'
import type { Mark, NumberFormatSpec, Scene } from '@xihan-ui/viz'
import type { ChartFrame, ChartMetrics, ChartOffset, ChartRow, ChartShown, ChartSize, ChartTransitionRun } from '../shared/chart'
import type { SparklineModel, SparklinePipeline } from './sparkline.model'
import type { SparklineCurve, SparklineMarkers, SparklineTranslations, SparklineVariant } from './sparkline.types'

export interface SparklineSchema extends MachineSchema {
  props: {
    /** 数据：数值数组，或对象数组配合 x / y 指明字段。null、undefined 与 NaN 是缺失，折线在此断开，不按 0 画。 */
    data?: readonly (number | null | undefined)[] | readonly ChartRow[]
    /** 对象数组的横坐标字段；是数值或日期时折线按它的间距排开，缺省按数据次序等距排开。 */
    x?: string
    /** 对象数组的数值字段。 */
    y?: string
    /** 形态，缺省 line。 */
    variant?: SparklineVariant
    /** 折线与面积的插值，缺省 linear。 */
    curve?: SparklineCurve
    /** 标记点，缺省 last；柱形态下是把这几根柱换成强调色，盈亏形态不标。 */
    markers?: SparklineMarkers
    /** 参考带 [下界, 上界]：正常区间画成一条淡底，纵向范围扩到把它包进来。盈亏形态不画。 */
    band?: readonly [number, number]
    /** 语气，缺省 neutral：线与柱取弱化色、标记取品牌色；其余语气整条取语气色。 */
    tone?: Tone
    /** 数值格式：摘要里的数值用它写。 */
    format?: NumberFormatSpec | ((value: number) => string)
    /**
     * 播放过渡动画，缺省 true：首次出现时折线从头描到尾、柱从基线长出，数据变化时从当前位置插值到新位置。
     * false 时直接画终态。系统开了减弱动效或容器写了 data-motion="reduce" 时几何直接落到终态，只保留淡入淡出。
     */
    animated?: boolean
    /** 数字格式与内建文案的语言；未提供时按宿主语言。 */
    locale?: string
    translations?: Partial<SparklineTranslations>
  }
  context: {
    /** 根的尺寸；null 表示尚未测量（服务端与首帧）。 */
    size: ChartSize | null
    metrics: ChartMetrics
    /** 过渡中正在显示的那一帧；null 表示显示目标场景本身。 */
    frame: ChartFrame | null
  }
  computed: {
    /** 目标场景；null 表示此刻不画（未测量、规格不合法）。 */
    scene: Scene | null
  }
  refs: {
    /** 根节点（`<svg>`），由适配器注入；它既是尺寸观测的宿主，也是时长与减弱动效的读取点。 */
    getRootEl: () => Element | null
    /** 与根相同：视口量测按「视口」取节点。 */
    getViewportEl: () => Element | null
    alive: boolean
    transition: ChartTransitionRun | null
    shown: ChartShown | null
    /** 管线：按输入引用分段记忆，输入不变整条走缓存。 */
    pipeline: SparklinePipeline
  }
  state: 'idle'
  event:
    | { type: 'RESIZE', size: ChartSize | null, offset: ChartOffset }
    | { type: 'METRICS', metrics: ChartMetrics }
    /** 过渡的逐帧推进。 */
    | { type: 'SCENE.FRAME' }
  tag: never
  guard: never
  action: 'setSize' | 'setMetrics' | 'syncTransition' | 'advanceTransition' | 'reportIssues'
  effect: 'trackViewport'
}

export interface SparklineApi<T extends PropTypes = PropTypes> {
  /** 管线产物：规格、场景与摘要。 */
  model: SparklineModel
  /** 要画的场景；尚未测量时为空场景。 */
  scene: Scene
  /** 已经量过尺寸、画得出来。 */
  measured: boolean
  /** 没有一个有值的点。 */
  empty: boolean
  summary: string
  getRootProps: () => T['element']
  getSummaryProps: () => T['element']
  getMarkProps: (mark: Mark) => T['element']
}
