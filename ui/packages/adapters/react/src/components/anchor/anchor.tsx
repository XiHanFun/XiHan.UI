import type { Direction, Orientation, Size, Tone } from '@xihan-ui/core'
import type { AnchorSchema, AnchorTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { useCallback, useRef } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { AnchorProvider, useAnchorContext } from './context'
import { useAnchor } from './use-anchor'

type AnchorProps = AnchorSchema['props']

/** 根上自有的那些取值；dir 与 defaultValue 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'nav'>, 'defaultValue' | 'dir'>

export interface XhAnchorRootProps extends RootElementProps {
  value?: string | null
  defaultValue?: string | null
  collection?: readonly string[]
  offset?: number
  bounds?: number
  smooth?: boolean
  orientation?: Orientation
  dir?: Direction
  translations?: Partial<AnchorTranslations>
  tone?: Tone
  size?: Size
  /** 判定线所依附的滚动容器，缺省挂在窗口上；经 refs 交给观察器。 */
  scrollElement?: HTMLElement | null
  onValueChange?: AnchorProps['onValueChange']
  children?: ReactNode
}

/** 根节点渲染为 nav 地标。 */
export function XhAnchorRoot({
  value,
  defaultValue,
  collection,
  offset,
  bounds,
  smooth,
  orientation,
  dir,
  translations,
  tone,
  size,
  scrollElement,
  onValueChange,
  children,
  ...rest
}: XhAnchorRootProps): ReactNode {
  // 取值器每帧换、接线只建一次：现读这一帧的 scrollElement，别让它成为重建的理由
  const latest = useRef(scrollElement)
  latest.current = scrollElement
  const getScrollEl = useCallback(() => latest.current ?? null, [])
  const ctx = useAnchor(withXhConfig('anchor', {
    value,
    defaultValue,
    collection,
    offset,
    bounds,
    smooth,
    orientation,
    dir,
    translations,
    tone,
    size,
    onValueChange,
  }) as AnchorProps, getScrollEl)
  return (
    <AnchorProvider value={ctx}>
      <nav {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </nav>
    </AnchorProvider>
  )
}

XhAnchorRoot.xhEvents = ['value-change'] as const

export interface XhAnchorListProps extends ComponentPropsWithRef<'ul'> {}
// 用 ul 而非 div：目录是一组并列的去处，读屏会念「列表，共 n 项」；不用 ol，目录没有层级顺序语义。
export function XhAnchorList({ children, ...rest }: XhAnchorListProps): ReactNode {
  const ctx = useAnchorContext()
  return (
    <ul
      {...mergeReactProps(
        ctx.api.getListProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLUListElement | null) => { ctx.listRef.current = el } },
      )}
    >
      {children}
    </ul>
  )
}

export interface XhAnchorItemProps extends ComponentPropsWithRef<'li'> {}
export function XhAnchorItem({ children, ...rest }: XhAnchorItemProps): ReactNode {
  const ctx = useAnchorContext()
  return <li {...mergeReactProps(ctx.api.getItemProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</li>
}

export interface XhAnchorLinkProps extends Omit<ComponentPropsWithRef<'a'>, 'value'> {
  value: string
}
/** href 由 value 派生为 `#id`；smooth 关闭时退化为原生片段跳转。 */
export function XhAnchorLink({ value, children, ...rest }: XhAnchorLinkProps): ReactNode {
  const ctx = useAnchorContext()
  return <a {...mergeReactProps(ctx.api.getLinkProps({ value }) as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</a>
}

export interface XhAnchorLinkTextProps extends ComponentPropsWithRef<'span'> {}
/** 链接里的文字载体：链接内另有图标时，省略号只裁这一段。 */
export function XhAnchorLinkText({ children, ...rest }: XhAnchorLinkTextProps): ReactNode {
  const ctx = useAnchorContext()
  return <span {...mergeReactProps(ctx.api.getLinkTextProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhAnchorIndicatorProps extends ComponentPropsWithRef<'li'> {}
/** 指示条容器，位置由机器算好写入内联样式；渲染为 li 以 list 为定位参照系。 */
export function XhAnchorIndicator({ ...rest }: XhAnchorIndicatorProps): ReactNode {
  const ctx = useAnchorContext()
  return <li {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}
