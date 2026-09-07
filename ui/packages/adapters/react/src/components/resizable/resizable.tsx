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
  /** 方向键一步走多少。 */
  keyboardStep?: number
  /** PageUp / PageDown 一步走多少。 */
  keyboardLargeStep?: number
  /** 开放哪几条边；不给就是八向全开。 */
  edges?: ResizeEdge[]
  disabled?: boolean
  /** 文字方向，缺省 ltr。 */
  dir?: Direction
  translations?: Partial<ResizableTranslations>
  /** 每次调整都发；拖动过程中会连续发很多次。 */
  onDimensionsChange?: ResizableProps['onDimensionsChange']
  /** 只在一次调整收尾时发一次，存尺寸用它。 */
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
  /** 这个把手管哪条边。 */
  edge: ResizeEdge
}

/**
 * 一条边上的把手。
 *
 * 推西边与北边时容器的起点会动，那段位移写成 root 的 left / top——皮肤已给
 * `position: relative`，开箱即对。
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
