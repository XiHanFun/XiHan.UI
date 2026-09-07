import type { Orientation } from '@xihan-ui/core'
import type { FlexAlign, FlexGap, FlexJustify, FlexProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectFlex } from '@xihan-ui/headless'
import { Children, Fragment } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { FlexProvider, useFlexContext } from './context'

export interface XhFlexSplitProps extends ComponentPropsWithRef<'span'> {}

/**
 * 分隔符部件。写 split 时组件在每道缝里自动铺一个，
 * 手写它也铺得出同一种结构——两条路产出的 DOM 完全一致。
 */
export function XhFlexSplit({ children, ...rest }: XhFlexSplitProps): ReactNode {
  const ctx = useFlexContext()
  return (
    <span {...mergeReactProps(ctx.api.getSplitProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhFlexProps extends ComponentPropsWithRef<'div'> {
  /** 主轴方向：horizontal 横排、vertical 竖排，缺省 horizontal。 */
  orientation?: Orientation
  /** 交叉轴对齐：start / center / end / stretch / baseline。 */
  align?: FlexAlign
  /** 主轴分布：start / center / end / between / around / evenly。 */
  justify?: FlexJustify
  /** 子项间距档位：xs / sm / md / lg / xl。 */
  gap?: FlexGap
  /** 一行放不下时折行。 */
  wrap?: boolean
  /** 容器按行内盒排版，宽度收到内容。 */
  inline?: boolean
  /** 分隔符的内容：给了它，组件在每两个子项之间各铺一个分隔符部件。 */
  split?: ReactNode
}

/**
 * 把 children 摊成一个个子项。
 *
 * Children.toArray 已经丢掉 null / undefined / 布尔并把数组摊平，这里再滤掉
 * 只有空白的文本节点——它一个像素都不画，留着会插出两条挨在一起的分隔符。
 */
function flexItems(children: ReactNode): ReactNode[] {
  return Children.toArray(children).filter(node => typeof node !== 'string' || node.trim() !== '')
}

/** 在每两个子项之间铺一个分隔符部件。 */
function interleave(items: readonly ReactNode[], split: ReactNode): ReactNode[] {
  const out: ReactNode[] = []
  items.forEach((item, index) => {
    if (index > 0)
      out.push(<XhFlexSplit key={`xh-flex-split-${index}`}>{split}</XhFlexSplit>)
    out.push(<Fragment key={`xh-flex-item-${index}`}>{item}</Fragment>)
  })
  return out
}

/** 一维排布容器：六个排版参数落成根上的 data-*，换算成哪条 CSS 规则由皮肤定。 */
export function XhFlex({
  orientation,
  align,
  justify,
  gap,
  wrap,
  inline,
  split,
  children,
  ...rest
}: XhFlexProps): ReactNode {
  const api = connectFlex({ orientation, align, justify, gap, wrap, inline } as FlexProps, reactNormalize)
  // 没给分隔符时原样交出去，不摊平：摊平会替 children 重编 key，白白丢掉列表的复用信息
  const content = split == null ? children : interleave(flexItems(children), split)
  return (
    <FlexProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {content}
      </div>
    </FlexProvider>
  )
}
