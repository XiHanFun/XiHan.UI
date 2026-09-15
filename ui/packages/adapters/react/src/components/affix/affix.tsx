/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 affix 相关实现。

import type { AffixApi, AffixSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { AffixProvider, useAffixContext } from './context'
import { useAffix } from './use-affix'

type AffixProps = AffixSchema['props']

/** 函数式 children 的载荷：当前是否处于吸附状态。 */
export interface AffixRootSlotProps extends Pick<AffixApi, 'affixed'> {}

export interface XhAffixRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  offsetTop?: number
  offsetBottom?: number
  /** 滚动容器取值器，默认即整页滚动；挂载效应执行时求值。 */
  target?: () => HTMLElement | null
  onAffixChange?: AffixProps['onAffixChange']
  children?: SlotChildren<AffixRootSlotProps>
}

/** 根节点是占位盒：content 吸附时脱离文档流，它留在原位撑住该空间。 */
export function XhAffixRoot({
  offsetTop,
  offsetBottom,
  target,
  onAffixChange,
  children,
  ...rest
}: XhAffixRootProps): ReactNode {
  const ctx = useAffix({ offsetTop, offsetBottom, onAffixChange } as AffixProps, target)
  return (
    <AffixProvider value={ctx}>
      <div
        {...mergeReactProps(
          ctx.api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: (el: HTMLDivElement | null) => { ctx.rootRef.current = el } },
        )}
      >
        {renderSlot(children, { affixed: ctx.api.affixed })}
      </div>
    </AffixProvider>
  )
}

XhAffixRoot.xhEvents = ['affix-change'] as const

export interface XhAffixContentProps extends ComponentPropsWithRef<'div'> {}
/** 吸附时脱离常规流固定在可视区边缘，位置由状态机测量后写入内联样式。 */
export function XhAffixContent({ children, ...rest }: XhAffixContentProps): ReactNode {
  const ctx = useAffixContext()
  return (
    <div {...mergeReactProps(ctx.api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
