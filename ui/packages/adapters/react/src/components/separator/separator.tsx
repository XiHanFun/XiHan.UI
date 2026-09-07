import type { SeparatorAlign, SeparatorProps, SeparatorVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { connectSeparator } from '@xihan-ui/headless'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { slotPaints } from '../../runtime/slot-content'
import { SeparatorProvider, useSeparatorContext } from './context'

/** 分隔本身的取值，两种写法共用这一份。 */
interface SeparatorOwnProps {
  orientation?: 'horizontal' | 'vertical'
  /** 装饰性分隔：仅视觉分组，不进无障碍树。 */
  decorative?: boolean
  /** 线怎么画，缺省 default。 */
  variant?: SeparatorVariant
  /** 画成虚线。 */
  dashed?: boolean
  /** 分节文字落在哪一侧，缺省居中。 */
  align?: SeparatorAlign
}

export interface XhSeparatorRootProps extends ComponentPropsWithRef<'div'>, SeparatorOwnProps {}

/**
 * 分隔本身。children 为空时它就是那条线；放进 XhSeparatorLine 与 XhSeparatorContent
 * 之后它改当容器，线由 line 画。
 */
export function XhSeparatorRoot({
  orientation = 'horizontal',
  decorative,
  variant,
  dashed,
  align,
  children,
  ...rest
}: XhSeparatorRootProps): ReactNode {
  const api = connectSeparator({ orientation, decorative, variant, dashed, align } as SeparatorProps, reactNormalize)
  return (
    <SeparatorProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </SeparatorProvider>
  )
}

/** 线是纯装饰，不承载内容。 */
export interface XhSeparatorLineProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {}

/** 分节文字两侧的那条线，纯装饰。 */
export function XhSeparatorLine(props: XhSeparatorLineProps): ReactNode {
  const ctx = useSeparatorContext()
  return (
    <div {...mergeReactProps(ctx.api.getLineProps() as Record<string, unknown>, props as Record<string, unknown>)} />
  )
}

export interface XhSeparatorContentProps extends ComponentPropsWithRef<'span'> {}

/** 夹在两条线中间的分节文字。 */
export function XhSeparatorContent({ children, ...rest }: XhSeparatorContentProps): ReactNode {
  const ctx = useSeparatorContext()
  return (
    <span {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhSeparatorProps extends XhSeparatorRootProps {}

/**
 * 一步到位的写法：不给 children 就是一条线；给了就自动排成「线 · 文字 · 线」三段。
 *
 * 要往分节文字里塞自定义结构（比如一枚图标加一段字）时改用
 * XhSeparatorRoot + XhSeparatorLine + XhSeparatorContent。
 */
export function XhSeparator({ children, ...rest }: XhSeparatorProps): ReactNode {
  // 空白与假分支不算给了文案：包进三段就是一条断开的线
  if (!slotPaints(children))
    return <XhSeparatorRoot {...rest} />
  return (
    <XhSeparatorRoot {...rest}>
      <XhSeparatorLine />
      <XhSeparatorContent>{children}</XhSeparatorContent>
      <XhSeparatorLine />
    </XhSeparatorRoot>
  )
}
