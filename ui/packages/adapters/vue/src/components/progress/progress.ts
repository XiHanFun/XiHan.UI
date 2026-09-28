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
import type { PropType, VNode } from 'vue'
import { connectProgress } from '@xihan-ui/headless'
import { defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'

type Attrs = Record<string, unknown>

/** 刻度值的容器：没开刻度时不渲染。线形里连刻度线一起放，环形的刻度线画在 canvas 里。 */
function renderScale(a: ProgressApi, withTicks: boolean): VNode[] {
  if (a.ticks.length === 0)
    return []
  const ticks = withTicks ? a.ticks.map(tick => h('span', { ...a.getScaleTickProps(tick) as Attrs, key: `t${tick.key}` })) : []
  const labels = a.ticks.map(tick => h('span', { ...a.getScaleLabelProps(tick) as Attrs, key: `l${tick.key}` }, tick.label))
  return [h('div', a.getScaleProps() as Attrs, [...ticks, ...labels])]
}

export const XhProgress = defineComponent({
  name: 'XhProgress',
  props: {
    value: { type: Number, default: 0 },
    indeterminate: Boolean,
    max: { type: Number, default: 100 },
    // 缺省值都在 connect 里收口，这边一律不预设
    variant: { type: String as PropType<ProgressVariant> },
    strokeWidth: { type: Number },
    gapDegree: { type: Number },
    gapPosition: { type: String as PropType<ProgressGapPosition> },
    valueText: { type: String },
    tone: String as PropType<Tone>,
    size: String as PropType<Size>,
    semantics: { type: String as PropType<ProgressSemantics> },
    thresholds: { type: Array as PropType<readonly ProgressThreshold[]> },
    target: { type: Number },
    scale: { type: [Boolean, Object] as PropType<boolean | ProgressScaleOptions>, default: undefined },
    indicator: { type: String as PropType<ProgressIndicator> },
    steps: { type: Number },
    striped: { type: Boolean, default: undefined },
    buffer: { type: Number },
    locale: { type: String },
    translations: { type: Object as PropType<Partial<ProgressTranslations>> },
  },
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('progress', props)
    return () => {
      const a = connectProgress(configured as ProgressProps, vueNormalize)
      const rootProps = a.getRootProps() as Attrs
      if (a.variant === 'line') {
        return h('div', rootProps, [
          h('div', a.getTrackProps() as Attrs, [
            ...a.bands.map(band => h('div', { ...a.getThresholdProps(band) as Attrs, key: band.key })),
            // 缓冲段排在填充之前，被它压住；没有缓冲值时不渲染
            ...(a.buffer == null ? [] : [h('div', a.getBufferProps() as Attrs)]),
            h('div', a.getRangeProps() as Attrs),
          ]),
          ...(a.target == null ? [] : [h('div', a.getTargetProps() as Attrs)]),
          ...renderScale(a, true),
        ])
      }
      // 环心的内容归作者：没写就不渲染那一层，免得一个空盒子压在环上挡住指针
      const label = slots.default?.()
      const children: unknown[] = [
        h('svg', a.getCanvasProps() as Attrs, [
          h('circle', a.getTrackProps() as Attrs),
          ...a.bands.map(band => h('circle', { ...a.getThresholdProps(band) as Attrs, key: band.key })),
          h('circle', a.getRangeProps() as Attrs),
          ...a.ticks.map(tick => h('line', { ...a.getScaleTickProps(tick) as Attrs, key: tick.key })),
          ...(a.target == null ? [] : [h('line', a.getTargetProps() as Attrs)]),
          ...(a.indicator === 'needle' ? [h('path', a.getNeedleProps() as Attrs)] : []),
        ]),
        ...renderScale(a, false),
      ]
      if (slotPaints(label))
        children.push(h('div', a.getLabelProps() as Attrs, label))
      return h('div', rootProps, children as never)
    }
  },
})
