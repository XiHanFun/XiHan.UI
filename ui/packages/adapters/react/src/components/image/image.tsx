import type { ImageApi, ImageSchema } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import { ImageProvider, useImageContext } from './context'
import { useImage } from './use-image'

type ImageProps = ImageSchema['props']

/** 函数式 children 的载荷：加载状态、是否已加载完，以及回退内容此刻该不该露面。 */
export type ImageRootSlotProps = Pick<ImageApi, 'status' | 'loaded' | 'showFallback' | 'showPlaceholder'>

export interface XhImageRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 缺席即无来源，落回退态。 */
  src?: string
  alt?: string
  /** 加载途中回退内容押后露面的毫秒数；走缓存的快图在这一段里就到了，回退内容一次都不闪。 */
  fallbackDelay?: number
  /** 状态落位时通知。 */
  onStatusChange?: ImageProps['onStatusChange']
  children?: SlotChildren<ImageRootSlotProps>
}

export function XhImageRoot({
  src,
  alt,
  fallbackDelay,
  onStatusChange,
  children,
  ...rest
}: XhImageRootProps): ReactNode {
  const ctx = useImage({ src, alt, fallbackDelay, onStatusChange })
  const api = ctx.api
  return (
    <ImageProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
        {renderSlot(children, {
          status: api.status,
          loaded: api.loaded,
          showFallback: api.showFallback,
          showPlaceholder: api.showPlaceholder,
        })}
      </div>
    </ImageProvider>
  )
}

XhImageRoot.xhEvents = ['status-change'] as const

/** 图片节点常挂，靠 hidden 显隐；src / alt 由 connect 写上。 */
export interface XhImageImageProps extends Omit<ComponentPropsWithRef<'img'>, 'children' | 'src' | 'alt'> {}

export function XhImageImage(props: XhImageImageProps): ReactNode {
  const ctx = useImageContext()
  const imageRef = useRef<HTMLImageElement | null>(null)
  const { service, api } = ctx
  const status = api.status

  // 进入 loading 时为已就绪的图（如注水前就加载完的图）补报一次加载完成
  useEffect(() => {
    if (status !== 'loading' || service.getStatus() !== 'Started')
      return
    const img = imageRef.current
    if (img?.complete && img.naturalWidth > 0 && img.currentSrc === img.src)
      service.send({ type: 'IMAGE.LOAD' })
  }, [status, service])

  return (
    <img
      {...mergeReactProps(
        api.getImageProps() as Record<string, unknown>,
        props as Record<string, unknown>,
        { ref: imageRef },
      )}
    />
  )
}

export interface XhImagePlaceholderProps extends ComponentPropsWithRef<'div'> {}

/** 占位层：图片落位或失败即让位，节点常挂、靠 hidden 显隐。 */
export function XhImagePlaceholder({ children, ...rest }: XhImagePlaceholderProps): ReactNode {
  const ctx = useImageContext()
  return (
    <div {...mergeReactProps(ctx.api.getPlaceholderProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}

export interface XhImageFallbackProps extends ComponentPropsWithRef<'div'> {}

/** 回退位：失败时恒露面，加载途中要等 fallbackDelay 过去；节点常挂、靠 hidden 显隐。 */
export function XhImageFallback({ children, ...rest }: XhImageFallbackProps): ReactNode {
  const ctx = useImageContext()
  return (
    <div {...mergeReactProps(ctx.api.getFallbackProps() as Record<string, unknown>, rest as Record<string, unknown>)}>
      {children}
    </div>
  )
}
