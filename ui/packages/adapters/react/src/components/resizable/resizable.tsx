/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 resizable 相关实现。

import type { Direction } from '@xihan-ui/core'
import type { ResizableDimensions, ResizableOffset, ResizableSchema, ResizableTranslations } from '@xihan-ui/headless'
import type { ResizeEdge } from '@xihan-ui/pointer'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ResizableProvider, useResizableContext } from './context'
import { useResizable } from './use-resizable'

type ResizableProps = ResizableSchema['props']

/** 函数式 children 的载荷：当前尺寸、位移与调整态。 */
export interface ResizableRootSlotProps {
  dimensions: ResizableDimensions
  offset: ResizableOffset
  resizing: boolean
  activeEdge: ResizeEdge | null
}

export interface XhResizableRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'dir'> {
  /** 受控尺寸；给定即受控。 */
  dimensions?: ResizableDimensions
  /** 非受控初值。 */
  defaultDimensions?: ResizableDimensions
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  /** 锁定宽高比。 */
  aspectRatio?: number
  /** 指针拖动的吸附步长。 */
  step?: number
  /** 方向键一步移动多少。 */
  keyboardStep?: number
  /** PageUp / PageDown 一步移动多少。 */
  keyboardLargeStep?: number
  /** 开放哪几条边；未提供时八向全开。 */
  edges?: ResizeEdge[]
  disabled?: boolean
  /** 文字方向，默认 ltr。 */
  dir?: Direction
  translations?: Partial<ResizableTranslations>
  /** 每次调整都触发；拖动过程中会连续触发多次。 */
  onDimensionsChange?: ResizableProps['onDimensionsChange']
  /** 只在一次调整结束时触发一次，保存尺寸时使用它。 */
  onDimensionsChangeEnd?: ResizableProps['onDimensionsChangeEnd']
  children?: SlotChildren<ResizableRootSlotProps>
}

export function XhResizableRoot({
  dimensions,
  defaultDimensions,
  minWidth,
  minHeight,
  maxWidth,
  maxHeight,
  aspectRatio,
  step,
  keyboardStep,
  keyboardLargeStep,
  edges,
  disabled,
  dir,
  translations,
  onDimensionsChange,
  onDimensionsChangeEnd,
  children,
  ...rest
}: XhResizableRootProps): ReactNode {
  const ctx = useResizable(withXhConfig('resizable', {
    dimensions,
    defaultDimensions,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    aspectRatio,
    step,
    keyboardStep,
    keyboardLargeStep,
    edges,
    disabled,
    dir,
    translations,
    onDimensionsChange,
    onDimensionsChangeEnd,
  }) as ResizableProps)
  const api = ctx.api

  return (
    <ResizableProvider value={ctx}>
      <div
        {...mergeReactProps(
          api.getRootProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          { ref: ctx.rootRef },
        )}
      >
        {renderSlot(children, {
          dimensions: api.dimensions,
          offset: api.offset,
          resizing: api.resizing,
          activeEdge: api.activeEdge,
        })}
      </div>
    </ResizableProvider>
  )
}

XhResizableRoot.xhEvents = ['dimensions-change', 'dimensions-change-end'] as const

export interface XhResizableHandleProps extends ComponentPropsWithRef<'span'> {
  /** 该把手负责哪条边。 */
  edge: ResizeEdge
}

/**
 * 一条边上的把手。
 *
 * 推动西边与北边时容器的起点会移动，该段位移写为 root 的 left / top：皮肤已提供
 * `position: relative`，默认即正确。
 */
export function XhResizableHandle({ edge, children, ...rest }: XhResizableHandleProps): ReactNode {
  const ctx = useResizableContext()
  return (
    <span
      {...mergeReactProps(
        ctx.api.getHandleProps({ edge }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </span>
  )
}
