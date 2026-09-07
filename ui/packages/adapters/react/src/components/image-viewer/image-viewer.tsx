import type { OverlayBackdropVariant } from '@xihan-ui/core'
import type { ImageViewerApi, ImageViewerItem, ImageViewerSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { AsChildProps } from '../../runtime/as-child'
import type { SlotChildren } from '../../runtime/slot-content'
import { imageViewerCounterText } from '@xihan-ui/headless'
import { withXhConfig } from '../../config/config'
import { renderAsChild } from '../../runtime/as-child'
import { mergeReactProps } from '../../runtime/merge-props'
import { useNativeEvents } from '../../runtime/native-events'
import { XhPortal } from '../../runtime/portal'
import { renderSlot, slotPaints } from '../../runtime/slot-content'
import { ImageViewerProvider, useImageViewerContext } from './context'
import { useImageViewer } from './use-image-viewer'

type ImageViewerProps = ImageViewerSchema['props']

/** 函数式 children 的载荷：当前图与下标、变换与可翻页状态，以及翻页、缩放、旋转、翻转、归零等命令。 */
export type ImageViewerRootSlotProps = Pick<
  ImageViewerApi,
  | 'open'
  | 'index'
  | 'count'
  | 'currentItem'
  | 'transform'
  | 'imageStatus'
  | 'canPrev'
  | 'canNext'
  | 'setOpen'
  | 'setIndex'
  | 'next'
  | 'prev'
  | 'zoomIn'
  | 'zoomOut'
  | 'setScale'
  | 'rotateLeft'
  | 'rotateRight'
  | 'flipHorizontal'
  | 'flipVertical'
  | 'reset'
>

export interface XhImageViewerRootProps {
  collection?: ImageViewerItem[]
  open?: boolean
  defaultOpen?: boolean
  index?: number
  defaultIndex?: number
  loop?: boolean
  zoomStep?: number
  minScale?: number
  maxScale?: number
  closeOnEscape?: boolean
  closeOnInteractOutside?: boolean
  restoreFocus?: boolean
  variant?: OverlayBackdropVariant
  translations?: ImageViewerProps['translations']
  onOpenChange?: ImageViewerProps['onOpenChange']
  onIndexChange?: ImageViewerProps['onIndexChange']
  children?: SlotChildren<ImageViewerRootSlotProps>
}

/** 根不产出自己的元素：状态与命令经 children 载荷交出去，供浮层外的按钮（如缩略图）使用。 */
export function XhImageViewerRoot({ children, ...props }: XhImageViewerRootProps): ReactNode {
  const ctx = useImageViewer(withXhConfig('image-viewer', props) as ImageViewerProps)
  const api = ctx.api
  return (
    <ImageViewerProvider value={ctx}>
      {renderSlot(children, {
        open: api.open,
        index: api.index,
        count: api.count,
        currentItem: api.currentItem,
        transform: api.transform,
        imageStatus: api.imageStatus,
        canPrev: api.canPrev,
        canNext: api.canNext,
        setOpen: api.setOpen,
        setIndex: api.setIndex,
        next: api.next,
        prev: api.prev,
        zoomIn: api.zoomIn,
        zoomOut: api.zoomOut,
        setScale: api.setScale,
        rotateLeft: api.rotateLeft,
        rotateRight: api.rotateRight,
        flipHorizontal: api.flipHorizontal,
        flipVertical: api.flipVertical,
        reset: api.reset,
      })}
    </ImageViewerProvider>
  )
}

XhImageViewerRoot.xhEvents = ['open-change', 'index-change'] as const

export interface XhImageViewerTriggerProps extends ComponentPropsWithRef<'button'>, AsChildProps {}

export function XhImageViewerTrigger({ children, asChild, ...rest }: XhImageViewerTriggerProps): ReactNode {
  const ctx = useImageViewerContext()
  const props = mergeReactProps(
    ctx.api.getTriggerProps() as Record<string, unknown>,
    rest as Record<string, unknown>,
  )
  return renderAsChild(asChild, children, props, 'image-viewer', (p, kids) => <button {...p}>{kids}</button>)
}

export interface XhImageViewerContentProps extends ComponentPropsWithRef<'div'> {
  /** 浮层挂到哪个容器；不给就按全局配置，再不给挂 body。 */
  container?: () => Element | null
}

/** 遮罩与定位层跟内容一起搬到浮层落点：留在原地的话，宿主祖先建了层叠上下文就能盖住浮层。 */
export function XhImageViewerContent({ children, container, ...rest }: XhImageViewerContentProps): ReactNode {
  const ctx = useImageViewerContext()
  if (!ctx.rendered)
    return null
  const api = ctx.api
  return (
    <XhPortal container={container ?? ctx.portalContainer}>
      <div
        {...api.getBackdropProps() as Record<string, unknown>}
        ref={(el: HTMLDivElement | null) => { ctx.backdropRef.current = el }}
      />
      <div {...api.getPositionerProps() as Record<string, unknown>}>
        <div
          {...mergeReactProps(api.getContentProps() as Record<string, unknown>, rest as Record<string, unknown>)}
          ref={(el: HTMLDivElement | null) => { ctx.contentRef.current = el }}
        >
          {children}
        </div>
      </div>
    </XhPortal>
  )
}

export interface XhImageViewerViewportProps extends ComponentPropsWithRef<'div'> {}

/**
 * 图片的可视窗口。滚轮缩放要 preventDefault 拦掉页面滚动，而 React 把 wheel 委派在根容器上
 * 且登记为被动监听器，那条路上的 preventDefault 是空操作——装成本节点上的原生监听器才拦得住。
 */
export function XhImageViewerViewport({ children, ...rest }: XhImageViewerViewportProps): ReactNode {
  const ctx = useImageViewerContext()
  const bind = useNativeEvents(ctx.api.getViewportProps() as Record<string, unknown>, ['onWheel'])
  return (
    <div {...mergeReactProps(bind.attrs, rest as Record<string, unknown>, { ref: bind.ref })}>
      {children}
    </div>
  )
}

export interface XhImageViewerImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children' | 'src' | 'alt'> {}

export function XhImageViewerImage({ ...rest }: XhImageViewerImageProps): ReactNode {
  const ctx = useImageViewerContext()
  return <img {...mergeReactProps(ctx.api.getImageProps() as Record<string, unknown>, rest as Record<string, unknown>)} />
}

export interface XhImageViewerToolbarProps extends ComponentPropsWithRef<'div'> {}

export function XhImageViewerToolbar({ children, ...rest }: XhImageViewerToolbarProps): ReactNode {
  const ctx = useImageViewerContext()
  return (
    <div {...mergeReactProps(ctx.api.getToolbarProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhImageViewerToolTriggerProps extends ComponentPropsWithRef<'button'> {}

type ToolTrigger = (props: XhImageViewerToolTriggerProps) => ReactNode

/**
 * 工具条按钮共用的组件工厂：没写内容就空着，皮肤据 :empty 画兜底图标；
 * 给了文字的（1:1）填文字。
 */
function toolTrigger(
  name: string,
  getProps: (api: ImageViewerApi) => Record<string, unknown>,
  fallback?: string,
): ToolTrigger {
  function Trigger({ children, ...rest }: XhImageViewerToolTriggerProps): ReactNode {
    const ctx = useImageViewerContext()
    return (
      <button {...mergeReactProps(getProps(ctx.api), rest as Record<string, unknown>)}>
        {slotPaints(children) ? children : fallback}
      </button>
    )
  }
  Trigger.displayName = name
  return Trigger
}

export const XhImageViewerZoomInTrigger: ToolTrigger = toolTrigger('XhImageViewerZoomInTrigger', api => api.getZoomInTriggerProps() as Record<string, unknown>)
export const XhImageViewerZoomOutTrigger: ToolTrigger = toolTrigger('XhImageViewerZoomOutTrigger', api => api.getZoomOutTriggerProps() as Record<string, unknown>)
export const XhImageViewerRotateLeftTrigger: ToolTrigger = toolTrigger('XhImageViewerRotateLeftTrigger', api => api.getRotateLeftTriggerProps() as Record<string, unknown>)
export const XhImageViewerRotateRightTrigger: ToolTrigger = toolTrigger('XhImageViewerRotateRightTrigger', api => api.getRotateRightTriggerProps() as Record<string, unknown>)
export const XhImageViewerFlipHorizontalTrigger: ToolTrigger = toolTrigger('XhImageViewerFlipHorizontalTrigger', api => api.getFlipHorizontalTriggerProps() as Record<string, unknown>)
export const XhImageViewerFlipVerticalTrigger: ToolTrigger = toolTrigger('XhImageViewerFlipVerticalTrigger', api => api.getFlipVerticalTriggerProps() as Record<string, unknown>)
export const XhImageViewerResetTrigger: ToolTrigger = toolTrigger('XhImageViewerResetTrigger', api => api.getResetTriggerProps() as Record<string, unknown>, '1:1')
export const XhImageViewerPrevTrigger: ToolTrigger = toolTrigger('XhImageViewerPrevTrigger', api => api.getPrevTriggerProps() as Record<string, unknown>)
export const XhImageViewerNextTrigger: ToolTrigger = toolTrigger('XhImageViewerNextTrigger', api => api.getNextTriggerProps() as Record<string, unknown>)
export const XhImageViewerCloseTrigger: ToolTrigger = toolTrigger('XhImageViewerCloseTrigger', api => api.getCloseTriggerProps() as Record<string, unknown>)

export interface XhImageViewerCounterProps extends ComponentPropsWithRef<'div'> {}

/** 第几张 / 共几张；作者没写内容时用「n / m」的缺省文本兜底。 */
export function XhImageViewerCounter({ children, ...rest }: XhImageViewerCounterProps): ReactNode {
  const ctx = useImageViewerContext()
  const api = ctx.api
  const fallback = imageViewerCounterText(ctx.service.prop('translations'), api.index, api.count)
  return (
    <div {...mergeReactProps(api.getCounterProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {slotPaints(children) ? children : fallback}
    </div>
  )
}
