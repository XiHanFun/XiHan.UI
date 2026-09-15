/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 tag 相关实现。

import type { Size, Tone } from '@xihan-ui/core'
import type { TagSchema, TagTranslations, TagVariant } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { TagContext } from './use-tag'
import { useState } from 'react'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { slotIsPlainText } from '../../runtime/slot-content'
import { TagProvider, useTagContext } from './context'
import { useStaticTag, useTag } from './use-tag'

type TagProps = TagSchema['props']

export interface XhTagRootProps extends ComponentPropsWithRef<'span'> {
  variant?: TagVariant
  tone?: Tone
  size?: Size
  /** 是否提供关闭按钮；未传时由 connect 决定默认，传 false 才真正关闭。 */
  closable?: boolean
  disabled?: boolean
  /** 只读：关闭按钮留在原地但不可按下，标签本身不置灰。 */
  readOnly?: boolean
  /** 受控显隐；省略该 prop 即非受控。 */
  open?: boolean
  /** 非受控初始显隐，默认显示。 */
  defaultOpen?: boolean
  translations?: Partial<TagTranslations>
  onOpenChange?: TagProps['onOpenChange']
}

/**
 * 标签随文排列，根使用 span 才能位于一行文字中。
 *
 * 挂载时是否提供关闭按钮，决定该标签是否运行状态机：不提供关闭按钮时 OPEN / CLOSE 两条路径都不可达，
 * 展开态恒等于 `open ?? defaultOpen ?? true`。判据取挂载时的值，之后不再改变：
 * React 的 hook 不能按条件调用，两条路径各自是一个组件。
 */
export function XhTagRoot(props: XhTagRootProps): ReactNode {
  const [runsMachine] = useState(() => !!props.closable)
  return runsMachine ? <MachineTagRoot {...props} /> : <StaticTagRoot {...props} />
}

XhTagRoot.xhEvents = ['open-change'] as const

/** 运行状态机的路径。 */
function MachineTagRoot({
  variant,
  tone,
  size,
  closable,
  disabled,
  readOnly,
  open,
  defaultOpen,
  translations,
  onOpenChange,
  children,
  ...rest
}: XhTagRootProps): ReactNode {
  const ctx = useTag(withXhConfig('tag', {
    variant,
    tone,
    size,
    closable,
    disabled,
    readOnly,
    open,
    defaultOpen,
    translations,
    onOpenChange,
  }) as TagProps)
  return renderTagRoot(ctx, rest as Record<string, unknown>, children)
}

/** 不建立状态机的路径。 */
function StaticTagRoot({
  variant,
  tone,
  size,
  closable,
  disabled,
  readOnly,
  open,
  defaultOpen,
  translations,
  onOpenChange,
  children,
  ...rest
}: XhTagRootProps): ReactNode {
  const ctx = useStaticTag(withXhConfig('tag', {
    variant,
    tone,
    size,
    closable,
    disabled,
    readOnly,
    open,
    defaultOpen,
    translations,
    onOpenChange,
  }) as TagProps)
  return renderTagRoot(ctx, rest as Record<string, unknown>, children)
}

/** 两条路径共用的结构；不含 hook，直接调用不占一层组件。 */
function renderTagRoot(ctx: TagContext, rest: Record<string, unknown>, children: ReactNode): ReactNode {
  // children 里只有文字时替它包一层 label：截断规则挂在 label 上，
  // 直接摊在 root 上的文字过长会把关闭钮挤出去。作者自己写了节点就原样放行
  const body = slotIsPlainText(children) ? <XhTagLabel>{children}</XhTagLabel> : children
  return (
    <TagProvider value={ctx}>
      <span {...mergeReactProps(ctx.api.getRootProps() as Record<string, unknown>, rest)}>
        {body}
      </span>
    </TagProvider>
  )
}

export interface XhTagLabelProps extends ComponentPropsWithRef<'span'> {}

/** 标签文字所在的块，横向空间不足时由皮肤截断。 */
export function XhTagLabel({ children, ...rest }: XhTagLabelProps): ReactNode {
  const ctx = useTagContext()
  return (
    <span {...mergeReactProps(ctx.api.getLabelProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </span>
  )
}

export interface XhTagCloseTriggerProps extends ComponentPropsWithRef<'button'> {}

/** 关闭按钮：使用原生 button，Enter / Space 的激活交给平台。 */
export function XhTagCloseTrigger({ children, ...rest }: XhTagCloseTriggerProps): ReactNode {
  const ctx = useTagContext()
  return (
    <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}
