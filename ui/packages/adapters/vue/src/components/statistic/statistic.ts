/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 statistic 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { StatisticProps, StatisticStructureOptions, StatisticTrend } from '@xihan-ui/headless'
import type { PropType, SlotsType, VNode } from 'vue'
import type { PropsOf } from '../../runtime/props-of'
import { connectStatistic, statisticStructure } from '@xihan-ui/headless'
import { computed, defineComponent, h } from 'vue'
import { withXhConfig } from '../../config/config'
import { vueNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { provideStatistic, useStatisticContext } from './context'

export const XhStatisticRoot = defineComponent({
  name: 'XhStatisticRoot',
  // 有 connect 兜底的 prop：普通类型省略 default，Boolean 显式保留 undefined
  props: {
    size: { type: String as PropType<Size> },
    tone: { type: String as PropType<Tone> },
    trend: { type: String as PropType<StatisticTrend> },
    /** 数值。按 locale 与 formatOptions 格式化后写进 value 部件；部件里写了内容就照写的显示。 */
    value: { type: Number },
    /** 交给 Intl.NumberFormat 的选项：小数位、分组、货币、百分比、单位、紧凑记数等。 */
    formatOptions: { type: Object as PropType<Intl.NumberFormatOptions> },
    /** BCP 47 语言标记；未提供时取全局配置，再没有按宿主语言。 */
    locale: { type: String },
    /** 标签文字。不写默认插槽时铺 label 部件；需要放置其他内容时改用 label 插槽。 */
    label: { type: String },
    /** 涨跌段的比数文字（「同比 12%」）。不写默认插槽时铺进 trend 部件。 */
    trendText: { type: String },
  },
  slots: Object as SlotsType<{
    default?: () => VNode[]
    /** 标签，压过 label。 */
    label?: () => VNode[]
    /** 数值前的货币符号或图标。 */
    prefix?: () => VNode[]
    /** 数值后的单位或百分号。 */
    suffix?: () => VNode[]
  }>,
  setup(props, { slots }) {
    // withXhConfig 只能在 setup 期调，连接层在渲染期读这份代理
    const configured = withXhConfig('statistic', props)
    const api = computed(() => connectStatistic(configured as StatisticProps, vueNormalize))
    provideStatistic({ api })
    return () => h('div', api.value.getRootProps(), slots.default
      ? slots.default()
      : renderDefaultStructure(
          { label: props.label, valueText: api.value.valueText, trend: api.value.trend, trendText: props.trendText },
          { label: slots.label, prefix: slots.prefix, suffix: slots.suffix },
        ))
  },
})

// 标签渲染为 span 而不是 label：它不关联任何表单控件
export const XhStatisticLabel = defineComponent({
  name: 'XhStatisticLabel',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getLabelProps(), slots.default?.())
  },
})

// 插槽里写了内容就照写的显示；没写时铺 root 的 value 按语言格式化好的那串字
export const XhStatisticValue = defineComponent({
  name: 'XhStatisticValue',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => {
      const content = slots.default?.()
      // 插槽为空（含 v-if 落空只剩注释节点）时退回格式化好的数值
      return h('span', ctx.api.value.getValueProps(), slotPaints(content) ? content : ctx.api.value.valueText)
    }
  },
})

export const XhStatisticPrefix = defineComponent({
  name: 'XhStatisticPrefix',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getPrefixProps(), slots.default?.())
  },
})

export const XhStatisticSuffix = defineComponent({
  name: 'XhStatisticSuffix',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getSuffixProps(), slots.default?.())
  },
})

// 涨跌那一段：方向由 root 的 trend 给，箭头由皮肤画，比数（同比、环比）由作者写进来
export const XhStatisticTrend = defineComponent({
  name: 'XhStatisticTrend',
  setup(_, { slots }) {
    const ctx = useStatisticContext()
    return () => h('span', ctx.api.value.getTrendProps(), slots.default?.())
  },
})

/** 标准结构里各部件对应的组件。 */
const STATISTIC_PARTS = {
  label: XhStatisticLabel,
  prefix: XhStatisticPrefix,
  value: XhStatisticValue,
  suffix: XhStatisticSuffix,
  trend: XhStatisticTrend,
}

type StatisticSectionSlots = Readonly<Partial<Record<'label' | 'prefix' | 'suffix', () => VNode[]>>>

/**
 * 未写默认插槽时铺开的整套结构：照 headless 的 statisticStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 标签取文字或 label 插槽，前后缀取同名插槽，数值是格式化好的文字，涨跌给了方向或比数文字才铺。
 */
function renderDefaultStructure(text: Omit<StatisticStructureOptions, 'slotted'>, sections: StatisticSectionSlots): VNode[] {
  const nodes = statisticStructure({ ...text, slotted: name => sections[name as keyof StatisticSectionSlots] != null })
  return renderStructure(nodes, STATISTIC_PARTS, node => (node.slot ? sections[node.slot.name as keyof StatisticSectionSlots]?.() : undefined))
}

// 各组件接受的 props，与 React 同名
export type XhStatisticLabelProps = PropsOf<typeof XhStatisticLabel>
export type XhStatisticPrefixProps = PropsOf<typeof XhStatisticPrefix>
export type XhStatisticRootProps = PropsOf<typeof XhStatisticRoot>
export type XhStatisticSuffixProps = PropsOf<typeof XhStatisticSuffix>
export type XhStatisticTrendProps = PropsOf<typeof XhStatisticTrend>
export type XhStatisticValueProps = PropsOf<typeof XhStatisticValue>
