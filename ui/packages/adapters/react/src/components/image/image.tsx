/*
 * Copyright (c) 2021-Present XiHanFun and contributors.
 * Licensed under the MIT License. See LICENSE in the project root for license information.
 */

// 提供 image 相关实现。

import type { ImageApi, ImageSchema, ImageViewerItem } from '@xihan-ui/headless'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import type { SlotChildren } from '../../runtime/slot-content'
import { useEffect, useMemo, useRef } from 'react'
import { mergeReactProps } from '../../runtime/merge-props'
import { renderSlot } from '../../runtime/slot-content'
import {
  XhImageViewerCloseTrigger,
  XhImageViewerContent,
  XhImageViewerFlipHorizontalTrigger,
  XhImageViewerFlipVerticalTrigger,
  XhImageViewerImage,
  XhImageViewerResetTrigger,
  XhImageViewerRoot,
  XhImageViewerRotateLeftTrigger,
  XhImageViewerRotateRightTrigger,
  XhImageViewerToolbar,
  XhImageViewerViewport,
  XhImageViewerZoomInTrigger,
  XhImageViewerZoomOutTrigger,
} from '../image-viewer/image-viewer'
import { ImageProvider, useImageContext } from './context'
import { useImage } from './use-image'

type ImageProps = ImageSchema['props']

/** 函数式 children 的载荷：加载状态、是否已加载完成，以及回退内容当前是否应当显示。 */
export type ImageRootSlotProps = Pick<ImageApi, 'status' | 'loaded' | 'showFallback' | 'showPlaceholder'>

export interface XhImageRootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** 缺席即无来源，回落到回退态。 */
  src?: string
  alt?: string
  /** 图片在盒子里的铺法，与 CSS object-fit 同名；没写时由 `--xh-image-fit` 决定，缺省 cover。 */
  fit?: ImageProps['fit']
  /** 进入视口附近才去取图（原生 `loading="lazy"`），默认 false。 */
  lazy?: boolean
  /** 点击或 Enter / Space 打开大图预览，默认 false；写成对象时 `src` 给预览层另一张图。 */
  preview?: ImageProps['preview']
  /** 加载途中回退内容推迟显示的毫秒数；经缓存的快速图片在这段时间内即到达，回退内容不会闪现。 */
  fallbackDelay?: number
  /** 状态落位时通知。 */
  onStatusChange?: ImageProps['onStatusChange']
  children?: SlotChildren<ImageRootSlotProps>
}

/**
 * 预览层：一张图的图片预览，工具条放齐缩放、旋转、翻转与归零，外加关闭钮。
 * 开合受图片的 previewOpen 控制，预览层请求关闭时经 setPreviewOpen 写回；三端是同一棵树。
 */
function ImagePreview({ api, collection }: { api: ImageApi, collection: ImageViewerItem[] }): ReactNode {
  return (
    <XhImageViewerRoot
      collection={collection}
      open={api.previewOpen}
      onOpenChange={details => api.setPreviewOpen(details.open)}
    >
      <XhImageViewerContent>
        <XhImageViewerViewport>
          <XhImageViewerImage />
        </XhImageViewerViewport>
        <XhImageViewerToolbar>
          <XhImageViewerZoomOutTrigger />
          <XhImageViewerZoomInTrigger />
          <XhImageViewerRotateLeftTrigger />
          <XhImageViewerRotateRightTrigger />
          <XhImageViewerFlipHorizontalTrigger />
          <XhImageViewerFlipVerticalTrigger />
          <XhImageViewerResetTrigger />
        </XhImageViewerToolbar>
        <XhImageViewerCloseTrigger />
      </XhImageViewerContent>
    </XhImageViewerRoot>
  )
}

export function XhImageRoot({
  src,
  alt,
  fit,
  lazy,
  preview,
  fallbackDelay,
  onStatusChange,
  children,
  ...rest
}: XhImageRootProps): ReactNode {
  const ctx = useImage({ src, alt, fit, lazy, preview, fallbackDelay, onStatusChange })
  const api = ctx.api
  // 预览清单只随地址与替代文本换：图片自己换相位时不给预览层一份新数组
  const previewSrc = api.previewItem?.src
  const previewAlt = api.previewItem?.alt
  const previewCollection = useMemo<ImageViewerItem[]>(() => {
    if (previewSrc === undefined)
      return []
    return previewAlt === undefined ? [{ src: previewSrc }] : [{ src: previewSrc, alt: previewAlt }]
  }, [previewSrc, previewAlt])
  return (
    <ImageProvider value={ctx}>
      <div {...mergeReactProps(api.getRootProps(), rest)}>
        {renderSlot(children, {
          status: api.status,
          loaded: api.loaded,
          showFallback: api.showFallback,
          showPlaceholder: api.showPlaceholder,
        })}
      </div>
      {/* 预览层排在 root 之后而不是里面：React 的合成事件会顺着组件树从 Portal 冒回来，放在里面时预览层里的点击与按键会再打开一次 */}
      {api.previewable && <ImagePreview api={api} collection={previewCollection} />}
    </ImageProvider>
  )
}

XhImageRoot.xhEvents = ['status-change'] as const

/** 图片节点常驻，依靠 hidden 显隐；src / alt 由 connect 写入。 */
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
        api.getImageProps(),
        props,
        { ref: imageRef },
      )}
    />
  )
}

export interface XhImagePlaceholderProps extends ComponentPropsWithRef<'div'> {}

/** 占位层：图片落位或失败即让位，节点常驻、依靠 hidden 显隐。 */
export function XhImagePlaceholder({ children, ...rest }: XhImagePlaceholderProps): ReactNode {
  const ctx = useImageContext()
  return (
    <div {...mergeReactProps(ctx.api.getPlaceholderProps(), rest)}>
      {children}
    </div>
  )
}

export interface XhImageFallbackProps extends ComponentPropsWithRef<'div'> {}

/** 回退位：失败时恒显示，加载途中要等 fallbackDelay 过去；节点常驻、依靠 hidden 显隐。 */
export function XhImageFallback({ children, ...rest }: XhImageFallbackProps): ReactNode {
  const ctx = useImageContext()
  return (
    <div {...mergeReactProps(ctx.api.getFallbackProps(), rest)}>
      {children}
    </div>
  )
}
