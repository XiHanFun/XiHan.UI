import type { Size } from '@xihan-ui/core'
import type { DescriptionsColumns, DescriptionsPlacement, DescriptionsProps } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { connectDescriptions } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { DescriptionsProvider, useDescriptionsContext } from './context'

export interface XhDescriptionsRootProps extends ComponentPropsWithRef<'dl'> {
  /** 每行摆几组，一到六列；不写即每行一组。 */
  columns?: DescriptionsColumns
  /** 外框：给整份描述画一圈描边，并在格与格之间画网格线。 */
  bordered?: boolean
  /** 标签的位置：top / left；不写即标签在上。 */
  placement?: DescriptionsPlacement
  /** 尺寸：sm / md / lg。 */
  size?: Size
  /** 根渲染成哪个标签，默认 dl。 */
  as?: ElementType
}

/** 一组只读的「标签 + 取值」：三个轴与一个开关只落在这一层，各格从这里继承。 */
export function XhDescriptionsRoot({
  columns,
  bordered,
  placement,
  size,
  as = 'dl',
  children,
  ...rest
}: XhDescriptionsRootProps): ReactNode {
  const configured = withXhConfig('descriptions', { columns, bordered, placement, size }) as DescriptionsProps
  const api = connectDescriptions(configured, reactNormalize)
  const Tag = as as 'dl'
  return (
    <DescriptionsProvider value={{ api }}>
      <Tag {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </Tag>
    </DescriptionsProvider>
  )
}

export interface XhDescriptionsItemProps extends ComponentPropsWithRef<'div'> {
  /** 每一格渲染成哪个标签，默认 div。 */
  as?: ElementType
  /** 这一格横跨几列，不写即占一列；上限是根上的 columns。 */
  span?: number
}

/** 一组「标签 + 取值」包一层，让它成为网格里的一格。 */
export function XhDescriptionsItem({ as = 'div', span, children, ...rest }: XhDescriptionsItemProps): ReactNode {
  const ctx = useDescriptionsContext()
  const Tag = as as 'div'
  return (
    <Tag {...mergeReactProps(ctx.api.getItemProps({ span }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhDescriptionsLabelProps extends ComponentPropsWithRef<'dt'> {
  /** 标签渲染成哪个标签，默认 dt。 */
  as?: ElementType
}

export function XhDescriptionsLabel({ as = 'dt', children, ...rest }: XhDescriptionsLabelProps): ReactNode {
  const ctx = useDescriptionsContext()
  const Tag = as as 'dt'
  return (
    <Tag {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhDescriptionsValueProps extends ComponentPropsWithRef<'dd'> {
  /** 取值渲染成哪个标签，默认 dd。 */
  as?: ElementType
}

export function XhDescriptionsValue({ as = 'dd', children, ...rest }: XhDescriptionsValueProps): ReactNode {
  const ctx = useDescriptionsContext()
  const Tag = as as 'dd'
  return (
    <Tag {...mergeReactProps(ctx.api.getValueProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}
