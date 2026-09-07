import type { Size } from '@xihan-ui/core'
import type { PageHeaderProps, PageHeaderVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react'
import { connectPageHeader } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { reactNormalize } from '../../runtime/normalize-props'
import { PageHeaderProvider, usePageHeaderContext } from './context'

export interface XhPageHeaderRootProps extends ComponentPropsWithRef<'div'> {
  /** 尺寸：sm / md / lg，决定标题字号与整块的上下留白。 */
  size?: Size
  /** 底部画一条分隔线，把页头与下面的内容分开。 */
  bordered?: boolean
  /** 形态：plain / surface / raised。不写即不画面，与写 plain 同一个样子。 */
  variant?: PageHeaderVariant
}

/** 页头外壳。两个视觉轴与分隔线开关只落在这一层，各段从这里继承。 */
export function XhPageHeaderRoot({ size, bordered, variant, children, ...rest }: XhPageHeaderRootProps): ReactNode {
  const api = connectPageHeader(
    withXhConfig('page-header', { size, bordered, variant }) as PageHeaderProps,
    reactNormalize,
  )
  return (
    <PageHeaderProvider value={{ api }}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </PageHeaderProvider>
  )
}

export interface XhPageHeaderBreadcrumbProps extends ComponentPropsWithRef<'div'> {}

/** 面包屑位：整行排在标题之上，装什么归作者。 */
export function XhPageHeaderBreadcrumb({ children, ...rest }: XhPageHeaderBreadcrumbProps): ReactNode {
  const ctx = usePageHeaderContext()
  return (
    <div {...mergeReactProps(ctx.api.getBreadcrumbProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPageHeaderMediaProps extends ComponentPropsWithRef<'div'> {}

/** 头像 / 图标位：排在返回位与标题之间，图形本身归作者。 */
export function XhPageHeaderMedia({ children, ...rest }: XhPageHeaderMediaProps): ReactNode {
  const ctx = usePageHeaderContext()
  return (
    <div {...mergeReactProps(ctx.api.getMediaProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPageHeaderBackTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 渲染成哪个标签，默认 button。 */
  as?: ElementType
}

/**
 * 返回位：组件只给身份与位置，按钮本身归作者。
 * 不自动补 type="button"，落在表单里需自行声明。
 */
export function XhPageHeaderBackTrigger({ as = 'button', children, ...rest }: XhPageHeaderBackTriggerProps): ReactNode {
  const ctx = usePageHeaderContext()
  const Tag = as as 'button'
  return (
    <Tag {...mergeReactProps(ctx.api.getBackTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhPageHeaderTitleProps extends ComponentPropsWithRef<'div'> {
  /** 渲染成哪个标签，默认 div；这一块在页面大纲里确实是标题时写 h1（或 hN）。 */
  as?: ElementType
}

/** 标题默认渲染为 div：它只做视觉主次，组件自己不往文档大纲里插一级标题。 */
export function XhPageHeaderTitle({ as = 'div', children, ...rest }: XhPageHeaderTitleProps): ReactNode {
  const ctx = usePageHeaderContext()
  const Tag = as as 'div'
  return (
    <Tag {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </Tag>
  )
}

export interface XhPageHeaderDescriptionProps extends ComponentPropsWithRef<'div'> {}

/** 副标题与标题排在同一行，放编号、状态这类补充信息。 */
export function XhPageHeaderDescription({ children, ...rest }: XhPageHeaderDescriptionProps): ReactNode {
  const ctx = usePageHeaderContext()
  return (
    <div {...mergeReactProps(ctx.api.getDescriptionProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPageHeaderExtraProps extends ComponentPropsWithRef<'div'> {}

/** 操作槽只排版，按钮由作者放进来。 */
export function XhPageHeaderExtra({ children, ...rest }: XhPageHeaderExtraProps): ReactNode {
  const ctx = usePageHeaderContext()
  return (
    <div {...mergeReactProps(ctx.api.getExtraProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhPageHeaderFooterProps extends ComponentPropsWithRef<'div'> {}

/** 页脚整行另起，装描述、标签页或一组摘要。 */
export function XhPageHeaderFooter({ children, ...rest }: XhPageHeaderFooterProps): ReactNode {
  const ctx = usePageHeaderContext()
  return (
    <div {...mergeReactProps(ctx.api.getFooterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
