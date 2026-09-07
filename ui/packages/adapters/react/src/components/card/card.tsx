import type { Size } from '@xihan-ui/core'
import type { CardProps, CardVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectCard } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { CardProvider, useCardContext } from './context'

export interface XhCardRootProps extends ComponentPropsWithRef<'div'> {
  /** 形态：outline / subtle / elevated / ghost，决定描边、底色与投影怎么用。 */
  variant?: CardVariant
  /** 尺寸：sm / md / lg，决定各段的内边距与标题字号。 */
  size?: Size
  /** 指针悬停时抬起。 */
  hoverable?: boolean
  /** 在头、身、脚之间画分隔线。 */
  split?: boolean
}

/** 卡片外壳。三个视觉轴与两个开关只落在这一层，各段从这里继承。 */
export function XhCardRoot({ variant, size, hoverable, split, children, ...rest }: XhCardRootProps): ReactNode {
  const api = connectCard(withXhConfig('card', { variant, size, hoverable, split }) as CardProps, reactNormalize)
  return (
    <CardProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </CardProvider>
  )
}

export interface XhCardMediaProps extends ComponentPropsWithRef<'div'> {}

/** 封面槽：图片、视频由作者塞进来。 */
export function XhCardMedia({ children, ...rest }: XhCardMediaProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getMediaProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardHeaderProps extends ComponentPropsWithRef<'div'> {}

export function XhCardHeader({ children, ...rest }: XhCardHeaderProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardTitleProps extends ComponentPropsWithRef<'div'> {}

export function XhCardTitle({ children, ...rest }: XhCardTitleProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardDescriptionProps extends ComponentPropsWithRef<'div'> {}

export function XhCardDescription({ children, ...rest }: XhCardDescriptionProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardBodyProps extends ComponentPropsWithRef<'div'> {}

export function XhCardBody({ children, ...rest }: XhCardBodyProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhCardFooterProps extends ComponentPropsWithRef<'div'> {}

export function XhCardFooter({ children, ...rest }: XhCardFooterProps): ReactNode {
  const ctx = useCardContext()
  return (
    <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
