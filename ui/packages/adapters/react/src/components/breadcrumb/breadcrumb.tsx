import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { BreadcrumbItem, BreadcrumbNode, BreadcrumbNodeMeta, BreadcrumbProps, BreadcrumbTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { BreadcrumbProvider, useBreadcrumbContext } from './context'
import { useBreadcrumb } from './use-breadcrumb'

export interface XhBreadcrumbRootProps extends Omit<ComponentPropsWithRef<'nav'>, 'dir'> {
  collection?: readonly BreadcrumbNode[]
  /** 最多展开几层，超出的中间层折成一个省略位。 */
  maxItems?: number
  dir?: Direction
  translations?: Partial<BreadcrumbTranslations>
  tone?: Tone
  size?: Size
  /** 分隔符的内容；不给就是一个斜杠。 */
  renderSeparator?: () => ReactNode
  /** 省略位的内容，拿得到被折起的那几层；不给就是一个省略号。 */
  renderEllipsis?: (nodes: readonly BreadcrumbNodeMeta[]) => ReactNode
}

/** 根节点渲染为 nav 地标。 */
export function XhBreadcrumbRoot({
  collection,
  maxItems,
  dir,
  translations,
  tone,
  size,
  renderSeparator,
  renderEllipsis,
  children,
  ...rest
}: XhBreadcrumbRootProps): ReactNode {
  const ctx = useBreadcrumb(
    withXhConfig('breadcrumb', { collection, maxItems, dir, translations, tone, size }) as BreadcrumbProps,
  )
  const body = children ?? (collection
    ? <DefaultTree items={ctx.api.items} renderSeparator={renderSeparator} renderEllipsis={renderEllipsis} />
    : null)
  return (
    <BreadcrumbProvider value={ctx}>
      <nav {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {body}
      </nav>
    </BreadcrumbProvider>
  )
}

export interface XhBreadcrumbListProps extends ComponentPropsWithRef<'ol'> {}
/** 渲染为 ol，把层级路径表达成有序列表。 */
export function XhBreadcrumbList({ children, ...rest }: XhBreadcrumbListProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <ol {...mergeReactProps(ctx.api.getListProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</ol>
}

export interface XhBreadcrumbItemProps extends ComponentPropsWithRef<'li'> {}
export function XhBreadcrumbItem({ children, ...rest }: XhBreadcrumbItemProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <li {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

export interface XhBreadcrumbLinkProps extends ComponentPropsWithRef<'a'> {
  /** 当前页那一条。 */
  current?: boolean
}
/** href 由作者写，这里只补当前页标记与点击守卫；当前页同样渲染为 `<a>`。 */
export function XhBreadcrumbLink({ current, children, ...rest }: XhBreadcrumbLinkProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return (
    <a {...mergeReactProps(ctx.api.getLinkProps({ current }) as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </a>
  )
}

export interface XhBreadcrumbLinkIconProps extends ComponentPropsWithRef<'span'> {}
/** 链接里的图标位，与文字并排；纯装饰。 */
export function XhBreadcrumbLinkIcon({ children, ...rest }: XhBreadcrumbLinkIconProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <span {...mergeReactProps(ctx.api.getLinkIconProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhBreadcrumbSeparatorProps extends ComponentPropsWithRef<'li'> {}
/** 分隔符与省略号同为 ol 的直接子节点，渲染为 li 并对读屏隐藏。 */
export function XhBreadcrumbSeparator({ children, ...rest }: XhBreadcrumbSeparatorProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <li {...mergeReactProps(ctx.api.getSeparatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

export interface XhBreadcrumbEllipsisProps extends ComponentPropsWithRef<'li'> {}
export function XhBreadcrumbEllipsis({ children, ...rest }: XhBreadcrumbEllipsisProps): ReactNode {
  const ctx = useBreadcrumbContext()
  return <li {...mergeReactProps(ctx.api.getEllipsisProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

/**
 * 没写 children 时按 collection 铺开的整套结构，作者只交数据。
 * 与手写部件产出的 DOM 完全一致，要改结构就写 children，行为不变。
 * 层与层之间铺分隔符，被折掉的那一段铺成一个省略位。
 */
function DefaultTree(props: {
  items: readonly BreadcrumbItem[]
  renderSeparator?: () => ReactNode
  renderEllipsis?: (nodes: readonly BreadcrumbNodeMeta[]) => ReactNode
}): ReactNode {
  const out: ReactNode[] = []
  props.items.forEach((item, index) => {
    if (index > 0)
      out.push(<XhBreadcrumbSeparator key={`sep-${index}`}>{props.renderSeparator?.() ?? '/'}</XhBreadcrumbSeparator>)
    if (item.type === 'ellipsis') {
      out.push(<XhBreadcrumbEllipsis key="ellipsis">{props.renderEllipsis?.(item.nodes) ?? '…'}</XhBreadcrumbEllipsis>)
      return
    }
    const node = item.node
    out.push(
      <XhBreadcrumbItem key={node.value}>
        <XhBreadcrumbLink current={node.current} href={node.href}>
          {node.icon ? <XhBreadcrumbLinkIcon>{node.icon}</XhBreadcrumbLinkIcon> : null}
          {node.label}
        </XhBreadcrumbLink>
      </XhBreadcrumbItem>,
    )
  })
  return <XhBreadcrumbList>{out}</XhBreadcrumbList>
}
