import type {
  FloatingPanelApi,
  FloatingPanelPosition,
  FloatingPanelResizeEdge,
  FloatingPanelSchema,
  FloatingPanelSize,
  FloatingPanelTranslations,
  FloatingPanelWindowState,
} from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { withXhConfig } from '../../config/config'
import { mergeReactProps } from '../../runtime/merge-props'
import { XhPortal } from '../../runtime/portal'
import { renderSlot } from '../../runtime/slot-content'
import { FloatingPanelProvider, useFloatingPanelContext } from './context'
import { useFloatingPanel } from './use-floating-panel'

type FloatingPanelProps = FloatingPanelSchema['props']

/** 函数式 children 的载荷：开合、形态与矩形，以及改这四样的动作。 */
export interface FloatingPanelRootSlotProps extends Pick<
  FloatingPanelApi,
  'open' | 'windowState' | 'position' | 'dimensions' | 'dragging' | 'resizing' | 'canDrag' | 'canResize'
  | 'setOpen' | 'setPosition' | 'setDimensions' | 'setWindowState'
> {}

export interface XhFloatingPanelRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  open?: boolean
  defaultOpen?: boolean
  position?: FloatingPanelPosition
  defaultPosition?: FloatingPanelPosition
  dimensions?: FloatingPanelSize
  defaultDimensions?: FloatingPanelSize
  minSize?: FloatingPanelSize
  maxSize?: FloatingPanelSize
  windowState?: FloatingPanelWindowState
  defaultWindowState?: FloatingPanelWindowState
  draggable?: boolean
  resizable?: boolean
  disabled?: boolean
  translations?: Partial<FloatingPanelTranslations>
  onOpenChange?: FloatingPanelProps['onOpenChange']
  onPositionChange?: FloatingPanelProps['onPositionChange']
  onDimensionsChange?: FloatingPanelProps['onDimensionsChange']
  onWindowStateChange?: FloatingPanelProps['onWindowStateChange']
  children?: SlotChildren<FloatingPanelRootSlotProps>
}

export function XhFloatingPanelRoot({
  open,
  defaultOpen,
  position,
  defaultPosition,
  dimensions,
  defaultDimensions,
  minSize,
  maxSize,
  windowState,
  defaultWindowState,
  draggable,
  resizable,
  disabled,
  translations,
  onOpenChange,
  onPositionChange,
  onDimensionsChange,
  onWindowStateChange,
  children,
  ...rest
}: XhFloatingPanelRootProps): ReactNode {
  const ctx = useFloatingPanel(withXhConfig('floating-panel', {
    open,
    defaultOpen,
    position,
    defaultPosition,
    dimensions,
    defaultDimensions,
    minSize,
    maxSize,
    windowState,
    defaultWindowState,
    draggable,
    resizable,
    disabled,
    translations,
    onOpenChange,
    onPositionChange,
    onDimensionsChange,
    onWindowStateChange,
  }) as FloatingPanelProps)
  const api = ctx.api
  return (
    <FloatingPanelProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          open: api.open,
          windowState: api.windowState,
          position: api.position,
          dimensions: api.dimensions,
          dragging: api.dragging,
          resizing: api.resizing,
          canDrag: api.canDrag,
          canResize: api.canResize,
          setOpen: api.setOpen,
          setPosition: api.setPosition,
          setDimensions: api.setDimensions,
          setWindowState: api.setWindowState,
        })}
      </div>
    </FloatingPanelProvider>
  )
}

XhFloatingPanelRoot.xhEvents = [
  'open-change',
  'position-change',
  'dimensions-change',
  'window-state-change',
] as const

export interface XhFloatingPanelTriggerProps extends ComponentPropsWithRef<'button'> {}
/** 用原生 button，激活交给平台。 */
export function XhFloatingPanelTrigger({ children, ...rest }: XhFloatingPanelTriggerProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <button {...mergeReactProps(ctx.api.getTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFloatingPanelPositionerProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}
/** 搬到浮层落点：留在原地的话，宿主祖先只要建了层叠上下文就能盖住浮层。 */
export function XhFloatingPanelPositioner({ children, container, ...rest }: XhFloatingPanelPositionerProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      <div
        {...mergeReactProps(
          ctx.api.getPositionerProps() as Record<string, unknown>,
          rest as Record<string, unknown>,
          // 收起跟着退场闸门走：皮肤刻意没给 positioner 补 [hidden]{display:none}（补了
          // 退场就一帧都播不出来），所以真正的收起落成内联 display
          ctx.visible ? {} : { style: { display: 'none' } },
          { ref: (el: HTMLDivElement | null) => { ctx.positionerRef.current = el } },
        )}
      >
        {children}
      </div>
    </XhPortal>
  )
}

export interface XhFloatingPanelContentProps extends ComponentPropsWithRef<'div'> {}
/** 节点交给机器：跟手期间的指针监听要挂在它所在的那个文档上。 */
export function XhFloatingPanelContent({ children, ...rest }: XhFloatingPanelContentProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getContentProps() as Record<string, unknown>,
        rest as Record<string, unknown>,
        { ref: (el: HTMLDivElement | null) => { ctx.contentRef.current = el } },
      )}
    >
      {children}
    </div>
  )
}

export interface XhFloatingPanelHeaderProps extends ComponentPropsWithRef<'div'> {}
export function XhFloatingPanelHeader({ children, ...rest }: XhFloatingPanelHeaderProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <div {...mergeReactProps(ctx.api.getHeaderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhFloatingPanelTitleProps extends ComponentPropsWithRef<'h2'> {}
export function XhFloatingPanelTitle({ children, ...rest }: XhFloatingPanelTitleProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <h2 {...mergeReactProps(ctx.api.getTitleProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </h2>
  )
}

export interface XhFloatingPanelDragTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFloatingPanelDragTrigger({ children, ...rest }: XhFloatingPanelDragTriggerProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <button {...mergeReactProps(ctx.api.getDragTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFloatingPanelResizeTriggerProps extends ComponentPropsWithRef<'div'> {
  /** 这个把手守哪条边：n / e / s / w 四条边与 ne / nw / se / sw 四个角。 */
  edge: FloatingPanelResizeEdge
}
/** 把手是 role=separator 的元素而不是按钮：方向键推边，按钮的激活键在这里没有语义。 */
export function XhFloatingPanelResizeTrigger({ edge, children, ...rest }: XhFloatingPanelResizeTriggerProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <div
      {...mergeReactProps(
        ctx.api.getResizeTriggerProps({ edge }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </div>
  )
}

export interface XhFloatingPanelWindowStateTriggerProps extends ComponentPropsWithRef<'button'> {
  /** 按下它切到哪个形态；已经在该形态时再按一次回到常规。 */
  windowState: FloatingPanelWindowState
}
export function XhFloatingPanelWindowStateTrigger({
  windowState,
  children,
  ...rest
}: XhFloatingPanelWindowStateTriggerProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <button
      {...mergeReactProps(
        ctx.api.getWindowStateTriggerProps({ windowState }) as Record<string, unknown>,
        rest as Record<string, unknown>,
      )}
    >
      {children}
    </button>
  )
}

export interface XhFloatingPanelCloseTriggerProps extends ComponentPropsWithRef<'button'> {}
export function XhFloatingPanelCloseTrigger({ children, ...rest }: XhFloatingPanelCloseTriggerProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <button {...mergeReactProps(ctx.api.getCloseTriggerProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </button>
  )
}

export interface XhFloatingPanelBodyProps extends ComponentPropsWithRef<'div'> {}
export function XhFloatingPanelBody({ children, ...rest }: XhFloatingPanelBodyProps): ReactNode {
  const ctx = useFloatingPanelContext()
  return (
    <div {...mergeReactProps(ctx.api.getBodyProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
