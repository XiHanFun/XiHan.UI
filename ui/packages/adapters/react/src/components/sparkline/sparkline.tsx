/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { Tone } from '@xihan-ui/core'
import type {
  NumberFormatSpec,
  SparklineCurve,
  SparklineMarkers,
  SparklineSchema,
  SparklineTranslations,
  SparklineVariant,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { useSparkline } from './use-sparkline'

type SparklineProps = SparklineSchema['props']

export interface XhSparklineProps extends Omit<ComponentPropsWithRef<'svg'>, 'children' | 'x' | 'y' | 'format'> {
  /** 数值数组，或对象数组配合 x / y 指明字段；null、undefined 与 NaN 是缺失，折线在此断开。 */
  data?: SparklineProps['data']
  /** 对象数组的横坐标字段；是数值或日期时按它的间距排开。 */
  x?: string
  /** 对象数组的数值字段。 */
  y?: string
  /** 形态，默认 line。 */
  variant?: SparklineVariant
  /** 折线与面积的插值，默认 linear。 */
  curve?: SparklineCurve
  /** 标记点，默认 last。 */
  markers?: SparklineMarkers
  /** 参考带 [下界, 上界]。 */
  band?: readonly [number, number]
  /** 语气，默认 neutral。 */
  tone?: Tone
  /** 摘要里的数值格式。 */
  format?: NumberFormatSpec | ((value: number) => string)
  /** 播放过渡动画，默认开。 */
  animated?: boolean
  locale?: string
  translations?: Partial<SparklineTranslations>
}

/**
 * 迷你图：整张图是一个 `<svg role="img">`，随文排版，可及名写在根上的 aria-label。
 * 摘要（`<desc>`）排在最前，其后按场景画参考带、面积、折线、柱与标记点，都是 `<path>`。
 */
export function XhSparkline({
  data,
  x,
  y,
  variant,
  curve,
  markers,
  band,
  tone,
  format,
  animated,
  locale,
  translations,
  ...rest
}: XhSparklineProps): ReactNode {
  const ctx = useSparkline(withXhConfig('sparkline', {
    data,
    x,
    y,
    variant,
    curve,
    markers,
    band,
    tone,
    format,
    animated,
    locale,
    translations,
  }) as SparklineProps)
  const { api } = ctx
  const { back, data: layer, front } = api.scene.layers
  return (
    <svg
      {...mergeReactProps(
        api.getRootProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: SVGSVGElement | null) => { ctx.rootRef.current = el } },
      )}
    >
      <desc {...api.getSummaryProps() as Record<string, unknown>}>{api.summary}</desc>
      {[...back, ...layer, ...front].map(mark => <path key={mark.key} {...api.getMarkProps(mark) as Record<string, unknown>} />)}
    </svg>
  )
}
