/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 progress 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type {
  ProgressApi,
  ProgressGapPosition,
  ProgressIndicator,
  ProgressProps,
  ProgressScaleOptions,
  ProgressSemantics,
  ProgressThreshold,
  ProgressTranslations,
  ProgressVariant,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectProgress } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

export interface XhProgressProps extends ComponentPropsWithRef<'div'> {
  /** 当前进度值，越界会被夹取到 [0, max]。 */
  value?: number
  /** 进度未知：进度条改为往复动画，读屏侧不播报数值。 */
  indeterminate?: boolean
  /** 满值上限，默认 100。 */
  max?: number
  /** 形态，默认 line。circle 绘制整环，dashboard 在环上留一个缺口。 */
  variant?: ProgressVariant
  /** 环的线宽，使用 viewBox 单位，默认 6；只对环形生效。 */
  strokeWidth?: number
  /** 缺口角度，默认 75；只对 dashboard 生效。 */
  gapDegree?: number
  /** 缺口朝向，默认 bottom；只对 dashboard 生效。 */
  gapPosition?: ProgressGapPosition
  /** 读屏播报的文字，覆盖默认的数值播报。 */
  valueText?: string
  /** 语气：决定使用哪族颜色。 */
  tone?: Tone
  /** 尺寸：线形改变轨道厚度，环形改变直径。 */
  size?: Size
  /** 报告的是进度还是量，默认 progress。 */
  semantics?: ProgressSemantics
  /** 分段：升序的上界，每段带语气与名字，画成轨道上的色带；只在 meter 语义下生效。 */
  thresholds?: readonly ProgressThreshold[]
  /** 目标值：画一道目标刻度；只在 meter 语义下生效。 */
  target?: number
  /** 量程刻度与刻度值；只在 meter 语义下生效。 */
  scale?: boolean | ProgressScaleOptions
  /** 仪表盘的指示方式，默认 fill；只在 meter 语义下的 dashboard 生效。 */
  indicator?: ProgressIndicator
  /** 刻度值与读屏文字的语言。 */
  locale?: string
  translations?: Partial<ProgressTranslations>
}

type Attrs = Record<string, unknown>

/** 刻度值的容器：没开刻度时不渲染。线形里连刻度线一起放，环形的刻度线画在 canvas 里。 */
function Scale({ api, withTicks }: { api: ProgressApi, withTicks: boolean }): ReactNode {
  if (api.ticks.length === 0)
    return null
  return (
    <div {...api.getScaleProps() as Attrs}>
      {withTicks ? api.ticks.map(tick => <span key={`t${tick.key}`} {...api.getScaleTickProps(tick) as Attrs} />) : null}
      {api.ticks.map(tick => <span key={`l${tick.key}`} {...api.getScaleLabelProps(tick) as Attrs}>{tick.label}</span>)}
    </div>
  )
}

/**
 * 进度条。线形渲染为一条轨道加一段进度，环形把同一份进度绘制进一个 svg。
 *
 * children 是环心区域的内容，只在环形下渲染。
 */
export function XhProgress({
  value,
  indeterminate,
  max,
  variant,
  strokeWidth,
  gapDegree,
  gapPosition,
  valueText,
  tone,
  size,
  semantics,
  thresholds,
  target,
  scale,
  indicator,
  locale,
  translations,
  children,
  ...rest
}: XhProgressProps): ReactNode {
  const api = connectProgress(
    withXhConfig('progress', {
      value,
      indeterminate,
      max,
      variant,
      strokeWidth,
      gapDegree,
      gapPosition,
      valueText,
      tone,
      size,
      semantics,
      thresholds,
      target,
      scale,
      indicator,
      locale,
      translations,
    }) as ProgressProps,
    reactNormalize,
  )
  const rootProps = mergeReactProps(
    api.getRootProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )

  if (api.variant === 'line') {
    return (
      <div {...rootProps}>
        <div {...api.getTrackProps() as Attrs}>
          {api.bands.map(band => <div key={band.key} {...api.getThresholdProps(band) as Attrs} />)}
          <div {...api.getRangeProps() as Attrs} />
        </div>
        {api.target == null ? null : <div {...api.getTargetProps() as Attrs} />}
        <Scale api={api} withTicks />
      </div>
    )
  }

  // 环心的内容归作者：没写就不渲染那一层，免得一个空盒子压在环上挡住指针
  return (
    <div {...rootProps}>
      <svg {...api.getCanvasProps() as Attrs}>
        <circle {...api.getTrackProps() as Attrs} />
        {api.bands.map(band => <circle key={band.key} {...api.getThresholdProps(band) as Attrs} />)}
        <circle {...api.getRangeProps() as Attrs} />
        {api.ticks.map(tick => <line key={tick.key} {...api.getScaleTickProps(tick) as Attrs} />)}
        {api.target == null ? null : <line {...api.getTargetProps() as Attrs} />}
        {api.indicator === 'needle' ? <path {...api.getNeedleProps() as Attrs} /> : null}
      </svg>
      <Scale api={api} withTicks={false} />
      {slotPaints(children)
        ? <div {...api.getLabelProps() as Record<string, unknown>}>{children}</div>
        : null}
    </div>
  )
}
