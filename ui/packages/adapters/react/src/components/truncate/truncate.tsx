/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 truncate 相关实现。

import type { TruncateApi, TruncatePosition, TruncateSchema, TruncateTranslations } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode, Ref } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { useTruncate } from './use-truncate'

type TruncateProps = TruncateSchema['props']

/** 函数式 children 的载荷：展开态与测得的是否溢出，以及展开与重新测量的方法。 */
export type TruncateSlotProps = Pick<TruncateApi, 'open' | 'overflowing' | 'setOpen' | 'measure'>

/** trigger 的载荷：展开态与按钮此刻的缺省文案。 */
export type TruncateTriggerSlotProps = Pick<TruncateApi, 'open' | 'triggerLabel'>

export interface XhTruncateProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 限制几行，1 为单行，默认 1。 */
  lines?: number
  /** 省略号落在哪：end 末尾、middle 中间（只对单行生效），默认 end。 */
  position?: TruncatePosition
  /** 在文字之后放一颗展开 / 收起全文的按钮。 */
  expandable?: boolean
  /** 受控展开；省略该 prop 即非受控。 */
  open?: boolean
  /** 非受控时的初始展开态。 */
  defaultOpen?: boolean
  /** 实际被裁剪时才把整段文字交给平台的原生提示。 */
  tooltip?: boolean
  onOpenChange?: TruncateProps['onOpenChange']
  onOverflowChange?: TruncateProps['onOverflowChange']
  translations?: Partial<TruncateTranslations>
  /** 展开按钮里的内容，缺省是随展开态切换的那一句文案。 */
  trigger?: SlotChildren<TruncateTriggerSlotProps>
  children?: SlotChildren<TruncateSlotProps>
}

/**
 * 一段受限的文字：单行收为省略号，多行按行数裁剪。
 * 是否溢出由测量得出，写在 data-overflowing 上，也经函数式 children 的 overflowing 交出：
 * 是否再附加提示由作者决定，这里不处理浮层。
 * 开了 expandable 时在文字盒子之后铺一颗展开按钮，两个节点并排交给外层排版，透传属性落在文字盒子上。
 */
export function XhTruncate({
  lines,
  position,
  expandable,
  open,
  defaultOpen,
  tooltip,
  onOpenChange,
  onOverflowChange,
  translations,
  trigger,
  children,
  ...rest
}: XhTruncateProps): ReactNode {
  const ctx = useTruncate(withXhConfig('truncate', {
    lines,
    position,
    expandable,
    open,
    defaultOpen,
    tooltip,
    onOpenChange,
    onOverflowChange,
    translations,
  }) as TruncateProps)
  const props = mergeReactProps(
    ctx.api.getRootProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
    { ref: ctx.rootRef as Ref<unknown> },
  )
  const text = (
    <div {...props}>
      {renderSlot(children, {
        open: ctx.api.open,
        overflowing: ctx.api.overflowing,
        setOpen: ctx.api.setOpen,
        measure: ctx.api.measure,
      })}
    </div>
  )
  if (!expandable)
    return text
  const triggerContent = renderSlot(trigger, { open: ctx.api.open, triggerLabel: ctx.api.triggerLabel })
  return (
    <>
      {text}
      <button {...ctx.api.getTriggerProps() as Record<string, unknown>}>
        {triggerContent ?? ctx.api.triggerLabel}
      </button>
    </>
  )
}

XhTruncate.xhEvents = ['open-change', 'overflow-change'] as const
