import type { Direction, Size, Tone } from '@xihan-ui/core'
import type { CollapsibleSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import { renderAsChild } from '../../runtime/as-child'
import { mergePartProps, mergeReactProps } from '../../runtime/merge-props'
import { CollapsibleProvider, useCollapsibleContext } from './context'
import { useCollapsible } from './use-collapsible'

type CollapsibleProps = CollapsibleSchema['props']

/** 根上自有的那些取值；dir 与原生的同名属性含义不同，由这里接管。 */
type RootElementProps = Omit<ComponentPropsWithRef<'div'>, 'dir'>

export interface XhCollapsibleRootProps extends RootElementProps {
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  tone?: Tone
  size?: Size
  dir?: Direction
  onOpenChange?: CollapsibleProps['onOpenChange']
  children?: ReactNode
}

export function XhCollapsibleRoot({
  open,
  defaultOpen,
  disabled,
  tone,
  size,
  dir,
  onOpenChange,
  children,
  ...rest
}: XhCollapsibleRootProps): ReactNode {
  const ctx = useCollapsible({ open, defaultOpen, disabled, tone, size, dir, onOpenChange } as CollapsibleProps)
  return (
    <CollapsibleProvider value={ctx}>
      <div {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {children}
      </div>
    </CollapsibleProvider>
  )
}

XhCollapsibleRoot.xhEvents = ['open-change'] as const

export interface XhCollapsibleHeaderProps extends ComponentPropsWithRef<'div'> {}
/** 触发器与其同排内容住的那一行；只写触发器时可以不用它。 */
export function XhCollapsibleHeader({ children, ...rest }: XhCollapsibleHeaderProps): ReactNode {
  const ctx = useCollapsibleContext()
  return <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</div>
}

export interface XhCollapsibleTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}
export function XhCollapsibleTrigger({ children, asChild, ...rest }: XhCollapsibleTriggerProps): ReactNode {
  const ctx = useCollapsibleContext()
  const props = mergePartProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'collapsible', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhCollapsibleIndicatorProps extends ComponentPropsWithRef<'span'> {}
export function XhCollapsibleIndicator({ children, ...rest }: XhCollapsibleIndicatorProps): ReactNode {
  const ctx = useCollapsibleContext()
  return <span {...mergeReactProps(ctx.api.getIndicatorProps() as Record<string, unknown>, rest as Record<string, unknown>)}>{children}</span>
}

export interface XhCollapsibleContentProps extends ComponentPropsWithRef<'div'> {}
export function XhCollapsibleContent({ children, ...rest }: XhCollapsibleContentProps): ReactNode {
  const ctx = useCollapsibleContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        {
          // 收起跟着退场闸门走：皮肤刻意没给 content 补 [hidden]{display:none}（补了退场
          // 就一帧都播不出来），所以真正的收起落成内联 display——节点始终留在原地
          style: ctx.visible ? undefined : { display: 'none' },
          ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el },
        },
      )}
    >
      {children}
    </div>
  )
}
