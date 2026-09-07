import type { Size, Tone } from '@xihan-ui/core'
import type { StatisticProps, StatisticTrend } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectStatistic } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { StatisticProvider, useStatisticContext } from './context'

export interface XhStatisticRootProps extends ComponentPropsWithRef<'div'> {
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 语气：决定用哪族颜色。 */
  tone?: Tone
  /** 涨跌方向，落成涨跌那一段的 data-direction；与语气正交。 */
  trend?: StatisticTrend
}

/** 一块统计数的外壳。两个视觉轴只落在这一层，各段从这里继承。 */
export function XhStatisticRoot({ size, tone, trend, children, ...rest }: XhStatisticRootProps): ReactNode {
  const api = connectStatistic(withXhConfig('statistic', { size, tone, trend }) as StatisticProps, reactNormalize)
  return (
    <StatisticProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </StatisticProvider>
  )
}

export interface XhStatisticLabelProps extends ComponentPropsWithRef<'span'> {}

/** 标签渲染为 span 而不是 label：它不关联任何表单控件。 */
export function XhStatisticLabel({ children, ...rest }: XhStatisticLabelProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhStatisticValueProps extends ComponentPropsWithRef<'span'> {}

/** 数值由作者格式化好再塞进来，组件只负责排版。 */
export function XhStatisticValue({ children, ...rest }: XhStatisticValueProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getValueProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhStatisticPrefixProps extends ComponentPropsWithRef<'span'> {}

export function XhStatisticPrefix({ children, ...rest }: XhStatisticPrefixProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getPrefixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhStatisticSuffixProps extends ComponentPropsWithRef<'span'> {}

export function XhStatisticSuffix({ children, ...rest }: XhStatisticSuffixProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getSuffixProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhStatisticTrendProps extends ComponentPropsWithRef<'span'> {}

/** 涨跌那一段：方向由 root 的 trend 给，箭头由皮肤画，比数由作者写进来。 */
export function XhStatisticTrend({ children, ...rest }: XhStatisticTrendProps): ReactNode {
  const ctx = useStatisticContext()
  return (
    <span {...mergeReactProps(ctx.api.getTrendProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}
