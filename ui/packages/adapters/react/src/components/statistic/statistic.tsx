/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 statistic 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { StatisticProps, StatisticStructureOptions, StatisticTrend } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectStatistic, statisticStructure } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { renderStructure } from '../../runtime/structure'
import { StatisticProvider, useStatisticContext } from './context'

export interface XhStatisticRootProps extends Omit<ComponentPropsWithRef<'div'>, 'prefix'> {
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 语气：决定使用哪族颜色。 */
  tone?: Tone
  /** 涨跌方向，写为涨跌段的 data-trend；与语气正交。 */
  trend?: StatisticTrend
  /** 数值。按 locale 与 formatOptions 格式化后写进 value 部件；部件里写了内容就照写的显示。 */
  value?: number
  /** 交给 Intl.NumberFormat 的选项：小数位、分组、货币、百分比、单位、紧凑记数等。 */
  formatOptions?: Intl.NumberFormatOptions
  /** BCP 47 语言标记；未提供时取全局配置，再没有按宿主语言。 */
  locale?: string
  // —— 不给 children 时的标准结构（statisticStructure）——
  /** 标签。是字符串时作文字，是别的节点时由 label 部件装着。 */
  label?: ReactNode
  /** 数值前的货币符号或图标，铺进 prefix 部件。 */
  prefix?: ReactNode
  /** 数值后的单位或百分号，铺进 suffix 部件。 */
  suffix?: ReactNode
  /** 涨跌段的比数文字（「同比 12%」），铺进 trend 部件。 */
  trendText?: string
}

/** 一块统计数的外壳。两个视觉轴只落在这一层，各段从这里继承。 */
export function XhStatisticRoot({ size, tone, trend, value, formatOptions, locale, label, prefix, suffix, trendText, children, ...rest }: XhStatisticRootProps): ReactNode {
  const api = connectStatistic(withXhConfig('statistic', { size, tone, trend, value, formatOptions, locale }) as StatisticProps, reactNormalize)
  return (
    <StatisticProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps(), rest)}>
        {children ?? renderDefaultStructure({ valueText: api.valueText, trend: api.trend, trendText }, { label, prefix, suffix })}
      </div>
    </StatisticProvider>
  )
}

export interface XhStatisticLabelProps extends ComponentPropsWithRef<'span'> {}

/** 标签渲染为 span 而不是 label：它不关联任何表单控件。 */
export function XhStatisticLabel({ children, ...rest }: XhStatisticLabelProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhStatisticValueProps extends ComponentPropsWithRef<'span'> {}

/** children 里写了内容就照写的显示；没写时铺 root 的 value 按语言格式化好的那串字。 */
export function XhStatisticValue({ children, ...rest }: XhStatisticValueProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueProps(), rest)}>
      {/* children 落空（条件渲染没画出东西）时退回格式化好的数值 */}
      {slotPaints(children) ? children : ctx.api.valueText}
    </span>
  )
}

export interface XhStatisticPrefixProps extends ComponentPropsWithRef<'span'> {}

export function XhStatisticPrefix({ children, ...rest }: XhStatisticPrefixProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getPrefixProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhStatisticSuffixProps extends ComponentPropsWithRef<'span'> {}

export function XhStatisticSuffix({ children, ...rest }: XhStatisticSuffixProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getSuffixProps(), rest)}>
      {children}
    </span>
  )
}

export interface XhStatisticTrendProps extends ComponentPropsWithRef<'span'> {}

/** 涨跌段：方向由 root 的 trend 给出，箭头由皮肤绘制，比数由作者写入。 */
export function XhStatisticTrend({ children, ...rest }: XhStatisticTrendProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getTrendProps(), rest)}>
      {children}
    </span>
  )
}

/** 标准结构里各部件对应的组件。 */
const STATISTIC_PARTS = {
  label: XhStatisticLabel,
  prefix: XhStatisticPrefix,
  value: XhStatisticValue,
  suffix: XhStatisticSuffix,
  trend: XhStatisticTrend,
}

interface StatisticSections {
  readonly label: ReactNode
  readonly prefix: ReactNode
  readonly suffix: ReactNode
}

/**
 * 未写 children 时铺开的整套结构：照 headless 的 statisticStructure 渲，与 Web Components 不写部件时元素生成的节点出自同一份。
 * 标签是字符串时作文字，是别的节点时由 label 部件装着；前后缀由同名部件装着；数值是格式化好的文字。
 */
function renderDefaultStructure(text: Omit<StatisticStructureOptions, 'label' | 'slotted'>, { label, prefix, suffix }: StatisticSections): ReactNode[] {
  const sections: Readonly<Record<string, ReactNode>> = {
    label: typeof label === 'string' ? undefined : label,
    prefix,
    suffix,
  }
  return renderStructure(
    statisticStructure({ ...text, label: typeof label === 'string' ? label : undefined, slotted: name => sections[name] != null }),
    STATISTIC_PARTS,
    node => (node.slot ? sections[node.slot.name] : undefined),
  )
}
