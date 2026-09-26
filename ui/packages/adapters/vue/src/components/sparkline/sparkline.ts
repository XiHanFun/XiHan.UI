/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 sparkline 相关实现。

import type { Tone } from '@xihan-ui/core'
import type {
  SparklineCurve,
  SparklineMarkers,
  SparklineSchema,
  SparklineTranslations,
  SparklineVariant,
} from '@xihan-ui/headless'
import type { NumberFormatSpec } from '@xihan-ui/viz'
import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { useSparkline } from './use-sparkline'

type SparklineProps = SparklineSchema['props']

/**
 * 迷你图：整张图是一个 `<svg role="img">`，随文排版，可及名写在根上的 aria-label。
 * 摘要（`<desc>`）排在最前，其后按场景画参考带、面积、折线、柱与标记点，都是 `<path>`。
 */
export const XhSparkline = defineComponent({
  name: 'XhSparkline',
  // 缺省值由机器与 connect 决定；普通类型省略 default，Boolean 显式保留 undefined
  props: {
    data: { type: Array as PropType<SparklineProps['data']> },
    x: { type: String },
    y: { type: String },
    variant: { type: String as PropType<SparklineVariant> },
    curve: { type: String as PropType<SparklineCurve> },
    markers: { type: String as PropType<SparklineMarkers> },
    band: { type: Array as unknown as PropType<readonly [number, number]> },
    tone: { type: String as PropType<Tone> },
    format: { type: [Object, Function] as PropType<NumberFormatSpec | ((value: number) => string)> },
    animated: { type: Boolean, default: undefined },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<SparklineTranslations>> },
  },
  setup(props) {
    const ctx = useSparkline(withXhConfig('sparkline', props) as SparklineProps)
    return () => {
      const api = ctx.api.value
      const { back, data, front } = api.scene.layers
      return h('svg', {
        ...api.getRootProps() as Record<string, unknown>,
        ref: (el: unknown) => { ctx.rootRef.value = el as SVGSVGElement },
      }, [
        h('desc', api.getSummaryProps() as Record<string, unknown>, api.summary),
        ...[...back, ...data, ...front].map(mark => h('path', { ...api.getMarkProps(mark) as Record<string, unknown>, key: mark.key })),
      ])
    }
  },
})
